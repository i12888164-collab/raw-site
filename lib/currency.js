// Валюты и конвертация. Используется и на сервере (SSR-страницы), и в
// админке (client). Базовый набор расширяется пользовательскими валютами
// только в админке (через localStorage), чтобы не трогать БД.
//
// Понятия:
//  - multiplier: сколько "реальных единиц" в 1 введённой. Для UZC = 1000
//    (ввёл "150" -> 150 000 UZC = 150 000 сумов).
//  - usdRate: сколько реальных единиц валюты = 1 USD (для конвертации).

export const DEFAULT_CURRENCIES = {
  UZC: { code: "UZC", label: "Узбекский сом", symbol: "UZC", multiplier: 1000, usdRate: 12500 },
  USD: { code: "USD", label: "Доллар США", symbol: "$", multiplier: 1, usdRate: 1 },
  RUB: { code: "RUB", label: "Рубль", symbol: "₽", multiplier: 1, usdRate: 95 },
  EUR: { code: "EUR", label: "Евро", symbol: "€", multiplier: 1, usdRate: 0.92 },
  KZT: { code: "KZT", label: "Тенге", symbol: "₸", multiplier: 1, usdRate: 480 },
};

export const CURRENCY_ORDER = ["UZC", "USD", "RUB", "EUR", "KZT"];
export const BASE_UZS_RATE = 12500; // 1 USD = 12500 UZS (для цен товаров)

export function getCurrency(code, custom = {}) {
  return custom[code] || DEFAULT_CURRENCIES[code] || DEFAULT_CURRENCIES.UZC;
}

// Введённое "сырое" число (например 150) -> реальное количество с учётом
// множителя валюты (150 * 1000 = 150 000). Возвращает число.
export function rawToAmount(raw, code, custom = {}) {
  const c = getCurrency(code, custom);
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  if (!isFinite(n) || n <= 0) return 0;
  return n * (c.multiplier || 1);
}

// Форматирование количества валюты для показа: "150 000 UZC"
export function formatAmount(amount, code, custom = {}) {
  const c = getCurrency(code, custom);
  const num = Number(amount) || 0;
  return `${num.toLocaleString("ru-RU")} ${c.code}`;
}

// Конвертация количества валюты в доллары -> строка "≈ $12.00"
export function amountToUsd(amount, code, custom = {}) {
  const c = getCurrency(code, custom);
  const num = Number(amount) || 0;
  const usd = num / (c.usdRate || 1);
  return `≈ $${usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Парсинг цены/суммы из строки ("120 000", "120000 сум", "$12") -> число.
export function parseMoney(str) {
  if (str == null) return 0;
  const n = Number(String(str).replace(/[^\d.]/g, ""));
  return isFinite(n) ? n : 0;
}

// Цена (в сомах/UZS) -> "≈ $X.XX"
export function priceToUsd(priceStr, usdRate = BASE_UZS_RATE) {
  const n = parseMoney(priceStr);
  if (!n) return "";
  const usd = n / usdRate;
  return `≈ $${usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Форматирование числа с разделителями: 120000 -> "120 000"
export function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString("ru-RU");
}

// Загрузка пользовательских валют из localStorage (только в браузере).
export function loadCustomCurrencies() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("raw_currencies");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomCurrencies(custom) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("raw_currencies", JSON.stringify(custom));
  } catch {
    /* ignore */
  }
}

// Все доступные валюты (базовые + кастомные) как объект/массив.
export function allCurrencies(custom = {}) {
  return { ...DEFAULT_CURRENCIES, ...custom };
}

export function currencyList(custom = {}) {
  const all = allCurrencies(custom);
  return Object.values(all).sort((a, b) => a.code.localeCompare(b.code));
}

// Нормализация кода валюты (верхний регистр, trim). Для кастомных валют
// ключом служит код.
export function normalizeCurrencyCode(code) {
  return String(code || "").trim().toUpperCase();
}

// Полный "умный" рендер количества: "150" + UZC -> "150 000 UZC · ≈ $12.00"
export function smartAmount(raw, code, custom = {}) {
  const amount = rawToAmount(raw, code, custom);
  if (!amount) return "";
  return `${formatAmount(amount, code, custom)} · ${amountToUsd(amount, code, custom)}`;
}

// Умный рендер цены (в сомах/UZS): "200 000" -> "200 000 · ≈ $16.00"
export function smartPrice(priceStr, usdRate = BASE_UZS_RATE) {
  const n = parseMoney(priceStr);
  if (!n) return "";
  return `${formatMoney(n)} · ${priceToUsd(priceStr, usdRate)}`;
}
