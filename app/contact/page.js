import { SECTIONS } from "@/lib/sections";

export const metadata = {
  title: "Контакты и доставка — MY SHOP",
  description: "Связаться с нами в Telegram и WhatsApp, условия доставки.",
};

export default function ContactPage() {
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`;

  return (
    <div className="simple-page">
      <h1>Контакты и доставка</h1>
      <p>
        Заказы принимаем в Telegram и WhatsApp. Напиши название товара — и мы
        согласуем наличие, цену и доставку. Оплата и сроки обсуждаются в
        переписке.
      </p>

      <div className="contact-row">
        <span className="contact-label">Telegram</span>
        <span className="contact-value">
          {telegram ? (
            <a href={telegram} target="_blank" rel="noopener noreferrer">Написать</a>
          ) : (
            "—"
          )}
        </span>
      </div>
      <div className="contact-row">
        <span className="contact-label">WhatsApp</span>
        <span className="contact-value">
          {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">Написать</a>
          ) : (
            "—"
          )}
        </span>
      </div>
      <div className="contact-row">
        <span className="contact-label">Город</span>
        <span className="contact-value">Ташкент</span>
      </div>
      <div className="contact-row">
        <span className="contact-label">Доставка</span>
        <span className="contact-value">По Ташкенту · по Узбекистану</span>
      </div>

      <p style={{ marginTop: "2rem", color: "var(--muted)", fontSize: ".85rem" }}>
        Связаться можно из любого товара через кнопки TG / WA на карточке.
      </p>
    </div>
  );
}
