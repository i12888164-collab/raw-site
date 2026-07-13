"use client";
import { motion, useReducedMotion } from "framer-motion";

export default function Statement({ lines, ghostText, accent }) {
  const reduce = useReducedMotion();
  // Apple §4 + §14: spring settle; reduced-motion reads as a calm opacity cross-fade.
  const innerAnim = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.4 } }
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        transition: { type: "spring", bounce: 0.1, duration: 0.6 },
      };
  return (
    <section className="statement" style={{ "--accent": accent }}>
      <div className="statement-ghost">{ghostText}</div>
      <motion.div
        className="statement-inner"
        viewport={{ once: true }}
        {...innerAnim}
      >
        <h3 className="statement-title">
          {lines.map((line, i) => (
            <span key={i} className={i === lines.length - 1 ? "c-accent" : ""}>{line}</span>
          ))}
        </h3>
      </motion.div>
    </section>
  );
}
