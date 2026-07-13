"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { orderLinks } from "@/lib/sections";
import { getPackages, renderPackage } from "@/lib/packages";
import { GAMES } from "@/lib/games";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardAnim = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

// Группируем товары доната по названию игры (product.name).
function groupGames(products) {
  const order = [];
  const byName = {};
  products.forEach((p) => {
    if (byName[p.name] === undefined) {
      byName[p.name] = order.length;
      order.push({ name: p.name, items: [] });
    }
    order[byName[p.name]].items.push(p);
  });
  return order;
}

function GameCard({ name, items }) {
  // Собираем все пакеты из всех товаров этой игры
  const allPacks = [];
  items.forEach((it) => getPackages(it).forEach((p) => allPacks.push({ ...p, _src: it })));
  // Если пакетов нет (старый формат), fallback на один товар
  const source = items[0];
  const meta = GAMES.find((g) => g.name === name);
  const [selected, setSelected] = useState(0);

  // Обложка: берём первое фото из галереи любого товара игры, иначе image_url
  const cover = (() => {
    for (const it of items) {
      if (it.gallery && it.gallery[0]) return it.gallery[0];
    }
    return source.image_url || "/placeholder.svg";
  })();
  const galleryCount = items.reduce((n, it) => n + (Array.isArray(it.gallery) ? it.gallery.length : 0), 0);

  const packs = allPacks.length ? allPacks : null;
  const current = packs ? packs[selected % packs.length] : null;
  const src = current ? current._src : source;
  const links = orderLinks(src, current);

  return (
    <motion.div className="game-card" variants={cardAnim}>
      <Link href={`/game-topup/${source.id}`} className="game-card-link">
        <div className="game-card-header">
          <div className="game-card-dot" />
          <div>
            <div className="game-card-cat">{meta?.category || src.category || ""}</div>
            <div className="game-card-name">{name}</div>
          </div>
          {galleryCount > 1 ? <span className="card-gallery-badge" style={{ marginLeft: "auto" }}>+{galleryCount - 1} 📷</span> : null}
        </div>
        <div className="game-card-body">
          {cover !== "/placeholder.svg" ? (
            <div className="game-card-media">
              <img src={cover} alt={name} loading="lazy" />
            </div>
          ) : null}

          {packs ? (
            <div className="pack-grid">
              {packs.map((p, i) => (
                <button
                  key={i}
                  className={`pack-btn ${selected % packs.length === i ? "pack-btn-active" : ""}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(i); }}
                >
                  <span className="pack-amount">{Number(p.amount).toLocaleString("ru-RU")}</span>
                  <span className="pack-cur">{p.currency}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="game-card-price-only">{src.price}</div>
          )}
        </div>
      </Link>
      <div className="game-card-bottom">
        <div>
          <div className="game-price-label">ЦЕНА</div>
          <div className="game-price-value">
            {current ? current.price : src.price}
            {current ? <span className="card-usd"> {renderPackage(current).split("·")[1] || ""}</span> : null}
          </div>
        </div>
        <div className="order-buttons">
          <a className="order-btn" href={links.telegram} target="_blank" rel="noopener noreferrer" title="Заказать в Telegram" onClick={(e) => e.stopPropagation()}>TG</a>
          <a className="order-btn" href={links.whatsapp} target="_blank" rel="noopener noreferrer" title="Заказать в WhatsApp" onClick={(e) => e.stopPropagation()}>WA</a>
        </div>
      </div>
    </motion.div>
  );
}

export default function GamesGrid({ products }) {
  if (!products || products.length === 0) {
    return <div className="empty-state">Игры скоро появятся — загляни чуть позже.</div>;
  }

  const groups = groupGames(products);

  return (
    <motion.div className="grid" variants={container} initial="hidden" animate="show">
      {groups.map((g) => (
        <GameCard key={g.name} name={g.name} items={g.items} />
      ))}
    </motion.div>
  );
}
