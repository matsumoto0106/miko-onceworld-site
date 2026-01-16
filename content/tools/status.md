---
title: "主人公ステータス・シミュレーター"
---

<div class="sim">

  <h2>主人公 振り分けポイント</h2>

  <div class="row">
    <label>合計ポイント <input id="basePointTotal" type="number" min="0" value="0"></label>
    <div id="basePointInfo" class="note"></div>
  </div>

  <div class="grid">
    <label>vit <input id="base_vit" type="number" min="0" value="0"></label>
    <label>spd <input id="base_spd" type="number" min="0" value="0"></label>
    <label>atk <input id="base_atk" type="number" min="0" value="0"></label>
    <label>int <input id="base_int" type="number" min="0" value="0"></label>
    <label>def <input id="base_def" type="number" min="0" value="0"></label>
    <label>mdef <input id="base_mdef" type="number" min="0" value="0"></label>
    <label>luk <input id="base_luk" type="number" min="0" value="0"></label>
  </div>

  <hr>

  <h2>プロテイン</h2>

  <div class="row">
    <label>shaker <input id="shakerCount" type="number" min="0" value="0"></label>
  </div>

  <div class="protein-grid">
    <label>vit <input id="protein_vit" type="number" min="0" value="0"></label>
    <label>spd <input id="protein_spd" type="number" min="0" value="0"></label>
    <label>atk <input id="protein_atk" type="number" min="0" value="0"></label>
    <label>int <input id="protein_int" type="number" min="0" value="0"></label>
    <label>def <input id="protein_def" type="number" min="0" value="0"></label>
    <label>mdef <input id="protein_mdef" type="number" min="0" value="0"></label>
    <label>luk <input id="protein_luk" type="number" min="0" value="0"></label>
  </div>

  <hr>

  <h2>装備</h2>

  <div class="equip-grid">
    <label>武器
      <select id="select_weapon"></select>
      Lv <input id="level_weapon" type="number" min="0" value="0">
    </label>

    <label>頭
  <select id="select_head"></select>
      Lv <input id="level_head" type="number" min="0" value="0">
    </label>

    <label>体
  <select id="select_body"></select>
      Lv <input id="level_body" type="number" min="0" value="0">
    </label>

    <label>腕
  <select id="select_hands"></select>
      Lv <input id="level_hands" type="number" min="0" value="0">
    </label>

    <label>足
  <select id="select_feet"></select>
      Lv <input id="level_feet" type="number" min="0" value="0">
    </label>

    <label>盾
  <select id="select_shield"></select>
      Lv <input id="level_shield" type="number" min="0" value="0">
    </label>
  </div>

  <div class="row">
    <button id="recalcBtn">再計算</button>
    <button id="resetBtn">振り分けリセット</button>
    <button id="clearSaveBtn">保存クリア</button>
  </div>

  <div class="error" id="errBox"></div>

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

</div>

<script src="/js/status-sim.js"></script>
