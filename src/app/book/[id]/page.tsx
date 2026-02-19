import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookActionsPanel from "@/components/book/BookActionsPanel";
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives";
import { getBookById } from "@/lib/googleBooks";

type BookPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Book | BookCrew",
};

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);

  if (!book) {
    notFound();
  }

  const cleanDescription = stripHtmlTags(book.description);

  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <MotionSection className="space-y-5 rounded-3xl bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.07)] md:p-8">
            <MotionSection className="rounded-2xl border border-accent-soft bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Book Details
              </p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={`Cover of ${book.title}`}
                    className="h-40 w-28 rounded-xl border border-accent-soft object-cover shadow-[0_8px_24px_rgb(0,0,0,0.10)]"
                  />
                ) : (
                  <div className="flex h-40 w-28 items-center justify-center rounded-xl border border-dashed border-accent-soft bg-accent-soft text-center text-xs font-semibold text-muted">
                    No Cover
                  </div>
                )}

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                    {book.title}
                  </h1>
                  <p className="mt-1 text-sm text-muted md:text-base">
                    {book.authors}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-accent px-2.5 py-1 font-semibold text-white">
                      {book.category}
                    </span>
                    <span className="rounded-full border border-accent-soft bg-card px-2.5 py-1 font-semibold text-muted">
                      {book.pageCount ? `${book.pageCount} pages` : "Page count unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </MotionSection>

            <MotionSection className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-accent-soft p-3.5">
                <p className="text-xs text-muted">Published</p>
                <p className="mt-1 font-semibold text-accent">{book.publishedDate}</p>
              </div>
              <div className="rounded-xl bg-accent-soft p-3.5">
                <p className="text-xs text-muted">Publisher</p>
                <p className="mt-1 font-semibold text-accent">{book.publisher}</p>
              </div>
              <div className="rounded-xl bg-accent-soft p-3.5">
                <p className="text-xs text-muted">Google Volume ID</p>
                <p className="mt-1 truncate font-semibold text-accent">{book.id}</p>
              </div>
            </MotionSection>

            <MotionSection className="rounded-2xl border border-accent-soft bg-card p-5">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                {cleanDescription || "No description available."}
              </p>
            </MotionSection>

            <div className="pt-1">
              <Link
                href="/search"
                className="inline-flex rounded-full border border-accent px-5 py-2.5 text-sm font-semibold text-accent"
              >
                Back to Search
              </Link>
            </div>
          </MotionSection>

          <BookActionsPanel
            book={{
              id: book.id,
              title: book.title,
              authors: book.authors,
              thumbnail: book.thumbnail,
              publishedDate: book.publishedDate,
              publishedDateRaw: book.publishedDateRaw,
              previewLink: book.previewLink,
            }}
          />
        </div>
      </div>
    </MotionPage>
  );
}
