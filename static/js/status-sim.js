// static/js/status-sim.js
// 検証版：切り捨ては「通常割合⑥の後」と「最終割合⑦の後」のみ（2回だけ）
// - それ以外（シェイカー、装備スケール、セット、アクセ実数など）は丸めない
// - 既存UI（status.md）のDOMを前提にしつつ、存在しない要素があっても落ちないようにガードする

const STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk", "mov"];
const BASE_STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk"];
const PROTEIN_STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk"];
const SCALE_STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk"];
const ARMOR_KEYS = ["head", "body", "hands", "feet", "shield"];
const ACCESSORY_KEYS = ["accessory1", "accessory2", "accessory3"];
const PET_KEYS = ["pet1", "pet2", "pet3"];

const $ = (id) => document.getElementById(id);

// movの基礎値（ゲーム仕様）
const BASE_MOV = 6;

// 浮動小数点誤差の境界下ブレ対策（floorするのは⑥⑦のみ）
const EPS = 1e-9;
const safeFloor = (x) => Math.floor(x + EPS);

/* ---------- util ---------- */
const n = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const clamp0 = (v) => Math.max(0, n(v, 0));
const clamp1 = (v) => Math.max(1, n(v, 1));
const clampStage = (v) => Math.max(0, Math.min(4, n(v, 0)));

function makeZeroStats() {
  return Object.fromEntries(STATS.map((k) => [k, 0]));
}
function addStats(a, b) {
  const out = { ...a };
  for (const k of STATS) out[k] = (out[k] ?? 0) + (b?.[k] ?? 0);
  return out;
}
function mulStats(stats, mul) {
  const out = makeZeroStats();
  for (const k of STATS) out[k] = (stats?.[k] ?? 0) * mul;
  return out;
}

/* ---------- UI / error ---------- */
function setErr(text) {
  const el = $("errBox");
  if (!el) return;
  const msg = (text || "").trim();
  el.textContent = msg;
  el.classList.toggle("is-visible", msg.length > 0);
}
function flashInfo(msg, ms = 700) {
  setErr(msg);
  window.setTimeout(() => setErr(""), ms);
}

/* ---------- GitHub Pages 対応（従来の構成維持） ---------- */
function getAssetBaseUrl() {
  const s = document.currentScript;
  if (!s?.src) return location.origin;
  const u = new URL(s.src, location.href);
  const basePath = u.pathname.replace(/\/js\/status-sim\.js$/, "");
  return `${u.origin}${basePath}`;
}
const ASSET_BASE = getAssetBaseUrl();
const abs = (p) => `${ASSET_BASE}${p}`;

/* ---------- fetch ---------- */
async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`404: ${url}`);
  return await res.json();
}
async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`404: ${url}`);
  return await res.text();
}

/* ---------- TOML簡易 ---------- */
function parseMiniToml(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && l !== "+++" && !l.startsWith("#"));

  const item = { base_add: {}, base_rate: {} };
  let section = "";

  for (const line of lines) {
    const sec = line.match(/^\[(.+?)\]$/);
    if (sec) {
      section = sec[1];
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!kv) continue;

    const key = kv[1];
    let raw = kv[2].trim();
    if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);

    const value = Number.isFinite(Number(raw)) ? Number(raw) : raw;

    if (section === "base_add") item.base_add[key] = Number.isFinite(Number(value)) ? Number(value) : 0;
    else if (section === "base_rate") item.base_rate[key] = Number.isFinite(Number(value)) ? Number(value) : 0;
    else item[key] = value;
  }

  item.id = item.id || item.title || "unknown";
  return item;
}

/* ---------- スケール（丸めなし） ---------- */
function scaleEquipBaseAdd(baseAdd, enhance) {
  const lv = clamp0(enhance);
  const mul = 1 + lv * 0.1;

  const out = makeZeroStats();
  for (const k of SCALE_STATS) out[k] = (baseAdd?.[k] ?? 0) * mul; // ★丸めなし
  out.mov = baseAdd?.mov ?? 0; // movはスケールしない
  return out;
}
function scaleAccFlatLv1Base(baseAdd, displayLv) {
  const internal = clamp1(displayLv) - 1;
  const mul = 1 + internal * 0.1;

  const out = makeZeroStats();
  for (const k of STATS) out[k] = (baseAdd?.[k] ?? 0) * mul; // ★丸めなし
  return out;
}
function scaleAccRatePercentLv1Base(baseRate, displayLv) {
  const internal = clamp1(displayLv) - 1;
  const mul = 1 + internal * 0.01;

  const out = makeZeroStats();
  for (const k of STATS) out[k] = (baseRate?.[k] ?? 0) * mul; // 小数OK
  return out;
}

