"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS } from "@/lib/sections";
import { GAMES, currencyForGame, packsForGame } from "@/lib/games";

// Готовые заготовки размеров одежды (клик — добавляет размер в поле)
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "UNI"];
// Размеры обуви (отдельный набор)
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];
// Шаблоны "пачкой" под каждый раздел
const BULK_TEMPLATES = {
  "raw-street":
    "Название | Категория | Цена | Размеры | Тег\n" +
    "Худи Oversize | ХУДИ | 220 000 сум | S,M,L | NEW\n" +
    "Куртка Bomber | КУРТКИ | 480 000 сум | M,L\n" +
    "Футболка Basic | ФУТБОЛКИ | 150 000 сум | S,M,L,XL",
  "game-topup":
    "Игра | Платформа | Цена | Количество | Тег\n" +
    "PUBG MOBILE | MOBILE | 35 000 сум | 60 UC | HOT\n" +
    "FREE FIRE | MOBILE | 90 000 сум | 310 Diamonds\n" +
    "VALORANT | PC | 120 000 сум | 1000 VP",
  "sportswear":
    "Название | Категория | Цена | Размеры | Тег\n" +
    "Рашгард Pro | РАШГАРДЫ | 180 000 сум | M,L,XL | NEW\n" +
    "Шорты Training | ШОРТЫ | 120 000 сум | S,M,L\n" +
    "Кроссовки Speed | КРОССОВКИ | 420 000 сум | 41,42,43",
};

