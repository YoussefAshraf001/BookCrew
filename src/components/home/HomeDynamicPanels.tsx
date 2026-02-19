"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useFirebaseApp,
  type StoredBook,
} from "@/components/firebase/FirebaseAppProvider";
import { parseGoogleDateToTimestamp } from "@/lib/status";
import type { BookSummary } from "@/lib/googleBooks";

const RELEASE_CUTOFF_TIMESTAMP = Date.now();

type HomeDynamicPanelsProps = {
  featured: BookSummary[];
};

export default function HomeDynamicPanels({
  featured,
}: HomeDynamicPanelsProps) {
  const { user, shelves, shelfPermissionDenied } = useFirebaseApp();
  const statusBooks = shelves;

  const statusCounts = useMemo(
    () => ({
      want: statusBooks.want.length,
      reading: statusBooks.reading.length,
      read: statusBooks.read.length,
      dropped: statusBooks.dropped.length,
      paused: statusBooks.paused.length,
    }),
    [
      statusBooks.dropped.length,
      statusBooks.paused.length,
      statusBooks.reading.length,
      statusBooks.read.length,
      statusBooks.want.length,
    ],
  );

  const continueReading = useMemo(() => {
    return statusBooks.reading.slice(0, 5);
  }, [statusBooks.reading]);

  const recentlyRead = useMemo(() => {
    const sorted = [...statusBooks.read].sort((a, b) => {
      const aDate =
        parseGoogleDateToTimestamp(a.publishedDateRaw ?? undefined) ?? 0;
      const bDate =
        parseGoogleDateToTimestamp(b.publishedDateRaw ?? undefined) ?? 0;
      return bDate - aDate;
    });
    return sorted.slice(0, 5);
  }, [statusBooks.read]);

  const trackedUnreleased = useMemo(() => {
    const dedupe = new Map<string, StoredBook>();

    [
      ...statusBooks.want,
      ...statusBooks.reading,
      ...statusBooks.read,
      ...statusBooks.dropped,
      ...statusBooks.paused,
    ].forEach((book) => {
      const releaseAt = parseGoogleDateToTimestamp(
        book.publishedDateRaw ?? undefined,
      );

      if (releaseAt !== null && releaseAt > RELEASE_CUTOFF_TIMESTAMP) {
        dedupe.set(book.bookId || book.docId, book);
      }
    });

    return [...dedupe.values()].slice(0, 8);
  }, [statusBooks]);

  const statusCards = [
    { label: "Want to Read", count: statusCounts.want },
    { label: "Reading", count: statusCounts.reading },
    { label: "Read", count: statusCounts.read },
    { label: "Dropped", count: statusCounts.dropped },
    { label: "Paused", count: statusCounts.paused },
  ];

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statusCards.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl bg-card p-5 shadow-[0_5px_20px_rgb(0,0,0,0.06)]"
          >
            <p className="text-sm font-medium text-muted">{item.label}</p>
            <p className="mt-2 text-4xl font-bold text-accent">{item.count}</p>
            <p className="mt-1 text-xs text-muted">
              {shelfPermissionDenied
                ? "Firestore rules blocked shelf access."
                : user
                  ? "Synced with shelf."
                  : "Sign in to track status."}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-card p-6 shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Discover Books</h2>
              <p className="mt-1 text-sm text-muted">
                Featured mainstream titles from Google Books.
              </p>
            </div>
            <Link
              href="/explore"
              className="rounded-full border border-accent px-4 py-2 text-xs font-semibold text-accent"
            >
              Explore all
            </Link>
          </div>

          <ul className="mt-5 space-y-3">
            {featured.length > 0 ? (
              featured.map((book) => (
                <li
                  key={book.id}
                  className="rounded-xl border border-accent-soft bg-card p-4"
                >
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-sm text-muted">{book.authors}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-accent-soft px-2 py-1 font-medium text-accent">
                      {book.category}
                    </span>
                    <span className="font-medium text-muted">
                      {book.publishedDate}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-accent-soft p-4 text-sm text-muted">
                Could not load featured books.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold">Continue Reading</h2>
          <p className="mt-1 text-sm text-muted">
            Pick up where you left off, or reopen something you finished.
          </p>

          <div className="mt-5 space-y-3">
            <section className="rounded-xl border border-accent-soft bg-card">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold">Reading Now</span>
                <span className="text-xs text-muted">
                  {continueReading.length} books
                </span>
              </div>
              <ul className="space-y-2 border-t border-accent-soft px-4 py-3">
                {continueReading.length > 0 ? (
                  continueReading.map((book) => (
                    <li
                      key={book.bookId || book.docId}
                      className="rounded-lg bg-accent-soft/40 p-3 text-sm"
                    >
                      <p className="font-semibold">{book.title}</p>
                      <p className="text-xs text-muted">{book.authors}</p>
                      <p className="mt-1 text-xs text-muted">
                        {book.publishedDate}
                      </p>
                      <Link
                        href={`/book/${book.bookId}`}
                        className="mt-2 inline-flex rounded-full border border-accent-soft px-3 py-1 text-xs font-semibold text-accent transition hover:border-accent hover:bg-accent-soft/40"
                      >
                        Continue
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">
                    {user
                      ? "No books in Reading yet."
                      : "Sign in and set books to Reading to continue them here."}
                  </li>
                )}
              </ul>
            </section>

            <section className="rounded-xl border border-accent-soft bg-card">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold">Recently Read</span>
                <span className="text-xs text-muted">
                  {recentlyRead.length} books
                </span>
              </div>
              <ul className="space-y-2 border-t border-accent-soft px-4 py-3">
                {recentlyRead.length > 0 ? (
                  recentlyRead.map((book) => (
                    <li
                      key={book.bookId || book.docId}
                      className="rounded-lg bg-accent-soft/40 p-3 text-sm"
                    >
                      <p className="font-semibold">{book.title}</p>
                      <p className="text-xs text-muted">{book.authors}</p>
                      <p className="mt-1 text-xs text-muted">
                        Finished: {book.publishedDate}
                      </p>
                      <Link
                        href={`/book/${book.bookId}`}
                        className="mt-2 inline-flex rounded-full border border-accent-soft px-3 py-1 text-xs font-semibold text-accent transition hover:border-accent hover:bg-accent-soft/40"
                      >
                        Open again
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">
                    {user
                      ? "No books in Read yet."
                      : "Sign in to track read history."}
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
