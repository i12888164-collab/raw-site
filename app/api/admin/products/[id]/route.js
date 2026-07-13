import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cleanProduct } from "@/lib/validate";
import { isSameOrigin } from "@/lib/csrf";

export async function PUT(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Недопустимый источник запроса" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const product = cleanProduct(body);
  if (!product) {
    return NextResponse.json({ error: "Передай корректные поля товара" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(product)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function DELETE(request, { params }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Недопустимый источник запроса" }, { status: 403 });
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
