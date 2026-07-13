-- ============================================================================
-- raw-site — Supabase schema (hardened)
-- Применяется в Supabase SQL Editor. Идемпотентно там, где возможно.
-- RLS уже включён; политики гарантируют: чтение публично, запись только
-- через service_role. Уровень приложения НЕ ходит через anon на запись.
-- ============================================================================

-- --- Таблица товаров --------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  section     text not null,
  category    text,
  name        text not null,
  variant     text,
  price       text not null,
  description text,
  tag         text,
  image_url   text,
  gallery     jsonb,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- Индексы
create index if not exists products_section_idx on public.products (section);
create index if not exists products_sort_idx on public.products (section, sort_order);

-- --- CHECK-ограничения (второй рубеж после валидации на API) -----------------
-- Добавляются по одному; если уже есть — пропускаются (ALTER выбросит ошибку,
-- но применение безопасно повторять).
alter table public.products add constraint products_section_check
  check (section = any (array['raw-street','game-topup','sportswear']));

alter table public.products add constraint products_tag_check
  check (tag is null or tag = any (array['NEW','HOT']));

alter table public.products add constraint products_name_len
  check (char_length(name) <= 200);

alter table public.products add constraint products_price_len
  check (char_length(price) <= 64);

alter table public.products add constraint products_image_url_check
  check (image_url is null or (image_url ~* '^https://[a-z0-9.-]+\.supabase\.(co|in)/'
        and char_length(image_url) <= 512));

alter table public.products add constraint products_sort_order_check
  check (sort_order >= 0 and sort_order <= 100000);

-- --- Row Level Security ------------------------------------------------------
alter table public.products enable row level security;

-- Публичное чтение (anon/authenticated)
drop policy if exists "Публичное чтение" on public.products;
create policy "Публичное чтение"
  on public.products for select
  to anon, authenticated
  using (true);

-- Запись только через service_role (server-side admin API).
drop policy if exists "Admin write via service_role" on public.products;
create policy "Admin write via service_role"
  on public.products for all
  to service_role
  using (true) with check (true);

-- Явный запрет любых публичных записей (defense in depth).
drop policy if exists "No public writes" on public.products;
create policy "No public writes"
  on public.products for all
  to anon, authenticated
  using (false) with check (false);
