import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

// Защищает всё под /admin, кроме страницы логина и API логина.
// Сессия — подписанный HMAC-токен в httpOnly-куке (см. lib/session.js),
// а не константа "ok", которую раньше мог подделать любой.
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) return NextResponse.next();

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("admin_session")?.value;
    const valid = token ? await verifySessionToken(token) : false;
    if (!valid) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
