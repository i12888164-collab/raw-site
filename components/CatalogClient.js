"use client";
import { useMemo, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import GamesGrid from "@/components/GamesGrid";
import { SECTIONS } from "@/lib/sections";

export default function CatalogClient({ products, section }) {
  const [active, setActive] = useState("ВСЕ");
  const categories = SECTIONS[section].categories;

  const filtered = useMemo(() => {
    if (active === "ВСЕ") return products;
    return products.filter((p) => p.category === active);
  }, [products, active]);

  if (!products || products.length === 0) {
    return <div className="empty-state">Товары скоро появятся — загляни чуть позже.</div>;
  }

  return (
    <>
      <div className="filter-bar" id="catalog">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${active === cat ? "filter-chip-active" : ""}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="section-header">
        <div>
          <div className="section-eyebrow">{SECTIONS[section].catalogEyebrow}</div>
          <h2 className="section-title">{SECTIONS[section].catalogHeading}</h2>
        </div>
        <div className="section-count">{filtered.length} {section === "game-topup" ? "ПОЗИЦИЙ" : "ТОВАРОВ"}</div>
      </div>
      {section === "game-topup" ? (
        <GamesGrid products={filtered} />
      ) : (
        <ProductGrid products={filtered} />
      )}
    </>
  );
}
