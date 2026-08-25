"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { missingFirebaseKeys } from "@/lib/auth/firebase";
import type { ReactNode } from "react";

/**
 * Sign-in gate and page frame.
 *
 * <p>Three states rather than two. "Not configured" is separate from "signed out" because the
 * failure it causes is otherwise unreadable: Firebase throws `auth/invalid-api-key` from inside
 * the SDK, which looks like a broken deployment rather than an unset environment variable.
 */
export function Shell({ children }: { children: ReactNode }) {
  const { user, loading, configured, signIn, signOutNow } = useAuth();

  if (!configured) {
    return (
      <main>
        <h1>Drovi Console</h1>
        <div className="error">
          <strong>Firebase is not configured.</strong>
          <p className="muted" style={{ color: "inherit" }}>
            Missing: <code>{missingFirebaseKeys().join(", ")}</code>
          </p>
          <p className="muted" style={{ color: "inherit" }}>
            Copy <code>.env.example</code> to <code>.env.local</code> and fill it from the
            Firebase console → Project settings → Your apps → Web app. All four values are public
            by design.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main>
        <p className="muted">Checking your session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>Drovi Console</h1>
        <p className="muted">
          Name a product, and get a base URL you can paste over the real one.
        </p>
        <div className="panel">
          <button onClick={() => void signIn()}>Sign in with Google</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="spread">
        <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1>Drovi Console</h1>
        </a>
        <div className="row">
          <span className="muted">{user.email}</span>
          <button className="secondary" onClick={() => void signOutNow()}>
            Sign out
          </button>
        </div>
      </div>
      {children}
    </main>
  );
}