const EMPTY_FORM = {
  section: "raw-street", category: "", name: "", variant: "", price: "",
  description: "", tag: "", image_url: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("raw-street");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [gameAmount, setGameAmount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Режим формы: "single" — один товар, "bulk" — пачкой
  const [mode, setMode] = useState("single");
  const [bulkText, setBulkText] = useState("");
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);

  const isGames = activeTab === "game-topup";
  const isClothing = activeTab === "raw-street" || activeTab === "sportswear";
  const currency = isGames ? currencyForGame(form.name) : "";
  const packs = isGames ? packsForGame(form.name) : [];

  // Переключатель размера в поле variant (для одежды/обуви)
  function toggleSize(size) {
    const current = (form.variant || "").split(",").map((s) => s.trim()).filter(Boolean);
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setForm((f) => ({ ...f, variant: next.join(",") }));
  }
  function sizesArray() {
    return (form.variant || "").split(",").map((s) => s.trim()).filter(Boolean);
  }
  // Заполнить количество готовым паком
  function applyPack(pack) {
    setGameAmount(pack.split(" ")[0] || pack);
  }
  // Быстрый чип категории
  function setCategoryQuick(cat) {
    setForm((f) => ({ ...f, category: cat }));
  }

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
  }
  useEffect(() => { loadProducts(); }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function startEdit(p) {
    setEditingId(p.id);
    setMode("single");
    setForm({
      section: p.section, category: p.category || "", name: p.name,
      variant: p.variant || "", price: p.price, description: p.description || "",
      tag: p.tag || "", image_url: p.image_url || "",
    });
    if (p.section === "game-topup" && p.variant) {
      setGameAmount(p.variant.split(" ")[0] || "");
    }
    setActiveTab(p.section);
  }

  function resetForm() {
    setEditingId(null);
    setGameAmount("");
    setForm({ ...EMPTY_FORM, section: activeTab });
  }

  function handleTabChange(slug) {
    setActiveTab(slug);
    setEditingId(null);
    setGameAmount("");
    setForm({ ...EMPTY_FORM, section: slug });
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setErr(data.error || "Не удалось загрузить фото"); return; }
    setForm((f) => ({ ...f, image_url: data.url }));
  }

  // Мультизагрузка фото для режима "пачкой": грузим все сразу, привязываем по порядку
  async function handleBulkImages(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBulkUploading(true);
    setErr("");
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Ошибка загрузки фото"); continue; }
        urls.push(data.url);
      }
      setBulkImages(urls);
      setBulkPreview((prev) => prev.map((row, i) => ({ ...row, image_url: urls[i] || row.image_url })));
    } finally {
      setBulkUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    let payload = { ...form, section: activeTab };
    if (isGames) {
      const meta = GAMES.find((g) => g.name === form.name);
      payload = {
        ...payload,
        category: meta ? meta.category : "",
        variant: gameAmount ? `${gameAmount} ${meta ? meta.currency : ""}`.trim() : "",
      };
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error || "Ошибка сохранения"); return; }
    resetForm();
    loadProducts();
  }

  async function handleDelete(id) {
    if (!confirm("Удалить товар?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  // ----- УМНЫЙ РАЗБОР "ПАЧКИ" -----
  // Поддерживаемые разделители: вертикальная черта "|", запятая ",", таб (вставка из Excel).
  // Порядок полей: Название | Категория | Цена | Вариант | Тег
  // Если строка без разделителей — считаем, что это только название (категория подставится из раздела).
  function detectDelimiter(line) {
    if (line.includes("|")) return "|";
    if (line.includes("\t")) return "\t";
    if (line.includes(",")) return ",";
    return null;
  }
  function parseBulk(text, autoCategory) {
    return text
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const delim = detectDelimiter(line);
        let name = line, category = "", price = "", variant = "", tag = "";
        if (delim) {
          const parts = line.split(delim).map((s) => s.trim());
          [name, category, price, variant, tag] = parts;
        }
        // Если категория не задана — берём из текущего раздела (для игр не подставляем)
        if (!category && !isGames) category = autoCategory || "";
        return { name: name || "", category, price: price || "", variant, tag, image_url: null, description: "" };
      });
  }
  function onBulkTextChange(e) {
    const text = e.target.value;
    setBulkText(text);
    const autoCategory = SECTIONS[activeTab].categories.find((c) => c !== "ВСЕ") || "";
    const parsed = parseBulk(text, autoCategory);
    setBulkPreview(parsed.map((row, i) => ({ ...row, image_url: bulkImages[i] || null })));
  }

  // Вставить готовый шаблон под текущий раздел одной кнопкой
  function fillBulkTemplate() {
    const tpl = BULK_TEMPLATES[activeTab] || "";
    setBulkText(tpl);
    onBulkTextChange({ target: { value: tpl } });
  }

  // Импорт из CSV-файла (та же логика разбора, колонки через запятую)
  async function handleBulkFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBulkText(text);
    onBulkTextChange({ target: { value: text } });
  }

  async function handleBulkSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const rows = bulkPreview.filter((r) => r.name && r.price);
    if (rows.length === 0) {
      setErr("Нет валидных строк (нужны название и цена). Формат: Название | Категория | Цена | Вариант | Тег");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: activeTab, rows }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error || "Ошибка массового добавления"); return; }
    setBulkText("");
    setBulkPreview([]);
    setBulkImages([]);
    loadProducts();
  }

  const visible = products.filter((p) => p.section === activeTab);
  const categoryOptions = SECTIONS[activeTab].categories.filter((c) => c !== "ВСЕ");
  const validBulkCount = bulkPreview.filter((r) => r.name && r.price).length;
  const selectedSizes = sizesArray();

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-title">Админка</div>
        <button className="logout-btn" onClick={handleLogout}>Выйти</button>
      </header>

      <div className="tabs">
        {Object.entries(SECTIONS).map(([slug, s]) => (
          <button
            key={slug}
            className={`tab ${activeTab === slug ? "active" : ""}`}
            onClick={() => handleTabChange(slug)}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="mode-switch">
        <button className={`mode-btn ${mode === "single" ? "active" : ""}`} onClick={() => setMode("single")}>
          Один товар
        </button>
        <button className={`mode-btn ${mode === "bulk" ? "active" : ""}`} onClick={() => setMode("bulk")}>
          Добавить пачкой
        </button>
      </div>

      <div className="admin-body">
        {mode === "single" ? (
          <form className="admin-form" onSubmit={handleSubmit}>
            <h3>{editingId ? "Редактировать" : "Добавить"} — {SECTIONS[activeTab].title}</h3>

            {isGames ? (
              <>
                <div className="field">
                  <label>Игра</label>
                  <select value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required>
                    <option value="">Выбери игру...</option>
                    {GAMES.map((g) => (
                      <option key={g.name} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                  {currency ? <div className="field-hint">Валюта: {currency} (подставится автоматически)</div> : null}
                </div>
                <div className="field">
                  <label>Количество {currency ? `(${currency})` : ""}</label>
                  <input value={gameAmount} onChange={(e) => setGameAmount(e.target.value)} placeholder="660" required />
                  {packs.length > 0 ? (
                    <div className="chips-row">
                      {packs.map((pk) => (
                        <button type="button" key={pk} className="chip" onClick={() => applyPack(pk)}>{pk}</button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>Название</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Категория</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Без категории</option>
                    {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="chips-row">
                    {categoryOptions.map((c) => (
                      <button type="button" key={c} className={`chip ${form.category === c ? "chip-on" : ""}`} onClick={() => setCategoryQuick(c)}>{c}</button>
                    ))}
                  </div>
                </div>
                {isClothing ? (
                  <div className="field">
                    <label>Размеры (нажми, чтобы добавить)</label>
                    <input value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} placeholder="S,M,L" />
                    <div className="chips-row">
                      {CLOTHING_SIZES.map((s) => (
                        <button type="button" key={s} className={`chip ${selectedSizes.includes(s) ? "chip-on" : ""}`} onClick={() => toggleSize(s)}>{s}</button>
                      ))}
                    </div>
                    <div className="chips-row" style={{ marginTop: ".4rem" }}>
                      {SHOE_SIZES.map((s) => (
                        <button type="button" key={s} className={`chip ${selectedSizes.includes(s) ? "chip-on" : ""}`} onClick={() => toggleSize(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="field">
                    <label>Варианты (через запятую)</label>
                    <input value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} placeholder="S,M,L" />
                  </div>
                )}
              </>
            )}

            <div className="field">
              <label>Цена</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="200 000 сум" required />
            </div>

            <div className="field">
              <label>Тег (необязательно)</label>
              <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                <option value="">Без тега</option>
                <option value="NEW">NEW</option>
                <option value="HOT">HOT</option>
              </select>
            </div>

            <div className="field">
              <label>Описание (необязательно)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="field">
              <label>Фото</label>
              <input type="file" accept="image/*" onChange={handleUpload} />
              {uploading ? <div className="field-hint">Загружаем...</div> : null}
              {form.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image_url} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 3, marginTop: ".5rem" }} />
              ) : null}
            </div>

            {err ? <div className="login-error">{err}</div> : null}

            <button className="submit-btn" type="submit" disabled={saving || uploading}>
              {saving ? "Сохраняем..." : editingId ? "Сохранить изменения" : "Добавить"}
            </button>
            {editingId ? <div className="cancel-link" onClick={resetForm}>Отменить редактирование</div> : null}
          </form>
        ) : (
          <form className="admin-form" onSubmit={handleBulkSubmit}>
            <h3>Добавить пачкой — {SECTIONS[activeTab].title}</h3>

            <div className="bulk-toolbar">
              <button type="button" className="mini-btn" onClick={fillBulkTemplate}>Шаблон</button>
              <label className="mini-btn" style={{ cursor: "pointer" }}>
                Импорт CSV
                <input type="file" accept=".csv,text/csv" onChange={handleBulkFile} style={{ display: "none" }} />
              </label>
              <span className="bulk-count">Строк: {validBulkCount}</span>
            </div>

            <div className="field">
              <label>Товары (по одному в строке)</label>
              <textarea
                value={bulkText}
                onChange={onBulkTextChange}
                placeholder={"Название | Категория | Цена | Вариант | Тег\nХуди Oversize | ХУДИ | 220 000 сум | S,M,L | NEW\nКуртка Bomber | КУРТКИ | 480 000 сум | M\nМожно вставлять из Excel (Tab) или CSV (запятая)"}
                style={{ minHeight: 180 }}
              />
              <div className="field-hint">
                Разделители: <b>|</b>, <b>,</b> или Tab (вставка из Excel). Поля: Название | Категория | Цена | Вариант | Тег.
                Если не указать категорию — подставится первая из раздела.
              </div>
            </div>

            <div className="field">
              <label>Фото (необязательно, по порядку строк)</label>
              <input type="file" accept="image/*" multiple onChange={handleBulkImages} />
              {bulkUploading ? <div className="field-hint">Загружаем фото...</div> : null}
              <div className="bulk-thumbs">
                {bulkPreview.map((row, i) => (
                  <div className="bulk-thumb" key={i} title={row.name}>
                    {row.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.image_url} alt="" />
                    ) : (
                      <span className="bulk-thumb-empty">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {err ? <div className="login-error">{err}</div> : null}

            <button className="submit-btn" type="submit" disabled={saving || bulkUploading}>
              {saving ? "Добавляем..." : `Добавить ${validBulkCount} товар(ов)`}
            </button>
          </form>
        )}

        <div className="admin-list">
          {visible.length === 0 ? (
            <div className="empty-state">В этом разделе пока нет товаров.</div>
          ) : (
            visible.map((p) => (
              <div className="admin-row" key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url || "/placeholder.svg"} alt="" />
                <div className="info">
                  <div className="n">{p.name} {p.tag ? `· ${p.tag}` : ""}</div>
                  <div className="m">{p.category ? p.category + " · " : ""}{p.variant ? p.variant + " · " : ""}{p.price}</div>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" onClick={() => startEdit(p)}>Изменить</button>
                  <button className="icon-btn danger" onClick={() => handleDelete(p.id)}>Удалить</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
