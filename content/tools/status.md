---
title: "主人公ステータス・シミュレーター（デバッグ）"
---

<!-- DB埋め込み（JSより前） -->
{{< equip_db >}}
{{< acc_db >}}
{{< pet_db >}}

{{< rawhtml >}}
<p id="db-debug" class="note" style="margin:8px 0;">
  DB: ---
</p>
<script>
(function(){
  const e = (window.EQUIP_DB && Array.isArray(window.EQUIP_DB)) ? window.EQUIP_DB.length : 0;
  const a = (window.ACC_DB && Array.isArray(window.ACC_DB)) ? window.ACC_DB.length : 0;
  const p = (window.PET_DB && Array.isArray(window.PET_DB)) ? window.PET_DB.length : 0;
  const el = document.getElementById("db-debug");
  if (el) el.textContent = `DB: equip=${e}, acc=${a}, pet=${p}`;
})();
</script>
{{< /rawhtml >}}

<!-- ここが本命：Hugoが見ている db/ の File.Path 一覧 -->
{{< debug_pages filter="db/" limit="200" >}}

<hr>

<div class="tool-box" id="status-sim">
  <h2>主人公ステータス・シミュレーター（デバッグ）</h2>
  <p class="note">
    ※このページは「DBがHugoに認識されているか」を確認するためのデバッグ版です。<br>
    上の一覧に <code>db/equip/</code> や <code>db/pet-skill/</code> が出るかを確認してください。
  </p>
</div>
