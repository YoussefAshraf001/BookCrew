"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AccountSecurityPanel() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [resetEmail, setResetEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSendingEmailChange, setIsSendingEmailChange] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser?.email) {
        setResetEmail(nextUser.email);
        setNewEmail(nextUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const canSendVerification = useMemo(
    () => Boolean(user?.email) && !user?.emailVerified,
    [user?.email, user?.emailVerified],
  );

  async function handleSendVerification() {
    if (!user) {
      setError("Sign in first to send a verification email.");
      setStatus("");
      return;
    }

    if (user.emailVerified) {
      setStatus("Email is already verified.");
      setError("");
      return;
    }

    try {
      setIsSendingVerification(true);
      setError("");
      setStatus("");
      await sendEmailVerification(user);
      setStatus(`Verification email sent to ${user.email}.`);
    } catch {
      setError("Could not send verification email right now.");
    } finally {
      setIsSendingVerification(false);
    }
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = resetEmail.trim();

    if (!email) {
      setError("Enter an email address for password reset.");
      setStatus("");
      return;
    }

    try {
      setIsSendingReset(true);
      setError("");
      setStatus("");
      await sendPasswordResetEmail(auth, email);
      setStatus(`Password reset email sent to ${email}.`);
    } catch {
      setError("Could not send password reset email right now.");
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("Sign in first to request an email address change.");
      setStatus("");
      return;
    }

    const nextEmail = newEmail.trim().toLowerCase();

    if (!nextEmail) {
      setError("Enter a new email address.");
      setStatus("");
      return;
    }

    if (nextEmail === (user.email ?? "").toLowerCase()) {
      setError("Enter a different email address.");
      setStatus("");
      return;
    }

    try {
      setIsSendingEmailChange(true);
      setError("");
      setStatus("");
      await verifyBeforeUpdateEmail(user, nextEmail);
      setStatus(
        `Email change verification sent to ${nextEmail}. Confirm it to complete the change.`,
      );
    } catch {
      setError(
        "Could not start email address change. You may need to sign in again and retry.",
      );
    } finally {
      setIsSendingEmailChange(false);
    }
  }

  return (
    <article className="rounded-2xl bg-card p-5 shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-muted">Security</p>
      <p className="mt-2 text-sm text-muted">
        Manage verification, reset, and email-change actions.
      </p>

      <div className="mt-4 rounded-xl border border-accent-soft bg-accent-soft/30 p-3 text-xs text-muted">
        Signed in as: {user?.email ?? "Not signed in"}
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={handleSendVerification}
          disabled={!canSendVerification || isSendingVerification}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSendingVerification ? "Sending verification..." : "Send verification email"}
        </button>
        {user?.emailVerified ? (
          <p className="text-xs font-semibold text-accent">Email is already verified.</p>
        ) : null}
      </div>

      <form onSubmit={handlePasswordReset} className="mt-4 space-y-2">
        <label htmlFor="reset-email" className="text-xs font-semibold text-muted">
          Password reset email
        </label>
        <input
          id="reset-email"
          type="email"
          value={resetEmail}
          onChange={(event) => setResetEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={isSendingReset || !user}
          className="w-full rounded-xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSendingReset ? "Sending reset..." : "Send password reset"}
        </button>
      </form>

      <form onSubmit={handleEmailChange} className="mt-4 space-y-2">
        <label htmlFor="new-email" className="text-xs font-semibold text-muted">
          Change account email
        </label>
        <input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          placeholder="new-email@example.com"
          className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={isSendingEmailChange || !user}
          className="w-full rounded-xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSendingEmailChange
            ? "Sending email change verification..."
            : "Send email change verification"}
        </button>
      </form>

      {status ? <p className="mt-3 text-sm font-medium text-accent">{status}</p> : null}
      {error ? <p className="mt-2 text-sm font-medium text-red-500">{error}</p> : null}
    </article>
  );
}