/* ---------- セット判定 ---------- */
function getArmorSetSeries(slotItems, equipState) {
  let series = null;
  for (const key of ARMOR_KEYS) {
    const id = equipState?.[key]?.id || "";
    if (!id) return null;

    const item = (slotItems[key] || []).find((it) => it.id === id);
    if (!item) return null;

    const s = String(item.series ?? "").trim();
    if (!s) return null;

    if (series === null) series = s;
    if (series !== s) return null;
  }
  return series;
}

/* ---------- ペット：段階0..stageを合算 ---------- */
function sumPetUpToStage(pet, stage) {
  const s = clampStage(stage);
  const outAdd = makeZeroStats();
  const outRate = makeZeroStats();
  const outFinal = makeZeroStats();

  const stages = Array.isArray(pet?.stages) ? pet.stages : [];
  for (let i = 0; i <= s; i++) {
    const st = stages[i] || {};
    const add = st.base_add || {};
    const rate = st.base_rate || {};
    const fin = st.final_rate || {};

    for (const k of STATS) outAdd[k] += add?.[k] ?? 0;
    for (const k of STATS) outRate[k] += rate?.[k] ?? 0;
    for (const k of STATS) outFinal[k] += fin?.[k] ?? 0;
  }
  return { add: outAdd, rate: outRate, final: outFinal };
}

/* ---------- 表 ---------- */
function buildTableRowsIfPossible() {
  const tbody = $("statsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  for (const k of STATS) {
    const tr = document.createElement("tr");
    tr.dataset.stat = k;
    tr.innerHTML = `
      <td>${k}</td>
      <td class="num" data-col="base"></td>
      <td class="num" data-col="equip"></td>
      <td class="num" data-col="total"></td>
    `;
    tbody.appendChild(tr);
  }
}
function renderTableIfPossible(basePlusProtein, equipDisplay, total) {
  const tbody = $("statsTbody");
  if (!tbody) return;

  for (const tr of tbody.querySelectorAll("tr")) {
    const k = tr.dataset.stat;
    const baseEl = tr.querySelector('[data-col="base"]');
    const equipEl = tr.querySelector('[data-col="equip"]');
    const totalEl = tr.querySelector('[data-col="total"]');
    if (baseEl) baseEl.textContent = String(basePlusProtein?.[k] ?? 0);
    if (equipEl) equipEl.textContent = String(equipDisplay?.[k] ?? 0);
    if (totalEl) totalEl.textContent = String(total?.[k] ?? 0);
  }
}

/* ---------- floor箇所（⑥⑦のみ） ---------- */
function applyRateFloor(stats, ratePercentByStat) {
  const out = makeZeroStats();
  for (const k of STATS) {
    const p = ratePercentByStat?.[k] ?? 0;
    out[k] = safeFloor((stats?.[k] ?? 0) * (1 + p / 100));
  }
  return out;
}

/* ---------- 保存 ---------- */
const STORAGE_KEY = "status_sim_state_floor_after_rate_only_v1";
const saveState = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
const loadState = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
};
const clearState = () => localStorage.removeItem(STORAGE_KEY);

