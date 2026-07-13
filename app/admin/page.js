"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS, sectionAccent, orderLinks } from "@/lib/sections";
import { GAMES, currencyForGame, packsForGame } from "@/lib/games";
import {
  currencyList, loadCustomCurrencies, saveCustomCurrencies,
  rawToAmount, formatAmount, amountToUsd, parseMoney, priceToUsd, formatMoney,
  DEFAULT_CURRENCIES, CURRENCY_ORDER,
} from "@/lib/currency";
import { getPackages, buildPackage, renderPackage } from "@/lib/packages";

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
    "Игра | Платформа | Цена | Количество | Валюта | Тег\n" +
    "PUBG MOBILE | MOBILE | 35 000 сум | 60 | UC | HOT\n" +
    "FREE FIRE | MOBILE | 90 000 сум | 310 | Diamonds\n" +
    "VALORANT | PC | 120 000 сум | 1000 | VP",
  "sportswear":
    "Название | Категория | Цена | Размеры | Тег\n" +
    "Рашгард Pro | РАШГАРДЫ | 180 000 сум | M,L,XL | NEW\n" +
    "Шорты Training | ШОРТЫ | 120 000 сум | S,M,L\n" +
    "Кроссовки Speed | КРОССОВКИ | 420 000 сум | 41,42,43",
};

// Сохранённые пресеты (в localStorage): { name, data }
function loadPresets() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem("raw_presets") || "{}"); }
  catch { return {}; }
}
function savePresets(p) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("raw_presets", JSON.stringify(p)); } catch {}
}

