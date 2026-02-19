import type { Metadata } from "next";
import Link from "next/link";
import BookStatusShortcuts from "@/components/book/BookStatusShortcuts";
import {
  MotionPage,
  MotionSection,
} from "@/components/motion/MotionPrimitives";
import { searchBooks } from "@/lib/googleBooks";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Search | BookCrew",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page } = await searchParams;
  const query = q?.trim() ?? "";
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const perPage = 20;
  const fetchCount = perPage * pageNumber + 1;
  const allBooks = query ? await searchBooks(query, fetchCount) : [];
  const eligibleBooks = allBooks.filter(
    (book) =>
      Boolean(book.thumbnail) &&
      book.authors.trim().toLowerCase() !== "unknown author" &&
      Boolean(book.publishedDateRaw) &&
      book.publishedDate.trim().toLowerCase() !== "unknown",
  );
  const startIndex = (pageNumber - 1) * perPage;
  const books = eligibleBooks.slice(startIndex, startIndex + perPage);
  const hasPreviousPage = pageNumber > 1;
  const hasNextPage = eligibleBooks.length > startIndex + perPage;

  const prevHref = `/search?q=${encodeURIComponent(query)}&page=${pageNumber - 1}`;
  const nextHref = `/search?q=${encodeURIComponent(query)}&page=${pageNumber + 1}`;

  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <MotionSection className="rounded-3xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <h1 className="text-3xl font-bold">Search Books</h1>
          <p className="mt-2 text-muted">
            Search by title, author, or series using Google Books.
          </p>
          <form action="/search" method="get" className="mt-5 flex gap-3">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search title, author, or series"
              className="w-full rounded-full border border-accent-soft bg-card px-5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
            >
              Search
            </button>
          </form>
        </MotionSection>

        {query ? (
          <MotionSection className="space-y-3">
            <p className="text-sm text-muted">
              {books.length} result{books.length === 1 ? "" : "s"} on page{" "}
              {pageNumber} for &quot;{query}&quot;
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {books.map((book) => (
                <article
                  key={book.id}
                  className="rounded-2xl bg-card p-4 shadow-[0_5px_20px_rgb(0,0,0,0.06)]"
                >
                  <div className="flex gap-4">
                    {book.thumbnail ? (
                      <div className="relative h-32 w-22 shrink-0">
                        <img
                          src={book.thumbnail}
                          alt={`Cover of ${book.title}`}
                          className="h-32 w-22 rounded-lg border border-[#e4dccf] object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-22 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#d8cfbe] bg-[#faf7f1] p-2 text-center text-xs font-semibold text-muted">
                        No Cover
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-lg font-semibold">
                        {book.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {book.authors}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-accent-soft px-2 py-1 font-semibold text-accent">
                          {book.category}
                        </span>
                        <span className="font-medium text-muted">
                          {book.publishedDate}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/book/${book.id}`}
                          className="inline-flex rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent"
                        >
                          Open details
                        </Link>
                      </div>
                      <div className="mt-3">
                        <BookStatusShortcuts book={book} compact />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              {hasPreviousPage ? (
                <Link
                  href={prevHref}
                  className="rounded-full border border-accent-soft px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent-soft/40"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-full border border-accent-soft px-4 py-2 text-sm font-semibold text-muted opacity-60">
                  Previous
                </span>
              )}

              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Page {pageNumber}
              </span>

              {hasNextPage ? (
                <Link
                  href={nextHref}
                  className="rounded-full border border-accent-soft px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent-soft/40"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-full border border-accent-soft px-4 py-2 text-sm font-semibold text-muted opacity-60">
                  Next
                </span>
              )}
            </div>
          </MotionSection>
        ) : (
          <MotionSection className="rounded-2xl bg-card p-5 text-sm text-muted shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
            Start with a search term to find books.
          </MotionSection>
        )}
      </div>
    </MotionPage>
  );
}
