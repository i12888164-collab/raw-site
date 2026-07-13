-- ============================================================================
-- RAW-SITE — SQL для Supabase (Dashboard -> SQL Editor -> New query -> Run)
-- Безопасно выполнять повторно (используются IF NOT EXISTS / ON CONFLICT).
-- ============================================================================

-- 1) ТАБЛИЦА ТОВАРОВ ----------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('raw-street','game-topup','sportswear')),
  category text,
  name text not null,
  variant text,
  price text not null,
  description text,
  tag text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Добавляем колонки, если таблица была создана раньше без них:
alter table products add column if not exists description text;
alter table products add column if not exists category text;
alter table products add column if not exists tag text;

-- RLS: чтение публичное (anon key), запись только через service_role (бэкенд).
alter table products enable row level security;

drop policy if exists "Публичное чтение" on products;
create policy "Публичное чтение" on products
  for select using (true);

-- Индекс для поиска по названию (ускоряет /api/search).
create index if not exists products_name_idx on products using gin (to_tsvector('simple', name));
create index if not exists products_section_idx on products (section);

-- 2) БАКЕТ ДЛЯ ФОТО (создаём автоматически, руками не надо) -------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- Политики Storage: любой может смотреть фото (публичный бакет),
-- загружать/удалять может только service_role (бэкенд API).
drop policy if exists "Фото: публичное чтение" on storage.objects;
create policy "Фото: публичное чтение" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "Фото: запись через backend" on storage.objects;
create policy "Фото: запись через backend" on storage.objects
  for insert with check (bucket_id = 'products');

drop policy if exists "Фото: удаление через backend" on storage.objects;
create policy "Фото: удаление через backend" on storage.objects
  for delete using (bucket_id = 'products');

-- 3) ЗАГОТОВКИ (seed) — примерные цены. Цены в сумах (проект из Узбекистана).
--    Если товары уже есть — дубликаты не добавятся (по названию + разделу).
--    Можно выполнить отдельно, когда нужно наполнить каталог.
do $$
declare
  v_max int;
