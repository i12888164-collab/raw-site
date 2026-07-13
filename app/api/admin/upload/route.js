import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "products";
const MAX_BYTES = 5 * 1024 * 1024; // 5 МБ

// Разрешённые типы по "магическим" байтам (начало файла).
// SVG/HTML запрещены намеренно (stored XSS через <img src=x.svg>).
const ALLOWED = [
  { ext: "jpg", mime: ["image/jpeg"], sig: [[0xff, 0xd8, 0xff]] },
  { ext: "png", mime: ["image/png"], sig: [[0x89, 0x50, 0x4e, 0x47]] },
  { ext: "webp", mime: ["image/webp"], sig: [[0x52, 0x49, 0x46, 0x46]] },
  { ext: "gif", mime: ["image/gif"], sig: [[0x47, 0x49, 0x46, 0x38]] },
  { ext: "avif", mime: ["image/avif"], sig: [[0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]] },
];

function matchType(buffer, declaredMime) {
  for (const t of ALLOWED) {
    const okSig = t.sig.some((sig) =>
      sig.every((b, i) => buffer[i] === b)
    );
    const okMime = !declaredMime || t.mime.includes(declaredMime.toLowerCase());
    if (okSig && okMime) return t;
  }
  return null;
}

async function ensureBucket() {
  const { data: list } = await supabaseAdmin.storage.listBuckets();
  const exists = list?.some((b) => b.name === BUCKET);
  if (exists) return;
  await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
}

export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: "Файл слишком большой (макс. 5 МБ)" }, { status: 413 });
  }

  const detected = matchType(buffer, file.type);
  if (!detected) {
    return NextResponse.json(
      { error: "Можно загружать только изображения (jpg/png/webp/gif/avif)" },
      { status: 415 }
    );
  }

  try {
    await ensureBucket();
  } catch (e) {
    return NextResponse.json({ error: "Не удалось подготовить хранилище: " + e.message }, { status: 500 });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${detected.ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: detected.mime[0], upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
