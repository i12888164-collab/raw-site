import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-col">
        <div className="footer-logo">MY SHOP</div>
        <p className="footer-note">Три проекта, один сайт. Заказы принимаем в Telegram и WhatsApp.</p>
      </div>
      <div className="footer-col">
        <div className="footer-heading">Разделы</div>
        {Object.entries(SECTIONS).map(([slug, s]) => (
          <Link key={slug} href={`/${slug}`} className="footer-link">{s.title}</Link>
        ))}
      </div>
      <div className="footer-col">
        <div className="footer-heading">Информация</div>
        <Link href="/about" className="footer-link">О нас</Link>
        <Link href="/contact" className="footer-link">Контакты и доставка</Link>
      </div>
      <div className="footer-col">
        <div className="footer-heading">Связаться</div>
        <a className="footer-link" href={process.env.NEXT_PUBLIC_TELEGRAM_URL} target="_blank" rel="noopener noreferrer">Telegram</a>
        <a className="footer-link" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} — сделано с заботой о клиентах</div>
    </footer>
  );
}