begin
  select coalesce(max(sort_order), 0) into v_max from products;

  insert into products (section, category, name, variant, price, description, tag, sort_order)
  values
  -- ===== RAW STREET (уличная одежда из Китая) =====
  ('raw-street','ХУДИ','Oversize Hoodie','S,M,L,XL','220 000 сум','Свободный крой, плотный футер 380 г/м².','NEW', v_max + 1),
  ('raw-street','ХУДИ','Tech Hoodie','M,L','260 000 сум','Водоотталкивающая ткань, скрытые карманы.','HOT', v_max + 2),
  ('raw-street','КУРТКИ','Bomber Jacket','M,L,XL','480 000 сум','Стёганая куртка-бомбер, ветрозащита.','', v_max + 3),
  ('raw-street','КУРТКИ','Varsity Jacket','S,M,L','540 000 сум','Классическая варсити с вышивкой.','NEW', v_max + 4),
  ('raw-street','ФУТБОЛКИ','Basic Tee','S,M,L,XL','90 000 сум','100% хлопок, оверсайз посадка.','', v_max + 5),
  ('raw-street','ФУТБОЛКИ','Graphic Tee','M,L','120 000 сум','Принт шёлкотрафаретом, лимит 50 шт.','HOT', v_max + 6),
  ('raw-street','ШТАНЫ','Cargo Pants','M,L,XL','310 000 сум','Широкие карго, много карманов.','', v_max + 7),
  ('raw-street','ШТАНЫ','Wide Jeans','S,M,L','330 000 сум','Прямой крой, жёсткая деним.','', v_max + 8),
  ('raw-street','АКСЕССУАРЫ','Beanie','ONE SIZE','70 000 сум','Тёплый бини из акрила.','', v_max + 9),
  ('raw-street','АКСЕССУАРЫ','Crossbody Bag','ONE SIZE','180 000 сум','Мини-сумка через плечо.','NEW', v_max + 10),

  -- ===== GAME TOP-UP (донат / пополнение игр) =====
  ('game-topup','MOBILE','PUBG MOBILE','60 UC','30 000 сум','Пополнение Unknown Cash.','', v_max + 11),
  ('game-topup','MOBILE','PUBG MOBILE','325 UC','140 000 сум','Пополнение Unknown Cash.','HOT', v_max + 12),
  ('game-topup','MOBILE','FREE FIRE','100 Diamonds','25 000 сум','Пополнение алмазов.','', v_max + 13),
  ('game-topup','MOBILE','FREE FIRE','530 Diamonds','110 000 сум','Пополнение алмазов.','', v_max + 14),
  ('game-topup','MOBILE','MOBILE LEGENDS','86 Diamonds','22 000 сум','Пополнение алмазов MLBB.','', v_max + 15),
  ('game-topup','MOBILE','BRAWl STARS','30 Gems','12 000 сум','Пополнение гемов.','', v_max + 16),
  ('game-topup','MOBILE','CLASH OF CLANS','80 Gems','18 000 сум','Пополнение гемов.','', v_max + 17),
  ('game-topup','PC','STEAM WALLET','5 USD','65 000 сум','Пополнение кошелька Steam.','', v_max + 18),
  ('game-topup','PC','STEAM WALLET','20 USD','245 000 сум','Пополнение кошелька Steam.','HOT', v_max + 19),
  ('game-topup','PC','VALORANT','575 VP','55 000 сум','Пополнение Valorant Points.','', v_max + 20),
  ('game-topup','PC','GENSHIN IMPACT','330 Genesis Crystals','55 000 сум','Пополнение кристаллов.','', v_max + 21),
  ('game-topup','CONSOLE','PLAYSTATION','PSN 10 USD','130 000 сум','Пополнение PSN кошелька.','', v_max + 22),
  ('game-topup','CONSOLE','XBOX','XBOX 15 USD','190 000 сум','Пополнение Xbox Gift Card.','', v_max + 23),

  -- ===== SPORT LINE (спортивная экипировка) =====
  ('sportswear','РАШГАРДЫ','MMA Rashguard','S,M,L,XL','190 000 сум','Компрессионный рашгард, сублемация.','NEW', v_max + 24),
  ('sportswear','РАШГАРДЫ','Long Sleeve Rashguard','M,L','210 000 сум','Длинный рукав, защита от терки.','', v_max + 25),
  ('sportswear','ШОРТЫ','Fight Shorts','S,M,L,XL','170 000 сум','Бойцовские шорты, эластичные.','', v_max + 26),
  ('sportswear','ШОРТЫ','Training Shorts','M,L','140 000 сум','Шорты для зала.','', v_max + 27),
  ('sportswear','КРОССОВКИ','Running Pro','40,41,42,43','580 000 сум','Лёгкие беговые кроссовки.','HOT', v_max + 28),
  ('sportswear','КРОССОВКИ','Training Boost','39,40,42,44','620 000 сум','Кроссовки для кроссфита.','NEW', v_max + 29),
  ('sportswear','КОМПРЕССИЯ','Compression Tights','S,M,L','160 000 сум','Компрессионные леггинсы.','', v_max + 30),
  ('sportswear','КОМПРЕССИЯ','Compression Top','M,L,XL','150 000 сум','Компрессионная футболка.','', v_max + 31),
  ('sportswear','АКСЕССУАРЫ','Gym Gloves','ONE SIZE','85 000 сум','Боксёрские перчатки для зала.','', v_max + 32),
  ('sportswear','АКСЕССУАРЫ','Resistance Bands','ONE SIZE','95 000 сум','Набор резинок для ОФП.','', v_max + 33)
  on conflict do nothing; -- защита от дублей при повторном запуске
end $$;

-- 4) АДМИН (опционально). Логин/пароль задаются в Supabase, поле password_hash
--    хранит значение как есть (см. app/login/page.js). Создай админа вручную
--    или раскомментируй и подставь свои данные:
--
-- insert into admins (username, password_hash) values ('admin', 'твой_пароль')
-- on conflict (username) do nothing;
