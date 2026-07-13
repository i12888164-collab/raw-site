// Валидация и санация ввода для админ-API и поиска.
// Цель: не дать сохранить в БД опасные значения (например, data:/javascript:
// URL в поле image_url, которое потом рендерится в <img src>), и не сломать
// or-фильтр PostgREST спецсимволами.

export const ALLOWED_SECTIONS = ["raw-street", "game-topup", "sportswear"];
export const ALLOWED_TAGS = ["NEW", "HOT", ""];

function str(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

// image_url: только https и только хосты Supabase Storage (откуда реально
// берутся фото). Блокирует data:/javascript:/external домены.
export function isValidImageUrl(u) {
  if (typeof u !== "string" || !u) return false;
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return false;
    if (!url.hostname.endsWith(".supabase.co") && !url.hostname.endsWith(".supabase.in")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Нормализует тело товара к безопасным значениям. Возвращает null, если
// обязательные поля отсутствуют или невалидны.
export function cleanProduct(body) {
  if (!body || typeof body !== "object") return null;

  const section = str(body.section, 40);
  if (!ALLOWED_SECTIONS.includes(section)) return null;

  const name = str(body.name, 200);
  const price = str(body.price, 60);
  if (!name || !price) return null;

  const category = str(body.category, 100) || null;
  const variant = str(body.variant, 200) || null;
  const description = str(body.description, 2000) || null;

  let tag = str(body.tag, 10);
  if (!ALLOWED_TAGS.includes(tag)) tag = "";

  let image_url = str(body.image_url, 500) || null;
  if (image_url && !isValidImageUrl(image_url)) image_url = null;

  const packages = cleanPackages(body.packages);
  const gallery = cleanGallery(body.gallery);

  return { section, category, name, variant, price, description, tag, image_url, packages, gallery };
}

// Валидация галереи (массив URL изображений). Возвращает массив строк-URL
// (только валидные, https + Supabase Storage), либо null, если пусто/невалидно.
// Лимит MAX_GALLERY защищает от аномально большой нагрузки.
const MAX_GALLERY = 12;
export { MAX_GALLERY };

export function cleanGallery(input) {
  if (!input) return null;
  let arr;
  try {
    arr = typeof input === "string" ? JSON.parse(input) : input;
  } catch {
    return null;
  }
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const out = [];
  for (const it of arr) {
    if (typeof it !== "string") continue;
    const url = it.trim();
    if (!url) continue;
    if (!isValidImageUrl(url)) continue; // блокируем data:/external/не-https
    out.push(url);
    if (out.length >= MAX_GALLERY) break;
  }
  return out.length ? out : null;
}

// Валидация пакетов доната: массив { amount, currency, price }.
// amount — количество валюты (число, итоговое, уже с множителем),
// currency — код валюты, price — строка цены (сомы).
export function cleanPackages(input) {
  if (!input) return null;
  let arr;
  try {
    arr = typeof input === "string" ? JSON.parse(input) : input;
  } catch {
    return null;
  }
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const out = [];
  for (const it of arr) {
    if (!it || typeof it !== "object") continue;
    const amount = Number(String(it.amount).replace(/[^\d.]/g, ""));
    const currency = str(it.currency, 10);
    const price = str(it.price, 60);
    if (!isFinite(amount) || amount <= 0 || !currency || !price) continue;
    out.push({ amount, currency, price: price.trim() });
  }
  return out.length ? out : null;
}

// Санация поискового запроса: оставляем только буквы/цифры/пробелы/дефис
// (включая кириллицу). Убираем всё, что может сломать or-синтаксис PostgREST
// или быть использовано для неожиданного поведения: ( ) , * % " ' \ и т.п.
export function sanitizeSearch(q) {
  if (typeof q !== "string") return "";
  return q
    .trim()
    .replace(/[^\p{L}\p{N}\s\-]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}
