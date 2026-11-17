"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Float makes its children gently bob up and down forever.
// Good for the small cards floating on top of the hero image.
export default function Float({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
