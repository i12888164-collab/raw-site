// СЕРВЕРНЫЙ клиент — используется только внутри app/api/admin/*.
// Использует service_role ключ, который обходит RLS. НИКОГДА не импортируй
// этот файл в клиентские компоненты ("use client") — ключ не должен попасть в браузер.
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
