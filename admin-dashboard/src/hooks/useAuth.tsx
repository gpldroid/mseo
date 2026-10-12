import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import type {Session,User} from "@supabase/supabase-js";
import {supabase,supabaseConfigured,type AdminRole} from "../lib/supabase";
type AuthValue={session:Session|null;user:User|null;role:AdminRole|null;workspaceId:string|null;loading:boolean;signIn:(email:string,password:string)=>Promise<void>;signInGitHub:()=>Promise<void>;signOut:()=>Promise<void>;refreshRole:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);

function getOAuthRedirectUrl(){
 const {origin,hostname,pathname}=window.location;
 if(hostname==="gpldroid.github.io")return "https://gpldroid.github.io/mseo/admin-dashboard/";
 const configuredPath=pathname.match(/^(.*\/admin-dashboard)(?:\/|$)/)?.[1];
 const path=configuredPath?configuredPath+"/":"/admin-dashboard/";
 return new URL(path,origin).toString();
}

export function AuthProvider({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null),[role,setRole]=useState<AdminRole|null>(null),[workspaceId,setWorkspaceId]=useState<string|null>(null),[loading,setLoading]=useState(true);
 const refreshRole=async()=>{const {data:{session:current}}=await supabase.auth.getSession();setSession(current);if(!current?.user){setRole(null);setWorkspaceId(null);return}const {data,error}=await supabase.from("mcms_workspace_members").select("workspace_id,role").eq("user_id",current.user.id).limit(1).maybeSingle();if(error)throw error;setWorkspaceId(data?.workspace_id??null);setRole(data&&["owner","admin","editor","publisher","viewer"].includes(data.role)?data.role as AdminRole:null)};
 useEffect(()=>{let active=true;const init=async()=>{try{if(supabaseConfigured)await refreshRole()}catch(e){console.error("Auth initialization failed",e)}finally{if(active)setLoading(false)}};void init();const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);window.setTimeout(()=>{if(active)void refreshRole().catch(e=>console.error("Role refresh failed",e))},0)});return()=>{active=false;listener.subscription.unsubscribe()}},[]);
 const value=useMemo<AuthValue>(()=>({session,user:session?.user??null,role,workspaceId,loading,signIn:async(email,password)=>{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error},signInGitHub:async()=>{const {error}=await supabase.auth.signInWithOAuth({provider:"github",options:{redirectTo:getOAuthRedirectUrl()}});if(error)throw error},signOut:async()=>{const {error}=await supabase.auth.signOut();if(error)throw error;setRole(null);setWorkspaceId(null)},refreshRole}),[session,role,workspaceId,loading]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){const v=useContext(AuthContext);if(!v)throw new Error("useAuth must be used within AuthProvider");return v}
