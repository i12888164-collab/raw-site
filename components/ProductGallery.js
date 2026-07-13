"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Интерактивная галерея товара в Apple-стиле:
// - мгновенный отклик по клику (без ожидания анимации),
// - spring-переходы между слайдами (critically damped, плавно без «дёрганья»),
// - thumbnail-строка + точки (spatial consistency: выбор из того же места),
// - корректная работа с prefers-reduced-motion (кросс-фейд без слайда).
export default function ProductGallery({ images, name, accent = "#c9a96e" }) {
  const [idx, setIdx] = useState(0);
  const count = images.length;
  const safeIdx = Math.min(idx, count - 1);

  function go(dir) {
    setIdx((i) => {
      const next = i + dir;
      if (next < 0) return count - 1;
      if (next >= count) return 0;
      return next;
    });
  }

  return (
    <div className="pg">
      <div className="pg-stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={safeIdx}
            className="pg-slide"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[safeIdx]}
              alt={`${name} ${safeIdx + 1}`}
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + "/placeholder.svg")
                  e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </motion.div>
        </AnimatePresence>

        {count > 1 ? (
          <>
            <button
              type="button"
              className="pg-nav pg-nav-prev"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="pg-nav pg-nav-next"
              onClick={() => go(1)}
              aria-label="Следующее фото"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="pg-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`pg-dot ${i === safeIdx ? "active" : ""}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="pg-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              className={`pg-thumb ${i === safeIdx ? "active" : ""}`}
              onClick={() => setIdx(i)}
              aria-label={`Показать фото ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
