import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cleanProduct, ALLOWED_SECTIONS } from "@/lib/validate";
import { isSameOrigin } from "@/lib/csrf";

const MAX_ROWS = 200; // защита от заваливания БД одним запросом

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Недопустимый источник запроса" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const { section, rows } = body;
  if (!ALLOWED_SECTIONS.includes(section) || !Array.isArray(rows)) {
    return NextResponse.json({ error: "Передай раздел и массив строк" }, { status: 400 });
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: "Нет строк для добавления" }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Слишком много строк (макс. ${MAX_ROWS})` }, { status: 413 });
  }

  // Форсируем раздел из пути: строки не могут «перепрыгнуть» в чужой раздел.
  const cleaned = rows
    .map((r) => cleanProduct({ ...r, section }))
    .filter((r) => r);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Нет валидных строк (нужны название и цена)" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("products").insert(cleaned).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ products: data, count: data.length });
}
