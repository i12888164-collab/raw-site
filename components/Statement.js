"use client";
import { motion } from "framer-motion";

export default function Statement({ lines, ghostText, accent }) {
  return (
    <section className="statement" style={{ "--accent": accent }}>
      <div className="statement-ghost">{ghostText}</div>
      <motion.div
        className="statement-inner"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
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
