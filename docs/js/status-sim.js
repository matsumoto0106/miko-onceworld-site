const STATS = ["vit","spd","atk","int","def","mdef","luk","mov"];
const BASE_STATS = ["vit","spd","atk","int","def","mdef","luk"];
const PROTEIN_STATS = BASE_STATS;
const SCALE_STATS = BASE_STATS; // mov除外

const $ = id => document.getElementById(id);

const SLOTS = [
  { key:"weapon", index:"/db/equip/weapon/index.json", dir:"/db/equip/weapon/" },
  { key:"head",   index:"/db/equip/armor/head/index.json", dir:"/db/equip/armor/head/" },
  { key:"body",   index:"/db/equip/armor/body/index.json", dir:"/db/equip/armor/body/" },
  { key:"hands",  index:"/db/equip/armor/hands/index.json", dir:"/db/equip/armor/hands/" },
  { key:"feet",   index:"/db/equip/armor/feet/index.json", dir:"/db/equip/armor/feet/" },
  { key:"shield", index:"/db/equip/armor/shield/index.json", dir:"/db/equip/armor/shield/" },
];

const STORAGE_KEY = "status_sim_state_v8_equip_scale";

const n = v => Number.isFinite(+v) ? +v : 0;
const zeroStats = () => Object.fromEntries(STATS.map(s=>[s,0]));

const addStats = (a,b)=>{
  const r={...a};
  for(const k of STATS) r[k]+=b[k]||0;
  return r;
};

const scaleEquip = (base, level)=>{
  const r = zeroStats();
  const mul = 1 + level * 0.1;
  for(const k of SCALE_STATS){
    r[k] = Math.floor((base[k]||0) * mul);
  }
  return r;
};

async function fetchJSON(p){ return (await fetch(p)).json(); }
async function fetchText(p){ return await (await fetch(p)).text(); }

function parseToml(t){
  const o={base_add:{}};
  let sec="";
  t.split(/\r?\n/).forEach(l=>{
    l=l.trim(); if(!l||l==="+++"||l.startsWith("#")) return;
    const s=l.match(/^\[(.+)\]$/); if(s){sec=s[1];return;}
    const m=l.match(/^(\w+)\s*=\s*(.+)$/); if(!m)return;
    const v=isNaN(m[2])?m[2].replace(/"/g,""):Number(m[2]);
    sec==="base_add"?o.base_add[m[1]]=v:o[m[1]]=v;
  });
  o.id=o.id||o.title;
  return o;
}

function buildTable(){
  const tb=$("statsTbody"); tb.innerHTML="";
  STATS.forEach(s=>{
    tb.insertAdjacentHTML("beforeend",
      `<tr data-s="${s}">
        <td>${s}</td>
        <td class="b"></td>
        <td class="e"></td>
        <td class="t"></td>
      </tr>`);
  });
}

document.addEventListener("DOMContentLoaded",async()=>{
  buildTable();

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
  const equipDB={};

  for(const s of SLOTS){
    const sel=$(`select_${s.key}`);
    const lv =$(`level_${s.key}`);
    const files = await fetchJSON(s.index);
    equipDB[s.key]=[];
    for(const f of files){
      equipDB[s.key].push(parseToml(await fetchText(s.dir+f)));
    }
    sel.innerHTML='<option value="">(なし)</option>';
    equipDB[s.key].forEach(i=>sel.add(new Option(i.title,i.id)));
    sel.value=saved.equip?.[s.key]?.id||"";
    lv.value =saved.equip?.[s.key]?.lv||0;
    sel.onchange=lv.oninput=recalc;
  }

  function recalc(){
    let base=zeroStats();
    BASE_STATS.forEach(k=>base[k]=n($(`base_${k}`)?.value));

    let protein=zeroStats();
    const mul=1+n($("shakerCount")?.value)*0.01;
    PROTEIN_STATS.forEach(k=>{
      protein[k]=Math.floor(n($(`protein_${k}`)?.value)*mul);
    });

    let equipSum=zeroStats();
    const equipState={};

    for(const s of SLOTS){
      const id=$(`select_${s.key}`).value;
      const lv=n($(`level_${s.key}`).value);
      equipState[s.key]={id,lv};
      const it=equipDB[s.key].find(x=>x.id===id);
      if(it){
        equipSum=addStats(equipSum,scaleEquip(it.base_add,lv));
      }
    }

    const total=addStats(addStats(base,protein),equipSum);

    document.querySelectorAll("#statsTbody tr").forEach(tr=>{
      const k=tr.dataset.s;
      tr.querySelector(".b").textContent=(base[k]||0)+(protein[k]||0);
      tr.querySelector(".e").textContent=equipSum[k]||0;
      tr.querySelector(".t").textContent=total[k]||0;
    });

    localStorage.setItem(STORAGE_KEY,JSON.stringify({
      equip:equipState,
      base,proteinRaw:protein
    }));
  }

  recalc();
});
