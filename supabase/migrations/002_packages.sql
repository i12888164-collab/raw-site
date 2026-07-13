-- Миграция 002: пакеты доната.
-- Добавляет в products колонку packages (jsonb), в которой для раздела
-- game-topup хранится массив пакетов пополнения:
--   [{ "amount": 150000, "currency": "UZC", "price": "180 000" }, ...]
-- Для обычных товаров (одежда/спорт) колонка остаётся NULL.
-- Безопасно повторно запускать (IF NOT EXISTS).

ALTER TABLE products ADD COLUMN IF NOT EXISTS packages jsonb;
COMMENT ON COLUMN products.packages IS 'Донат: массив пакетов [{amount,currency,price}]';

-- Индекс для возможных запросов по наличию пакетов (опционально).
CREATE INDEX IF NOT EXISTS idx_products_has_packages
  ON products ((packages IS NOT NULL))
  WHERE packages IS NOT NULL;
