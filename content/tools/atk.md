---
title: "与ダメージ計算"
---

与ダメージを計算するツールです。

<hr>

<section class="atk-tool">
  <h2>与ダメージ計算</h2>

  <div class="atk-form">

  <div class="form-row">
      <label for="monster-select">モンスター選択：</label>
      {{< monster_select >}}
    </div>

  <div class="form-row">
      <label for="monster-level">モンスターレベル：</label>
      <input type="number" id="monster-level" value="1" min="1">
    </div>

  <div class="form-row">
      <span>攻撃タイプ：</span>
      <label><input type="radio" name="attack-type" value="phys" checked> 物理（ATK）</label>
      <label><input type="radio" name="attack-type" value="magic"> 魔法（INT）</label>
    </div>

  <div class="form-row">
      <label for="atk">ATK：</label>
      <input type="number" id="atk" value="100" min="0">
    </div>

  <div class="form-row">
      <label for="int">INT：</label>
      <input type="number" id="int" value="100" min="0">
    </div>

  <div class="form-row">
      <label for="def">DEF：</label>
      <input type="number" id="def" value="0" min="0">
    </div>

  <div class="form-row">
      <label for="mdef">MDEF：</label>
      <input type="number" id="mdef" value="0" min="0">
    </div>

  <button id="calc-btn">計算する</button>
  </div>

  <div class="atk-result">
    <p>与ダメージ：<span id="result">---</span></p>
    <p id="minline">最低ライン：---</p>
    <p id="debug" style="font-size:12px;opacity:0.8;">debug: ---</p>
  </div>
</section>
}

// --- イベント ---
selectEl.addEventListener("change", () => {
  levelEl.value = 1; // モンスター切替時はLv1に戻す（不要なら削除OK）
  onMonsterOrLevelChanged();
});
levelEl.addEventListener("input", () => {
  recalcMonsterStats();
  updateMinLine();
});
document.querySelectorAll('input[name="attack-type"]').forEach(radio => {
  radio.addEventListener("change", updateMinLine);
});
calcBtn.addEventListener("click", () => {
  const type = getAttackType();
  const atk  = Number(atkEl.value || 0);
  const intv = Number(intEl.value || 0);
  const def  = Number(defEl.value || 0);
  const mdef = Number(mdefEl.value || 0);
  const dmg = (type === "phys")
    ? calcPhysicalDamage(atk, def, mdef, 1.0)
    : calcMagicDamage(intv, def, mdef, 1.0);
  resultEl.textContent = dmg;
  updateMinLine();
});

// 初期化
onMonsterOrLevelChanged();
updateMinLine();
});
<script>
document.addEventListener("DOMContentLoaded", () => {
  const selectEl  = document.getElementById("monster-select");
  const levelEl   = document.getElementById("monster-level");
  const atkEl     = document.getElementById("atk");
  const intEl     = document.getElementById("int");
  const defEl     = document.getElementById("def");
  const mdefEl    = document.getElementById("mdef");
  const resultEl  = document.getElementById("result");
  const minlineEl = document.getElementById("minline");
  const calcBtn   = document.getElementById("calc-btn");
  const debugEl   = document.getElementById("debug");

  function dbg(msg) {
    if (debugEl) debugEl.textContent = "debug: " + msg;
  }

  // どれが missing か表示
  const missing = [];
  if (!selectEl)  missing.push("monster-select");
  if (!levelEl)   missing.push("monster-level");
  if (!atkEl)     missing.push("atk");
  if (!intEl)     missing.push("int");
  if (!defEl)     missing.push("def");
  if (!mdefEl)    missing.push("mdef");
  if (!resultEl)  missing.push("result");
  if (!minlineEl) missing.push("minline");
  if (!calcBtn)   missing.push("calc-btn");

  if (missing.length) {
    dbg("missing: " + missing.join(", "));
    return;
  }

  dbg("ready");

  // まず「選択した option の value を表示」して、値が入ってるか確認
  selectEl.addEventListener("change", () => {
    const opt = selectEl.options[selectEl.selectedIndex];
    dbg("selected value: " + opt.value);

    // value が "def|mdef" 形式ならそれを反映
    const v = (opt.value || "").trim();
    if (v.includes("|")) {
      const [defStr, mdefStr] = v.split("|");
      defEl.value = Number(defStr || 0);
      mdefEl.value = Number(mdefStr || 0);
      dbg(`applied def=${defEl.value}, mdef=${mdefEl.value}`);
    } else {
      dbg("value has no '|'");
    }
  });
});
</script>
