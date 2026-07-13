// Простой in-memory rate-limiter для защиты /api/admin/login от брутфорса.
// В serverless (Vercel) каждый инстанс держит свой счётчик — этого достаточно,
// чтобы поднять стоимость перебора на порядки, но не заменяет распределённый
// лимит (Redis/Upstash) для высоконагруженных сценариев.
const WINDOW_MS = 15 * 60 * 1000; // 15 минут
const MAX_FAILURES = 10; // <=10 неудач за окно, иначе блок

// ip -> { count, first }
const failures = new Map();

function windowStart(rec) {
  if (!rec || Date.now() - rec.first > WINDOW_MS) return null;
  return rec;
}

export function isLoginBlocked(ip) {
  const rec = windowStart(failures.get(ip));
  if (!rec) return false;
  return rec.count >= MAX_FAILURES;
}

export function registerLoginFailure(ip) {
  const rec = windowStart(failures.get(ip)) || { count: 0, first: Date.now() };
  rec.count += 1;
  failures.set(ip, rec);
}

export function registerLoginSuccess(ip) {
  failures.delete(ip);
}

export function getClientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
