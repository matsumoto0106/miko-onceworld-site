// static/js/status-sim.js
// 検証版：通常割合⑥・最終割合⑦の直後のみ切り捨て
// floor はこの2箇所だけ
// mov 基礎値 = 6

const STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk", "mov"];
const BASE_STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk"];
const PROTEIN_STATS = ["vit", "spd", "atk", "int", "def", "mdef", "luk"];
const ARMOR_KEYS = ["head", "body", "hands", "feet", "shield"];
const ACCESSORY_KEYS = ["accessory1", "accessory2", "accessory3"];
const PET_KEYS = ["pet1", "pet2", "pet3"];

const $ = (id) => document.getElementById(id);
const BASE_MOV = 6;

/* ---------- util ---------- */
const n = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const clamp0 = (v) => Math.max(0, n(v, 0));
const clamp1 = (v) => Math.max(1, n(v, 1));
const clampStage = (v) => Math.max(0, Math.min(4, n(v, 0)));

function zeroStats() {
  return Object.fromEntries(STATS.map(k => [k, 0]));
}
function add(a, b) {
  const r = { ...a };
  for (const k of STATS) r[k] += b?.[k] ?? 0;
  return r;
}
function mul(a, m) {
  const r = zeroStats();
  for (const k of STATS) r[k] = (a?.[k] ?? 0) * m;
  return r;
}

/* ---------- fetch ---------- */
async function fetchJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(url);
  return r.json();
}
async function fetchText(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(url);
  return r.text();
}

/* ---------- toml ---------- */
function parseMiniToml(txt) {
  const item = { base_add: {}, base_rate: {}, final_rate: {} };
  let sec = "";
  txt.split(/\r?\n/).forEach(l => {
    l = l.trim();
    if (!l || l === "+++" || l.startsWith("#")) return;
    const s = l.match(/^\[(.+?)\]$/);
    if (s) { sec = s[1]; return; }
    const m = l.match(/^([\w]+)\s*=\s*(.+)$/);
    if (!m) return;
    const k = m[1];
    let v = m[2].replace(/"/g, "");
    v = Number.isFinite(Number(v)) ? Number(v) : v;
    if (sec === "base_add") item.base_add[k] = v || 0;
    else if (sec === "base_rate") item.base_rate[k] = v || 0;
    else if (sec === "final_rate") item.final_rate[k] = v || 0;
    else item[k] = v;
  });
  return item;
}

/* ---------- ペット ---------- */
function sumPet(pet, stage) {
  const add = zeroStats(), rate = zeroStats(), final = zeroStats();
  for (let i = 1; i <= stage; i++) {
    const s = pet.stages[i];
    if (!s) continue;
    for (const k of STATS) {
      add[k] += s.base_add?.[k] ?? 0;
      rate[k] += s.base_rate?.[k] ?? 0;
      final[k] += s.final_rate?.[k] ?? 0;
    }
  }
  return { add, rate, final };
}

/* ---------- main ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  const petDB = await fetchJSON("/db/pet_skills.json");
  const pets = petDB.pets;

  const equipIndex = await fetchJSON("/db/equip/weapon/index.json");
  const equipItems = {};
  for (const f of equipIndex) {
    equipItems[f] = parseMiniToml(await fetchText(`/db/equip/weapon/${f}`));
  }

  function recalc() {
    // ①②③
    const base = zeroStats();
    for (const k of BASE_STATS) base[k] = clamp0($(`base_${k}`)?.value);
    base.mov = BASE_MOV;

    let protein = zeroStats();
    const shaker = clamp0($("shakerCount")?.value);
    for (const k of PROTEIN_STATS)
      protein[k] = clamp0($(`protein_${k}`)?.value) * (1 + shaker * 0.01);

    let equip = zeroStats();
    const wid = $("select_weapon")?.value;
    if (wid && equipItems[wid]) {
      const lv = clamp0($("level_weapon")?.value);
      const m = 1 + lv * 0.1;
      for (const k of STATS)
        equip[k] += (equipItems[wid].base_add[k] ?? 0) * m;
    }

    // 合算
    let total = add(add(base, protein), equip);

    // ⑤ ペット実数
    let petRate = zeroStats(), petFinal = zeroStats();
    for (let i = 1; i <= 3; i++) {
      const pid = $(`select_pet${i}`)?.value;
      const stg = clampStage($(`stage_pet${i}`)?.value);
      if (!pid || !stg) continue;
      const p = pets.find(x => x.id === pid);
      const s = sumPet(p, stg);
      total = add(total, s.add);
      petRate = add(petRate, s.rate);
      petFinal = add(petFinal, s.final);
    }

    // ⑥ 通常割合 → 切り捨て
    for (const k of STATS)
      total[k] = Math.floor(total[k] * (1 + petRate[k] / 100));

    // ⑦ 最終割合 → 切り捨て
    for (const k of STATS)
      total[k] = Math.floor(total[k] * (1 + petFinal[k] / 100));

    // 表示
    for (const k of STATS)
      document.querySelector(`[data-total="${k}"]`).textContent = total[k];
  }

  document.querySelectorAll("input,select").forEach(e =>
    e.addEventListener("change", recalc)
  );

  recalc();
});
