// static/js/status-sim.js
// 安定版：装備が一部404でも落ちず、画面にエラーを出す
// 機能：基礎 + プロテイン(7種) + シェイカー(共通倍率) + 装備(武器+防具5種) => 表表示 + 保存

const STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk", "mov"];
const PROTEIN_STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk"]; // movなし
const $ = (id) => document.getElementById(id);

const SLOTS = [
  { key: "weapon", label: "武器", indexUrl: "/db/equip/weapon/index.json", itemDir: "/db/equip/weapon/" },
  { key: "head",   label: "頭",   indexUrl: "/db/equip/armor/head/index.json",   itemDir: "/db/equip/armor/head/" },
  { key: "body",   label: "体",   indexUrl: "/db/equip/armor/body/index.json",   itemDir: "/db/equip/armor/body/" },
  { key: "hands",  label: "腕",   indexUrl: "/db/equip/armor/hands/index.json",  itemDir: "/db/equip/armor/hands/" },
  { key: "feet",   label: "足",   indexUrl: "/db/equip/armor/feet/index.json",   itemDir: "/db/equip/armor/feet/" },
  { key: "shield", label: "盾",   indexUrl: "/db/equip/armor/shield/index.json", itemDir: "/db/equip/armor/shield/" },
];

// ====== 配信パス対応（GitHub Pagesなど） ======
function getAssetBaseUrl() {
  const scriptEl = document.currentScript;
  if (!scriptEl || !scriptEl.src) return window.location.origin;
  const u = new URL(scriptEl.src, window.location.href);
  const basePath = u.pathname.replace(/\/js\/status-sim\.js$/, "");
  return `${u.origin}${basePath}`;
}
const ASSET_BASE = getAssetBaseUrl();
const abs = (p) => `${ASSET_BASE}${p}`;

// ====== localStorage ======
const STORAGE_KEY = "status_sim_state_v5_table_protein_shaker";

const saveState = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
const loadState = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; } };
const clearState = () => localStorage.removeItem(STORAGE_KEY);

// ====== util ======
const n = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const clamp0 = (v) => Math.max(0, n(v, 0));

function makeZeroStats() {
  return Object.fromEntries(STATS.map((k) => [k, 0]));
}
function addStats(a, b) {
  const out = { ...a };
  for (const k of STATS) out[k] = (out[k] ?? 0) + (b?.[k] ?? 0);
  return out;
}

function setErr(text) {
  const el = $("errBox");
  if (el) el.textContent = text || "";
}

// ====== シェイカー ======
function readShakerFromUI() {
  return clamp0($("shakerCount")?.value);
}
function applyShakerToUI(v) {
  const el = $("shakerCount");
  if (el) el.value = String(clamp0(v ?? 0));
}
function shakerMultiplier(shakerCount) {
  // 1個につき +1% => 1 + 0.01 * shaker
  return 1 + 0.01 * clamp0(shakerCount);
}

// ====== プロテイン（ステ別） ======
function readProteinRawFromUI() {
  const out = makeZeroStats();
  for (const k of PROTEIN_STATS) out[k] = clamp0($(`protein_${k}`)?.value);
  return out;
}
function applyProteinToUI(stats) {
  for (const k of PROTEIN_STATS) {
    const el = $(`protein_${k}`);
    if (el) el.value = String(clamp0(stats?.[k] ?? 0));
  }
}
function resetProteinUI() {
  for (const k of PROTEIN_STATS) {
    const el = $(`protein_${k}`);
    if (el) el.value = "0";
  }
}

// シェイカー補正を適用したプロテイン（端数は切り捨て）
function applyShakerToProtein(raw
