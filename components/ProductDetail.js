import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { SECTIONS, orderLinks } from "@/lib/sections";

export default async function ProductDetail({ section, id }) {
  const meta = SECTIONS[section];

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("section", section)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("section", section)
    .neq("id", id)
    .limit(4);

  const links = orderLinks(product);

  return (
    <div style={{ "--accent": meta.accent }}>
      <div className="product-detail">
        <Link className="back-link detail-back" href={`/${section}`}>← Назад в {meta.title}</Link>
        <div className="product-detail-grid">
          <div className="product-detail-img">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.name} />
            ) : null}
          </div>
          <div className="product-detail-info">
            <span className="product-detail-code">{meta.code} / {meta.title}</span>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-price">{product.price}</div>

            {product.variant ? (
              <div className="card-variant-row" style={{ margin: "1.2rem 0" }}>
                {product.variant.split(",").map((v, i) => (
                  <span className="card-variant-pill" key={i}>{v.trim()}</span>
                ))}
              </div>
            ) : null}

            {product.description ? (
              <p className="product-detail-description">{product.description}</p>
            ) : null}

            <div className="product-detail-actions">
              <a className="detail-order-btn" href={links.telegram} target="_blank" rel="noopener noreferrer">
                Заказать в Telegram
              </a>
              <a className="detail-order-btn detail-order-btn-outline" href={links.whatsapp} target="_blank" rel="noopener noreferrer">
                Заказать в WhatsApp
              </a>
            </div>
          </div>
        </div>

        {related && related.length > 0 ? (
          <div className="related-section">
            <h2 className="related-heading">Ещё из {meta.title}</h2>
            <div className="grid">
              {related.map((p) => {
                const rl = orderLinks(p);
                return (
                  <div className="card" key={p.id}>
                    <Link href={`/${section}/${p.id}`} className="card-media-link">
                      <div className="card-img-wrap">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt={p.name} loading="lazy" />
                        ) : null}
                      </div>
                      <div className="card-name">{p.name}</div>
                    </Link>
                    <div className="card-bottom">
                      <div className="card-price">{p.price}</div>
                      <div className="order-buttons">
                        <a className="order-btn" href={rl.telegram} target="_blank" rel="noopener noreferrer">TG</a>
                        <a className="order-btn" href={rl.whatsapp} target="_blank" rel="noopener noreferrer">WA</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
