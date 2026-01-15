---
title: "主人公ステータス・シミュレーター"
---

<!-- DB埋め込み（必ずJSより前） -->
{{< equip_db >}}
{{< pet_db >}}
{{< acc_db >}}

<div class="tool-box" id="status-sim">
  <h2>主人公ステータス・シミュレーター</h2>

  <section class="tool-result" style="margin-top:12px;">
    <h3>① プロテイン</h3>

  <div class="tool-row">
      <label for="shaker">シェイカー数：</label>
      <input type="number" id="shaker" value="0" min="0" style="width:90px;">
      <span class="note">（プロテイン補正：個数 × (1 + シェイカー×0.01)）</span>
    </div>

  <div class="tool-row" style="gap:8px; flex-wrap:wrap;">
      <label>VIT</label><input type="number" id="prot-vit" value="0" min="0" max="1000" style="width:90px;">
      <label>SPD</label><input type="number" id="prot-spd" value="0" min="0" max="1000" style="width:90px;">
      <label>ATK</label><input type="number" id="prot-atk" value="0" min="0" max="1000" style="width:90px;">
      <label>INT</label><input type="number" id="prot-int" value="0" min="0" max="1000" style="width:90px;">
      <label>DEF</label><input type="number" id="prot-def" value="0" min="0" max="1000" style="width:90px;">
      <label>MDEF</label><input type="number" id="prot-mdef" value="0" min="0" max="1000" style="width:90px;">
      <label>LUK</label><input type="number" id="prot-luk" value="0" min="0" max="1000" style="width:90px;">
      <label>MOV</label><input type="number" id="prot-mov" value="0" min="0" max="1000" style="width:90px;">
    </div>
  </section>

  <section class="tool-result" style="margin-top:12px;">
    <h3>② 振り分けポイント</h3>
    <p class="note">（1pt=+1）</p>

  <div class="tool-row" style="gap:8px; flex-wrap:wrap;">
      <label>VIT</label><input type="number" id="pt-vit" value="0" min="0" style="width:90px;">
      <label>SPD</label><input type="number" id="pt-spd" value="0" min="0" style="width:90px;">
      <label>ATK</label><input type="number" id="pt-atk" value="0" min="0" style="width:90px;">
      <label>INT</label><input type="number" id="pt-int" value="0" min="0" style="width:90px;">
      <label>DEF</label><input type="number" id="pt-def" value="0" min="0" style="width:90px;">
      <label>MDEF</label><input type="number" id="pt-mdef" value="0" min="0" style="width:90px;">
      <label>LUK</label><input type="number" id="pt-luk" value="0" min="0" style="width:90px;">
      <label>MOV</label><input type="number" id="pt-mov" value="0" min="0" style="width:90px;">
    </div>
  </section>

  <section class="tool-result" style="margin-top:12px;">
    <h3>③ 装備（武器 + 防具5部位）</h3>

  <div class="tool-row">
      <label for="equip-enh">強化数：</label>
      <input type="number" id="equip-enh" value="0" min="0" style="width:90px;">
      <span class="note">（装備補正：基礎値 × (1 + 強化数×0.1)）</span>
    </div>

  <div class="tool-row"><label>武器：</label><select id="equip-weapon"></select></div>
    <div class="tool-row"><label>頭：</label><select id="equip-head"></select></div>
    <div class="tool-row"><label>胴：</label><select id="equip-body"></select></div>
    <div class="tool-row"><label>腕：</label><select id="equip-arms"></select></div>
    <div class="tool-row"><label>脚：</label><select id="equip-legs"></select></div>
    <div class="tool-row"><label>盾：</label><select id="equip-shield"></select></div>

  <div class="tool-row">
      <label>一致判定：</label>
      <strong id="match-status">---</strong>
      <span class="note">（防具5部位が同シリーズなら一致補正④が有効）</span>
    </div>
  </section>

  <section class="tool-result" style="margin-top:12px;">
    <h3>⑤〜⑦ アクセ / ペット</h3>

  <div class="tool-row">
      <label for="acc-enh">アクセ強化数：</label>
      <input type="number" id="acc-enh" value="0" min="0" style="width:90px;">
      <span class="note">（実数：×(1+強化×0.1) / 割合：×(1+強化×0.01)）</span>
    </div>

  <div class="tool-row"><label>アクセ①：</label><select id="acc-1"></select></div>
    <div class="tool-row"><label>アクセ②：</label><select id="acc-2"></select></div>

  <hr>

  <p class="note">ペットはLv31/71/121/181で段階解放。段階分だけ効果を累積適用。</p>

  <div class="tool-row">
      <label>ペット①：</label><select id="pet-1"></select>
      <label style="margin-left:10px;">Lv</label><input type="number" id="petlv-1" value="1" min="1" style="width:90px;">
      <span class="note" id="petstage-1">段階：-</span>
    </div>

  <div class="tool-row">
      <label>ペット②：</label><select id="pet-2"></select>
      <label style="margin-left:10px;">Lv</label><input type="number" id="petlv-2" value="1" min="1" style="width:90px;">
      <span class="note" id="petstage-2">段階：-</span>
    </div>

  <div class="tool-row">
      <label>ペット③：</label><select id="pet-3"></select>
      <label style="margin-left:10px;">Lv</label><input type="number" id="petlv-3" value="1" min="1" style="width:90px;">
      <span class="note" id="petstage-3">段階：-</span>
    </div>
  </section>

  <div class="tool-row" style="margin-top:12px;">
    <button type="button" id="status-calc">計算する</button>
    <span class="note">（自動更新も入れてます。ボタンは“確定”用）</span>
  </div>

  <section class="tool-result" style="margin-top:12px;">
    <h3>計算結果</h3>

  <div class="tool-row">
      <label>VIT：</label><strong id="out-vit">---</strong>
      <label style="margin-left:10px;">SPD：</label><strong id="out-spd">---</strong>
      <label style="margin-left:10px;">ATK：</label><strong id="out-atk">---</strong>
      <label style="margin-left:10px;">INT：</label><strong id="out-int">---</strong>
    </div>

  <div class="tool-row">
      <label>DEF：</label><strong id="out-def">---</strong>
      <label style="margin-left:10px;">MDEF：</label><strong id="out-mdef">---</strong>
      <label style="margin-left:10px;">LUK：</label><strong id="out-luk">---</strong>
      <label style="margin-left:10px;">MOV：</label><strong id="out-mov">---</strong>
    </div>

  <hr>

  <div class="tool-row">
      <label>実DEF：</label><strong id="out-realdef">---</strong>
      <label style="margin-left:10px;">実MDEF：</label><strong id="out-realmdef">---</strong>
      <span class="note">（式は後で反映）</span>
    </div>

  <hr>

  <details>
      <summary>内訳（検算用）</summary>
      <pre id="out-debug" style="white-space:pre-wrap;">---</pre>
    </details>
  </section>
</div>

{{< rawhtml >}}
<script src="/js/status-sim.js"></script>
{{< /rawhtml >}}
