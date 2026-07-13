import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "ok", {
    httpOnly: true,
    // secure: только на HTTPS. На локальном HTTP (localhost) браузер не отдаёт
    // secure-cookie, и логин перестаёт работать — поэтому выключаем в dev.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14, // 14 дней
    path: "/",
  });
  return res;
}
