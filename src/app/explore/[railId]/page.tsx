import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives";
import { getExploreRailById } from "@/lib/googleBooks";
import BackToTopButton from "@/components/ui/BackToTopButton";

type ExploreRailPageProps = {
  params: Promise<{
    railId: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Category | Explore | BookCrew",
};

export default async function ExploreRailPage({
  params,
  searchParams,
}: ExploreRailPageProps) {
  const { railId } = await params;
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const perPage = 16;
  const visibleCount = perPage * pageNumber;
  const rail = await getExploreRailById(railId, visibleCount);

  if (!rail) {
    notFound();
  }

  const hasMore = rail.totalAvailable > rail.books.length;
  const nextHref = `/explore/${rail.id}?page=${pageNumber + 1}`;

  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <MotionSection className="overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <div className="bg-gradient-to-r from-accent-soft/70 via-card to-card p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Explore Category
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{rail.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted md:text-base">{rail.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">
                {rail.books.length} / {rail.totalAvailable} books
              </span>
              <Link
                href="/explore"
                className="rounded-full border border-accent px-3 py-1.5 text-xs font-semibold text-accent"
              >
                Back to Explore
              </Link>
            </div>
          </div>
        </MotionSection>

        {rail.books.length > 0 ? (
          <>
            <MotionSection className="rounded-3xl bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.07)] md:p-6">
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
                        <p className="line-clamp-2 min-h-[44px] text-sm font-semibold md:text-base">
                          {book.title}
                        </p>
                        <p className="mt-1 line-clamp-2 min-h-[40px] text-xs text-muted md:text-sm">
                          {book.authors}
                        </p>
                        <p className="mt-2 min-h-[20px] text-xs text-muted">{book.publishedDate}</p>
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
            </MotionSection>

            {hasMore ? (
              <MotionSection className="flex justify-center">
                <Link
                  href={nextHref}
                  scroll={false}
                  className="rounded-full border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition hover:-translate-y-0.5 hover:bg-accent-soft/35"
                >
                  Load more
                </Link>
              </MotionSection>
            ) : null}
          </>
        ) : (
          <MotionSection className="rounded-3xl bg-card p-6 text-sm text-muted shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
            No books returned for this category right now.
          </MotionSection>
        )}

        <BackToTopButton />
      </div>
    </MotionPage>
  );
}
