# Raw Site — сайт с тремя разделами + админка

Next.js + Supabase (база данных, хранилище фото). Анимации на Framer Motion.
Разделы: Raw Street / Донат Shop / Sport Line. Заказы — через Telegram/WhatsApp (без корзины и онлайн-оплаты).

## 1. Настройка Supabase (один раз)

1. Зайди на supabase.com → New project (у тебя уже есть аккаунт)
2. В новом проекте: **SQL Editor → New query** → вставь содержимое файла `supabase/schema.sql` → **Run**
3. **Storage → New bucket** → назови `products` → включи **Public bucket**
4. **Project Settings → API** — скопируй:
   - `Project URL` → это `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ключ → это `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` ключ (секретный!) → это `SUPABASE_SERVICE_ROLE_KEY`

## 2. Настройка проекта локально

```bash
cp .env.local.example .env.local
```
Открой `.env.local` и впиши свои значения: ключи Supabase, пароль для админки (`ADMIN_PASSWORD`), ссылку на Telegram и номер WhatsApp.

```bash
npm install
npm run dev
```
Открой http://localhost:3000 — сайт. http://localhost:3000/admin — админка (спросит пароль из `ADMIN_PASSWORD`).

## 3. Как добавлять товары

Через сайт: зайди на `/admin`, введи пароль, выбери вкладку раздела, заполни форму (название, вариант, цена, фото) → "Добавить товар". Всё сразу появляется на сайте, никакого кода трогать не нужно.

## 4. Деплой на Vercel

1. Залей проект в свой GitHub-репозиторий (как и раньше: `git add . && git commit -m "..." && git push`)
2. На vercel.com: **Add New → Project** → выбери репозиторий → **Import**
3. **Environment Variables** — добавь те же переменные, что в `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_TELEGRAM_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
4. **Deploy**

## Важно про безопасность

- `SUPABASE_SERVICE_ROLE_KEY` и `ADMIN_PASSWORD` — никогда не публикуй, не клади в git (файл `.env.local` уже в `.gitignore`)
- Пароль админки — придумай сложный, это единственная защита панели управления
# raw-site  
