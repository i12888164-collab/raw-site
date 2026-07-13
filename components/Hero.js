"use client";
import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { SECTIONS } from "@/lib/sections";

const stagger = { show: { transition: { staggerChildren: 0.12 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero({ slug }) {
  const s = SECTIONS[slug];

  return (
    <section className="hero" style={{ "--accent": s.accent }}>
      <div className="hero-bg" />
      {s.heroImage ? (
        <div className="hero-photo">
          <img
            src={s.heroImage}
            alt=""
            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
          />
        </div>
      ) : null}
      <motion.div className="hero-content" initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={fadeUp} className="hero-badge">{s.badge}</motion.div>

        <h1 className="hero-title">
          {s.heroLines.map((line, i) => (
            <motion.span key={i} variants={fadeUp} className={line.color === "accent" ? "c-accent" : ""}>
              {line.text}
            </motion.span>
          ))}
        </h1>

        <motion.p variants={fadeUp} className="hero-sub">{s.heroSub}</motion.p>

        {s.features ? (
          <motion.div variants={fadeUp} className="feature-badges">
            {s.features.map((f) => (
              <span key={f} className="feature-badge"><Check size={13} /> {f}</span>
            ))}
          </motion.div>
        ) : null}

        <motion.div variants={fadeUp} className="hero-ctas">
          <a href="#catalog" className="hero-cta-primary">{s.ctaPrimary}</a>
          <a
            href={process.env.NEXT_PUBLIC_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta-secondary"
          >
            Написать в Telegram
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-scroll-hint"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <ChevronDown size={18} />
      </motion.div>
    </section>
  );
}