/* ---------- main ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  buildTableRowsIfPossible();
  const saved = loadState();

  // ---- ペットDB ----
  let petList = [];
  try {
    const petDB = await fetchJSON(abs("/db/pet_skills.json"));
    petList = Array.isArray(petDB?.pets) ? petDB.pets : [];
  } catch (e) {
    flashInfo(`pet_skills.json 読み込み失敗：${String(e?.message ?? e)}`, 4000);
  }

  // ---- 装備DB ----
  const SLOTS = [
    { key: "weapon", indexUrl: "/db/equip/weapon/index.json", itemDir: "/db/equip/weapon/" },
    { key: "head", indexUrl: "/db/equip/armor/head/index.json", itemDir: "/db/equip/armor/head/" },
    { key: "body", indexUrl: "/db/equip/armor/body/index.json", itemDir: "/db/equip/armor/body/" },
    { key: "hands", indexUrl: "/db/equip/armor/hands/index.json", itemDir: "/db/equip/armor/hands/" },
    { key: "feet", indexUrl: "/db/equip/armor/feet/index.json", itemDir: "/db/equip/armor/feet/" },
    { key: "shield", indexUrl: "/db/equip/armor/shield/index.json", itemDir: "/db/equip/armor/shield/" },
    { key: "accessory", indexUrl: "/db/equip/accessory/index.json", itemDir: "/db/equip/accessory/" }
  ];

  const slotItems = {};
  const loadErrors = [];

  for (const s of SLOTS) {
    slotItems[s.key] = [];
    try {
      const files = await fetchJSON(abs(s.indexUrl));
      const items = [];
      for (const f of files) {
        const toml = await fetchText(abs(`${s.itemDir}${f}`));
        items.push(parseMiniToml(toml));
      }
      slotItems[s.key] = items;
    } catch (e) {
      loadErrors.push(`${s.key}: ${String(e?.message ?? e)}`);
    }
  }

  // selectへ流し込み（DOMが無くても落ちない）
  const fillSelect = (el, items, getLabel) => {
    if (!el) return;
    el.innerHTML = "";
    el.append(new Option("（なし）", ""));
    for (const it of items) el.append(new Option(getLabel(it), it.id));
  };

  for (const key of ["weapon", "head", "body", "hands", "feet", "shield"]) {
    fillSelect($(`select_${key}`), slotItems[key] || [], (it) => it.title ?? it.id);
    if ($(`select_${key}`)) $(`select_${key}`).value = saved?.equip?.[key]?.id ?? "";
    if ($(`level_${key}`)) $(`level_${key}`).value = String(clamp0(saved?.equip?.[key]?.lv ?? 0));
  }
  for (const akey of ACCESSORY_KEYS) {
    fillSelect($(`select_${akey}`), slotItems.accessory || [], (it) => it.title ?? it.id);
    if ($(`select_${akey}`)) $(`select_${akey}`).value = saved?.equip?.[akey]?.id ?? "";
    if ($(`level_${akey}`)) $(`level_${akey}`).value = String(clamp1(saved?.equip?.[akey]?.lv ?? 1));
  }
  for (const pk of PET_KEYS) {
    fillSelect($(`select_${pk}`), petList, (p) => p.name ?? p.id);
    if ($(`select_${pk}`)) $(`select_${pk}`).value = saved?.pets?.[pk]?.id ?? "";
    if ($(`stage_${pk}`)) $(`stage_${pk}`).value = String(clampStage(saved?.pets?.[pk]?.stage ?? 0));
  }

  // 入力復元（DOMが無くても落ちない）
  if ($("basePointTotal")) $("basePointTotal").value = String(clamp0(saved?.basePointTotal ?? 0));
  for (const k of BASE_STATS) if ($(`base_${k}`)) $(`base_${k}`).value = String(clamp0(saved?.basePoints?.[k] ?? 0));
  if ($("shakerCount")) $("shakerCount").value = String(clamp0(saved?.shakerCount ?? 0));
  for (const k of PROTEIN_STATS) if ($(`protein_${k}`)) $(`protein_${k}`).value = String(clamp0(saved?.proteinRaw?.[k] ?? 0));

  // ボタン（無ければ無視）
  $("recalcBtn")?.addEventListener("click", recalc);
  $("resetBtn")?.addEventListener("click", () => {
    for (const k of BASE_STATS) if ($(`base_${k}`)) $(`base_${k}`).value = "0";
    recalc();
  });
  $("clearSaveBtn")?.addEventListener("click", () => {
    clearState();
    // 既存運用を尊重して reload はしない（必要ならユーザーが更新）
    recalc();
  });

  // 監視
  document.querySelectorAll("input,select").forEach((el) => {
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  });

  function recalc() {
    const errs = [];
    if (loadErrors.length) errs.push(...loadErrors);

    const basePointTotal = clamp0($("basePointTotal")?.value);

    // ② ステ振り（mov固定6）
    const basePointsRaw = makeZeroStats();
    for (const k of BASE_STATS) basePointsRaw[k] = clamp0($(`base_${k}`)?.value);
    basePointsRaw.mov = BASE_MOV;

    // ① プロテイン（シェイカー）※丸めなし
    const shaker = clamp0($("shakerCount")?.value);
    const proteinRaw = makeZeroStats();
    for (const k of PROTEIN_STATS) proteinRaw[k] = clamp0($(`protein_${k}`)?.value);
    proteinRaw.mov = 0;
    const proteinAppliedRaw = mulStats(proteinRaw, 1 + shaker * 0.01);

    // ③ 武器防具（丸めなし）
    let equipSumRaw = makeZeroStats();
    const equipState = {};
    for (const key of ["weapon", "head", "body", "hands", "feet", "shield"]) {
      const id = $(`select_${key}`)?.value || "";
      const lv = clamp0($(`level_${key}`)?.value);
      equipState[key] = { id, lv };
      if (!id) continue;
      const it = (slotItems[key] || []).find((v) => v.id === id);
      if (!it) continue;
      equipSumRaw = addStats(equipSumRaw, scaleEquipBaseAdd(it.base_add ?? {}, lv));
    }

    // ④ セット（丸めなし）
    const setSeries = getArmorSetSeries(slotItems, equipState);
    const setMul = setSeries ? 1.1 : 1.0;

    // ポイント表示（DOMが無くても落ちない）
    const used = BASE_STATS.reduce((s, k) => s + (basePointsRaw[k] ?? 0), 0);
    const remain = basePointTotal - used;
    const info = $("basePointInfo");
    if (info) info.textContent = setSeries ? `使用 ${used} / 残り ${remain}（セットON）` : `使用 ${used} / 残り ${remain}`;
    if (remain < 0) errs.push(`ポイント超過：残り ${remain}`);

    // セット適用（①②③のみ）※丸めなし
    const basePoints = mulStats(basePointsRaw, setMul);
    const proteinApplied = mulStats(proteinAppliedRaw, setMul);
    const equipSum = mulStats(equipSumRaw, setMul);

    const basePlusProtein = addStats(basePoints, proteinApplied);
    const sumBeforeAcc = addStats(basePlusProtein, equipSum);

    // アクセ（丸めなし）
    let accFlat = makeZeroStats();
    let accRate = makeZeroStats();
    for (const akey of ACCESSORY_KEYS) {
      const id = $(`select_${akey}`)?.value || "";
      const lv = clamp1($(`level_${akey}`)?.value);
      equipState[akey] = { id, lv };
      if (!id) continue;
      const it = (slotItems.accessory || []).find((v) => v.id === id);
      if (!it) continue;
      accFlat = addStats(accFlat, scaleAccFlatLv1Base(it.base_add ?? {}, lv));
      accRate = addStats(accRate, scaleAccRatePercentLv1Base(it.base_rate ?? {}, lv));
    }

    // ペット（丸めなし）
    let petFlat = makeZeroStats();
    let petRate = makeZeroStats();
    let petFinalRate = makeZeroStats();
    const petsState = {};
    for (const pk of PET_KEYS) {
      const pid = $(`select_${pk}`)?.value || "";
      const stage = clampStage($(`stage_${pk}`)?.value);
      petsState[pk] = { id: pid, stage };
      if (!pid || stage <= 0) continue;
      const pet = petList.find((p) => String(p.id) === String(pid));
      if (!pet) continue;
      const summed = sumPetUpToStage(pet, stage);
      petFlat = addStats(petFlat, summed.add);
      petRate = addStats(petRate, summed.rate);
      petFinalRate = addStats(petFinalRate, summed.final);
    }

    // ⑤ 実数加算
    const sumAfterFlat = addStats(addStats(sumBeforeAcc, accFlat), petFlat);

    // ⑥ 通常割合（アクセ%＋ペット*）→ floor（ここだけ）
    const totalRate = addStats(accRate, petRate);
    const afterNormal = applyRateFloor(sumAfterFlat, totalRate);

    // ⑦ 最終割合（ペット**）→ floor（ここだけ）
    const total = applyRateFloor(afterNormal, petFinalRate);

    // 表示（従来どおり）
    const equipDisplay = addStats(addStats(equipSum, accFlat), petFlat);
    setErr(errs.join("\n"));
    renderTableIfPossible(basePlusProtein, equipDisplay, total);

    saveState({
      basePointTotal,
      basePoints: Object.fromEntries(BASE_STATS.map((k) => [k, basePointsRaw[k] ?? 0])),
      shakerCount: shaker,
      proteinRaw: Object.fromEntries(PROTEIN_STATS.map((k) => [k, proteinRaw[k] ?? 0])),
      equip: equipState,
      pets: petsState
    });
  }

  // 初回
  recalc();
});
