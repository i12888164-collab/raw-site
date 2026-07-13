"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { orderLinks } from "@/lib/sections";
import { getPackages } from "@/lib/packages";
import { priceToUsd } from "@/lib/currency";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
// Apple §4 + §14: critically-damped spring; reduced-motion keeps opacity, drops the y-travel.
const makeItem = (reduce) => ({
  hidden: { opacity: 0, y: reduce ? 0 : 22 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.45 } },
});

// Компактный рендер пакетов на карточке доната
function PackPills({ packs }) {
  const shown = packs.slice(0, 3);
  return (
    <div className="pack-pills">
      {shown.map((p, i) => (
        <span className="pack-pill" key={i}>
          {Number(p.amount).toLocaleString("ru-RU")} {p.currency}
        </span>
      ))}
      {packs.length > 3 ? <span className="pack-pill pack-pill-more">+{packs.length - 3}</span> : null}
    </div>
  );
}

// Галерея-превью: основная картинка + остальные прокручиваются по наведению
// (отклик мгновенный, как в Apple-интерфейсах — без задержек анимации).
function GalleryStrip({ images, alt }) {
  const [idx, setIdx] = useState(0);
  const count = images.length;
  return (
    <div
      className="card-gallery"
      onMouseEnter={() => count > 1 && setIdx(1)}
      onMouseLeave={() => setIdx(0)}
    >
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={i === 0 ? alt : `${alt} ${i + 1}`}
          loading="lazy"
          className={`card-gallery-img ${i === idx ? "is-active" : ""}`}
          onError={(e) => {
            if (e.currentTarget.src !== window.location.origin + "/placeholder.svg")
              e.currentTarget.src = "/placeholder.svg";
          }}
        />
      ))}
      {count > 1 ? (
        <div className="card-gallery-dots">
          {images.map((_, i) => (
            <span key={i} className={`card-gallery-dot ${i === idx ? "active" : ""}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Card({ p, reduce }) {
  const links = orderLinks(p);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  // Apple §3/§4: spring-smoothed pointer tracking — inherently interruptible and
  // velocity-aware, so the tilt follows the finger and never "snaps" on release.
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const gallery = Array.isArray(p.gallery) ? p.gallery : [];
  const extraImages = (p.image_url ? [p.image_url, ...gallery] : gallery).filter(Boolean);

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 8);
    rx.set(-py * 6);
  }
  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  const packs = getPackages(p);

  return (
    <motion.div
      className="card"
      variants={makeItem(reduce)}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 700 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/${p.section}/${p.id}`} className="card-media-link">
        <div className="card-img-wrap">
          {p.tag ? <span className="card-tag">{p.tag}</span> : null}
          {extraImages.length > 0 ? (
            <GalleryStrip images={extraImages} alt={p.name} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image_url || "/placeholder.svg"}
              alt={p.name}
              loading="lazy"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + "/placeholder.svg")
                  e.currentTarget.src = "/placeholder.svg";
              }}
            />
          )}
          {extraImages.length > 1 ? (
            <span className="card-gallery-count">{extraImages.length} 📷</span>
          ) : null}
        </div>
      </Link>
      <div className="card-body">
        {p.category ? <div className="card-category">{p.category}</div> : null}
        <Link href={`/${p.section}/${p.id}`}>
          <div className="card-name">{p.name}</div>
        </Link>
        {packs.length ? (
          <PackPills packs={packs} />
        ) : p.variant ? (
          <div className="card-variant-row">
            {p.variant.split(",").map((v, i) => (
              <span className="card-variant-pill" key={i}>{v.trim()}</span>
            ))}
          </div>
        ) : null}
        <div className="card-bottom">
          <div className="card-price">
            {p.price} <span className="card-usd">{priceToUsd(p.price)}</span>
          </div>
          <div className="order-buttons">
            <a className="order-btn" href={links.telegram} target="_blank" rel="noopener noreferrer" title="Заказать в Telegram">TG</a>
            <a className="order-btn" href={links.whatsapp} target="_blank" rel="noopener noreferrer" title="Заказать в WhatsApp">WA</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductGrid({ products }) {
  const reduce = useReducedMotion();
  if (!products || products.length === 0) {
    return <div className="empty-state">Товары скоро появятся — загляни чуть позже.</div>;
  }

  return (
    <motion.div className="grid" variants={container} initial="hidden" animate="show">
      {products.map((p) => (
        <Card key={p.id} p={p} reduce={reduce} />
      ))}
    </motion.div>
  );
}
