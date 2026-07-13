"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Интерактивная галерея: большое фото + миниатюры под ним.
// Первая картинка = обложка. Клик по миниатюре плавно меняет активное фото.
export default function Gallery({ images, alt }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const safe = images && images.length ? images : [];
  if (safe.length === 0) return null;

  return (
    <div className="gallery">
      <div className="gallery-stage">
        <AnimatePresence mode="wait">
          <motion.img
            key={safe[active]}
            src={safe[active]}
            alt={alt}
            // Apple §4 + §14: critically-damped spring; reduced-motion keeps only the
            // opacity cross-fade and drops the subtle scale settle.
            initial={{ opacity: 0, scale: reduce ? 1 : 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            onError={(e) => {
              if (e.currentTarget.src !== window.location.origin + "/placeholder.svg")
                e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </AnimatePresence>
        {safe.length > 1 ? <span className="gallery-counter">{active + 1} / {safe.length}</span> : null}
      </div>
      {safe.length > 1 ? (
        <div className="gallery-thumbs">
          {safe.map((u, i) => (
            <button
              type="button"
              key={u}
              className={`gallery-thumb ${i === active ? "gallery-thumb-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Показать фото ${i + 1}`}
            >
              <img src={u} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
