---
title: "ペット与ダメージ計算"
---

ペットの与ダメージを計算するツールです（攻撃値は手入力）。

<hr>

<section class="atk-tool">
  <h2>ペット与ダメージ計算</h2>

  <div class="atk-form">

  <div class="form-row">
      <label for="pet-select">ペット選択：</label>
      {{< pet_select >}}
  </div>

  <div class="form-row">
      <span>並び順：</span>
      <label><input type="radio" name="pet-sort" value="id" checked> 図鑑番号</label>
      <label><input type="radio" name="pet-sort" value="kana"> 五十音</label>
  </div>

  <div class="form-row">
      <span>攻撃タイプ：</span>
      <strong><span id="pet-type">---</span></strong>
  </div>

  <div class="form-row">
      <label for="pet-atk">ペットATK（物理用）：</label>
      <input type="number" id="pet-atk" value="0" min="0">
  </div>

  <div class="form-row">
      <label for="pet-int">ペットINT（魔法用）：</label>
      <input type="number" id="pet-int" value="0" min="0">
  </div>

  <hr>

  <div class="form-row">
      <label for="monster-select">モンスター選択：</label>
      {{< monster_select >}}
  </div>

  <div class="form-row">
      <label for="monster-level">モンスターレベル：</label>
      <input type="number" id="monster-level" value="1" min="1">
  </div>

  <div class="form-row">
      <label for="def">DEF：</label>
      <input type="number" id="def" value="0" min="0">
  </div>

  <div class="form-row">
      <label for="mdef">MDEF：</label>
      <input type="number" id="mdef" value="0" min="0">
  </div>

  <div class="form-row">
      <label for="vit-display">対象モンスター体力（レベル反映）：</label>
      <span id="vit-display">---</span>
  </div>

  <button id="calc-btn">計算する</button>
  </div>

  <div class="atk-result">
    <p>与ダメージ：<span id="result">---</span></p>
  </div>
</section>

