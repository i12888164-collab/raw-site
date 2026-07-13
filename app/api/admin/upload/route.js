import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "products";

// Убеждаемся, что бакет для фото существует и публичен.
// Раньше бакет надо было создавать вручную в Supabase — из-за этого
// загрузка падала ("bucket not found"), а в админке картинки не появлялись.
async function ensureBucket() {
  const { data: list } = await supabaseAdmin.storage.listBuckets();
  const exists = list?.some((b) => b.name === BUCKET);
  if (exists) return;
  await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  // Публичная политика на чтение (на случае, если auto-policy не сработала)
  try {
    await supabaseAdmin.storage.rpc("create_policy_if_not_exists", {});
  } catch {
    /* rpc может отсутствовать — не критично, бакет создаётся public */
  }
}

// Принимает файл (multipart/form-data), кладёт в Supabase Storage bucket "products",
// возвращает публичную ссылку на фото.
export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  try {
    await ensureBucket();
  } catch (e) {
    return NextResponse.json({ error: "Не удалось подготовить хранилище: " + e.message }, { status: 500 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
