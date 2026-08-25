import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * The Firebase web app, initialised once.
 *
 * <p>Every value here is public and ships in the bundle, which is correct: the web config
 * identifies a project, it does not authorise anything. What decides access is Firebase Auth and
 * our backend verifying the resulting ID token — and the backend needs only a project id to do
 * that, so no credential exists anywhere in this system (ADR-0006).
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Whether sign-in can work at all.
 *
 * Checked rather than assumed because the failure without it is miserable: Firebase throws
 * `auth/invalid-api-key` from inside the SDK, which reads like a broken deployment rather than
 * an unset variable. The sign-in screen uses this to say which variable is missing.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

export function missingFirebaseKeys(): string[] {
  return Object.entries({
    NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: config.projectId,
    NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

let app: FirebaseApp | undefined;

export function firebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error(`Firebase is not configured. Missing: ${missingFirebaseKeys().join(", ")}`);
  }
  // getApps() rather than a module-level init: Next renders modules more than once in
  // development, and initializeApp twice throws.
  app ??= getApps()[0] ?? initializeApp(config as Record<string, string>);
  return getAuth(app);
}
