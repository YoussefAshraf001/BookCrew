"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppNav from "@/components/layout/AppNav";

export default function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/api/");

  return (
    <>
      {!hideNav ? (
        <div className="px-6 pt-6 md:px-10 md:pt-10">
          <div className="mx-auto max-w-6xl">
            <AppNav />
          </div>
        </div>
      ) : null}
      {children}
    </>
  );
}
