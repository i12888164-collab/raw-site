import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { SECTIONS, orderLinks } from "@/lib/sections";
import { getPackages, renderPackage } from "@/lib/packages";
import { priceToUsd } from "@/lib/currency";
import PackSelector from "@/components/PackSelector";
import ProductGallery from "@/components/ProductGallery";

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
  const packs = getPackages(product);
  const isDonate = packs.length > 0;
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const images = (product.image_url ? [product.image_url, ...gallery] : gallery).filter(Boolean);
  const mainImage = images[0] || product.image_url || null;

  return (
    <div style={{ "--accent": meta.accent }}>
      <div className="product-detail">
        <Link className="back-link detail-back" href={`/${section}`}>← Назад в {meta.title}</Link>

        <div className="product-detail-grid">
          <div className="product-detail-img">
            {images.length > 1 ? (
              <ProductGallery images={images} name={product.name} accent={meta.accent} />
            ) : mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={product.name} />
            ) : null}
          </div>

          <div className="product-detail-info">
            <span className="product-detail-code">{meta.code} / {meta.title}</span>
            <h1 className="product-detail-name">{product.name}</h1>

            {isDonate ? (
              <PackSelector packs={packs} product={product} />
            ) : (
              <>
                <div className="product-detail-price">
                  {product.price} <span className="card-usd">{priceToUsd(product.price)}</span>
                </div>
                {product.variant ? (
                  <div className="card-variant-row" style={{ margin: "1.2rem 0" }}>
                    {product.variant.split(",").map((v) => (
                      <span className="card-variant-pill" key={v}>{v.trim()}</span>
                    ))}
                  </div>
                ) : null}
              </>
            )}

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
                const rpacks = getPackages(p);
                const rIsDonate = rpacks.length > 0;
                const rGallery = Array.isArray(p.gallery) ? p.gallery : [];
                const rImages = (p.image_url ? [p.image_url, ...rGallery] : rGallery).filter(Boolean);
                return (
                  <div className="card" key={p.id}>
                    <Link href={`/${section}/${p.id}`} className="card-media-link">
                      <div className="card-img-wrap">
                        {p.tag ? <span className="card-tag">{p.tag}</span> : null}
                        {rImages.length > 0 ? (
                          <img src={rImages[0]} alt={p.name} loading="lazy" onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + "/placeholder.svg")
                              e.currentTarget.src = "/placeholder.svg";
                          }} />
                        ) : null}
                        {rImages.length > 1 ? <span className="card-gallery-count">{rImages.length} 📷</span> : null}
                      </div>
                      <div className="card-name">{p.name}</div>
                    </Link>
                    <div className="card-bottom">
                      <div className="card-price">
                        {p.price} <span className="card-usd">{priceToUsd(p.price)}</span>
                      </div>
                      <div className="order-buttons">
                        <a className="order-btn" href={rl.telegram} target="_blank" rel="noopener noreferrer">TG</a>
                        <a className="order-btn" href={rl.whatsapp} target="_blank" rel="noopener noreferrer">WA</a>
                      </div>
                    </div>
                    {rIsDonate && rpacks.length ? (
                      <div className="pack-pills" style={{ padding: "0 1rem 1rem" }}>
                        {rpacks.slice(0, 3).map((rp) => (
                          <span className="pack-pill" key={rp.currency + rp.amount}>
                            {Number(rp.amount).toLocaleString("ru-RU")} {rp.currency}
                          </span>
                        ))}
                      </div>
                    ) : null}
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
