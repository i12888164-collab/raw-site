import Link from "next/link";
import { SECTIONS, orderLinks } from "@/lib/sections";
import { getPackages } from "@/lib/packages";
import { priceToUsd } from "@/lib/currency";

export default function FeaturedGrid({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="featured-section">
      <div className="featured-header">
        <span className="featured-eyebrow">Свежее</span>
        <h2 className="featured-title">Новинки во всех разделах</h2>
      </div>
      <div className="grid">
        {products.map((p) => {
          const meta = SECTIONS[p.section];
          const links = orderLinks(p);
          const packs = getPackages(p);
          return (
            <div className="card" key={p.id} style={{ "--accent": meta.accent }}>
              <Link href={`/${p.section}/${p.id}`} className="card-media-link">
                <div className="card-img-wrap">
                  {p.tag ? <span className="card-tag">{p.tag}</span> : null}
                  <span className="card-section-badge">{meta.code}</span>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                  ) : null}
                </div>
              </Link>
              <div className="card-body">
                {p.category ? <div className="card-category">{p.category}</div> : null}
                <Link href={`/${p.section}/${p.id}`}>
                  <div className="card-name">{p.name}</div>
                </Link>
                {packs.length ? (
                  <div className="pack-pills">
                    {packs.slice(0, 3).map((pki) => (
                      <span className="pack-pill" key={pki.currency + pki.amount}>
                        {Number(pki.amount).toLocaleString("ru-RU")} {pki.currency}
                      </span>
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
