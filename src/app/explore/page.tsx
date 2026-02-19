import type { Metadata } from "next";
import Link from "next/link";
import {
  MotionPage,
  MotionSection,
} from "@/components/motion/MotionPrimitives";
import BackToTopButton from "@/components/ui/BackToTopButton";
import { getExploreRails } from "@/lib/googleBooks";

export const metadata: Metadata = {
  title: "Explore | BookCrew",
};

export default async function ExplorePage() {
  const rails = await getExploreRails();
  const hasAnyBooks = rails.some((rail) => rail.books.length > 0);
  const totalBooks = rails.reduce((sum, rail) => sum + rail.books.length, 0);

  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <MotionSection className="overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <div className="bg-gradient-to-r from-accent-soft/70 via-card to-card p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Explore Feed
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Curated Rails For Real Books
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted md:text-base">
              Dive into focused rails by genre and release momentum. Every card
              links straight to details so users can quickly preview, favorite,
              and track statuses.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">
                {rails.length} rails
              </span>
              <span className="rounded-full border border-accent-soft bg-card px-3 py-1.5 text-xs font-semibold text-muted">
                {totalBooks} books loaded
              </span>
              <Link
                href="/search"
                className="rounded-full border border-accent px-3 py-1.5 text-xs font-semibold text-accent"
              >
                Open Search
              </Link>
            </div>
          </div>
        </MotionSection>

        <MotionSection className="rounded-2xl bg-card p-4 shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
          <div className="flex flex-wrap gap-2">
            {rails.map((rail) => (
              <Link
                key={rail.id}
                href={`/explore/${rail.id}`}
                className="rounded-full border border-accent-soft bg-card px-3 py-1.5 text-xs font-semibold text-accent transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft/40"
              >
                {rail.title}
              </Link>
            ))}
          </div>
        </MotionSection>

        {hasAnyBooks ? (
          rails.map((rail) => (
            <MotionSection
              key={rail.id}
              id={rail.id}
              className="rounded-3xl bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.07)] md:p-6"
            >
              <div className="mb-4 flex items-end justify-between gap-3 border-b border-accent-soft pb-4">
                <div>
                  <h2 className="text-xl font-bold">{rail.title}</h2>
                  <p className="text-sm text-muted">{rail.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    {rail.books.length} books
                  </span>
                  <Link
                    href={`/explore/${rail.id}`}
                    className="rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent-soft/35"
                  >
                    Check out
                  </Link>
                </div>
              </div>

              {rail.books.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {rail.books.map((book) => (
                    <article
                      key={`${rail.id}-${book.id}`}
                      className="flex h-full flex-col rounded-2xl border border-accent-soft bg-card p-4 transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgb(0,0,0,0.14)]"
                    >
                      <div className="flex min-h-[122px] gap-3">
                        {book.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt={`Cover of ${book.title}`}
                            className="h-24 w-16 shrink-0 rounded-lg border border-accent-soft object-cover"
                          />
                        ) : (
                          <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-accent-soft bg-accent-soft/35 text-[10px] font-semibold text-muted">
                            NO COVER
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-semibold md:text-base">
                            {book.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-muted md:text-sm">
                            {book.authors}
                          </p>
                          <p className="mt-2 min-h-[20px] text-xs text-muted">
                            {book.publishedDate}
                          </p>
                          <p className="mt-2 inline-block max-w-full truncate rounded-full bg-accent-soft px-2 py-1 text-[10px] font-semibold text-accent md:text-xs">
                            {book.category}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-1">
                        <Link
                          href={`/book/${book.id}`}
                          className="inline-flex rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                        >
                          View Book
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-accent-soft bg-card p-4 text-sm text-muted">
                  No books returned for this rail right now.
                </p>
              )}
            </MotionSection>
          ))
        ) : (
          <MotionSection className="rounded-3xl bg-card p-6 text-sm text-muted shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
            Could not load explore rails. Confirm
            <code className="px-1">GOOGLE_BOOKS_API_KEY</code> in
            <code className="px-1">.env.local</code> and try again.
          </MotionSection>
        )}

        <BackToTopButton />
      </div>
    </MotionPage>
  );
}
