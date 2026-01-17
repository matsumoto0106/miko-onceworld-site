---
title: "主人公ステータス・シミュレーター"
---

<div class="sim">

<h2>主人公 振り分けポイント</h2>

<div class="row">
  <label class="pill">合計 <input id="basePointTotal" type="number" min="0" value="0"></label>
  <div id="basePointInfo" class="note"></div>
</div>

<div class="grid">
  <label class="pill">vit <input id="base_vit" type="number" min="0" value="0"></label>
  <label class="pill">spd <input id="base_spd" type="number" min="0" value="0"></label>
  <label class="pill">atk <input id="base_atk" type="number" min="0" value="0"></label>
  <label class="pill">int <input id="base_int" type="number" min="0" value="0"></label>
  <label class="pill">def <input id="base_def" type="number" min="0" value="0"></label>
  <label class="pill">mdef <input id="base_mdef" type="number" min="0" value="0"></label>
  <label class="pill">luk <input id="base_luk" type="number" min="0" value="0"></label>
</div>

<hr>

<h2>結果</h2>

<table class="stats-table">
  <thead>
    <tr>
      <th>ステ</th>
      <th>基礎＋プロテイン</th>
      <th>装備</th>
      <th>合計</th>
    </tr>
  </thead>
  <tbody id="statsTbody"></tbody>
</table>

<div class="row buttons">
  <button id="recalcBtn" type="button">再計算</button>
  <button id="resetBtn" type="button">振り分けリセット</button>
  <button id="clearSaveBtn" type="button">保存クリア</button>
</div>

<div class="error" id="errBox"></div>

<hr>

<details class="fold" id="foldProtein">
<summary>プロテイン</summary>

<div class="row">
  <label class="pill">シェイカー <input id="shakerCount" type="number" min="0" value="0"></label>
</div>

<div class="grid">
  <label class="pill">vit <input id="protein_vit" type="number" min="0" value="0"></label>
  <label class="pill">spd <input id="protein_spd" type="number" min="0" value="0"></label>
  <label class="pill">atk <input id="protein_atk" type="number" min="0" value="0"></label>
  <label class="pill">int <input id="protein_int" type="number" min="0" value="0"></label>
  <label class="pill">def <input id="protein_def" type="number" min="0" value="0"></label>
  <label class="pill">mdef <input id="protein_mdef" type="number" min="0" value="0"></label>
  <label class="pill">luk <input id="protein_luk" type="number" min="0" value="0"></label>
</div>
</details>

<details class="fold" id="foldEquip">
<summary>装備</summary>

<div class="equip-grid">

  <!-- 武器防具 -->
  <label class="equip-row"><span class="slot">武器</span><select id="select_weapon"></select><span class="lv">+</span><input id="level_weapon" type="number" min="0" value="0"></label>
  <label class="equip-row"><span class="slot">頭</span><select id="select_head"></select><span class="lv">+</span><input id="level_head" type="number" min="0" value="0"></label>
  <label class="equip-row"><span class="slot">体</span><select id="select_body"></select><span class="lv">+</span><input id="level_body" type="number" min="0" value="0"></label>
  <label class="equip-row"><span class="slot">腕</span><select id="select_hands"></select><span class="lv">+</span><input id="level_hands" type="number" min="0" value="0"></label>
  <label class="equip-row"><span class="slot">足</span><select id="select_feet"></select><span class="lv">+</span><input id="level_feet" type="number" min="0" value="0"></label>
  <label class="equip-row"><span class="slot">盾</span><select id="select_shield"></select><span class="lv">+</span><input id="level_shield" type="number" min="0" value="0"></label>

  <!-- アクセ3枠（Lv1基礎） -->
  <label class="equip-row"><span class="slot">アクセ1</span><select id="select_accessory1"></select><span class="lv">Lv</span><input id="level_accessory1" type="number" min="1" value="1"></label>
  <label class="equip-row"><span class="slot">アクセ2</span><select id="select_accessory2"></select><span class="lv">Lv</span><input id="level_accessory2" type="number" min="1" value="1"></label>
  <label class="equip-row"><span class="slot">アクセ3</span><select id="select_accessory3"></select><span class="lv">Lv</span><input id="level_accessory3" type="number" min="1" value="1"></label>

</div>
</details>

</div>

<script src="/js/status-sim.js"></script>
