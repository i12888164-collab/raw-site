"use client";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

const slugs = Object.keys(SECTIONS);

function Portal({ slug, s, index }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sry = useSpring(ry, { stiffness: 120, damping: 16 });
  const reduce = useReducedMotion();

  function handleMove(e) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 9);
    rx.set(-py * 7);
  }
  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div variants={item} className="portal-col">
      <motion.div className="portal-perspective" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <Link href={`/${slug}`} className="portal" data-brand={slug} style={{ "--accent": s.accent }}>
          <div className="portal-duotone" />
          <div className="portal-glow" />
          <div className="portal-scanline" />
          <motion.div className="portal-inner" style={{ rotateX: srx, rotateY: sry }}>
            <div className="portal-top">
              <span className="portal-index">
                {String(index + 1).padStart(2, "0")}
                <em>/0{slugs.length}</em>
              </span>
              <span className="portal-code">{s.code}</span>
            </div>
            <div className="portal-bottom">
              <span className="portal-tag">{s.tagline}</span>
              <span className="portal-title glitch" data-text={s.title}>
                {s.title}
              </span>
              <span className="portal-cta">
                <span className="portal-cta-circle">→</span>
                Смотреть
              </span>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function PortalHub() {
  return (
    <motion.main className="portals" variants={container} initial="hidden" animate="show">
      {Object.entries(SECTIONS).map(([slug, s], i) => (
        <Portal key={slug} slug={slug} s={s} index={i} />
      ))}
    </motion.main>
  );
}
