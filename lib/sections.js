// Метаданные разделов — единое место, где описаны все три бренда.
export const SECTIONS = {
  "raw-street": {
    code: "RS",
    sub: "CLOTHING",
    title: "Raw Street",
    tagline: "Одежда, привезённая из Китая",
    accent: "#c9a96e",
    bg: "#0a0a0e",
    surface: "#1a1a1e",
    badge: "[ SERIES: URBAN 01 ] [ RAW STREET ]",
    heroLines: [{ text: "УЛИЦА —", color: "fg" }, { text: "ТВОЙ", color: "fg" }, { text: "ХОЛСТ", color: "accent" }],
    heroSub: "Одежда с характером. Каждый дроп — лимитированный. Заказываем из Китая, привозим в Ташкент.",
    ctaPrimary: "К товары",
    categories: ["ВСЕ", "ХУДИ", "КУРТКИ", "ФУТБОЛКИ", "ШТАНЫ", "АКСЕССУАРЫ"],
    catalogEyebrow: "[ RAW STREET ] [ CLOTHING ]",
    catalogHeading: "КОЛЛЕКЦИЯ",
    statement: ["НОСИ С ГОРДОСТЬЮ.", "БУДЬ СОБОЙ."],
    ghostText: "RAW STREET",
  },
  "game-topup": {
    code: "GT",
    sub: "TOP-UP",
    title: "Донат Shop",
    tagline: "Пополнение игр по узбекским картам",
    accent: "#7c3aed",
    bg: "#07070f",
    surface: "#0f0f1a",
    badge: "[ СИСТЕМА ПОПОЛНЕНИЯ ] [ ДОНАТ SHOP ]",
    heroLines: [{ text: "ДОНАТ БЕЗ", color: "fg" }, { text: "ГРАНИЦ", color: "accent" }],
    heroSub: "Пополняй любимые игры через узбекские карточки. Humo, Uzcard, Click, Payme — всё принимаем.",
    ctaPrimary: "Выбрать игру",
    features: ["МГНОВЕННО", "БЕЗОПАСНО", "UZCARD / HUMO"],
    stats: [
      { value: "24/7", label: "ПОДДЕРЖКА" },
      { value: "1 мин", label: "ВРЕМЯ ЗАЧИСЛЕНИЯ" },
      { value: "100%", label: "ГАРАНТИЯ ЗАЧИСЛЕНИЯ" },
    ],
    categories: ["ВСЕ", "MOBILE", "PC", "CONSOLE"],
    catalogEyebrow: "[ ДОНАТ SHOP ] [ ПОПОЛНЕНИЕ ]",
    catalogHeading: "ВЫБЕРИ ИГРУ",
    statement: ["ИГРАЙ БЕЗ ПАУЗ.", "ПОПОЛНЯЙ ЗА МИНУТУ."],
    ghostText: "ДОНАТ SHOP",
  },
  "sportswear": {
    code: "SL",
    sub: "ATHLETIC",
    title: "Sport Line",
    tagline: "Рашгарды, кроссовки, экипировка",
    accent: "#4a90c4",
    bg: "#121c28",
    surface: "#1a2633",
    badge: "[ SERIES: SPORT 01 ] [ SPORT LINE ]",
    heroLines: [{ text: "СОЗДАН ДЛЯ", color: "fg" }, { text: "БОРЬБЫ", color: "accent" }],
    heroSub: "Рашгарды, кроссовки и всё для спорта. Экипировка для серьёзных тренировок. Ташкент.",
    ctaPrimary: "К товары",
    categories: ["ВСЕ", "РАШГАРДЫ", "ШОРТЫ", "КРОССОВКИ", "КОМПРЕССИЯ", "АКСЕССУАРЫ"],
    catalogEyebrow: "[ SPORT LINE ] [ ЭКИПИРОВКА ]",
    catalogHeading: "КОЛЛЕКЦИЯ",
    statement: ["ТРЕНИРУЙСЯ ЖЁСТЧЕ.", "СТАНЬ СИЛЬНЕЕ."],
    ghostText: "SPORT LINE",
  },
};

export function orderLinks(product) {
  const label = product.category && product.category !== product.name
    ? `${product.name} — ${product.category}`
    : product.name;
  const text = encodeURIComponent(
    `Здравствуйте! Хочу заказать: ${label}${product.variant ? " (" + product.variant + ")" : ""}`
  );
  return {
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || "#",
    whatsapp: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""}?text=${text}`,
  };
}
