// CSRF-защита для state-changing admin-эндпоинтов.
// Кука admin_session уже имеет SameSite=lax, что блокирует межсайтовые POST
// в современных браузерах. Эта проверка — второй рубеж: отклоняет запросы,
// у которых заголовок Origin задан и не совпадает с хостом приложения
// (покрывает старые браузеры и прямые cross-origin вызовы).
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin запросы браузер часто не шлют Origin
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
