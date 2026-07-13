"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { orderLinks } from "@/lib/sections";
import { GAMES } from "@/lib/games";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardAnim = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

function GameCard({ name, packs }) {
  const [selected, setSelected] = useState(0);
  const pack = packs[selected];
  const links = orderLinks(pack);
  const meta = GAMES.find((g) => g.name === name);

  return (
    <motion.div className="game-card" variants={cardAnim}>
      <div className="game-card-header">
        <div className="game-card-dot" />
        <div>
          <div className="game-card-cat">{meta?.category || pack.category || ""}</div>
          <div className="game-card-name">{name}</div>
        </div>
      </div>
      <div className="game-card-body">
        <div className="pack-grid">
          {packs.map((p, i) => (
            <button
              key={p.id}
              className={`pack-btn ${selected === i ? "pack-btn-active" : ""}`}
              onClick={() => setSelected(i)}
            >
              {p.variant}
            </button>
          ))}
        </div>
        <div className="game-card-bottom">
          <div>
            <div className="game-price-label">ЦЕНА</div>
            <div className="game-price-value">{pack.price}</div>
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

export default function GamesGrid({ products }) {
  if (!products || products.length === 0) {
    return <div className="empty-state">Игры скоро появятся — загляни чуть позже.</div>;
  }

  // Группируем пакеты пополнения по названию игры (product.name)
  const order = [];
  const byName = {};
  products.forEach((p) => {
    if (byName[p.name] === undefined) {
      byName[p.name] = order.length;
      order.push({ name: p.name, packs: [] });
    }
    order[byName[p.name]].packs.push(p);
  });

  return (
    <motion.div className="grid" variants={container} initial="hidden" animate="show">
      {order.map((g) => (
        <GameCard key={g.name} name={g.name} packs={g.packs} />
      ))}
    </motion.div>
  );
}
