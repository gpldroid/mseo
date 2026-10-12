import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured, type AdminRole } from "../lib/supabase";

type AuthValue = {
  session: Session | null;
  user: User | null;
  role: AdminRole | null;
  workspaceId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};
const AuthContext = createContext<AuthValue | null>(null);

function getOAuthRedirectUrl() {
  const { origin, hostname } = window.location;
  if (hostname === "gpldroid.github.io") return "https://gpldroid.github.io/mseo/admin-dashboard/";
  const path = window.location.pathname.match(/^(.*\/admin-dashboard)(?:\/|$)/)?.[1] ?? "/admin-dashboard";
  return new URL(path + "/", origin).toString();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = async () => {
    const { data: { session: current }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    setSession(current);
    if (!current?.user) { setRole(null); return; }
    const { data, error } = await supabase.from("mseo_admins").select("role").eq("user_id", current.user.id).maybeSingle();
    if (error) throw error;
    setRole((data?.role as AdminRole | undefined) ?? null);
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      try { if (supabaseConfigured) await refreshRole(); }
      catch (error) { console.error("Authentication initialization failed:", error); }
      finally { if (active) setLoading(false); }
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      window.setTimeout(() => {
        if (active) void refreshRole().catch(error => console.error("Access check failed:", error));
      }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthValue>(() => ({
    session, user: session?.user ?? null, role, workspaceId: role ? session?.user.id ?? null : null, loading,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await refreshRole();
    },
    signInGitHub: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: getOAuthRedirectUrl() },
      });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setRole(null);
    },
    refreshRole,
  }), [session, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
