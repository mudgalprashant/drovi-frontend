"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { firebaseAuth, isFirebaseConfigured } from "./firebase";

interface AuthState {
  user: User | null;
  /** Distinct from "signed out": until Firebase has answered, we do not know which. */
  loading: boolean;
  configured: boolean;
  signIn: () => Promise<void>;
  signOutNow: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      // Nothing to wait for. Leaving `loading` true here would render a spinner forever on a
      // misconfigured deployment, which looks like a hang rather than a missing variable.
      setLoading(false);
      return;
    }
    return onAuthStateChanged(firebaseAuth(), (next) => {
      setUser(next);
      setLoading(false);
    });
  }, [configured]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      configured,
      signIn: async () => {
        await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
      },
      signOutNow: async () => {
        await signOut(firebaseAuth());
      },
    }),
    [user, loading, configured],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
