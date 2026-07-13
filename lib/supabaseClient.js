// Публичный клиент — используется на страницах сайта для чтения товаров.
// Безопасен для браузера: anon key может только читать (см. supabase/schema.sql).
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
