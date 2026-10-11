import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured, type AdminRole } from "../lib/supabase";

type AuthValue = { session: Session | null; user: User | null; role: AdminRole | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signInGitHub: () => Promise<void>; signOut: () => Promise<void>; refreshRole: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = async () => {
    const { data: { session: current } } = await supabase.auth.getSession();
    setSession(current);
    if (!current?.user) { setRole(null); return; }
    const { data, error } = await supabase.from("mseo_admins").select("role").eq("user_id", current.user.id).maybeSingle();
    if (error) throw error;
    setRole(data && ["admin", "editor", "viewer"].includes(data.role) ? data.role as AdminRole : null);
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try { if (supabaseConfigured) await refreshRole(); }
      catch (error) { console.error("Auth initialization failed", error); }
      finally { if (active) setLoading(false); }
    };
    void initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      window.setTimeout(() => { if (active) void refreshRole().catch(error => console.error("Role refresh failed", error)); }, 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthValue>(() => ({
    session, user: session?.user ?? null, role, loading,
    signIn: async (email, password) => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; },
    signInGitHub: async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: window.location.origin } }); if (error) throw error; },
    signOut: async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; setRole(null); },
    refreshRole,
  }), [session, role, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}