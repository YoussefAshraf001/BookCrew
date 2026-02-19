import type { Metadata } from "next";
import AccountAuthPanel from "@/components/account/AccountAuthPanel";
import AccountSecurityPanel from "@/components/account/AccountSecurityPanel";
import {
  MotionPage,
  MotionSection,
} from "@/components/motion/MotionPrimitives";

export const metadata: Metadata = {
  title: "Account | BookCrew",
};

export default function AccountPage() {
  return (
    <MotionPage className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <MotionSection className="overflow-hidden rounded-3xl bg-card shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <div className="bg-gradient-to-r from-accent-soft/60 via-card to-card p-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="mt-2 max-w-2xl text-muted">
              Guests can browse everything. Use this page to sign in, create an
              account, and manage security & privacy actions.
            </p>
          </div>
        </MotionSection>

        <MotionSection className="grid gap-4 lg:grid-cols-2">
          <AccountAuthPanel />
          <AccountSecurityPanel />
        </MotionSection>

        <MotionSection className="rounded-2xl border border-dashed border-accent-soft bg-card p-5 text-sm text-muted shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
          Profile editing, reading goals, image uploads, and shelf management
          are account-only features.
        </MotionSection>
      </div>
    </MotionPage>
  );
}
