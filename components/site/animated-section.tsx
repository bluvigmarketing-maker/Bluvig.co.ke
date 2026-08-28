"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
