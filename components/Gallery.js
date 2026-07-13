"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Интерактивная галерея: большое фото + миниатюры под ним.
// Первая картинка = обложка. Клик по миниатюре плавно меняет активное фото.
export default function Gallery({ images, alt }) {
  const [active, setActive] = useState(0);
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
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
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
