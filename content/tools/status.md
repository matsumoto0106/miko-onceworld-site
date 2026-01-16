---
title: "主人公ステータス・シミュレーター"
---

<div class="sim">
  <h2>主人公 基礎ステータス</h2>

  <div class="grid">
    <label>vit <input id="base_vit" type="number" inputmode="numeric" value="0" /></label>
    <label>spd <input id="base_spd" type="number" inputmode="numeric" value="0" /></label>
    <label>atk <input id="base_atk" type="number" inputmode="numeric" value="0" /></label>
    <label>int <input id="base_int" type="number" inputmode="numeric" value="0" /></label>
    <label>def <input id="base_def" type="number" inputmode="numeric" value="0" /></label>
    <label>mdef <input id="base_mdef" type="number" inputmode="numeric" value="0" /></label>
    <label>luk <input id="base_luk" type="number" inputmode="numeric" value="0" /></label>
    <label>mov <input id="base_mov" type="number" inputmode="numeric" value="0" /></label>
  </div>

  <hr />

  <h2>装備</h2>
  <div class="row">
    <label for="weaponSelect">武器</label>
    <select id="weaponSelect"></select>
  </div>

  <div class="row">
    <button id="recalcBtn" type="button">再計算</button>
    <button id="resetBtn" type="button">基礎ステを0に戻す</button>
  </div>

  <hr />

  <h2>結果</h2>

  <div class="result-grid">
    <div>
      <div>基礎ステ</div>
      <pre id="baseBox">{}</pre>
    </div>

  <div>
      <div>装備加算（base_add）</div>
      <pre id="equipBox">{}</pre>
    </div>

  <div>
      <div>合計（基礎＋装備）</div>
      <pre id="totalBox">{}</pre>
    </div>
  </div>
</div>

<style>
  .sim { max-width: 900px; }
  .row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin: 8px 0; }
  .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  .grid label { display:flex; justify-content:space-between; gap: 8px; align-items:center; }
  .grid input { width: 72px; }
  .result-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
  pre { background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px; overflow:auto; }
</style>

<script src="/js/status-sim.js"></script>