const EMPTY_FORM = {
  section: "raw-street", category: "", name: "", variant: "", price: "",
  description: "", tag: "", image_url: "", gallery: [],
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("raw-street");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [gameAmount, setGameAmount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Режим формы: "single" — один товар, "bulk" — пачкой
  const [mode, setMode] = useState("single");
  const [bulkText, setBulkText] = useState("");
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkImages, setBulkImages] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);

  // Список: поиск + мультивыбор + массовое удаление
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, ids: [], label: "" });
  const [busyDelete, setBusyDelete] = useState(false);

  // Валюты (базовые + кастомные из localStorage)
  const [customCurrencies, setCustomCurrencies] = useState({});
  // Пакеты доната (массив {amount,currency,price})
  const [pkgRows, setPkgRows] = useState([]);
  const [pkgDraft, setPkgDraft] = useState({ amount: "", currency: "UZC", price: "" });
  // Пресеты
  const [presets, setPresets] = useState({});
  const [presetName, setPresetName] = useState("");

  const isGames = activeTab === "game-topup";
  const isClothing = activeTab === "raw-street" || activeTab === "sportswear";
  const accent = sectionAccent(activeTab);
  const curList = useMemo(() => currencyList(customCurrencies), [customCurrencies]);

  useEffect(() => {
    setCustomCurrencies(loadCustomCurrencies());
    setPresets(loadPresets());
    loadProducts();
  }, []);

  const currencyForForm = useCallback(
    (name) => (isGames ? currencyForGame(name) : ""),
    [isGames]
  );
  const packsForForm = useCallback(
    (name) => (isGames ? packsForGame(name) : []),
    [isGames]
  );

  // Переключатель размера в поле variant (для одежды/обуви)
  function toggleSize(size) {
    const current = (form.variant || "").split(",").map((s) => s.trim()).filter(Boolean);
    const next = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
    setForm((f) => ({ ...f, variant: next.join(",") }));
  }
  function sizesArray() {
    return (form.variant || "").split(",").map((s) => s.trim()).filter(Boolean);
  }
  function setCategoryQuick(cat) {
    setForm((f) => ({ ...f, category: cat }));
  }

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

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
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
    });
    if (p.section === "game-topup") {
      const pkgs = getPackages(p);
      setPkgRows(pkgs);
      // старое поле variant хранит "60 UC" — для обратной совместимости
      if (!pkgs.length && p.variant) setGameAmount(p.variant.split(" ")[0] || "");
      else setGameAmount("");
    } else {
      setPkgRows([]);
    }
    setActiveTab(p.section);
  }

  function resetForm() {
    setEditingId(null);
    setGameAmount("");
    setPkgRows([]);
    setPkgDraft({ amount: "", currency: "UZC", price: "" });
    setForm({ ...EMPTY_FORM, section: activeTab });
  }

  function handleTabChange(slug) {
    setActiveTab(slug);
    setEditingId(null);
    setGameAmount("");
    setPkgRows([]);
    setForm({ ...EMPTY_FORM, section: slug });
    setSelected(new Set());
    setQuery("");
  }

  // Загрузка файла (используется и обычным input, и drag&drop)
  async function uploadFile(file) {
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
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    await uploadFile(file);
  }
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !file.type.startsWith("image/")) {
      setErr("Можно перетащить только изображение");
      return;
    }
    uploadFile(file);
  }

  // ----- ГАЛЕРЕЯ (несколько фото: логотип, БП, БП+) -----
  async function uploadGalleryFile(file) {
    if (!file) return;
    setGalleryUploading(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setGalleryUploading(false);
    if (!res.ok) { setErr(data.error || "Не удалось загрузить фото"); return; }
    setForm((f) => ({ ...f, gallery: [...(f.gallery || []), data.url] }));
  }
  function removeGalleryImg(idx) {
    setForm((f) => ({ ...f, gallery: (f.gallery || []).filter((_, i) => i !== idx) }));
  }
  function moveGalleryImg(idx, dir) {
    setForm((f) => {
      const arr = [...(f.gallery || [])];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return f;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return { ...f, gallery: arr };
    });
  }

  // ----- ПАКЕТЫ ДОНАТА -----
  function addPkg() {
    const built = buildPackage(pkgDraft.amount, pkgDraft.currency, pkgDraft.price, customCurrencies);
    if (!built) { setErr("Пакет: укажи количество и цену"); return; }
    setPkgRows((prev) => [...prev, built]);
    setPkgDraft({ amount: "", currency: pkgDraft.currency, price: "" });
    setErr("");
  }
  function removePkg(i) {
    setPkgRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ----- ПРЕСЕТЫ -----
  function saveCurrentPreset() {
    const name = presetName.trim();
    if (!name) { setErr("Введи название пресета"); return; }
    const snap = {
      section: activeTab,
      category: form.category, name: form.name, variant: form.variant,
      price: form.price, description: form.description, tag: form.tag,
      image_url: form.image_url,
      gallery: form.gallery || [],
      packages: isGames ? pkgRows : [],
    };
    const next = { ...presets, [name]: snap };
    setPresets(next);
    savePresets(next);
    setPresetName("");
  }
  function applyPreset(name) {
    const snap = presets[name];
    if (!snap) return;
    setActiveTab(snap.section || activeTab);
    setForm({
      section: snap.section || activeTab,
      category: snap.category || "", name: snap.name || "",
      variant: snap.variant || "", price: snap.price || "",
      description: snap.description || "", tag: snap.tag || "",
      image_url: snap.image_url || "",
      gallery: snap.gallery || [],
    });
    setPkgRows(snap.packages || []);
    setGameAmount("");
    setMode("single");
  }
  function deletePreset(name) {
    const next = { ...presets };
    delete next[name];
    setPresets(next);
    savePresets(next);
  }

  // ----- ВАЛЮТЫ (кастомные) -----
  function addCurrency() {
    const code = window.prompt("Код валюты (например, TRY):");
    if (!code) return;
    const c = code.trim().toUpperCase();
    if (!c || customCurrencies[c] || DEFAULT_CURRENCIES[c]) {
      setErr("Такая валюта уже есть"); return;
    }
    const label = window.prompt("Название (например, Турецкая лира):", c) || c;
    const multRaw = window.prompt("Множитель (сколько единиц в 1 введённой, напр. 1):", "1");
    const rateRaw = window.prompt("Курс: сколько этой валюты = 1 USD (напр. 32):", "1");
    const mult = Math.max(1, Number(multRaw) || 1);
    const rate = Math.max(0.0001, Number(rateRaw) || 1);
    const next = { ...customCurrencies, [c]: { code: c, label, symbol: c, multiplier: mult, usdRate: rate } };
    setCustomCurrencies(next);
    saveCustomCurrencies(next);
  }

  // ----- СБОРКА И ОТПРАВКА -----
  function buildPayload() {
    let payload = { ...form, section: activeTab };
    if (isGames) {
      const meta = GAMES.find((g) => g.name === form.name);
      payload.category = meta ? meta.category : "";
      if (pkgRows.length) {
        payload.variant = pkgRows
          .map((p) => `${p.amount.toLocaleString("ru-RU")} ${p.currency}`)
          .join(" / ");
        payload.packages = pkgRows;
      } else {
        payload.variant = gameAmount ? `${gameAmount} ${meta ? meta.currency : ""}`.trim() : "";
        payload.packages = null;
      }
    } else {
      payload.packages = null;
    }
    if (!Array.isArray(payload.gallery) || payload.gallery.length === 0) payload.gallery = null;
    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const payload = buildPayload();
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

  function askDelete(id, name) {
    setConfirm({ open: true, ids: [id], label: name || "этот товар" });
  }
  async function confirmDelete() {
    setBusyDelete(true);
    for (const id of confirm.ids) {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    }
    setBusyDelete(false);
    setConfirm({ open: false, ids: [], label: "" });
    setSelected(new Set());
    loadProducts();
  }
  async function bulkDeleteSelected() {
    if (selected.size === 0) return;
    const ids = [...selected];
    setConfirm({ open: true, ids, label: `${ids.length} выбранных товар(ов)` });
  }

  // ----- УМНЫЙ РАЗБОР "ПАЧКИ" -----
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
        let name = line, category = "", price = "", variant = "", tag = "", currency = "";
        if (delim) {
          const parts = line.split(delim).map((s) => s.trim());
          [name, category, price, variant, currency, tag] = parts;
        }
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
  function fillBulkTemplate() {
    const tpl = BULK_TEMPLATES[activeTab] || "";
    setBulkText(tpl);
    onBulkTextChange({ target: { value: tpl } });
  }
  async function handleBulkFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setBulkText(text);
    onBulkTextChange({ target: { value: text } });
  }
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
  async function handleBulkSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const rows = bulkPreview.filter((r) => r.name && r.price);
    if (rows.length === 0) {
      setErr("Нет валидных строк (нужны название и цена). Формат: Название | Категория | Цена | Вариант | Валюта | Тег");
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

  // ----- СПИСОК: поиск + мультивыбор -----
  const visible = useMemo(() => {
    const base = products.filter((p) => p.section === activeTab);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((p) =>
      [p.name, p.category, p.variant, p.price, p.tag]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [products, activeTab, query]);

  const selectedSizes = sizesArray();
  const allSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const validBulkCount = bulkPreview.filter((r) => r.name && r.price).length;

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    setSelected((prev) => {
      if (visible.length > 0 && visible.every((p) => prev.has(p.id))) {
        const next = new Set(prev);
        visible.forEach((p) => next.delete(p.id));
        return next;
      }
      const next = new Set(prev);
      visible.forEach((p) => next.add(p.id));
      return next;
    });
  }

  // Живой предпросмотр (как на сайте)
  const previewProduct = useMemo(() => {
    const base = {
      section: activeTab, category: form.category, name: form.name,
      variant: form.variant, price: form.price, tag: form.tag,
      image_url: form.image_url, gallery: form.gallery || [], packages: isGames ? pkgRows : [],
    };
    if (isGames && pkgRows.length) {
      base.variant = pkgRows.map((p) => `${p.amount.toLocaleString("ru-RU")} ${p.currency}`).join(" / ");
    }
    return base;
  }, [form, activeTab, isGames, pkgRows]);

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
            style={activeTab === slug ? { borderColor: sectionAccent(slug), color: "#0e0e10", background: sectionAccent(slug) } : undefined}
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
        <button className={`mode-btn ${previewOpen ? "active" : ""}`} onClick={() => setPreviewOpen((v) => !v)} title="Живой предпросмотр карточки">
          👁 Предпросмотр
        </button>
      </div>

      <div className={`admin-body ${previewOpen ? "with-preview" : ""}`}>
        {/* ============ ФОРМА ============ */}
        <div className="admin-form-col">
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
                    {form.name ? <div className="field-hint">Валюта: {currencyForForm(form.name)} (подставится автоматически)</div> : null}
                  </div>

                  <div className="field">
                    <label>Пакеты пополнения (несколько на выбор, как размеры)</label>
                    <div className="pkg-draft">
                      <input
                        className="pkg-amt"
                        value={pkgDraft.amount}
                        onChange={(e) => setPkgDraft({ ...pkgDraft, amount: e.target.value })}
                        placeholder="150"
                        inputMode="numeric"
                      />
                      <select
                        className="pkg-cur"
                        value={pkgDraft.currency}
                        onChange={(e) => setPkgDraft({ ...pkgDraft, currency: e.target.value })}
                      >
                        {curList.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                      <input
                        className="pkg-price"
                        value={pkgDraft.price}
                        onChange={(e) => setPkgDraft({ ...pkgDraft, price: e.target.value })}
                        placeholder="Цена (сум)"
                      />
                      <button type="button" className="mini-btn" onClick={addPkg}>+ Пакет</button>
                    </div>
                    <div className="field-hint">
                      Введи "150" + UZC → <b>{rawToAmount(150, pkgDraft.currency, customCurrencies).toLocaleString("ru-RU")} {pkgDraft.currency}</b> · {amountToUsd(rawToAmount(150, pkgDraft.currency, customCurrencies), pkgDraft.currency, customCurrencies)}
                    </div>
                    {pkgRows.length > 0 ? (
                      <div className="pkg-list">
                        {pkgRows.map((p, i) => (
                          <div className="pkg-item" key={i}>
                            <span className="pkg-render">{renderPackage(p, customCurrencies)}</span>
                            <button type="button" className="pkg-x" onClick={() => removePkg(i)}>✕</button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="chips-row" style={{ marginTop: ".5rem" }}>
                      {packsForForm(form.name).map((pk) => (
                        <button type="button" key={pk} className="chip" onClick={() => setPkgDraft({ ...pkgDraft, amount: pk.split(" ")[0] || pk })}>{pk}</button>
                      ))}
                    </div>
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
                      {SECTIONS[activeTab].categories.filter((c) => c !== "ВСЕ").map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="chips-row">
                      {SECTIONS[activeTab].categories.filter((c) => c !== "ВСЕ").map((c) => (
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
                <label>Цена (в сумах)</label>
                <div className="price-input-wrap">
                  <input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="200 000"
                    inputMode="numeric"
                    required
                  />
                  {parseMoney(form.price) ? (
                    <span className="price-usd">{priceToUsd(form.price)}</span>
                  ) : null}
                </div>
                <div className="field-hint">Вводи просто цифры (200000). В доллары пересчитается автоматически: {parseMoney(form.price) ? `≈ $${(parseMoney(form.price) / 12500).toFixed(2)}` : "≈ $0.00"}</div>
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
                <div
                  className={`dropzone ${dragging ? "dragging" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" accept="image/*" onChange={handleUpload} id="photo-input" />
                  <label htmlFor="photo-input" className="dropzone-label">
                    {uploading ? "Загружаем..." : "Перетащи фото сюда или нажми для выбора"}
                  </label>
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="dropzone-preview" />
                  ) : null}
                </div>
                {form.image_url ? (
                  <button type="button" className="mini-btn" onClick={() => setForm((f) => ({ ...f, image_url: "" }))}>Убрать фото</button>
                ) : null}
              </div>

              <div className="field">
                <label>Галерея (логотип, БП, БП+ ...)</label>
                <div className="gallery-upload">
                  <label className="mini-btn" style={{ cursor: "pointer" }}>
                    {galleryUploading ? "Загружаем..." : "+ Добавить фото"}
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => {
                      Array.from(e.target.files || []).forEach((f) => uploadGalleryFile(f));
                      e.target.value = "";
                    }} />
                  </label>
                  <div className="field-hint">Первое фото — главное на странице товара.</div>
                </div>
                {(form.gallery || []).length > 0 ? (
                  <div className="gallery-thumbs">
                    {(form.gallery || []).map((url, i) => (
                      <div className="gallery-thumb" key={i}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" />
                        <div className="gallery-thumb-actions">
                          <button type="button" className="gallery-arrow" disabled={i === 0} onClick={() => moveGalleryImg(i, -1)} title="Левее">◀</button>
                          <button type="button" className="gallery-arrow" disabled={i === (form.gallery || []).length - 1} onClick={() => moveGalleryImg(i, 1)} title="Правее">▶</button>
                          <button type="button" className="gallery-x" onClick={() => removeGalleryImg(i)} title="Удалить">✕</button>
                        </div>
                        {i === 0 ? <span className="gallery-main-badge">главное</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* ПРЕСЕТЫ */}
              <div className="presets-block">
                <div className="presets-head">Заготовки (пресеты)</div>
                <div className="presets-row">
                  <input
                    className="preset-name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Название заготовки"
                  />
                  <button type="button" className="mini-btn" onClick={saveCurrentPreset}>Сохранить текущую</button>
                </div>
                {Object.keys(presets).length > 0 ? (
                  <div className="chips-row" style={{ marginTop: ".4rem" }}>
                    {Object.keys(presets).map((name) => (
                      <span className="preset-chip" key={name}>
                        <button type="button" className="preset-apply" onClick={() => applyPreset(name)}>{name}</button>
                        <button type="button" className="preset-del" onClick={() => deletePreset(name)}>✕</button>
                      </span>
                    ))}
                  </div>
                ) : <div className="field-hint">Заполни форму и сохрани как заготовку — потом подставишь в один клик.</div>}
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
                <button type="button" className="mini-btn" onClick={addCurrency}>＋ Валюта</button>
                <span className="bulk-count">Строк: {validBulkCount}</span>
              </div>

              <div className="field">
                <label>Товары (по одному в строке)</label>
                <textarea
                  value={bulkText}
                  onChange={onBulkTextChange}
                  placeholder={"Название | Категория | Цена | Вариант | Валюта | Тег\nPUBG MOBILE | MOBILE | 35 000 сум | 60 | UC | HOT\nХуди Oversize | ХУДИ | 220 000 сум | S,M,L | NEW"}
                  style={{ minHeight: 180 }}
                />
                <div className="field-hint">
                  Разделители: <b>|</b>, <b>,</b> или Tab (вставка из Excel). Донат: Название | Платформа | Цена | Количество | Валюта | Тег.
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
        </div>

        {/* ============ ЖИВОЙ ПРЕДПРОСМОТР ============ */}
        {previewOpen ? (
          <div className="admin-preview">
            <div className="preview-label">Как будет на сайте</div>
            <PreviewCard product={previewProduct} accent={accent} custom={customCurrencies} />
          </div>
        ) : null}

        {/* ============ СПИСОК ============ */}
        <div className="admin-list-col">
          <div className="list-toolbar">
            <div className="search-wrap">
              <input
                className="list-search"
                placeholder="Поиск по названию, категории, цене..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query ? <button className="search-clear" onClick={() => setQuery("")}>✕</button> : null}
            </div>
            <div className="list-meta">
              <label className="select-all">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                Все ({visible.length})
              </label>
              {selected.size > 0 ? (
                <button className="bulk-delete-btn" onClick={bulkDeleteSelected}>
                  Удалить выбранные ({selected.size})
                </button>
              ) : null}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="empty-state">В этом разделе пока нет товаров.</div>
          ) : (
            <div className="admin-list">
              {visible.map((p) => (
                <div className={`admin-row ${selected.has(p.id) ? "selected" : ""}`} key={p.id}>
                  <input
                    type="checkbox"
                    className="row-check"
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                  <img src={p.image_url || "/placeholder.svg"} alt="" />
                  <div className="info">
                    <div className="n">{p.name} {p.tag ? `· ${p.tag}` : ""}</div>
                    <div className="m">
                      {p.category ? p.category + " · " : ""}
                      {p.variant ? p.variant + " · " : ""}
                      {p.price}
                      {getPackages(p).length ? ` · 📦${getPackages(p).length}` : ""}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => startEdit(p)}>Изменить</button>
                    <button className="icon-btn danger" onClick={() => askDelete(p.id, p.name)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ МОДАЛКА ПОДТВЕРЖДЕНИЯ ============ */}
      {confirm.open ? (
        <div className="modal-overlay" onClick={() => !busyDelete && setConfirm({ open: false, ids: [], label: "" })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтвердить удаление</h3>
            <p>Удалить <b>{confirm.label}</b>? Действие необратимо.</p>
            <div className="modal-actions">
              <button className="icon-btn" disabled={busyDelete} onClick={() => setConfirm({ open: false, ids: [], label: "" })}>Отмена</button>
              <button className="icon-btn danger" disabled={busyDelete} onClick={confirmDelete}>
                {busyDelete ? "Удаляем..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Карточка предпросмотра (как на сайте). Изолированный компонент,
// чтобы не тащить зависимости ProductGrid в админку.
function PreviewCard({ product, accent, custom }) {
  const packs = getPackages(product);
  const links = orderLinks(product, packs[0]);
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const mainImg = product.image_url || gallery[0] || null;
  return (
    <div className="preview-card" style={{ "--accent": accent }}>
      <div className="preview-media">
        {mainImg ? <img src={mainImg} alt="" /> : null}
        {product.tag ? <span className="preview-tag">{product.tag}</span> : null}
      </div>
      {gallery.length > 1 ? (
        <div className="preview-gallery">
          {gallery.map((url, i) => (
            <div className={`preview-gallery-dot ${i === 0 ? "active" : ""}`} key={i} />
          ))}
        </div>
      ) : null}
      <div className="preview-body">
        <div className="preview-cat">{product.category || (packs.length ? "Донат" : "—")}</div>
        <div className="preview-name">{product.name || "Название товара"}</div>
        {packs.length > 0 ? (
          <div className="preview-packs">
            {packs.map((p, i) => (
              <div className="preview-pack" key={i}>
                <span>{renderPackage(p, custom)}</span>
                <span className="preview-pack-price">{p.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="preview-sub">{product.variant || ""}</div>
        )}
        <div className="preview-price">{product.price || "0 сум"}</div>
        <div className="order-buttons" style={{ marginTop: ".6rem" }}>
          <a className="order-btn" href={links.telegram} target="_blank" rel="noopener noreferrer" title="Telegram">TG</a>
          <a className="order-btn" href={links.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp">WA</a>
        </div>
      </div>
    </div>
  );
}
