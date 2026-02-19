"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { useFirebaseApp } from "@/components/firebase/FirebaseAppProvider";
import { shelfStatuses, type ShelfStatus } from "@/lib/status";

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

const statusLabels: Record<ShelfStatus, string> = {
  want: "Want to Read",
  reading: "Reading",
  read: "Read",
  paused: "Paused",
  dropped: "Dropped",
};

export default function ShelfBoard() {
  const { user, shelves } = useFirebaseApp();
  const railsRef = useRef<Record<ShelfStatus, HTMLDivElement | null>>({
    want: null,
    reading: null,
    read: null,
    paused: null,
    dropped: null,
  });

  const totalBooks = useMemo(
    () =>
      shelfStatuses.reduce((sum, status) => sum + shelves[status].length, 0),
    [shelves],
  );

  function slide(status: ShelfStatus, direction: "left" | "right") {
    const target = railsRef.current[status];
    if (!target) {
      return;
    }

    target.scrollBy({
      left: direction === "right" ? 360 : -360,
      behavior: "smooth",
    });
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-dashed border-accent-soft bg-card p-6 text-sm text-muted shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
        Sign in to unlock your personal shelves.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-card p-4 shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
        <p className="text-sm font-semibold text-muted">Your Library</p>
        <p className="mt-1 text-2xl font-bold text-accent">{totalBooks}</p>
        <p className="text-xs text-muted">books across all shelves</p>
      </div>

      {shelfStatuses.map((status) => (
        <section
          key={status}
          className="rounded-3xl bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.07)] md:p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{statusLabels[status]}</h2>
              <p className="text-sm text-muted">
                {shelves[status].length} books
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => slide(status, "left")}
                aria-label={`Slide ${statusLabels[status]} shelf left`}
                title="Slide left"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent-soft text-accent transition hover:border-accent hover:bg-accent-soft/40"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={() => slide(status, "right")}
                aria-label={`Slide ${statusLabels[status]} shelf right`}
                title="Slide right"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent-soft text-accent transition hover:border-accent hover:bg-accent-soft/40"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {shelves[status].length > 0 ? (
            <div
              ref={(node) => {
                railsRef.current[status] = node;
              }}
              className="flex gap-3 overflow-x-auto overflow-y-visible pt-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {shelves[status].map((book) => (
                <Link
                  key={`${status}-${book.docId}`}
                  href={`/book/${book.bookId}`}
                  className="group relative block min-w-[138px] max-w-[138px] rounded-xl border border-accent-soft bg-card p-2 transition hover:-translate-y-2 hover:shadow-[0_12px_26px_rgb(0,0,0,0.18)]"
                >
                  <span className="pointer-events-none absolute left-0 top-2 h-[176px] w-1 rounded-l-lg bg-linear-to-b from-accent-soft to-accent/40" />
                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={`Cover of ${book.title}`}
                      className="h-44 w-full rounded-lg border border-accent-soft object-cover"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center rounded-xl border border-dashed border-accent-soft bg-accent-soft/30 text-xs font-semibold text-muted">
                      No Cover
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-accent-soft p-4 text-sm text-muted">
              No books on this shelf yet.
            </p>
          )}
        </section>
      ))}
    </section>
  );
}
