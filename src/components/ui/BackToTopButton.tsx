"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <motion.button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-accent-soft bg-card px-4 py-2 text-xs font-semibold text-accent shadow-[0_10px_24px_rgb(0,0,0,0.22)] transition hover:border-accent hover:bg-accent-soft/35 md:bottom-8 md:right-10"
      aria-label="Back to top"
      title="Back to top"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.span
        className="inline-flex"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <ArrowUpIcon />
      </motion.span>
      Back to top
    </motion.button>
  );
}
