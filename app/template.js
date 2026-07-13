"use client";
import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }) {
  const reduce = useReducedMotion();
  // Apple §4 + §14: critically-damped page transition; reduced-motion drops the
  // y-axis travel so navigation cross-fades instead of sliding.
  const anim = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -14 },
        transition: { type: "spring", bounce: 0, duration: 0.5 },
      };
  return <motion.div {...anim}>{children}</motion.div>;
}
