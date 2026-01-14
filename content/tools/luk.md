---
title: "命中回避計算ツール"
---

<div class="tool-box">

  <div class="tool-row">
    <label for="enemy-select">敵モンスター選択：</label>
    {{< monster_select id="enemy-select" role="enemy" >}}
  </div>

  <div class="tool-row">
    <label for="monster-order">並び順：</label>
    <select id="monster-order" data-monster-order="enemy">
      <option value="id-asc" selected>図鑑番号（昇順）</option>
      <option value="name-asc">名前（昇順）</option>
      <option value="name-desc">名前（降順）</option>
    </select>
  </div>

  <!-- ★ よくあるLv -->
  <div class="tool-row" id="common-lv-row" style="display:none;">
    <label>よくあるLv：</label>
    <div id="common-lv-buttons"></div>
  </div>

  <div class="tool-row">
    <label for="enemy-level">敵レベル：</label>
    <input type="number" id="enemy-level" value="1" min="1">
  </div>

  <div class="tool-row">
    <button id="calc-btn" type="button">計算する</button>
  </div>

  <hr>

  <section class="tool-result">
    <h2>計算結果</h2>
    <p>敵LUK：<strong id="enemy-luk">---</strong></p>
    <p>命中に必要な攻撃側LUK：<strong id="need-hit">---</strong></p>
    <p>回避が発生する防御側LUK：<strong id="need-evade">---</strong></p>
    <p>ほぼ完全回避の防御側LUK：<strong id="need-perfect">---</strong></p>
  </section>

</div>

{{< rawhtml >}}
<script src="/js/luk-calc.js"></script>
<script src="/js/monster-order.js"></script>

<script>
document.addEventListener("DOMContentLoaded", () => {
  const selectEl = document.getElementById("enemy-select");
  const levelEl  = document.getElementById("enemy-level");

  const row  = document.getElementById("common-lv-row");
  const wrap = document.getElementById("common-lv-buttons");

  if (!selectEl || !levelEl || !row || !wrap) return;

  function renderCommonLevels() {
    const opt = selectEl.options[selectEl.selectedIndex];
    const raw = opt?.dataset?.levels || "";

    const levels = String(raw)
      .split(",")
      .map(v => Number(v.trim()))
      .filter(v => Number.isFinite(v) && v >= 1);

    if (!opt || !opt.value || levels.length === 0) {
      wrap.innerHTML = "";
      row.style.display = "none";
      return;
    }

    wrap.innerHTML = "";
    row.style.display = "";

    levels.forEach(lv => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = lv;
      b.style.marginRight = "6px";
      b.style.padding = "4px 10px";
      b.style.borderRadius = "999px";
      b.style.border = "1px solid #ddd";
      b.style.background = "#fff";
      b.style.cursor = "pointer";

      b.addEventListener("click", () => {
        levelEl.value = lv;
        levelEl.dispatchEvent(new Event("input", { bubbles: true }));
      });

      wrap.appendChild(b);
    });
  }

  selectEl.addEventListener("change", renderCommonLevels);
  renderCommonLevels();
});
</script>
{{< /rawhtml >}}
