import { NextResponse } from "next/server";

// Защищает всё под /admin, кроме страницы логина и API логина.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) return NextResponse.next();

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const session = request.cookies.get("admin_session")?.value;
    if (session !== "ok") {
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
