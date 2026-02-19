import type { Metadata } from "next";
import AuthPageCard from "@/components/account/AuthPageCard";

export const metadata: Metadata = {
  title: "Sign In | BookCrew",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <AuthPageCard mode="sign-in" />
      </div>
    </main>
  );
}

