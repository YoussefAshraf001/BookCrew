"use client";

import { useEffect, useState, type FormEvent } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirebaseApp } from "@/components/firebase/FirebaseAppProvider";
import { useToast } from "@/components/ui/ToastProvider";

export default function ProfileEditorCard() {
  const { user, profile } = useFirebaseApp();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      setDisplayName("");
      setBio("");
      setIsEditing(false);
      return;
    }

    setDisplayName(
      typeof profile?.displayName === "string"
        ? profile.displayName
        : user.displayName ?? "",
    );
    setBio(typeof profile?.bio === "string" ? profile.bio : "");
  }, [profile, user]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      showToast("Sign in required to edit your profile.", "info");
      return;
    }

    try {
      setIsSaving(true);
      const profileRef = doc(db, "users", user.uid);
      await setDoc(
        profileRef,
        {
          displayName: displayName.trim() || user.displayName || "Reader",
          bio: bio.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      showToast("Profile updated.", "success");
      setIsEditing(false);
    } catch {
      showToast("Could not save profile right now.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartEdit() {
    if (!user) {
      showToast("Sign in required to edit your profile.", "info");
      return;
    }

    setIsEditing(true);
  }

  return (
    <section className="rounded-2xl bg-card p-5 shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">Edit Profile</p>
          <p className="mt-2 text-sm text-muted">
            {user
              ? "Update your public profile details."
              : "Sign in to edit your profile."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartEdit}
          className="rounded-full border border-accent px-4 py-2 text-xs font-semibold text-accent"
        >
          {isEditing ? "Editing" : "Edit"}
        </button>
      </div>

      <form
        onSubmit={handleSave}
        className={[
          "mt-4 space-y-2 transition",
          isEditing ? "opacity-100" : "pointer-events-none opacity-45",
        ].join(" ")}
      >
        <label htmlFor="profile-name" className="text-xs font-semibold text-muted">
          Display name
        </label>
        <input
          id="profile-name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Reader Name"
          className="w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent disabled:opacity-55"
          disabled={!user || !isEditing}
        />

        <label htmlFor="profile-bio" className="text-xs font-semibold text-muted">
          Bio
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="What do you like to read?"
          className="h-24 w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent disabled:opacity-55"
          disabled={!user || !isEditing}
        />

        <button
          type="submit"
          disabled={isSaving || !isEditing}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}
