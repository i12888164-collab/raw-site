// Подписанные сессионные токены админа (HMAC-SHA256 поверх Web Crypto).
// Работает и в Edge runtime (middleware), и в Node runtime (API routes),
// потому что использует глобальный crypto.subtle (доступен в обоих).
//
// Заменяет старую схему, где сессия была константой "ok" в куке, которую
// мог подделать кто угодно (broken access control).
// ВНИМАНИЕ: не импортируем node:crypto — он недоступен в Edge Runtime.

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

// Секрет для подписи. Приоритет у выделенного ADMIN_SESSION_SECRET;
// если его нет — резервный ключ из ADMIN_PASSWORD + соль (не идеально,
// но лучше константы). В production обязательно задайте ADMIN_SESSION_SECRET.
function getSecret() {
  const dedicated = process.env.ADMIN_SESSION_SECRET;
  if (dedicated && dedicated.length >= 16) return dedicated;
  const pwd = process.env.ADMIN_PASSWORD || "";
  return pwd + ":raw-site-session-salt-v1";
}

function toBase64Url(bytes) {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(data, secret) {
  const key = await subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await subtle.sign("HMAC", key, enc.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

// Константное сравнение, чтобы не утекало через тайминг.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 14; // 14 дней

export async function createSessionToken(maxAgeSec = DEFAULT_MAX_AGE) {
  const payload = { exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const body = toBase64Url(enc.encode(JSON.stringify(payload)));
  const sig = await hmac(body, getSecret());
  return `${body}.${sig}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;

  const expected = await hmac(body, getSecret());
  if (!timingSafeEqual(expected, sig)) return false;

  try {
    const json = dec.decode(fromBase64Url(body));
    const payload = JSON.parse(json);
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}
