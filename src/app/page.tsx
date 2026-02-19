import type { ReactElement } from "react";
import HomeDynamicPanels from "@/components/home/HomeDynamicPanels";
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives";
import { getFeaturedBooks, getUpcomingReleases } from "@/lib/googleBooks";

export default async function Home(): Promise<ReactElement> {
  const discover = await getFeaturedBooks();
  const upcoming = await getUpcomingReleases(8);

  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <MotionSection className="overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <div className="bg-gradient-to-r from-accent-soft/70 via-card to-card p-8 md:p-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              BookCrew
            </p>
            <h1 className="text-3xl font-bold md:text-5xl">Your Reading Command Center</h1>
            <p className="mt-3 max-w-2xl text-muted">
              Browse freely, preview books instantly, and sync shelves, profile,
              and release tracking when signed in.
            </p>
          </div>
        </MotionSection>

        <HomeDynamicPanels featured={discover} upcoming={upcoming} />
      </div>
    </MotionPage>
  );
}
