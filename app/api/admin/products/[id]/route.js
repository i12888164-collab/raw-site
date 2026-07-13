import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(request, { params }) {
  const body = await request.json();
  const { section, category, name, variant, price, description, tag, image_url } = body;

  const { data, error } = await supabaseAdmin
    .from("products")
    .update({ section, category, name, variant, price, description, tag, image_url })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(request, { params }) {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
