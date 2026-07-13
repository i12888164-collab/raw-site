"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { SECTIONS } from "@/lib/sections";

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <motion.div
      className="search-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="search-box">
        <div className="search-input-row">
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Поиск товаров..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-close" onClick={onClose} aria-label="Закрыть">
            <X size={22} />
          </button>
        </div>

        {query.trim().length >= 2 && !loading && results && results.length === 0 ? (
          <div className="search-empty">Ничего не найдено по «{query}»</div>
        ) : null}

        {query.trim().length < 2 ? (
          <div className="search-hint">Введи минимум 2 символа — ищем по всем трём разделам</div>
        ) : null}

        {results && results.length > 0 ? (
          <div className="search-results">
            {results.map((p) => {
              const meta = SECTIONS[p.section];
              return (
                <Link
                  key={p.id}
                  href={`/${p.section}/${p.id}`}
                  className="search-result-row"
                  onClick={onClose}
                >
                  <div className="search-result-img">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">{p.name}</div>
                    <div className="search-result-meta" style={{ color: meta.accent }}>{meta.title}{p.category ? ` · ${p.category}` : ""}</div>
                  </div>
                  <div className="search-result-price">{p.price}</div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
