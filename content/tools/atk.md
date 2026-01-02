---
title: "与ダメージ計算"
description: "与ダメージを計算するツールです。"
---
<hr>

<section class="atk-tool">
  <h2>与ダメージ計算</h2>
  <h2>攻撃対象モンスター</h2>

<div class="form-row">
  <label for="monster-select">モンスター選択：</label>
  {{< monster_select >}}
</div>
  モンスターレベル：
  <input
    type="number"
    id="monster-level"
    value="1"
    min="1"
  >
</label>

</label>
  <div class="atk-form">
    <label>
      攻撃力（ATK）
      <input type="number" id="atk" value="100" min="0" placeholder="例：120">
    </label>
    <label>
      防御力（DEF）
      <input type="number" id="def" value="30" min="0" placeholder="例：80">
    </label>
    <button id="calc-btn">計算する</button>
  </div>
  <div class="atk-result">
    <p>与ダメージ：<span id="result">---</span></p>
  </div>
</section>

<script src="/js/atk-calc.js"></script>
<script>
document.addEventListener("DOMContentLoaded", () => {
  const selectEl = document.getElementById("monster-select");
  const defEl = document.getElementById("def");

  if (!selectEl || !defEl) return;

  selectEl.addEventListener("change", () => {
    const opt = selectEl.options[selectEl.selectedIndex];
    const def = Number(opt.dataset.def || opt.value || 0);

    if (!Number.isNaN(def) && def > 0) {
      defEl.value = def;
    }
  });
});
</script>
