---
title: "主人公ステータス・シミュレーター"
---

<div class="tool-box" id="status-sim">
  <h2>主人公ステータス・シミュレーター</h2>

  <!-- ===== ① プロテイン ===== -->
  <section class="tool-result" style="margin-top:12px;">
    <h3>① プロテイン</h3>

    <div class="tool-row">
      <label for="shaker">シェイカー数：</label>
      <input type="number" id="shaker" value="0" min="0" style="width:90px;">
      <span class="note">個数 × (1 + シェイカー×0.01)</span>
    </div>

    <div class="tool-row" style="gap:8px; flex-wrap:wrap;">
      <label>VIT</label><input type="number" id="prot-vit" value="0" min="0" max="1000" style="width:80px;">
      <label>SPD</label><input type="number" id="prot-spd" value="0" min="0" max="1000" style="width:80px;">
      <label>ATK</label><input type="number" id="prot-atk" value="0" min="0" max="1000" style="width:80px;">
      <label>INT</label><input type="number" id="prot-int" value="0" min="0" max="1000" style="width:80px;">
      <label>DEF</label><input type="number" id="prot-def" value="0" min="0" max="1000" style="width:80px;">
      <label>MDEF</label><input type="number" id="prot-mdef" value="0" min="0" max="1000" style="width:80px;">
      <label>LUK</label><input type="number" id="prot-luk" value="0" min="0" max="1000" style="width:80px;">
      <label>MOV</label><input type="number" id="prot-mov" value="0" min="0" max="1000" style="width:80px;">
    </div>
  </section>

  <!-- ===== ② 振り分け ===== -->
  <section class="tool-result" style="margin-top:12px;">
    <h3>② 振り分けポイント</h3>
    <p class="note">1pt = +1</p>

    <div class="tool-row" style="gap:8px; flex-wrap:wrap;">
      <label>VIT</label><input type="number" id="pt-vit" value="0" min="0" style="width:80px;">
      <label>SPD</label><input type="number" id="pt-spd" value="0" min="0" style="width:80px;">
      <label>ATK</label><input type="number" id="pt-atk" value="0" min="0" style="width:80px;">
      <label>INT</label><input type="number" id="pt-int" value="0" min="0" style="width:80px;">
      <label>DEF</label><input type="number" id="pt-def" value="0" min="0" style="width:80px;">
      <label>MDEF</label><input type="number" id="pt-mdef" value="0" min="0" style="width:80px;">
      <label>LUK</label><input type="number" id="pt-luk" value="0" min="0" style="width:80px;">
      <label>MOV</label><input type="number" id="pt-mov" value="0" min="0" style="width:80px;">
    </div>
  </section>

  <!-- ===== ③ 装備 ===== -->
  <section class="tool-result" style="margin-top:12px;">
    <h3>③ 装備</h3>

    <div class="tool-row">
      <label for="equip-enh">強化数：</label>
      <input type="number" id="equip-enh" value="0" min="0" style="width:90px;">
      <span class="note">基礎 × (1 + 強化×0.1)</span>
    </div>

    <div class="tool-row"><label>武器</label><select id="equip-weapon"></select></div>
    <div class="tool-row"><label>頭</label><select id="equip-head"></select></div>
    <div class="tool-row"><label>胴</label><select id="equip-body"></select></div>
    <div class="tool-row"><label>腕</label><select id="equip-arms"></select></div>
    <div class="tool-row"><label>脚</label><select id="equip-legs"></select></div>
    <div class="tool-row"><label>盾</label><select id="equip-shield"></select></div>

    <div class="tool-row">
      <label>一致判定：</label>
      <strong id="match-status">---</strong>
    </div>
  </section>

  <!-- ===== 結果 ===== -->
  <section class="tool-result" style="margin-top:12px;">
    <h3>計算結果</h3>

    <div class="tool-row">
      <label>VIT</label><strong id="out-vit">---</strong>
      <label>SPD</label><strong id="out-spd">---</strong>
      <label>ATK</label><strong id="out-atk">---</strong>
      <label>INT</label><strong id="out-int">---</strong>
    </div>

    <div class="tool-row">
      <label>DEF</label><strong id="out-def">---</strong>
      <label>MDEF</label><strong id="out-mdef">---</strong>
      <label>LUK</label><strong id="out-luk">---</strong>
      <label>MOV</label><strong id="out-mov">---</strong>
    </div>
  </section>
</div>

<!-- ===== DB を必ず先に埋め込む ===== -->
{{< equip_db >}}
{{< acc_db >}}
{{< pet_db >}}

<!-- ===== JS は最後 ===== -->
{{< rawhtml >}}
<script src="/js/status-sim.js"></script>
{{< /rawhtml >}}