<script>
document.addEventListener("DOMContentLoaded", () => {
  // --- 要素取得 ---
  const petSelectEl = document.getElementById("pet-select");
  const petAtkEl = document.getElementById("pet-atk");
  const petIntEl = document.getElementById("pet-int");
  const petTypeEl = document.getElementById("pet-type");

  const monsterSelectEl = document.getElementById("monster-select");
  const levelEl = document.getElementById("monster-level");
  const defEl = document.getElementById("def");
  const mdefEl = document.getElementById("mdef");
  const vitDisplayEl = document.getElementById("vit-display");

  const resultEl = document.getElementById("result");
  const calcBtn = document.getElementById("calc-btn");

  if (!petSelectEl || !petAtkEl || !petIntEl || !petTypeEl ||
      !monsterSelectEl || !levelEl || !defEl || !mdefEl || !vitDisplayEl ||
      !resultEl || !calcBtn) return;

  // --- モンスター基礎値（Lv1） ---
  let baseDef = 0;
  let baseMdef = 0;
  let baseVit = 0;

  function scaleByLevel(base, lv) {
    return Math.floor(base * (1 + (lv - 1) * 0.1));
  }

  function getLv() {
    return Math.max(1, Number(levelEl.value || 1));
  }

  // monster_select は value="def|mdef|vit" 方式の前提
  function loadMonsterBases() {
    const opt = monsterSelectEl.options[monsterSelectEl.selectedIndex];
    const v = (opt?.value || "").trim();

    if (!v.includes("|")) {
      baseDef = 0; baseMdef = 0; baseVit = 0;
      return;
    }

    const [defStr, mdefStr, vitStr] = v.split("|");
    baseDef = Number(defStr || 0);
    baseMdef = Number(mdefStr || 0);
    baseVit = Number(vitStr || 0);
  }

  function recalcMonsterStats() {
    const lv = getLv();
    if (!baseDef && !baseMdef && !baseVit) return;

    const def = scaleByLevel(baseDef, lv);
    const mdef = scaleByLevel(baseMdef, lv);
    const vit = scaleByLevel(baseVit, lv);

    defEl.value = def;
    mdefEl.value = mdef;

    // 体力表示は “vit*18+100” 仕様
    vitDisplayEl.textContent = vit * 18 + 100;
  }

  function onMonsterOrLevelChanged() {
    loadMonsterBases();
    recalcMonsterStats();
  }

  // --- ペット攻撃タイプ制御 ---
  function setPetType(type) {
    petTypeEl.textContent = type || "---";

    if (type === "物理") {
      petAtkEl.disabled = false;
      petAtkEl.style.opacity = "1";
      petIntEl.disabled = true;
      petIntEl.value = 0;
      petIntEl.style.opacity = "0.5";
    } else if (type === "魔法") {
      petIntEl.disabled = false;
      petIntEl.style.opacity = "1";
      petAtkEl.disabled = true;
      petAtkEl.value = 0;
      petAtkEl.style.opacity = "0.5";
    } else {
      // 未選択
      petAtkEl.disabled = true;
      petIntEl.disabled = true;
      petAtkEl.style.opacity = "0.5";
      petIntEl.style.opacity = "0.5";
      petAtkEl.value = 0;
      petIntEl.value = 0;
    }
  }

  function getPetType() {
    return (petSelectEl.value || "").trim(); // "物理" or "魔法"
  }

  // --- ペット並び替え ---
  function sortPetOptions(mode) {
    const currentValue = petSelectEl.value;

    const placeholder = petSelectEl.options[0];
    const opts = Array.from(petSelectEl.options).slice(1);

    opts.sort((a, b) => {
      if (mode === "id") {
        return Number(a.dataset.id || 0) - Number(b.dataset.id || 0);
      } else {
        const at = (a.dataset.title || "").trim();
        const bt = (b.dataset.title || "").trim();
        return at.localeCompare(bt, "ja");
      }
    });

    petSelectEl.innerHTML = "";
    petSelectEl.appendChild(placeholder);
    opts.forEach(o => petSelectEl.appendChild(o));

    petSelectEl.value = currentValue;
  }

  document.querySelectorAll('input[name="pet-sort"]').forEach(r => {
    r.addEventListener("change", () => {
      sortPetOptions(r.value);
      // 並べ替え後にタイプ表示を再反映
      setPetType(getPetType());
    });
  });

  // --- 仮：ペットダメージ計算（後で式差し替え） ---
  function calcPetDamagePhysical(petAtk, def, mdef) {
    // 仮式：とりあえず動く形（後で正式式に差し替え）
    const raw = petAtk - (def + mdef / 10);
    return Math.max(0, Math.floor(raw));
  }

  function calcPetDamageMagic(petInt, def, mdef) {
    // 仮式：とりあえず動く形（後で正式式に差し替え）
    const raw = petInt - (mdef + def / 10);
    return Math.max(0, Math.floor(raw));
  }

  // --- イベント ---
  petSelectEl.addEventListener("change", () => {
    setPetType(getPetType());
  });

  monsterSelectEl.addEventListener("change", () => {
    levelEl.value = 1;
    onMonsterOrLevelChanged();
  });

  levelEl.addEventListener("input", () => {
    recalcMonsterStats();
  });

  calcBtn.addEventListener("click", () => {
    const type = getPetType();
    const def = Number(defEl.value || 0);
    const mdef = Number(mdefEl.value || 0);

    let dmg = 0;
    if (type === "物理") {
      dmg = calcPetDamagePhysical(Number(petAtkEl.value || 0), def, mdef);
    } else if (type === "魔法") {
      dmg = calcPetDamageMagic(Number(petIntEl.value || 0), def, mdef);
    } else {
      dmg = 0;
    }

    resultEl.textContent = dmg;
  });

  // --- 初期化 ---
  sortPetOptions("id");
  setPetType(getPetType());
  onMonsterOrLevelChanged();
});
</script>
