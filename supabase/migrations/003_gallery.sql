-- Миграция 003: галерея изображений карточки товара.
-- Добавляет в products колонку gallery (jsonb) — массив URL картинок
-- (например, логотип игры + БП + БП+). Первый элемент массива = обложка.
-- Безопасно повторно запускать (IF NOT EXISTS).

ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery jsonb;
COMMENT ON COLUMN products.gallery IS 'Массив URL изображений карточки (галерея). Первый элемент = обложка.';
