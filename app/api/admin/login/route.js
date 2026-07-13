import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/session";
import {
  getClientIp,
  isLoginBlocked,
  registerLoginFailure,
  registerLoginSuccess,
} from "@/lib/ratelimit";

const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 дней

export async function POST(request) {
  const ip = getClientIp(request);

  if (isLoginBlocked(ip)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429 }
    );
  }

  let password;
  try {
    ({ password } = await request.json());
  } catch {
    password = undefined;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  // Требуем, чтобы пароль был задан и достаточно длинным (защита от
  // дефолтных/коротких паролей в .env.local.example).
  const passwordOk =
    adminPassword &&
    adminPassword.length >= 12 &&
    password === adminPassword;

  if (!passwordOk) {
    registerLoginFailure(ip);
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  registerLoginSuccess(ip);
  const token = await createSessionToken(SESSION_MAX_AGE);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
