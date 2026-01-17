---
title: "主人公ステータス・シミュレーター"
---

<style>
  .sim-wrap{max-width:980px;margin:0 auto;padding:12px}
  .sim-card{border:1px solid #ddd;border-radius:10px;padding:12px;margin:12px 0}
  .sim-grid{display:grid;grid-template-columns:1fr;gap:10px}
  @media(min-width:860px){.sim-grid{grid-template-columns:1fr 1fr}}
  .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .row label{min-width:90px}
  select,input{max-width:100%;padding:6px 8px;border:1px solid #ccc;border-radius:8px}
  input[type="number"]{width:110px}
  .small{font-size:12px;opacity:.75}
  table{width:100%;border-collapse:collapse}
  th,td{border-bottom:1px solid #eee;padding:8px}
  th{background:#fff}
  td.num{text-align:right;font-variant-numeric:tabular-nums}
</style>

<div class="sim-wrap">

  <div class="sim-card">
    <div class="sim-grid">
      <div>
        <div class="small">ステ振り（movは固定）</div>
        <div class="row"><label>vit</label><input id="base_vit" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>spd</label><input id="base_spd" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>atk</label><input id="base_atk" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>int</label><input id="base_int" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>def</label><input id="base_def" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>mdef</label><input id="base_mdef" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>luk</label><input id="base_luk" type="number" min="0" step="1" value="0"></div>
        <div class="small">mov は内部で固定（JS側）</div>
      </div>
      <div>
        <div class="small">プロテイン（mov除外）</div>
        <div class="row"><label>シェイカー</label><input id="shakerCount" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>vit</label><input id="protein_vit" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>spd</label><input id="protein_spd" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>atk</label><input id="protein_atk" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>int</label><input id="protein_int" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>def</label><input id="protein_def" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>mdef</label><input id="protein_mdef" type="number" min="0" step="1" value="0"></div>
        <div class="row"><label>luk</label><input id="protein_luk" type="number" min="0" step="1" value="0"></div>
      </div>
    </div>
  </div>

  <div class="sim-card">
    <div class="small">装備（武器＋防具）</div>
    <div class="row">
      <label>武器</label>
      <select id="select_weapon"></select>
      <span class="small">+<input id="level_weapon" type="number" min="0" step="1" value="0"></span>
    </div>
    <div class="row"><label>頭</label><select id="select_head"></select><span class="small">+<input id="level_head" type="number" min="0" step="1" value="0"></span></div>
    <div class="row"><label>胴</label><select id="select_body"></select><span class="small">+<input id="level_body" type="number" min="0" step="1" value="0"></span></div>
    <div class="row"><label>手</label><select id="select_hands"></select><span class="small">+<input id="level_hands" type="number" min="0" step="1" value="0"></span></div>
    <div class="row"><label>足</label><select id="select_feet"></select><span class="small">+<input id="level_feet" type="number" min="0" step="1" value="0"></span></div>
    <div class="row"><label>盾</label><select id="select_shield"></select><span class="small">+<input id="level_shield" type="number" min="0" step="1" value="0"></span></div>
    <div class="small" style="margin-top:10px">アクセ（最大3枠）</div>
    <div class="row"><label>アクセ1</label><select id="select_accessory1"></select><span class="small">Lv<input id="level_accessory1" type="number" min="1" step="1" value="1"></span></div>
    <div class="row"><label>アクセ2</label><select id="select_accessory2"></select><span class="small">Lv<input id="level_accessory2" type="number" min="1" step="1" value="1"></span></div>
    <div class="row"><label>アクセ3</label><select id="select_accessory3"></select><span class="small">Lv<input id="level_accessory3" type="number" min="1" step="1" value="1"></span></div>
    <div class="small" style="margin-top:10px">ペット（最大3体）</div>
    <div class="row">
      <label>ペット1</label><select id="select_pet1"></select>
      <span class="small">段階</span><input id="stage_pet1" type="number" min="0" max="4" step="1" value="0">
    </div>
    <div class="row">
      <label>ペット2</label><select id="select_pet2"></select>
      <span class="small">段階</span><input id="stage_pet2" type="number" min="0" max="4" step="1" value="0">
    </div>
    <div class="row">
      <label>ペット3</label><select id="select_pet3"></select>
      <span class="small">段階</span><input id="stage_pet3" type="number" min="0" max="4" step="1" value="0">
    </div>
  </div>

  <div class="sim-card">
    <table>
      <thead>
        <tr>
          <th>stat</th>
          <th class="num">基礎+プロテイン</th>
          <th class="num">装備/実数</th>
          <th class="num">合計</th>
        </tr>
      </thead>
      <tbody id="statsTbody"></tbody>
    </table>
  </div>

</div>

<script defer src="/js/status-sim.js"></script>
