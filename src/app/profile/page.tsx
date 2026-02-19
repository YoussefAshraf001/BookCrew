import type { Metadata } from "next";
import { MotionPage, MotionSection } from "@/components/motion/MotionPrimitives";
import ProfileOverviewCard from "@/components/profile/ProfileOverviewCard";
import UserLibraryCard from "@/components/profile/UserLibraryCard";

export const metadata: Metadata = {
  title: "Profile | BookCrew",
};

export default function ProfilePage() {
  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <MotionSection className="rounded-3xl bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="mt-2 text-muted">
            Public reader identity and reading preferences.
          </p>
        </MotionSection>

        <ProfileOverviewCard />

        <UserLibraryCard />
      </div>
    </MotionPage>
  );
}
