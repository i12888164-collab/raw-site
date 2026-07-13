"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { orderLinks } from "@/lib/sections";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

function Card({ p }) {
  const links = orderLinks(p);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

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

  return (
    <motion.div
      className="card"
      variants={item}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 700 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <Link href={`/${p.section}/${p.id}`} className="card-media-link">
        <div className="card-img-wrap">
          {p.tag ? <span className="card-tag">{p.tag}</span> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image_url || "/placeholder.svg"}
            alt={p.name}
            loading="lazy"
            onError={(e) => {
              if (e.currentTarget.src !== window.location.origin + "/placeholder.svg")
                e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      </Link>
      <div className="card-body">
        {p.category ? <div className="card-category">{p.category}</div> : null}
        <Link href={`/${p.section}/${p.id}`}>
          <div className="card-name">{p.name}</div>
        </Link>
        {p.variant ? (
          <div className="card-variant-row">
            {p.variant.split(",").map((v, i) => (
              <span className="card-variant-pill" key={i}>{v.trim()}</span>
            ))}
          </div>
        ) : null}
        <div className="card-bottom">
          <div className="card-price">{p.price}</div>
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
  if (!products || products.length === 0) {
    return <div className="empty-state">Товары скоро появятся — загляни чуть позже.</div>;
  }

  return (
    <motion.div className="grid" variants={container} initial="hidden" animate="show">
      {products.map((p) => (
        <Card key={p.id} p={p} />
      ))}
    </motion.div>
  );
}
