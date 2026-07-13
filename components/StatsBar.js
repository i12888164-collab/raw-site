"use client";
import { motion } from "framer-motion";

export default function StatsBar({ stats, accent }) {
  if (!stats) return null;
  return (
    <div className="stats-bar" style={{ "--accent": accent }}>
      <div className="stats-inner">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className="stat-item"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
