"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { upsertUserProfile } from "@/lib/userProfile";

function getFirebaseErrorMessage(code?: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "permission-denied":
      return "Signed in, but Firestore denied profile write. Check your rules for users/{uid}.";
    case "unavailable":
      return "Firebase is temporarily unavailable. Try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function AccountAuthPanel() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (nextUser?.email) {
        setEmail(nextUser.email);
      }

      if (nextUser?.displayName) {
        setDisplayName(nextUser.displayName);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = displayName.trim();
    const nextEmail = email.trim().toLowerCase();
    const nextPassword = password.trim();

    if (!nextName || !nextEmail || !nextPassword) {
      setError("Name, email, and password are required.");
      setStatus("");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setStatus("");
      const credentials = await createUserWithEmailAndPassword(
        auth,
        nextEmail,
        nextPassword,
      );

      await updateProfile(credentials.user, { displayName: nextName });

      try {
        await upsertUserProfile(credentials.user, nextName);
      } catch (profileError) {
        const profileCode =
          profileError && typeof profileError === "object" && "code" in profileError
            ? String(profileError.code)
            : undefined;

        setStatus(`Account created for ${nextEmail}. Verification email sent.`);
        setError(getFirebaseErrorMessage(profileCode));
        setPassword("");
        return;
      }

      await sendEmailVerification(credentials.user);

      setStatus(`Account created for ${nextEmail}. Verification email sent.`);
      setPassword("");
    } catch (caughtError) {
      const code =
        caughtError && typeof caughtError === "object" && "code" in caughtError
          ? String(caughtError.code)
          : undefined;

      setError(getFirebaseErrorMessage(code));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignIn() {
    const nextEmail = email.trim().toLowerCase();
    const nextPassword = password.trim();

    if (!nextEmail || !nextPassword) {
      setError("Email and password are required.");
      setStatus("");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setStatus("");
      const credentials = await signInWithEmailAndPassword(
        auth,
        nextEmail,
        nextPassword,
      );

      setStatus(`Signed in as ${credentials.user.email}.`);
      setPassword("");

      try {
        await upsertUserProfile(
          credentials.user,
          credentials.user.displayName ?? displayName.trim(),
        );
      } catch (profileError) {
        const profileCode =
          profileError && typeof profileError === "object" && "code" in profileError
            ? String(profileError.code)
            : undefined;

        setError(getFirebaseErrorMessage(profileCode));
      }
    } catch (caughtError) {
      const code =
        caughtError && typeof caughtError === "object" && "code" in caughtError
          ? String(caughtError.code)
          : undefined;

      setError(getFirebaseErrorMessage(code));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      setError("");
      setStatus("");
      await signOut(auth);
      setStatus("Signed out.");
      setPassword("");
    } catch {
      setError("Could not sign out right now.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <article className="rounded-2xl bg-card p-5 shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">Authentication</p>
          <p className="mt-2 text-sm text-muted">
            Browse freely. Sign in for shelves and profile editing.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-accent-soft bg-accent-soft/30 p-3 text-xs text-muted">
        Current user: {user?.email ?? "Not signed in"}
      </div>

      {!user ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={[
              "rounded-full px-4 py-2 text-xs font-semibold",
              mode === "sign-in"
                ? "bg-accent text-white"
                : "border border-accent-soft text-muted",
            ].join(" ")}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={[
              "rounded-full px-4 py-2 text-xs font-semibold",
              mode === "sign-up"
                ? "bg-accent text-white"
                : "border border-accent-soft text-muted",
            ].join(" ")}
          >
            Sign Up
          </button>
        </div>
      ) : null}

      {!user ? (
        <form
          onSubmit={mode === "sign-up" ? handleSignUp : (event) => event.preventDefault()}
          className="mt-4 space-y-2"
        >
        {mode === "sign-up" && !user ? (
          <>
            <label htmlFor="auth-name" className="text-xs font-semibold text-muted">
              Display name
            </label>
            <input
              id="auth-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Reader Name"
              className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
            />
          </>
        ) : null}

        <label htmlFor="auth-email" className="text-xs font-semibold text-muted">
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
        />

        <label htmlFor="auth-password" className="text-xs font-semibold text-muted">
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
        />

          <button
            type={mode === "sign-up" ? "submit" : "button"}
            onClick={mode === "sign-in" ? handleSignIn : undefined}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting
              ? "Working..."
              : mode === "sign-up"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-accent-soft bg-accent-soft/25 p-3 text-sm text-muted">
          You are signed in. Security actions are available in the panel on the
          right.
        </p>
      )}

      <button
        type="button"
        onClick={handleSignOut}
        disabled={!user || isSigningOut}
        className="mt-3 w-full rounded-xl border border-accent-soft px-4 py-2.5 text-sm font-semibold text-muted disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>

      {status ? <p className="mt-3 text-sm font-medium text-accent">{status}</p> : null}
      {error ? <p className="mt-2 text-sm font-medium text-red-500">{error}</p> : null}
    </article>
  );
}
