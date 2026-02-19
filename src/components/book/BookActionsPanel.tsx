"use client";

import Link from "next/link";
import { useFirebaseApp } from "@/components/firebase/FirebaseAppProvider";
import BookStatusShortcuts from "@/components/book/BookStatusShortcuts";

type BookActionsPanelProps = {
  book: {
    id: string;
    title: string;
    authors: string;
    thumbnail: string | null;
    publishedDate: string;
    publishedDateRaw: string | null;
    previewLink: string | null;
  };
};

export default function BookActionsPanel({ book }: BookActionsPanelProps) {
  const { user } = useFirebaseApp();
  const placeholderReadUrl = `https://z-lib.gd/s/${encodeURIComponent(book.title)}?`;

  return (
    <aside className="rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.07)] lg:sticky lg:top-8 lg:h-fit">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Reading Actions
      </p>
      <h2 className="mt-2 text-xl font-bold">Start Reading</h2>
      <p className="mt-2 text-sm text-muted">
        Preview is public. Shelf and status actions require an account.
      </p>

      <div className="mt-5 space-y-2.5">
        <Link
          href={placeholderReadUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-xl border border-accent-soft bg-card px-4 py-3 text-left text-sm font-semibold text-accent transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft/40"
        >
          Read (Placeholder)
        </Link>
        {book.previewLink ? (
          <Link
            href={book.previewLink}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-xl bg-accent px-4 py-3 text-left text-sm font-semibold text-white shadow-[0_6px_18px_rgb(38,70,83,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_22px_rgb(38,70,83,0.36)]"
          >
            Preview
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-accent-soft bg-card px-4 py-3 text-left text-sm font-semibold text-muted opacity-70"
          >
            Preview Unavailable
          </button>
        )}
        <BookStatusShortcuts book={book} iconFavorite />
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-accent-soft bg-card p-3 text-xs text-muted">
        {user
          ? `Signed in as ${user.email}.`
          : "Sign in from Account to unlock shelf and status actions."}
      </div>
    </aside>
  );
}
