import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export const metadata = {
  title: "О нас — MY SHOP",
  description: "Три проекта, один сайт: Raw Street, Донат Shop и Sport Line.",
};

const STORIES = {
  "raw-street": "Одежда с характером. Каждый дроп — лимитированный. Заказываем из Китая и привозим в Ташкент.",
  "game-topup": "Пополняем любимые игры через узбекские карточки — Humo, Uzcard, Click, Payme. Мгновенно и безопасно.",
  "sportswear": "Рашгарды, кроссовки и экипировка для серьёзных тренировок. Создано для борьбы.",
};

export default function AboutPage() {
  const brands = Object.entries(SECTIONS);

  return (
    <div className="simple-page">
      <h1>О нас</h1>
      <p>
        MY SHOP — это три независимых проекта под одной крышей. Мы не держим
        склад и не берём предоплату онлайн: заказы оформляются в Telegram и
        WhatsApp, а каждый товар можно обсудить напрямую. Ниже — что стоит за
        каждым из разделов.
      </p>

      {brands.map(([slug, s], i) => (
        <div className="brand-story-row" key={slug} style={{ "--accent": s.accent }}>
          <div className="brand-story-code" style={{ color: s.accent }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "1.6rem", margin: "0 0 .4rem" }}>
              {s.title}
            </h2>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".18em", color: s.accent, marginBottom: ".6rem" }}>
              [ {s.code} ] · {s.sub}
            </div>
            <p>{STORIES[slug]}</p>
            <Link href={`/${slug}`} className="back-link" style={{ color: s.accent }}>
              Перейти в {s.title} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
