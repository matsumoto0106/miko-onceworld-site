document.addEventListener("DOMContentLoaded", () => {
  const STATS = ["vit","spd","atk","int","def","mdef","luk","mov"];
  const $ = (id) => document.getElementById(id);

  const n = (v, fb = 0) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : fb;
  };

  // =========================
  // DB normalize
  // - 配列: そのまま
  // - 文字列(JSON): JSON.parse
  // - それ以外: fallback
  // =========================
  function parseMaybeJSON(v, fb) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") return v;
    if (typeof v !== "string") return fb;

    const s = v.trim();
    if (!s) return fb;
    if (s[0] === "[" || s[0] === "{") {
      try { return JSON.parse(s); } catch (_) { return fb; }
    }
    return fb;
  }

  const EQUIP_DB_RAW = parseMaybeJSON(window.EQUIP_DB, []);
  const ACC_DB_RAW   = parseMaybeJSON(window.ACC_DB, []);
  const PET_DB_RAW   = parseMaybeJSON(window.PET_DB, []);

  const EQUIP_DB = Array.isArray(EQUIP_DB_RAW) ? EQUIP_DB_RAW : [];
  const ACC_DB   = Array.isArray(ACC_DB_RAW) ? ACC_DB_RAW : [];
  const PET_DB   = Array.isArray(PET_DB_RAW) ? PET_DB_RAW : [];

  // --- inputs ---
  const shakerEl = $("shaker");

  const prot = Object.fromEntries(STATS.map(s => [s, $(`prot-${s}`)]));
  const pts  = Object.fromEntries(STATS.map(s => [s, $(`pt-${s}`)]));

  const equipEnhEl = $("equip-enh");
  const equipSel = {
    weapon: $("equip-weapon"),
    head: $("equip-head"),
    body: $("equip-body"),
    arms: $("equip-arms"),
    legs: $("equip-legs"),
    shield: $("equip-shield"),
  };

  const matchStatusEl = $("match-status");

  const accEnhEl = $("acc-enh");
  const accSel = [ $("acc-1"), $("acc-2") ];

  const petSel = [ $("pet-1"), $("pet-2"), $("pet-3") ];
  const petLv  = [ $("petlv-1"), $("petlv-2"), $("petlv-3") ];
  const petStageLabel = [ $("petstage-1"), $("petstage-2"), $("petstage-3") ];

  const calcBtn = $("status-calc");

  // --- outputs ---
  const out = Object.fromEntries(STATS.map(s => [s, $(`out-${s}`)]));
  const outRealDef = $("out-realdef");
  const outRealMdef = $("out-realmdef");
  const outDebug = $("out-debug");

  // ページ違いで動かないように（最低限）
  if (!calcBtn) return;

  // ---------- helpers ----------
  function addDict(dst, src, mul = 1) {
    for (const k of Object.keys(src || {})) dst[k] = (dst[k] || 0) + n(src[k]) * mul;
  }

  // ペット段階：Lv31/71/121/181 で 1段階ずつ
  function petStageFromLv(lv) {
    if (lv >= 181) return 4;
    if (lv >= 121) return 3;
    if (lv >= 71)  return 2;
    if (lv >= 31)  return 1;
    return 0;
  }

  // ⑥/⑦：割合合計 → 倍率
  function rateMul(sumRate) {
    return 1 + sumRate;
  }

  // 装備実数：基礎×(1+強化×0.1)
  function equipScale(base, enh) {
    return base * (1 + enh * 0.1);
  }

  // アクセ実数：基礎×(1+強化×0.1)
  function accFlatScale(base, enh) {
    return base * (1 + enh * 0.1);
  }

  // アクセ割合：基礎×(1+強化×0.01)
  function accRateScale(baseRate, enh) {
    return baseRate * (1 + enh * 0.01);
  }

  // ---------- UI build ----------
  function fillSelect(sel, items, placeholderText) {
    // ここで落ちると全部止まるので null は安全に無視
    if (!sel) return;

    sel.innerHTML = "";

    const p = document.createElement("option");
    p.value = "";
    p.textContent = placeholderText;
    sel.appendChild(p);

    (items || []).forEach((it, idx) => {
      const o = document.createElement("option");
      o.value = String(idx);

      // title が無いデータでも落とさない
      o.textContent = it?.title ? String(it.title) : "(no title)";

      if (it?.slot != null) o.dataset.slot = String(it.slot || "");
      if (it?.series != null) o.dataset.series = String(it.series || "");
      if (it?.match_mul != null) o.dataset.matchMul = String(it.match_mul || 1.0);

      // payload は option に保持
      try { o.dataset.payload = JSON.stringify(it); }
      catch (_) { o.dataset.payload = "{}"; }

      sel.appendChild(o);
    });
  }

  function buildEquipSelects() {
    // EQUIP_DB が「文字列配列」なら（＝パス配列等）安全側で埋めない
    const looksLikePaths = EQUIP_DB.length > 0 && typeof EQUIP_DB[0] === "string";
    if (looksLikePaths) {
      if (matchStatusEl) {
        matchStatusEl.textContent = "装備DBがパス配列です（slot等が無いので候補を生成できません）";
      }
      fillSelect(equipSel.weapon, [], "-- 武器なし --");
      fillSelect(equipSel.head,   [], "-- 頭なし --");
      fillSelect(equipSel.body,   [], "-- 胴なし --");
      fillSelect(equipSel.arms,   [], "-- 腕なし --");
      fillSelect(equipSel.legs,   [], "-- 脚なし --");
      fillSelect(equipSel.shield, [], "-- 盾なし --");
      return;
    }

    const bySlot = { weapon:[], head:[], body:[], arms:[], legs:[], shield:[] };
    for (const it of EQUIP_DB) {
      const slot = String(it?.slot || "").toLowerCase();
      if (bySlot[slot]) bySlot[slot].push(it);
    }

    fillSelect(equipSel.weapon, bySlot.weapon, "-- 武器なし --");
    fillSelect(equipSel.head,   bySlot.head,   "-- 頭なし --");
    fillSelect(equipSel.body,   bySlot.body,   "-- 胴なし --");
    fillSelect(equipSel.arms,   bySlot.arms,   "-- 腕なし --");
    fillSelect(equipSel.legs,   bySlot.legs,   "-- 脚なし --");
    fillSelect(equipSel.shield, bySlot.shield, "-- 盾なし --");
  }

  function buildAccSelects() {
    accSel.forEach(sel => fillSelect(sel, ACC_DB, "-- アクセなし --"));
  }

  function buildPetSelects() {
    petSel.forEach(sel => fillSelect(sel, PET_DB, "-- ペットなし --"));
  }

  // ---------- collect ----------
  function collectProtein() {
    const s = Math.max(0, n(shakerEl?.value, 0));
    const mul = 1 + s * 0.01;

    const add = {};
    STATS.forEach(k => {
      const count = Math.max(0, n(prot[k]?.value, 0));
      add[k] = count * mul;
    });
    return { add, mul };
  }

  function collectPoints() {
    const add = {};
    STATS.forEach(k => add[k] = Math.max(0, n(pts[k]?.value, 0)));
    return { add };
  }

  function collectEquip(enh) {
    const add = {};
    STATS.forEach(k => add[k] = 0);

    const picks = {};
    for (const [slot, sel] of Object.entries(equipSel)) {
      const opt = sel?.options?.[sel.selectedIndex];
      if (!opt || !opt.value) { picks[slot] = null; continue; }

      let item = {};
      try { item = JSON.parse(opt.dataset.payload || "{}"); }
      catch (_) { item = {}; }

      picks[slot] = item;

      const base = item.base_add || {};
      for (const k of Object.keys(base)) add[k] += equipScale(n(base[k]), enh);
    }
    return { add, picks };
  }

  // ④ match bonus（防具5部位が同シリーズなら、そのシリーズの match_mul を適用）
  function calcMatchMul(picks) {
    const armorSlots = ["head","body","arms","legs","shield"];
    const series = armorSlots.map(s => picks[s]?.series || "").filter(v => v);

    if (series.length !== 5) {
      if (matchStatusEl) matchStatusEl.textContent = "未一致（防具5部位が揃っていません）";
      return 1.0;
    }
    const allSame = series.every(v => v === series[0]);
    if (!allSame) {
      if (matchStatusEl) matchStatusEl.textContent = "未一致（シリーズが揃っていません）";
      return 1.0;
    }

    const mul = n(picks.head?.match_mul, 1.0) || 1.0;
    if (matchStatusEl) matchStatusEl.textContent = `一致：${series[0]}（×${mul}）`;
    return mul;
  }

  // ⑤ flat add (アクセ実数 + ペット実数)
  // ⑥ rate sum
  // ⑦ final rate sum
  function collectAcc(enh) {
    const flat = {}, rate = {}, final = {};
    STATS.forEach(k => { flat[k]=0; rate[k]=0; final[k]=0; });

    accSel.forEach(sel => {
      const opt = sel?.options?.[sel.selectedIndex];
      if (!opt || !opt.value) return;

      let it = {};
      try { it = JSON.parse(opt.dataset.payload || "{}"); }
      catch (_) { it = {}; }

      for (const k of Object.keys(it.flat_add || {}))  flat[k]  += accFlatScale(n(it.flat_add[k]), enh);
      for (const k of Object.keys(it.rate_add || {}))  rate[k]  += accRateScale(n(it.rate_add[k]), enh);
      for (const k of Object.keys(it.final_add || {})) final[k] += accRateScale(n(it.final_add[k]), enh);
    });

    return { flat, rate, final };
  }

  function collectPets() {
    const flat = {}, rate = {}, final = {};
    STATS.forEach(k => { flat[k]=0; rate[k]=0; final[k]=0; });

    for (let i=0; i<3; i++) {
      const sel = petSel[i];
      const lv = Math.max(1, n(petLv[i]?.value, 1));
      const opt = sel?.options?.[sel.selectedIndex];
      const stage = petStageFromLv(lv);

      if (petStageLabel[i]) petStageLabel[i].textContent = `段階：${stage}`;
      if (!opt || !opt.value) continue;

      let pet = {};
      try { pet = JSON.parse(opt.dataset.payload || "{}"); }
      catch (_) { pet = {}; }

      const stages = Array.isArray(pet.stages) ? pet.stages : [];

      for (let k=0; k<Math.min(stage, stages.length); k++) {
        const eff = stages[k] || {};
        addDict(flat,  eff.flat_add  || {}, 1);
        addDict(rate,  eff.rate_add  || {}, 1);
        addDict(final, eff.final_add || {}, 1);
      }
    }
    return { flat, rate, final };
  }

  // ---------- calc ----------
  function calcFinal() {
    const shaker = Math.max(0, n(shakerEl?.value, 0));
    const equipEnh = Math.max(0, n(equipEnhEl?.value, 0));
    const accEnh = Math.max(0, n(accEnhEl?.value, 0));

    const p = collectProtein();      // ①
    const t = collectPoints();       // ②
    const e = collectEquip(equipEnh);// ③
    const matchMul = calcMatchMul(e.picks); // ④

    const acc = collectAcc(accEnh);  // ⑤〜⑦(アクセ)
    const pets = collectPets();      // ⑤〜⑦(ペット)

    const s1 = {}, sCore = {}, sPlusFlat = {}, sumRate = {}, sumFinal = {}, result = {};

    STATS.forEach(k => {
      // (①+②+③)
      s1[k] = (n(p.add[k]) + n(t.add[k]) + n(e.add[k]));
      // ×④
      sCore[k] = s1[k] * matchMul;

      // +⑤
      const flat5 = n(acc.flat[k]) + n(pets.flat[k]);
      sPlusFlat[k] = sCore[k] + flat5;

      // ×⑥ ×⑦
      sumRate[k] = n(acc.rate[k]) + n(pets.rate[k]);
      sumFinal[k] = n(acc.final[k]) + n(pets.final[k]);

      const mul6 = rateMul(sumRate[k]);
      const mul7 = rateMul(sumFinal[k]);

      // Q1: 最後に切り捨て
      result[k] = Math.floor(sPlusFlat[k] * mul6 * mul7);
    });

    STATS.forEach(k => { if (out[k]) out[k].textContent = String(result[k]); });

    // 実DEF / 実MDEF（式は後で差し替え）
    if (outRealDef) outRealDef.textContent = "---";
    if (outRealMdef) outRealMdef.textContent = "---";

    // 検算用（長いけど “困った時だけ見る” 用）
    if (outDebug) {
      outDebug.textContent =
`式：(((①+②+③)×④)+⑤)×⑥×⑦

DB types:
- EQUIP_DB typeof=${typeof window.EQUIP_DB}, isArray=${Array.isArray(window.EQUIP_DB)}
- ACC_DB typeof=${typeof window.ACC_DB}, isArray=${Array.isArray(window.ACC_DB)}
- PET_DB typeof=${typeof window.PET_DB}, isArray=${Array.isArray(window.PET_DB)}

DB counts:
- equip=${EQUIP_DB.length}
- acc=${ACC_DB.length}
- pet=${PET_DB.length}

④ matchMul=${matchMul}
① shaker=${shaker}
③ equip強化=${equipEnh}
アクセ強化=${accEnh}

①(protein_add)
${JSON.stringify(p.add, null, 2)}

②(points_add)
${JSON.stringify(t.add, null, 2)}

③(equip_add)
${JSON.stringify(e.add, null, 2)}

⑤(flat_add = acc + pet)
${JSON.stringify(Object.fromEntries(STATS.map(k => [k, n(acc.flat[k]) + n(pets.flat[k])])), null, 2)}

⑥(rate_sum)
${JSON.stringify(sumRate, null, 2)}

⑦(final_sum)
${JSON.stringify(sumFinal, null, 2)}

result
${JSON.stringify(result, null, 2)}
`;
    }
  }

  function bindAutoRecalc() {
    const recalc = () => calcFinal();

    shakerEl?.addEventListener("input", recalc);

    STATS.forEach(k => {
      prot[k]?.addEventListener("input", recalc);
      pts[k]?.addEventListener("input", recalc);
    });

    equipEnhEl?.addEventListener("input", recalc);
    Object.values(equipSel).forEach(sel => sel?.addEventListener("change", recalc));

    accEnhEl?.addEventListener("input", recalc);
    accSel.forEach(sel => sel?.addEventListener("change", recalc));

    petSel.forEach(sel => sel?.addEventListener("change", recalc));
    petLv.forEach(el => el?.addEventListener("input", recalc));

    calcBtn.addEventListener("click", recalc);
  }

  // init
  // ※ここで DB 件数が表示されれば「JSが完走している」確認になる
  if (matchStatusEl) matchStatusEl.textContent = `DB: equip=${EQUIP_DB.length}, pet=${PET_DB.length}, acc=${ACC_DB.length}`;

  buildEquipSelects();
  buildAccSelects();
  buildPetSelects();
  bindAutoRecalc();
  calcFinal();
});
