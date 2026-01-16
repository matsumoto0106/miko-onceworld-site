---
title: "主人公ステータス・シミュレーター"
---

<div class="sim">
  <div class="row">
    <label for="weaponSelect">武器</label>
    <select id="weaponSelect"></select>
  </div>

  <div class="row">
    <button id="recalcBtn" type="button">再計算</button>
  </div>

  <hr />

  <div class="row">
    <div>加算ステータス（base_add）</div>
    <pre id="resultBox">{}</pre>
  </div>
</div>

<script src="/js/status-sim.js"></script>
