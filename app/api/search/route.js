import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${q}%,category.ilike.%${q}%`)
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data || [] });
}
