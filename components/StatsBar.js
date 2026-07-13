"use client";
import { motion, useReducedMotion } from "framer-motion";

export default function StatsBar({ stats, accent }) {
  if (!stats) return null;
  const reduce = useReducedMotion();
  // Apple §4 + §14: spring settle; reduced-motion drops the y-travel (opacity only).
  const anim = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.3 } }
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        transition: { type: "spring", bounce: 0, duration: 0.5 },
      };
  return (
    <div className="stats-bar" style={{ "--accent": accent }}>
      <div className="stats-inner">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className="stat-item"
            viewport={{ once: true, margin: "-60px" }}
            {...anim}
          >
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
