import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AdminRole = "admin" | "moderator" | "guide" | "learner" | null;
interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  role?: AdminRole;
}
interface AuthState {
  user: User | null;
  session: User | null;
  profile: Profile | null;
  role: AdminRole;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

async function fetchProfile(user: User): Promise<Profile | null> {
  const snapshot = await getDoc(doc(db, "profiles", user.uid));
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as Profile)
    : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (currentUser) => {
        setLoading(true);
        setUser(currentUser);
        try {
          setProfile(currentUser ? await fetchProfile(currentUser) : null);
        } catch (error) {
          console.error("Profile fetch failed:", error);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      }),
    []
  );

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unable to sign in",
      };
    }
  };
  const signOut = () => firebaseSignOut(auth);
  const role = profile?.role ?? null;

  return (
    <AuthCtx.Provider
      value={{
        user,
        session: user,
        profile,
        role,
        loading,
        isAdmin: role === "admin",
        isModerator: role === "moderator",
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthCtx);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
