"use client";

import { type Timestamp } from "firebase/firestore";
import { useFirebaseApp } from "@/components/firebase/FirebaseAppProvider";

type CardStats = {
  reading: number;
  read: number;
  wantToRead: number;
  dropped: number;
  paused: number;
  favorites: number;
};

function formatJoined(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return "Unknown";
}

function cardIdFromUid(uid: string): string {
  // Deterministic hash from full UID to keep card number stable and unique-like.
  let hash = 0;
  for (let index = 0; index < uid.length; index += 1) {
    hash = (hash * 31 + uid.charCodeAt(index)) >>> 0;
  }

  const hashBlock = hash.toString(36).toUpperCase().padStart(7, "0");
  const uidBlock = uid.slice(-6).toUpperCase().padStart(6, "0");
  return `BC-${hashBlock}-${uidBlock}`;
}

export default function UserLibraryCard() {
  const { user, profile, shelves, favorites } = useFirebaseApp();
  const displayName =
    typeof profile?.displayName === "string"
      ? profile.displayName
      : user?.displayName || "Guest Reader";
  const bio =
    typeof profile?.bio === "string" && profile.bio.trim()
      ? profile.bio
      : "No bio yet.";
  const profileImage =
    typeof profile?.profileImageBase64 === "string"
      ? profile.profileImageBase64
      : null;
  const joinedAt = formatJoined(profile?.createdAt);
  const stats: CardStats = {
    reading: shelves.reading.length,
    read: shelves.read.length,
    wantToRead: shelves.want.length,
    dropped: shelves.dropped.length,
    paused: shelves.paused.length,
    favorites: favorites.length,
  };

  const cardId = user?.uid ? cardIdFromUid(user.uid) : "BC-GUEST-0000";

  return (
    <section className="overflow-hidden rounded-3xl border border-accent-soft bg-card shadow-[0_16px_38px_rgb(0,0,0,0.16)]">
      <div className="relative border-b border-accent-soft bg-[linear-gradient(130deg,var(--accent),color-mix(in_oklab,var(--accent) 40%,black)_64%)] p-6 md:p-8">
        <div className="absolute right-4 top-4">
          <img
            src="/logo.jpg"
            alt="BookCrew logo"
            className="h-16 w-16 rounded-lg object-cover"
          />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
          BookCrew Membership
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
          Library Access Card
        </h2>
        <p className="mt-1 text-sm text-white/80">
          {user
            ? "Verified reader profile"
            : "Sign in to activate your member card"}
        </p>
      </div>

      <div className="space-y-3 p-6 md:p-8">
        {/* <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-soft bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl border border-accent-soft bg-accent-soft/30">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Member profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted">
                  IMG
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Member Name</p>
              <p className="mt-1 text-xl font-bold">{displayName}</p>
              <p className="text-xs text-muted">{bio}</p>
            </div>
          </div>
          <p className="rounded-full border border-accent-soft bg-accent-soft/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            {user ? "Active Member" : "Guest"}
          </p>
        </div> */}

        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-accent-soft bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Card No.
            </p>
            <p className="mt-1 font-mono text-base font-bold text-accent">
              {cardId}
            </p>
          </article>
          <article className="rounded-2xl border border-accent-soft bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Member Since
            </p>
            <p className="mt-1 text-sm font-semibold">{joinedAt}</p>
          </article>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          <article className="rounded-xl bg-accent-soft/45 p-3 sm:col-span-2">
            <p className="text-xs text-muted">Reading</p>
            <p className="text-xl font-bold text-accent">{stats.reading}</p>
          </article>
          <article className="rounded-xl bg-accent-soft/45 p-3 sm:col-span-2">
            <p className="text-xs text-muted">Read</p>
            <p className="text-xl font-bold text-accent">{stats.read}</p>
          </article>
          <article className="rounded-xl bg-accent-soft/45 p-3 sm:col-span-2">
            <p className="text-xs text-muted">Want to read</p>
            <p className="text-xl font-bold text-accent">{stats.wantToRead}</p>
          </article>
          <article className="rounded-xl bg-accent-soft/45 p-3 sm:col-span-2 sm:col-start-2">
            <p className="text-xs text-muted">Dropped</p>
            <p className="text-xl font-bold text-accent">{stats.dropped}</p>
          </article>
          <article className="rounded-xl bg-accent-soft/45 p-3 sm:col-span-2 sm:col-start-4">
            <p className="text-xs text-muted">Paused</p>
            <p className="text-xl font-bold text-accent">{stats.paused}</p>
          </article>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-accent-soft bg-card px-6 py-4 md:px-8">
        <p className="text-sm text-foreground">
          Favorites:
          <span className="ml-2 font-bold text-accent">{stats.favorites}</span>
        </p>
        <p className="rounded-full border border-accent-soft bg-accent-soft/40 px-3 py-1 text-xs font-semibold text-foreground">
          {user?.email ?? "guest@bookcrew.local"}
        </p>
      </div>
    </section>
  );
}
