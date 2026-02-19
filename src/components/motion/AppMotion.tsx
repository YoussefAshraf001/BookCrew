"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const INTRO_SESSION_KEY = "bookcrew_intro_seen_session_v1";
const INTRO_DURATION_MS = 2300;

function IntroOverlay() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.28, ease: "easeOut" } }}
    >
      <motion.div
        className="relative h-36 w-56"
        style={{ transformPerspective: 1200 }}
        initial={{ scale: 1, opacity: 1 }}
        animate={{
          scale: [1, 1.06, 16],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 2.1,
          ease: "easeInOut",
          times: [0, 0.55, 1],
        }}
      >
        <div className="absolute inset-0 rounded-xl border border-accent/40 bg-card shadow-[0_20px_45px_rgb(0,0,0,0.24)]" />

        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="absolute right-3 top-2 h-32 w-[45%] origin-left rounded-r-lg border border-accent/20 bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.16))]"
            initial={{ rotateY: 0, x: 0, opacity: 0.9 }}
            animate={{
              rotateY: [0, -165, -340],
              x: [0, 6, 0],
              opacity: [0.9, 1, 0.45],
            }}
            transition={{
              duration: 1.15,
              ease: "easeInOut",
              delay: index * 0.13,
            }}
          />
        ))}

        <motion.div
          className="absolute left-6 top-5 h-26 w-[38%] rounded-md border border-accent/40 bg-accent-soft"
          initial={{ opacity: 0.85 }}
          animate={{ opacity: [0.85, 1, 0.7] }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function AppMotion({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [showIntro, setShowIntro] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let readyFrame: number | null = null;
    let introFrame: number | null = null;

    const markReady = () => {
      readyFrame = window.requestAnimationFrame(() => {
        setIsReady(true);
      });
    };

    if (reduceMotion) {
      markReady();
      return () => {
        if (readyFrame !== null) {
          window.cancelAnimationFrame(readyFrame);
        }
      };
    }

    try {
      const seenIntro = sessionStorage.getItem(INTRO_SESSION_KEY) === "true";

      if (seenIntro) {
        markReady();
        return () => {
          if (readyFrame !== null) {
            window.cancelAnimationFrame(readyFrame);
          }
        };
      }

      introFrame = window.requestAnimationFrame(() => {
        setShowIntro(true);
      });
      const timer = window.setTimeout(() => {
        setShowIntro(false);
        setIsReady(true);
        sessionStorage.setItem(INTRO_SESSION_KEY, "true");
      }, INTRO_DURATION_MS);

      return () => {
        window.clearTimeout(timer);
        if (introFrame !== null) {
          window.cancelAnimationFrame(introFrame);
        }
      };
    } catch {
      markReady();
    }

    return () => {
      if (readyFrame !== null) {
        window.cancelAnimationFrame(readyFrame);
      }
      if (introFrame !== null) {
        window.cancelAnimationFrame(introFrame);
      }
    };
  }, [reduceMotion]);

  return (
    <motion.div initial={false}>
      <AnimatePresence>{showIntro ? <IntroOverlay /> : null}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
      {children}
      </motion.div>
    </motion.div>
  );
}
