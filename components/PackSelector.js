"use client";
import { useState, useMemo } from "react";
import { orderLinks } from "@/lib/sections";
import { renderPackage } from "@/lib/packages";

// Интерактивный выбор пакета доната на странице товара.
export default function PackSelector({ packs, product }) {
  const [selected, setSelected] = useState(0);
  const pack = packs[selected] || packs[0];

  const links = useMemo(() => orderLinks(product, pack), [product, pack]);

  return (
    <div className="pack-selector">
      <div className="pack-selector-label">Выбери пакет</div>
      <div className="pack-grid">
        {packs.map((p, i) => (
          <button
            key={i}
            className={`pack-btn ${selected === i ? "pack-btn-active" : ""}`}
            onClick={() => setSelected(i)}
          >
            <span className="pack-amount">{Number(p.amount).toLocaleString("ru-RU")}</span>
            <span className="pack-cur">{p.currency}</span>
            <span className="pack-price">{p.price} · {renderPackage(p).split("·")[1] || ""}</span>
          </button>
        ))}
      </div>

      <div className="pack-selected-summary">
        <div>
          <div className="pack-selected-amount">
            {Number(pack.amount).toLocaleString("ru-RU")} {pack.currency}
          </div>
          <div className="pack-selected-usd">{renderPackage(pack).split("·")[1] || ""}</div>
        </div>
        <div className="pack-selected-price">{pack.price} <span className="card-usd">{`≈ $${(Number(String(pack.price).replace(/[^\d.]/g, "")) / 12500).toFixed(2)}`}</span></div>
      </div>

      <div className="product-detail-actions">
        <a className="detail-order-btn" href={links.telegram} target="_blank" rel="noopener noreferrer">
          Заказать в Telegram
        </a>
        <a className="detail-order-btn detail-order-btn-outline" href={links.whatsapp} target="_blank" rel="noopener noreferrer">
          Заказать в WhatsApp
        </a>
      </div>
    </div>
  );
}
