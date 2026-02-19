"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { upsertUserProfile } from "@/lib/userProfile";

type AuthMode = "sign-in" | "sign-up";

type AuthPageCardProps = {
  mode: AuthMode;
};

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
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function AuthPageCard({ mode }: AuthPageCardProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = email.trim().toLowerCase();
    const nextPassword = password.trim();
    const nextName = displayName.trim();

    if (!nextEmail || !nextPassword || (isSignUp && !nextName)) {
      setError(
        isSignUp
          ? "Name, email, and password are required."
          : "Email and password are required.",
      );
      setStatus("");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setStatus("");

      if (isSignUp) {
        const credentials = await createUserWithEmailAndPassword(
          auth,
          nextEmail,
          nextPassword,
        );

        await updateProfile(credentials.user, { displayName: nextName });
        await upsertUserProfile(credentials.user, nextName);
        await sendEmailVerification(credentials.user);
        setStatus(`Account created for ${nextEmail}. Verification email sent.`);
      } else {
        const credentials = await signInWithEmailAndPassword(
          auth,
          nextEmail,
          nextPassword,
        );

        await upsertUserProfile(
          credentials.user,
          credentials.user.displayName ?? "",
        );
        setStatus(`Signed in as ${credentials.user.email}.`);
      }

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

  return (
    <section className="rounded-3xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
      <h1 className="text-3xl font-bold">
        {isSignUp ? "Create Account" : "Sign In"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isSignUp
          ? "Start your BookCrew profile and save your data to Firebase."
          : "Sign in to access your BookCrew profile and settings."}
      </p>

      <div className="mt-4 rounded-xl border border-accent-soft bg-accent-soft/30 p-3 text-xs text-muted">
        Current user: {user?.email ?? "Not signed in"}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-2">
        {isSignUp ? (
          <>
            <label htmlFor="auth-name-page" className="text-xs font-semibold text-muted">
              Display name
            </label>
            <input
              id="auth-name-page"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Reader Name"
              className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
            />
          </>
        ) : null}

        <label htmlFor="auth-email-page" className="text-xs font-semibold text-muted">
          Email
        </label>
        <input
          id="auth-email-page"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
        />

        <label htmlFor="auth-password-page" className="text-xs font-semibold text-muted">
          Password
        </label>
        <input
          id="auth-password-page"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting
            ? "Working..."
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {isSignUp ? "Already have an account? " : "Need an account? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-semibold text-accent underline underline-offset-4"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </Link>
      </p>

      {status ? <p className="mt-3 text-sm font-medium text-accent">{status}</p> : null}
      {error ? <p className="mt-2 text-sm font-medium text-red-500">{error}</p> : null}
    </section>
  );
}
