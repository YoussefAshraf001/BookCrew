"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
};

export function MotionPage({
  children,
  className,
  ...props
}: BaseProps & HTMLMotionProps<"main">) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.main>
  );
}

export function MotionSection({
  children,
  className,
  ...props
}: BaseProps & HTMLMotionProps<"section">) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function MotionDiv({
  children,
  className,
  ...props
}: BaseProps & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionButton({
  children,
  className,
  ...props
}: BaseProps & HTMLMotionProps<"button">) {
  return (
    <motion.button
      className={className}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
