import type { Metadata } from "next";
import ShelfBoard from "@/components/shelf/ShelfBoard";
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives";

export const metadata: Metadata = {
  title: "My Shelf | BookCrew",
};

export default function ShelfPage() {
  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <MotionSection className="rounded-3xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <h1 className="text-3xl font-bold">My Shelf</h1>
          <p className="mt-2 text-muted">
            Browse your status shelves, slide across rows, and pull a book out to open details.
          </p>
        </MotionSection>

        <ShelfBoard />
      </div>
    </MotionPage>
  );
}
