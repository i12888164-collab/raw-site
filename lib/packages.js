// Работа с пакетами доната (game-topup). Пакет = { amount, currency, price }.
// amount — итоговое количество валюты (уже с множителем), currency — код,
// price — строка цены (в сомах/UZS).
import {
  formatAmount, amountToUsd, getCurrency, rawToAmount, normalizeCurrencyCode,
} from "@/lib/currency";

// Нормализует сырой пакет из формы -> готовый для БД. Возвращает null,
// если невалиден. rawAmount — введённое пользователем ("150"), multiplier
// применяется внутри rawToAmount.
export function buildPackage(rawAmount, currencyCode, price, custom = {}) {
  const code = normalizeCurrencyCode(currencyCode);
  if (!code) return null;
  const amount = rawToAmount(rawAmount, code, custom);
  if (!amount) return null;
  const p = String(price || "").trim();
  if (!p) return null;
  return { amount, currency: code, price: p };
}

// Рендер одного пакета для показа: "150 000 UZC · ≈ $12.00"
export function renderPackage(pkg, custom = {}) {
  if (!pkg || !pkg.amount) return "";
  return `${formatAmount(pkg.amount, pkg.currency, custom)} · ${amountToUsd(pkg.amount, pkg.currency, custom)}`;
}

// Достаёт пакеты из товара (jsonb или распарсенный массив).
export function getPackages(product) {
  if (!product) return [];
  const p = product.packages;
  if (!p) return [];
  if (Array.isArray(p)) return p;
  if (typeof p === "string") {
    try { return JSON.parse(p); } catch { return []; }
  }
  return [];
}

// Валидация массива пакетов (для админки): убирает пустые, следит за
// лимитом. Возвращает очищенный массив (может быть пустым).
export function sanitizePackages(list, max = 12) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const it of list) {
    if (!it) continue;
    const amount = Number(it.amount);
    const currency = normalizeCurrencyCode(it.currency);
    const price = String(it.price || "").trim();
    if (!isFinite(amount) || amount <= 0 || !currency || !price) continue;
    out.push({ amount, currency, price });
    if (out.length >= max) break;
  }
  return out;
}
