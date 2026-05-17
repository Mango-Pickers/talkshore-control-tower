import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

/* ================= TYPES ================= */

export type AdminRole = "admin" | "moderator" | "guide" | "learner" | null;

interface Profile {
  id: string;

  full_name?: string;

  email?: string;

  role?: AdminRole;
}

interface AuthState {
  user: User | null;

  session: Session | null;

  profile: Profile | null;

  role: AdminRole;

  loading: boolean;

  isAdmin: boolean;

  isModerator: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: string | null;
  }>;

  signOut: () => Promise<void>;
}

/* ================= CONTEXT ================= */

const AuthCtx = createContext<AuthState | undefined>(undefined);

/* ================= FETCH PROFILE ================= */

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Profile fetch failed:", error);

    return null;
  }

  return data;
}

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [session, setSession] = useState<Session | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [role, setRole] = useState<AdminRole>(null);

  const [loading, setLoading] = useState(true);

  /* ================= LOAD SESSION ================= */

  useEffect(() => {
    const loadUser = async (currentSession: Session | null) => {
      if (!currentSession?.user) {
        setUser(null);

        setSession(null);

        setProfile(null);

        setRole(null);

        setLoading(false);

        return;
      }

      setUser(currentSession.user);

      setSession(currentSession);

      const profileData = await fetchProfile(currentSession.user.id);

      setProfile(profileData);

      setRole(profileData?.role ?? null);

      setLoading(false);
    };

    /* ================= SESSION LISTENER ================= */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      await loadUser(currentSession);
    });

    /* ================= INITIAL SESSION ================= */

    supabase.auth.getSession().then(async ({ data }) => {
      await loadUser(data.session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ================= SIGN IN ================= */

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      error: error?.message ?? null,
    };
  };

  /* ================= SIGN OUT ================= */

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  /* ================= ROLE HELPERS ================= */

  const isAdmin = role === "admin";

  const isModerator = role === "moderator";

  /* ================= PROVIDER ================= */

  return (
    <AuthCtx.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        isAdmin,
        isModerator,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

/* ================= HOOK ================= */

export function useAuth() {
  const context = useContext(AuthCtx);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
