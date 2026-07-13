import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request) {
  const body = await request.json();
  const { section, category, name, variant, price, description, tag, image_url } = body;

  if (!section || !name || !price) {
    return NextResponse.json({ error: "Заполни раздел, название и цену" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([{ section, category, name, variant, price, description, tag, image_url }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
