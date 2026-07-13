import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Массовое добавление товаров одним запросом.
// Тело: { section, rows: [ { name, category, price, variant, tag, image_url, description } ] }
// Используется формой "Добавить пачкой" в админке.
export async function POST(request) {
  const body = await request.json();
  const { section, rows } = body;

  if (!section || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Передай раздел и хотя бы одну строку" }, { status: 400 });
  }

  const cleaned = rows
    .map((r) => ({
      section,
      name: (r.name || "").trim(),
      category: (r.category || "").trim() || null,
      price: (r.price || "").toString().trim(),
      variant: (r.variant || "").trim() || null,
      tag: (r.tag || "").trim() || null,
      image_url: (r.image_url || "").trim() || null,
      description: (r.description || "").trim() || null,
    }))
    .filter((r) => r.name && r.price);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Нет валидных строк (нужны название и цена)" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("products").insert(cleaned).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ products: data, count: data.length });
}
