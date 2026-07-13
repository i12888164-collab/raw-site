"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { SECTIONS } from "@/lib/sections";
import SearchOverlay from "@/components/SearchOverlay";

const slugs = Object.keys(SECTIONS);

export default function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const activeSlug = slugs.find((s) => pathname.startsWith(`/${s}`));
  const current = activeSlug ? SECTIONS[activeSlug] : null;

  return (
    <>
      <nav className="navbar" style={{ "--nav-accent": current?.accent }}>
        <div className="nav-left">
          <Link href="/" className="nav-logo">MY SHOP</Link>
          {current ? (
            <motion.span
              key={activeSlug}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".18em", color: current.accent }}
            >
              {current.sub}
            </motion.span>
          ) : null}
        </div>

        <div className="nav-switcher">
          {slugs.map((slug) => {
            const s = SECTIONS[slug];
            const active = pathname.startsWith(`/${slug}`);
            return (
              <Link
                key={slug}
                href={`/${slug}`}
                className={`nav-tab ${active ? "nav-tab-active" : ""}`}
                style={{ "--nav-accent": s.accent }}
              >
                {s.code}
                {active ? <span className="nav-tab-indicator" /> : null}
              </Link>
            );
          })}
        </div>

        <div className="nav-page-links">
          <Link href="/about" className={`nav-page-link ${pathname === "/about" ? "nav-page-link-active" : ""}`}>О нас</Link>
          <Link href="/contact" className={`nav-page-link ${pathname === "/contact" ? "nav-page-link-active" : ""}`}>Контакты</Link>
        </div>

        <div className="nav-icons">
          <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Поиск" data-cursor-hover>
            <Search size={17} />
          </button>
          <button className="nav-icon-btn nav-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Меню">
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="nav-mobile-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {slugs.map((slug) => {
              const s = SECTIONS[slug];
              const active = pathname.startsWith(`/${slug}`);
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className={`nav-mobile-link ${active ? "nav-mobile-link-active" : ""}`}
                  style={{ "--nav-accent": s.accent }}
                  onClick={() => setMobileOpen(false)}
                >
                  {s.title}
                </Link>
              );
            })}
            <Link href="/about" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>О нас</Link>
            <Link href="/contact" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Контакты</Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen ? <SearchOverlay onClose={() => setSearchOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}
