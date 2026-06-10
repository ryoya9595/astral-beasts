/* ============================================
   ASTRAL BEASTS — game engine
   ============================================ */
'use strict';

// ---------- helpers ----------
const $id = (s)=>document.getElementById(s);
const app = $id('app');
const ri = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
const esc = (s)=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// tiny retro beeps
let AC=null;
function beep(freq=520, dur=.06, type='square', vol=.04){
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(), g=AC.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=vol;
    o.connect(g); g.connect(AC.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime+dur);
    o.stop(AC.currentTime+dur+.02);
  }catch(e){}
}

// ---------- sprites (procedural SVG) ----------
function spriteSVG(spId, cls=''){
  const sp = DEX[spId].sprite;
  const {c1,c2,shape,acc} = sp, sz = sp.size||1;
  const eye = (x,y,r=4.5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x+1}" cy="${y+1}" r="${r*.55}" fill="#1a1530"/><circle cx="${x-1}" cy="${y-1}" r="${r*.22}" fill="#fff"/>`;
  const blush=(x,y)=>`<circle cx="${x}" cy="${y}" r="3" fill="#ff8aa0" opacity=".55"/>`;
  let body='';
  if(shape==='round'){
    body=`<ellipse cx="50" cy="58" rx="29" ry="26" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <ellipse cx="38" cy="82" rx="7" ry="4" fill="${c2}"/><ellipse cx="62" cy="82" rx="7" ry="4" fill="${c2}"/>
      ${eye(40,52)}${eye(60,52)}${blush(34,62)}${blush(66,62)}
      <path d="M46 63 q4 4 8 0" stroke="#1a1530" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }else if(shape==='beast'){
    body=`<ellipse cx="52" cy="68" rx="24" ry="17" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <path d="M74 66 q14 -4 12 -16" stroke="${c2}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="42" r="18" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <path d="M30 30 l-3 -13 l11 7 z" fill="${c2}"/><path d="M52 28 l5 -12 l4 13 z" fill="${c2}"/>
      <ellipse cx="38" cy="83" rx="6" ry="3.5" fill="${c2}"/><ellipse cx="60" cy="83" rx="6" ry="3.5" fill="${c2}"/>
      ${eye(36,40)}${eye(50,40)}${blush(31,49)}
      <path d="M40 49 q3 3 7 0" stroke="#1a1530" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }else if(shape==='tall'){
    body=`<ellipse cx="50" cy="64" rx="21" ry="24" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <circle cx="50" cy="31" r="16" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <path d="M37 22 l-4 -11 l10 6 z" fill="${c2}"/><path d="M57 17 l10 -6 l-4 11 z" fill="${c2}"/>
      <ellipse cx="27" cy="62" rx="6" ry="11" fill="${c1}" stroke="${c2}" stroke-width="2.5" transform="rotate(18 27 62)"/>
      <ellipse cx="73" cy="62" rx="6" ry="11" fill="${c1}" stroke="${c2}" stroke-width="2.5" transform="rotate(-18 73 62)"/>
      <ellipse cx="40" cy="88" rx="7" ry="4" fill="${c2}"/><ellipse cx="60" cy="88" rx="7" ry="4" fill="${c2}"/>
      <ellipse cx="50" cy="66" rx="12" ry="15" fill="#fff" opacity=".25"/>
      ${eye(44,29)}${eye(56,29)}
      <path d="M46 37 q4 3 8 0" stroke="#1a1530" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }else if(shape==='bird'){
    body=`<ellipse cx="50" cy="60" rx="23" ry="19" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <ellipse cx="64" cy="60" rx="10" ry="14" fill="${c2}" opacity=".8" transform="rotate(-20 64 60)"/>
      <circle cx="42" cy="38" r="14" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <path d="M28 38 l-9 4 l9 4 z" fill="#ffb300" stroke="#e65100" stroke-width="1.5"/>
      <path d="M70 72 l12 6 M70 76 l9 8" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 79 l0 6 m4 -6 l0 6" stroke="#ffb300" stroke-width="2.5" stroke-linecap="round"/>
      ${eye(40,36)}${blush(48,44)}`;
  }else if(shape==='bug'){
    body=`<ellipse cx="50" cy="64" rx="19" ry="15" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <path d="M37 60 q-12 6 -8 14 M63 60 q12 6 8 14" stroke="${c2}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="42" r="13" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <path d="M43 31 q-4 -8 -10 -8 M57 31 q4 -8 10 -8" stroke="${c2}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="33" cy="23" r="3" fill="${c2}"/><circle cx="67" cy="23" r="3" fill="${c2}"/>
      <ellipse cx="32" cy="56" rx="9" ry="14" fill="#fff" opacity=".4" transform="rotate(20 32 56)"/>
      <ellipse cx="68" cy="56" rx="9" ry="14" fill="#fff" opacity=".4" transform="rotate(-20 68 56)"/>
      ${eye(45,41)}${eye(56,41)}`;
  }else if(shape==='rock'){
    body=`<path d="M50 22 L76 36 L82 62 L66 84 L34 84 L18 62 L24 36 Z" fill="${c1}" stroke="${c2}" stroke-width="3.5"/>
      <path d="M34 40 l8 -6 M62 36 l8 8 M28 64 l8 6" stroke="${c2}" stroke-width="2.5" stroke-linecap="round"/>
      ${eye(42,54,5)}${eye(60,54,5)}
      <path d="M46 67 q5 4 10 0" stroke="#1a1530" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  }else if(shape==='jelly'){
    body=`<path d="M22 60 a28 27 0 0 1 56 0 l0 4 l-56 0 z" fill="${c1}" stroke="${c2}" stroke-width="3"/>
      <path d="M28 64 q-2 12 4 20 M42 64 q-1 14 2 22 M58 64 q1 14 -2 22 M72 64 q2 12 -4 20"
        stroke="${c1}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/>
      <ellipse cx="40" cy="42" rx="9" ry="11" fill="#fff" opacity=".3"/>
      ${eye(42,50)}${eye(60,50)}${blush(35,58)}${blush(67,58)}`;
  }else if(shape==='star'){
    body=`<path d="M50 16 L60 40 L86 42 L66 58 L73 84 L50 69 L27 84 L34 58 L14 42 L40 40 Z"
        fill="${c1}" stroke="${c2}" stroke-width="3" stroke-linejoin="round"/>
      ${eye(43,49)}${eye(58,49)}${blush(37,57)}${blush(64,57)}
      <path d="M46 59 q4 4 9 0" stroke="#1a1530" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  let accent='';
  const ax=50, ay= shape==='beast'?24 : shape==='bird'?26 : shape==='tall'?12 : shape==='rock'?16 : 24;
  if(acc==='fire') accent=`<path d="M${ax} ${ay+8} q-7 -3 -4 -11 q2 4 5 4 q-1 -7 5 -10 q-1 6 3 8 q3 -2 3 -6 q5 8 -2 14 q-5 3 -10 1z" fill="#ffca28" stroke="#e65100" stroke-width="1.6"/>`;
  if(acc==='grass') accent=`<path d="M${ax} ${ay+8} q-12 -4 -10 -14 q9 1 12 10 q2 -10 12 -12 q1 11 -10 16z" fill="#7cb342" stroke="#33691e" stroke-width="1.6"/>`;
  if(acc==='water') accent=`<path d="M${ax} ${ay-4} q7 9 0 14 q-7 -5 0 -14z" fill="#81d4fa" stroke="#0277bd" stroke-width="1.6"/>`;
  if(acc==='electric') accent=`<path d="M${ax+2} ${ay-6} l-7 11 l5 1 l-4 9 l9 -12 l-5 -1 l4 -8z" fill="#ffeb3b" stroke="#f57f17" stroke-width="1.4"/>`;
  if(acc==='earth') accent=`<path d="M${ax-10} ${ay+8} l5 -9 l5 9z M${ax+1} ${ay+8} l5 -7 l5 7z" fill="#795548" stroke="#3e2723" stroke-width="1.4"/>`;
  if(acc==='wind') accent=`<path d="M${ax-10} ${ay+2} q10 -10 18 0 q-6 8 -12 3" fill="none" stroke="#b2ebf2" stroke-width="3" stroke-linecap="round"/>`;
  if(acc==='light') accent=`<path d="M${ax} ${ay-7} l2.5 6 l6.5 .8 l-5 4.4 l1.6 6.6 l-5.6 -3.6 l-5.6 3.6 l1.6 -6.6 l-5 -4.4 l6.5 -.8z" fill="#fff59d" stroke="#c08a00" stroke-width="1.4"/>`;
  if(acc==='dark') accent=`<path d="M${ax+4} ${ay-6} a8 8 0 1 0 6 13 a6.5 6.5 0 0 1 -6 -13z" fill="#d1c4e9" stroke="#311b92" stroke-width="1.4"/>`;
  if(acc==='legend') accent=`<ellipse cx="50" cy="50" rx="40" ry="14" fill="none" stroke="#ffd76a" stroke-width="2.5" opacity=".8" transform="rotate(-18 50 50)"/>
    <path d="M50 4 l2.5 6 l6.5 .8 l-5 4.4 l1.6 6.6 l-5.6 -3.6 l-5.6 3.6 l1.6 -6.6 l-5 -4.4 l6.5 -.8z" fill="#ffd76a" stroke="#c08a00" stroke-width="1.4"/>`;
  return `<svg class="mon-sprite ${cls}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(50,52) scale(${sz}) translate(-50,-52)">${body}${accent}</g></svg>`;
}
function typeChips(spId){
  return DEX[spId].t.map(t=>`<span class="type-chip" style="background:${TYPES[t].c}">${TYPES[t].n}</span>`).join('');
}

// ---------- monster instances ----------
const maxHP = (m)=>Math.floor(DEX[m.sp].b.hp*m.lv/25)+m.lv+12;
const atkOf = (m)=>Math.floor(DEX[m.sp].b.atk*m.lv/50)+5;
const defOf = (m)=>Math.floor(DEX[m.sp].b.def*m.lv/50)+5;
const spdOf = (m)=>Math.floor(DEX[m.sp].b.spd*m.lv/50)+5;
const expNext = (lv)=>5*lv*lv;
function movesAt(spId,lv){
  return DEX[spId].learn.filter(e=>e[0]<=lv).map(e=>e[1])
    .filter((v,i,a)=>a.indexOf(v)===i).slice(-4);
}
function mkMon(sp,lv){
  const m={sp,lv,exp:0,moves:movesAt(sp,lv)};
  m.hp=maxHP(m);
  return m;
}

// ---------- game state ----------
let G=null;
const SAVE_KEY='astral_save_v1';
function newState(){
  return {name:'', party:[], box:[], money:3000,
    items:{kizu:3, orb:0}, badges:[], flags:{}, maxLoc:0, loc:0, lastTown:0};
}
function save(){ try{localStorage.setItem(SAVE_KEY, JSON.stringify(G));}catch(e){} }
function loadSave(){ try{const s=localStorage.getItem(SAVE_KEY); return s?JSON.parse(s):null;}catch(e){return null;} }
function healParty(){ G.party.forEach(m=>{m.hp=maxHP(m);}); }
function firstAlive(){ return G.party.findIndex(m=>m.hp>0); }

const STARTER_CHAIN={
  hinokobi:['hinokobi','kaengia','goukalion'],
  hanamoru:['hanamoru','moriverun','jukaiser'],
  upashio:['upashio','upareido','granshion'],
};
const RIVAL_PICK={hinokobi:'upashio', hanamoru:'hinokobi', upashio:'hanamoru'};

// ---------- dialog system ----------
const dlgbox=$id('dlgbox'), dlgText=$id('dlg-text'), dlgChoices=$id('dlg-choices'), dlgArrow=$id('dlg-arrow');
function say(...lines){
  return new Promise(resolve=>{
    let i=0, typing=false, full='', timer=null;
    dlgbox.classList.remove('hidden');
    dlgChoices.innerHTML=''; dlgArrow.style.display='block';
    const typeLine=(text)=>{
      full=text; typing=true; dlgText.textContent='';
      let j=0;
      timer=setInterval(()=>{
        if(!typing){ clearInterval(timer); dlgText.textContent=full; return; }
        dlgText.textContent=full.slice(0,++j);
        if(j>=full.length){ typing=false; clearInterval(timer); }
      },16);
    };
    const next=()=>{
      if(i>=lines.length){
        dlgbox.classList.add('hidden'); dlgbox.onclick=null; resolve(); return;
      }
      beep(660,.03,'square',.02);
      typeLine(lines[i++]);
    };
    dlgbox.onclick=()=>{ if(typing){ typing=false; } else next(); };
    next();
  });
}
function choose(opts){
  return new Promise(resolve=>{
    dlgbox.classList.remove('hidden');
    dlgArrow.style.display='none';
    dlgChoices.innerHTML='';
    dlgbox.onclick=null;
    opts.forEach((o,i)=>{
      const b=document.createElement('button');
      b.textContent=o;
      b.onclick=(e)=>{ e.stopPropagation(); beep(880,.05); dlgChoices.innerHTML='';
        dlgbox.classList.add('hidden'); resolve(i); };
      dlgChoices.appendChild(b);
    });
  });
}
async function ask(text,opts){
  dlgText.textContent=text;
  return await choose(opts);
}

// ---------- battle engine ----------
const battleState={};
function hpClass(r){ return r<.25?'low':r<.55?'mid':''; }
function cardHTML(m, isAlly){
  const mx=maxHP(m), r=m.hp/mx;
  return `<div class="nm"><b>${esc(DEX[m.sp].n)}</b><span>Lv${m.lv}</span></div>
    <div>${typeChips(m.sp)}</div>
    <div class="hp-outer"><div class="hp-inner ${hpClass(r)}" style="width:${Math.max(0,r*100)}%"></div></div>
    ${isAlly?`<div class="hp-num">${Math.max(0,m.hp)} / ${mx}</div>
    <div class="exp-outer"><div class="exp-inner" style="width:${Math.min(100,m.exp/expNext(m.lv)*100)}%"></div></div>`:''}`;
}
function refreshCards(){
  const B=battleState;
  $id('e-card').innerHTML=cardHTML(B.enemy,false);
  $id('p-card').innerHTML=cardHTML(B.ally,true);
}
function setSprites(){
  const B=battleState;
  $id('e-spr').innerHTML=spriteSVG(B.enemy.sp,'enemy-sprite');
  $id('p-spr').innerHTML=spriteSVG(B.ally.sp,'ally-sprite');
}
function bmsg(text){
  return new Promise(resolve=>{
    const el=$id('battle-msg');
    $id('battle-cmds').innerHTML='';
    let j=0, typing=true;
    el.textContent='';
    const t=setInterval(()=>{
      if(!typing){clearInterval(t); el.textContent=text; return;}
      el.textContent=text.slice(0,++j);
      if(j>=text.length){typing=false; clearInterval(t);}
    },14);
    const ui=$id('battle-ui');
    ui.onclick=()=>{ if(typing){typing=false;} else {ui.onclick=null; resolve();} };
  });
}
function flash(id, ally){
  const sv=$id(id).querySelector('svg');
  if(!sv) return;
  sv.classList.add(ally?'ally-shake':'shake');
  setTimeout(()=>sv.classList.remove(ally?'ally-shake':'shake'),380);
}
function calcDmg(att,def,mv){
  let eff=1;
  DEX[def.sp].t.forEach(tt=>{ const c=CHART[mv.t]; eff*=(c && tt in c)?c[tt]:1; });
  if(eff===0) return {dmg:0, eff:0, crit:false};
  const base=Math.floor((Math.floor(2*att.lv/5)+2)*mv.p*atkOf(att)/Math.max(1,defOf(def))/50)+2;
  const stab=DEX[att.sp].t.includes(mv.t)?1.5:1;
  const crit=Math.random()<1/16;
  const rand=.85+Math.random()*.15;
  return {dmg:Math.max(1,Math.floor(base*eff*stab*(crit?1.5:1)*rand)), eff, crit};
}
async function doAttack(att,def,mvId,attAlly){
  const mv=MOVES[mvId];
  await bmsg(`${DEX[att.sp].n}の ${mv.n}！`);
  if(Math.random()*100>mv.a){ await bmsg('しかし はずれてしまった！'); return; }
  const r=calcDmg(att,def,mv);
  if(r.eff===0){ await bmsg('こうかが ない みたいだ…'); return; }
  beep(attAlly?300:220,.08,'sawtooth',.05);
  flash(attAlly?'e-spr':'p-spr', !attAlly);
  def.hp=Math.max(0,def.hp-r.dmg);
  refreshCards();
  if(r.crit) await bmsg('きゅうしょに あたった！');
  if(r.eff>1) await bmsg('こうかは ばつぐんだ！');
  else if(r.eff<1) await bmsg('こうかは いまひとつの ようだ…');
}
function aiMove(en,target){
  const opts=en.moves.map(id=>{
    let eff=1; DEX[target.sp].t.forEach(tt=>{const c=CHART[MOVES[id].t]; eff*=(c&&tt in c)?c[tt]:1;});
    return {id, w:MOVES[id].p*eff+1};
  });
  if(Math.random()<.3) return opts[ri(0,opts.length-1)].id;
  opts.sort((a,b)=>b.w-a.w);
  return opts[0].id;
}
async function gainExpFlow(mon, amt){
  mon.exp+=amt;
  await bmsg(`${DEX[mon.sp].n}は けいけんち ${amt}を もらった！`);
  while(mon.exp>=expNext(mon.lv)){
    mon.exp-=expNext(mon.lv);
    mon.lv++;
    mon.hp=Math.min(maxHP(mon), mon.hp+ (DEX[mon.sp].b.hp>0?Math.floor(maxHP(mon)/12):0)+2);
    refreshCards();
    beep(990,.1,'square',.05);
    await bmsg(`${DEX[mon.sp].n}は レベル${mon.lv}に あがった！`);
    // learn moves
    for(const [l,mid] of DEX[mon.sp].learn){
      if(l===mon.lv && !mon.moves.includes(mid)){
        if(mon.moves.length<4){ mon.moves.push(mid); await bmsg(`${DEX[mon.sp].n}は ${MOVES[mid].n}を おぼえた！`); }
        else{ const old=mon.moves.shift(); mon.moves.push(mid);
          await bmsg(`${DEX[mon.sp].n}は ${MOVES[old].n}を わすれて ${MOVES[mid].n}を おぼえた！`); }
      }
    }
    // evolution
    const ev=DEX[mon.sp].evo;
    if(ev && mon.lv>=ev.lv){
      await bmsg(`おや…！？ ${DEX[mon.sp].n}の ようすが…！`);
      const oldN=DEX[mon.sp].n;
      mon.sp=ev.to;
      if(battleState.ally===mon) setSprites();
      refreshCards();
      beep(1240,.18,'triangle',.06);
      await bmsg(`${oldN}は ${DEX[mon.sp].n}に しんかした！`);
      for(const [l,mid] of DEX[mon.sp].learn){
        if(l<=mon.lv && !mon.moves.includes(mid) && mon.moves.length<4){ mon.moves.push(mid); }
      }
    }
  }
}
function partyPickHTML(filter){
  return G.party.map((m,i)=>{
    const dis=filter(m,i);
    return `<button class="btn" data-i="${i}" ${dis?'disabled':''}>
      ${esc(DEX[m.sp].n)} Lv${m.lv}　HP ${Math.max(0,m.hp)}/${maxHP(m)} ${m.hp<=0?'（ひんし）':''}</button>`;
  }).join('');
}
function pickFromParty(filter, allowCancel=true){
  return new Promise(resolve=>{
    const c=$id('battle-cmds');
    c.innerHTML=partyPickHTML(filter)+(allowCancel?`<button class="btn small" data-i="-1">もどる</button>`:'');
    c.querySelectorAll('button').forEach(b=>{
      b.onclick=()=>{ const i=+b.dataset.i; resolve(i); };
    });
  });
}
function battleBagPick(inBattle){
  return new Promise(resolve=>{
    const c=$id('battle-cmds');
    const usable=Object.keys(G.items).filter(k=>G.items[k]>0 &&
      (ITEMS[k].kind!=='orb' || (inBattle&&battleState.canCatch)));
    c.innerHTML=(usable.length?usable.map(k=>
      `<button class="btn" data-k="${k}">${ITEMS[k].n} ×${G.items[k]} <span class="muted">${ITEMS[k].desc}</span></button>`).join('')
      :`<div style="padding:6px">つかえる どうぐが ない…</div>`)
      +`<button class="btn small" data-k="">もどる</button>`;
    c.querySelectorAll('button').forEach(b=>{
      b.onclick=()=>resolve(b.dataset.k||null);
    });
  });
}
async function tryCatch(orbKey){
  const B=battleState, en=B.enemy;
  G.items[orbKey]--;
  await bmsg(`${G.name}は ${ITEMS[orbKey].n}を なげた！`);
  const M=maxHP(en);
  const rate=Math.min(.95, ((3*M-2*en.hp)/(3*M)) * (DEX[en.sp].catch/255) * ITEMS[orbKey].rate);
  let shakes=0;
  for(let i=0;i<3;i++){
    await wait(450); beep(420,.05);
    await bmsg('…ゆれている…');
    if(Math.random()>Math.pow(rate,1/3)) break;
    shakes++;
  }
  if(shakes>=3){
    beep(1180,.25,'triangle',.07);
    await bmsg(`やった！ ${DEX[en.sp].n}を つかまえた！`);
    const caught={sp:en.sp, lv:en.lv, exp:0, hp:en.hp, moves:[...en.moves]};
    if(G.party.length<6){ G.party.push(caught); await bmsg(`${DEX[en.sp].n}は てもちに くわわった！`); }
    else{ G.box.push(caught); await bmsg(`てもちが いっぱいなので ボックスに おくられた！`); }
    return true;
  }
  await bmsg('ああっ！ でてきてしまった！');
  return false;
}

/*
 cfg: {mons:[inst], kind:'wild'|'trainer', name, pre, win, money, canCatch, legendary}
 returns 'win' | 'lose' | 'run' | 'caught'
*/
async function battle(cfg){
  const B=battleState;
  B.enemyParty=cfg.mons; B.ei=0;
  B.enemy=cfg.mons[0];
  B.pi=firstAlive(); B.ally=G.party[B.pi];
  B.canCatch=!!cfg.canCatch;
  app.innerHTML=`<div id="battle">
    <div class="battle-field">
      <div class="combatant enemy"><div class="info-card" id="e-card"></div><div id="e-spr"></div></div>
      <div class="combatant ally"><div id="p-spr"></div><div class="info-card" id="p-card"></div></div>
    </div>
    <div id="battle-ui"><div id="battle-msg"></div><div class="cmd-grid" id="battle-cmds"></div></div>
  </div>`;
  setSprites(); refreshCards();
  if(cfg.kind==='trainer'){
    await bmsg(`${cfg.name}が しょうぶを しかけてきた！`);
    if(cfg.pre) await bmsg(`${cfg.name}「${cfg.pre}」`);
    await bmsg(`${cfg.name}は ${DEX[B.enemy.sp].n}を くりだした！`);
  }else if(cfg.legendary){
    await bmsg(`でんせつの せいじゅう ${DEX[B.enemy.sp].n}が めをさました！`);
  }else{
    await bmsg(`あっ！ やせいの ${DEX[B.enemy.sp].n}が とびだしてきた！`);
  }
  await bmsg(`ゆけっ！ ${DEX[B.ally.sp].n}！`);

  while(true){
    // ----- player command -----
    const cmd=await new Promise(resolve=>{
      const c=$id('battle-cmds');
      $id('battle-msg').textContent=`${DEX[B.ally.sp].n}は どうする？`;
      c.innerHTML=`
        <button class="btn" data-a="fight">たたかう</button>
        <button class="btn" data-a="bag">バッグ</button>
        <button class="btn" data-a="party">モンスター</button>
        <button class="btn" data-a="run" ${cfg.kind==='trainer'?'disabled':''}>にげる</button>`;
      c.querySelectorAll('button').forEach(b=>{
        b.onclick=async()=>{
          const a=b.dataset.a;
          if(a==='fight'){
            c.innerHTML=B.ally.moves.map(id=>{
              const mv=MOVES[id];
              return `<button class="btn move-btn" data-m="${id}"><span>${mv.n}</span>
                <span class="mv-meta">${TYPES[mv.t].n}/${mv.p}</span></button>`;
            }).join('')+`<button class="btn small" data-m="">もどる</button>`;
            c.querySelectorAll('button').forEach(mb=>{
              mb.onclick=()=>{ if(!mb.dataset.m){ resolve({redo:true}); } else resolve({move:mb.dataset.m}); };
            });
          }else if(a==='bag'){
            const k=await battleBagPick(true);
            if(!k){ resolve({redo:true}); return; }
            resolve({item:k});
          }else if(a==='party'){
            const i=await pickFromParty((m,i)=>m.hp<=0||i===B.pi);
            if(i<0){ resolve({redo:true}); return; }
            resolve({switch:i});
          }else if(a==='run'){
            resolve({run:true});
          }
        };
      });
    });
    if(cmd.redo) continue;

    let playerActed=false;
    // run
    if(cmd.run){
      const p=Math.max(.3, Math.min(.95, .55+(spdOf(B.ally)-spdOf(B.enemy))/100));
      if(Math.random()<p){ await bmsg('うまく にげきれた！'); return 'run'; }
      await bmsg('にげられなかった！');
      playerActed=true;
    }
    // item
    if(cmd.item){
      const it=ITEMS[cmd.item];
      if(it.kind==='orb'){
        if(cfg.kind==='trainer'){ await bmsg('ひとの モンスターに なげるなんて とんでもない！'); continue; }
        if(await tryCatch(cmd.item)){ save(); return 'caught'; }
        playerActed=true;
      }else if(it.kind==='heal'){
        const i=await pickFromParty(m=>m.hp<=0||m.hp>=maxHP(m));
        if(i<0) continue;
        const t=G.party[i];
        G.items[cmd.item]--;
        t.hp=Math.min(maxHP(t), t.hp+it.amt);
        refreshCards(); beep(900,.1,'triangle',.05);
        await bmsg(`${DEX[t.sp].n}の HPが かいふくした！`);
        playerActed=true;
      }else if(it.kind==='revive'){
        const i=await pickFromParty(m=>m.hp>0);
        if(i<0) continue;
        const t=G.party[i];
        G.items[cmd.item]--;
        t.hp=Math.floor(maxHP(t)/2);
        refreshCards(); beep(900,.1,'triangle',.05);
        await bmsg(`${DEX[t.sp].n}は げんきを とりもどした！`);
        playerActed=true;
      }
    }
    // switch
    if(cmd.switch!==undefined){
      await bmsg(`もどれ！ ${DEX[B.ally.sp].n}！`);
      B.pi=cmd.switch; B.ally=G.party[B.pi];
      setSprites(); refreshCards();
      await bmsg(`ゆけっ！ ${DEX[B.ally.sp].n}！`);
      playerActed=true;
    }

    // ----- turn resolution -----
    const enMove=aiMove(B.enemy,B.ally);
    if(cmd.move){
      const pFirst=spdOf(B.ally)>=spdOf(B.enemy);
      const order=pFirst?['p','e']:['e','p'];
      for(const who of order){
        if(who==='p'){
          if(B.ally.hp<=0) continue;
          await doAttack(B.ally,B.enemy,cmd.move,true);
          if(B.enemy.hp<=0) break;
        }else{
          if(B.enemy.hp<=0) continue;
          await doAttack(B.enemy,B.ally,enMove,false);
          if(B.ally.hp<=0) break;
        }
      }
    }else if(playerActed){
      if(B.enemy.hp>0) await doAttack(B.enemy,B.ally,enMove,false);
    }

    // ----- faint checks -----
    if(B.enemy.hp<=0){
      const sv=$id('e-spr').querySelector('svg'); if(sv) sv.classList.add('faint');
      beep(160,.25,'sawtooth',.06);
      await bmsg(`${cfg.kind==='trainer'?cfg.name+'の ':''}${DEX[B.enemy.sp].n}は たおれた！`);
      const exp=Math.floor(DEX[B.enemy.sp].exp*B.enemy.lv/5)+1;
      if(B.ally.hp>0) await gainExpFlow(B.ally,exp);
      B.ei++;
      if(B.ei<B.enemyParty.length){
        B.enemy=B.enemyParty[B.ei];
        await bmsg(`${cfg.name}は ${DEX[B.enemy.sp].n}を くりだした！`);
        setSprites(); refreshCards();
        continue;
      }
      if(cfg.kind==='trainer'){
        await bmsg(`${cfg.name}との しょうぶに かった！`);
        if(cfg.win) await bmsg(`${cfg.name}「${cfg.win}」`);
        if(cfg.money){ G.money+=cfg.money; await bmsg(`しょうきんとして ${cfg.money}ゴールドを てにいれた！`); }
      }
      save();
      return 'win';
    }
    if(B.ally.hp<=0){
      const sv=$id('p-spr').querySelector('svg'); if(sv) sv.classList.add('faint');
      beep(160,.25,'sawtooth',.06);
      await bmsg(`${DEX[B.ally.sp].n}は たおれた！`);
      if(firstAlive()<0){ return 'lose'; }
      const i=await pickFromParty(m=>m.hp<=0,false);
      B.pi=i; B.ally=G.party[B.pi];
      setSprites(); refreshCards();
      await bmsg(`ゆけっ！ ${DEX[B.ally.sp].n}！`);
    }
  }
}

async function handleLoss(){
  await say('めのまえが まっくらに なった…',
    `${G.name}は あわてて ひきかえした…`);
  G.money=Math.floor(G.money/2);
  healParty();
  G.loc=G.lastTown;
  save();
  renderLocation();
}

// ---------- wild & trainer wrappers ----------
function pickWild(loc){
  const t=loc.wild.table, total=t.reduce((s,e)=>s+e[1],0);
  let r=Math.random()*total;
  for(const [sp,w] of t){ r-=w; if(r<=0) return sp; }
  return t[0][0];
}
async function wildBattle(){
  const loc=LOCS[G.loc];
  const sp=pickWild(loc), lv=ri(loc.wild.lv[0],loc.wild.lv[1]);
  const r=await battle({mons:[mkMon(sp,lv)], kind:'wild', canCatch:true});
  if(r==='lose'){ await handleLoss(); return; }
  renderLocation();
}
async function trainerBattleData(t, opts={}){
  const mons=t.mons.map(([sp,lv])=>mkMon(sp,lv));
  const r=await battle({mons, kind:'trainer', name:t.n||t.leader, pre:t.pre, win:t.win, money:t.money,...opts});
  return r;
}

// ---------- screens ----------
function header(title){
  return `<h1 class="screen-title">${esc(title)}</h1>
  <div class="row" style="justify-content:space-between; margin-bottom:10px;">
    <span class="muted">${esc(G.name)}　<span class="gold">${G.money}G</span></span>
    <span class="badge-icons gold">${'◆'.repeat(G.badges.length)}<span class="muted">${'◇'.repeat(8-G.badges.length)}</span></span>
  </div>`;
}
function renderTitle(){
  const hasSave=!!loadSave();
  app.innerHTML=`<div id="title-screen">
    <div id="title-beast">${spriteSVG('astraleon')}</div>
    <div id="title-logo">アストラル<br>ビースト</div>
    <div id="title-sub">〜 ハルモニア地方の旅 〜</div>
    <div style="height:8px"></div>
    ${hasSave?'<button class="btn" id="bt-continue">つづきから</button>':''}
    <button class="btn" id="bt-new">はじめから</button>
    <div class="muted press" style="margin-top:10px">- PRESS BUTTON -</div>
  </div>`;
  if(hasSave) $id('bt-continue').onclick=()=>{ G=loadSave(); beep(880,.08); renderMap(); };
  $id('bt-new').onclick=()=>{ beep(880,.08); startNewGame(); };
}

async function startNewGame(){
  G=newState();
  app.innerHTML=`<div class="screen-pad" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
    <div style="width:120px;height:120px">${spriteSVG('hotarupo')}</div>
  </div>`;
  await say(
    'やあ！ モンスターの せかいへ ようこそ！',
    'わたしは モリノ。みんなからは モンスターはかせと よばれておる。',
    'このせかいには アストラルビーストと よばれる ふしぎな いきものが くらしておる。',
    'ひとは ビーストと きずなを むすび、ともに たたかい、ともに いきておるのじゃ。',
    'おっと、まずは きみの なまえを おしえてくれんか？');
  app.innerHTML=`<div class="screen-pad" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:14px;">
    <div>きみの なまえは？</div>
    <input id="name-input" maxlength="8" placeholder="なまえ">
    <button class="btn" id="name-ok" style="width:240px;text-align:center">けってい</button>
  </div>`;
  await new Promise(res=>{
    $id('name-ok').onclick=()=>{
      const v=$id('name-input').value.trim();
      if(!v){ $id('name-input').placeholder='なまえを いれてね！'; return; }
      G.name=v.slice(0,8); beep(880,.08); res();
    };
  });
  await say(`${G.name}！ いい なまえじゃ！`,
    'きみは きょうから ビーストトレーナーとして 旅にでる。',
    'ハルモニア地方 8つの まちを めぐり、「守人（もりびと）」たちと たたかい 聖印を あつめるのじゃ。',
    '8つの聖印を そろえたものだけが アストラルリーグに ちょうせんできる！',
    'さあ、けんきゅうじょに きなさい。きみの あいぼうを えらんでもらおう！');
  await starterSelect();
}

async function starterSelect(){
  const picks=['hinokobi','hanamoru','upashio'];
  app.innerHTML=`<div class="screen-pad">
    <h1 class="screen-title">モリノ研究所</h1>
    <div>はかせ「すきな こを えらぶといい！」</div>
    <div class="starter-row">
      ${picks.map(p=>`<div class="starter-card" data-sp="${p}">
        ${spriteSVG(p)}<div>${typeChips(p)}</div><div class="nm">${DEX[p].n}</div>
      </div>`).join('')}
    </div>
    <div class="muted" style="margin-top:12px">タップして えらんでね</div>
  </div>`;
  const sp=await new Promise(res=>{
    app.querySelectorAll('.starter-card').forEach(c=>{
      c.onclick=async()=>{
        const s=c.dataset.sp;
        dlgText.textContent='';
        await say(`${DEX[s].n}（${TYPES[DEX[s].t[0]].n}タイプ）`, DEX[s].desc);
        const ok=await ask(`${DEX[s].n}に きめる？`,['はい！','ほかのこも みる']);
        if(ok===0) res(s);
      };
    });
  });
  G.starter=sp;
  G.party=[mkMon(sp,5)];
  beep(1240,.2,'triangle',.07);
  await say(`${G.name}は ${DEX[sp].n}を あいぼうに えらんだ！`);
  // rival
  const rsp=RIVAL_PICK[sp];
  await say('そのとき、けんきゅうじょの ドアが いきおいよく あいた！',
    'ソラ「おっす はかせ！ …って、' + G.name + ' おまえも きてたのか！」',
    'ソラは きみの おさななじみで ライバルだ。',
    `ソラ「じゃあ おれは こいつに きめた！ ${DEX[rsp].n}、おまえだ！」`,
    'ソラ「なあ ' + G.name + '！ さっそく しょうぶしようぜ！」');
  const r=await battle({mons:[mkMon(rsp,5)], kind:'trainer',
    name:'ライバルの ソラ', money:500,
    pre:'いくぜ！ さいしょの しょうぶだ！',
    win:'うわー まけた！ でも つぎは まけないからな！'});
  healParty();
  if(r==='lose'){
    G.money=Math.max(500,G.money);
    await say('ソラ「へへっ、おれの かち！ でも おまえも わるくなかったぜ」',
      'はかせが モンスターを かいふくしてくれた。');
  }else{
    await say('はかせが モンスターを かいふくしてくれた。');
  }
  G.items.kizu=(G.items.kizu||0)+2;
  G.items.orb=(G.items.orb||0)+5;
  await say('はかせ「ふたりとも みどころが あるのう！」',
    'はかせ「これを もっていきなさい。キズぐすりと キャプトオーブじゃ」',
    'キャプトオーブ×5と キズぐすり×2を てにいれた！',
    'はかせ「やせいの ビーストは オーブで なかまに できる。たくさん つかまえるのじゃぞ」',
    'ソラ「おれは さきに いくぜ！ リーグで まってるからな！」',
    'さあ、ぼうけんの はじまりだ！ まずは 1ばん街道から コハルタウンを めざそう！');
  G.maxLoc=1;
  save();
  renderMap();
}

function renderMap(){
  let html=`<div class="screen-pad">${header('ハルモニア地方マップ')}`;
  LOCS.forEach((l,i)=>{
    const locked=i>G.maxLoc;
    html+=`<div class="map-node ${l.town?'town':''} ${i===G.loc?'current':''} ${locked?'locked':''}" data-i="${i}">
      <div class="dot"></div><div>${locked?'？？？':esc(l.n)}</div>
      ${!locked&&l.gym&&G.badges.includes(l.gym.badge)?'<span class="gold" style="margin-left:auto">◆</span>':''}
    </div>`;
  });
  html+=`<div style="height:6px"></div>
    <div class="grid2">
      <button class="btn" id="m-party">モンスター</button>
      <button class="btn" id="m-bag">バッグ</button>
    </div></div>`;
  app.innerHTML=html;
  app.querySelectorAll('.map-node:not(.locked)').forEach(n=>{
    n.onclick=()=>{ beep(700,.05); G.loc=+n.dataset.i; enterLocation(); };
  });
  $id('m-party').onclick=()=>renderParty('map');
  $id('m-bag').onclick=()=>renderBag('map');
}

async function enterLocation(){
  const loc=LOCS[G.loc];
  if(loc.town) G.lastTown=G.loc;
  save();
  // arrival story events
  if(loc.id==='raimei' && !G.flags.raimeiClear){
    renderLocation();
    await say('まちが ていでんしている…！',
      'けいびいん「ヴォイド団が はつでんしょを おそっているんだ！ たすけてくれ！」');
    return;
  }
  if(loc.id==='victory' && !G.flags.rival4){
    renderLocation();
    await say('みなれた かおが まちかまえていた。',
      'ソラ「よう！ おまえも ここまで きたんだな」',
      'ソラ「リーグの まえに…おれが ほんきで そだてた チーム、うけてみろ！」');
    const r=await trainerBattleData({n:'ライバルの ソラ',
      mons:[['tornecle',37],['stelladia',37],['kageusa',38],[STARTER_CHAIN[RIVAL_PICK[G.starter]][2],39]],
      money:4000,
      pre:'いくぜ！ おれたちの ぜんりょくだ！',
      win:'…つよくなったな。おまえなら リーグでも やれるよ。さきに いって まってるぜ！'});
    if(r==='lose'){ await handleLoss(); return; }
    G.flags.rival4=true; save();
    renderLocation();
    return;
  }
  renderLocation();
}

function renderLocation(){
  const loc=LOCS[G.loc];
  let html=`<div class="screen-pad">${header(loc.n)}
    <div class="loc-banner"><h2>${esc(loc.n)}</h2><div class="muted">${esc(loc.desc)}</div></div>
    <div class="loc-actions">`;
  // story / special actions
  if(loc.id==='midoriba'){
    html+=`<button class="btn" id="a-lab">🔬 モリノ研究所に いく</button>`;
  }
  if(loc.id==='jukai' && !G.flags.forestClear){
    html+=`<button class="btn danger" id="a-void1">❗ 森のおくの さわぎを みにいく</button>`;
  }
  if(loc.id==='raimei' && !G.flags.raimeiClear){
    html+=`<button class="btn danger" id="a-void2">❗ はつでんしょに のりこむ</button>`;
  }
  if(loc.id==='tower'){
    if(!G.flags.towerClear) html+=`<button class="btn danger" id="a-void3">❗ 星霊の塔に ふみこむ</button>`;
    else if(!G.flags.legendCaught) html+=`<button class="btn" id="a-altar">✨ さいじょうかいの さいだんを しらべる</button>`;
  }
  if(loc.gym && !G.badges.includes(loc.gym.badge)){
    const blocked=(loc.id==='raimei'&&!G.flags.raimeiClear);
    html+=`<button class="btn" id="a-gym" ${blocked?'disabled':''}>⚔️ ${esc(loc.gym.leader)}に ちょうせん（${TYPES[loc.gym.type].n}）</button>`;
  }
  if(loc.id==='league'){
    html+=`<button class="btn" id="a-league">👑 アストラルリーグに ちょうせん</button>`;
  }
  if(loc.wild){
    html+=`<button class="btn" id="a-wild">🌿 草むらを さがす（やせいの ビースト）</button>`;
  }
  if(loc.trainers){
    loc.trainers.forEach((t,i)=>{
      if(!G.flags['tr_'+loc.id+'_'+i])
        html+=`<button class="btn" data-tr="${i}">🥊 ${esc(t.n)}と しょうぶ</button>`;
    });
  }
  if(loc.town){
    html+=`<button class="btn" id="a-heal">💖 いやしのいずみ（ぜんかいふく）</button>
      <button class="btn" id="a-shop">🛒 ショップ</button>
      <button class="btn" id="a-box">📦 ボックス</button>`;
  }
  html+=`<div class="grid2">
      <button class="btn" id="a-party">モンスター</button>
      <button class="btn" id="a-bag">バッグ</button>
    </div>
    <button class="btn" id="a-map">🗺 マップへ もどる</button>
  </div></div>`;
  app.innerHTML=html;

  const on=(id,fn)=>{ const e=$id(id); if(e) e.onclick=fn; };
  on('a-map',renderMap);
  on('a-party',()=>renderParty('loc'));
  on('a-bag',()=>renderBag('loc'));
  on('a-wild',wildBattle);
  on('a-heal',async()=>{ healParty(); beep(990,.15,'triangle',.06); save();
    await say('モンスターたちは すっかり げんきに なった！'); });
  on('a-shop',renderShop);
  on('a-box',renderBox);
  on('a-lab',async()=>{
    await say('はかせ「おお ' + G.name + '！ 旅は どうじゃな？」',
      `はかせ「聖印は いま ${G.badges.length}こか。」`,
      G.badges.length>=8?'はかせ「アストラルリーグに ちょうせんできるぞ！ ソラも まっておるじゃろう」'
        :'はかせ「守人たちとの たたかいが きみと ビーストを そだてるのじゃ」');
  });
  loc.trainers&&app.querySelectorAll('[data-tr]').forEach(b=>{
    b.onclick=async()=>{
      const i=+b.dataset.tr, t=loc.trainers[i];
      await say(`${t.n}「${t.talk}」`);
      const r=await trainerBattleData(t);
      if(r==='lose'){ await handleLoss(); return; }
      if(r==='win'){ G.flags['tr_'+loc.id+'_'+i]=true; save(); }
      renderLocation();
    };
  });
  on('a-gym',()=>gymChallenge(loc));
  on('a-void1',eventForest);
  on('a-void2',eventCity);
  on('a-void3',eventTower);
  on('a-altar',eventAltar);
  on('a-league',eventLeague);
}

// ---------- gym & story events ----------
async function gymChallenge(loc){
  const g=loc.gym;
  await say(`${g.leader}が しずかに たちあがった。`);
  const r=await trainerBattleData({n:g.leader, mons:g.mons, money:g.money, pre:g.pre, win:g.win});
  if(r==='lose'){ await handleLoss(); return; }
  if(r!=='win'){ renderLocation(); return; }
  G.badges.push(g.badge);
  beep(1320,.3,'triangle',.08);
  await say(`✨ ${g.badge}を てにいれた！（${G.badges.length}/8）`);
  // unlock next area & post-gym events
  const gi=LOCS.indexOf(loc);
  if(G.maxLoc<gi+1 && gi+1<LOCS.length) G.maxLoc=gi+1;
  if(loc.id==='morinomiya' && !G.flags.rival2){
    await say('まちの でぐちで ソラが まっていた。',
      'ソラ「' + G.name + '！ 聖印 あつめてるか？ おれと どっちが つよくなったか たしかめようぜ！」');
    const rr=await trainerBattleData({n:'ライバルの ソラ',
      mons:[['kotorin',16],[STARTER_CHAIN[RIVAL_PICK[G.starter]][1],18]], money:1500,
      pre:'いくぜ！ おれの しんかした あいぼうを みろ！',
      win:'くっそー！ もっと とっくんして でなおしてくるぜ！'});
    G.flags.rival2=true; save();
    if(rr==='lose'){ await handleLoss(); return; }
  }
  if(loc.id==='kazahaya' && !G.flags.rival3){
    await say('ふうしゃの したで ソラが こちらに きづいた。',
      'ソラ「きたな ' + G.name + '！ ちょうど いい かぜだ。しょうぶ しようぜ！」');
    const rr=await trainerBattleData({n:'ライバルの ソラ',
      mons:[['tornecle',27],['kageusa',27],[STARTER_CHAIN[RIVAL_PICK[G.starter]][1],29]], money:2500,
      pre:'まえより ずっと つよくなったぜ！',
      win:'…おまえ、ほんとに つよくなったな。つぎは リーグで あおうぜ！'});
    G.flags.rival3=true; save();
    if(rr==='lose'){ await handleLoss(); return; }
  }
  if(G.badges.length>=8){
    await say('8つの 聖印が そろった！',
      'のこるは 勝利の道の さきにある アストラルリーグだけだ！');
  }
  save();
  renderLocation();
}

async function eventForest(){
  await say('森のおくで くろい コートの しゅうだんが ビーストを おいまわしている！',
    '「ヴォイド団」…せいみゃくエネルギーを ねらう あくの そしきだ！');
  for(const t of VOID_FOREST){
    const r=await trainerBattleData(t);
    if(r==='lose'){ await handleLoss(); return; }
    if(r!=='win'){ renderLocation(); return; }
  }
  await say('したっぱたちは すてゼリフを はいて にげていった。',
    'たすけられた ビーストたちが うれしそうに なきごえを あげている。',
    'モリノミヤへの みちが ひらけた！');
  G.flags.forestClear=true;
  if(G.maxLoc<6) G.maxLoc=6;
  save();
  renderLocation();
}

async function eventCity(){
  await say('はつでんしょの なかは ヴォイド団だらけだ！');
  for(const t of VOID_CITY){
    const r=await trainerBattleData(t);
    if(r==='lose'){ await handleLoss(); return; }
    if(r!=='win'){ renderLocation(); return; }
  }
  await say('ヴォイド団は エネルギーを あきらめて てったいしていった！',
    'まちに あかりが もどった。',
    'けいびいん「ありがとう！ きみは まちの えいゆうだ！」',
    '守人ミナトが ジムで まっている。');
  G.flags.raimeiClear=true;
  save();
  renderLocation();
}

async function eventTower(){
  await say('塔のなかは ヴォイド団で あふれている。',
    'いちばん うえの かいから つよい ひかりが もれている…！');
  for(const t of VOID_TOWER){
    const r=await trainerBattleData(t);
    if(r==='lose'){ await handleLoss(); return; }
    if(r!=='win'){ renderLocation(); return; }
  }
  await say('ゼロスは ちからなく ひざを ついた。',
    'ゼロス「…ほしのちからが あれば、だれも かなしまない せかいを つくれると おもったのだ…」',
    'そのとき、さいだんが まばゆく かがやいた！',
    'でんせつの せいじゅう アストレオンが きみを じっと みつめている。',
    'ヴォイド団は ちりぢりに にげさった。さいだんを しらべれば アストレオンに あえそうだ…。');
  G.flags.towerClear=true;
  if(G.maxLoc<16) G.maxLoc=16;
  save();
  renderLocation();
}

async function eventAltar(){
  await say('さいだんに てを かざすと、ひかりが うずを まいた…！');
  const leg=mkMon('astraleon',40);
  const r=await battle({mons:[leg], kind:'wild', canCatch:true, legendary:true});
  if(r==='caught'){
    G.flags.legendCaught=true;
    await say('でんせつの せいじゅうが なかまに なった！',
      'ほしの ちからが きみの 旅を まもってくれるだろう。');
  }else if(r==='lose'){ await handleLoss(); return; }
  else{
    await say('アストレオンは ひかりに とけるように きえた…',
      'だが、さいだんには まだ あたたかい けはいが のこっている。（また ちょうせんできる）');
  }
  save();
  renderLocation();
}

async function eventLeague(){
  if(G.badges.length<8){
    await say('うけつけ「アストラルリーグへの ちょうせんには 8つの聖印が ひつようです」');
    return;
  }
  await say('うけつけ「聖印の かくにんが とれました。」',
    '「ここから さきは 星詠みの四賢者との れんせん。とちゅうで ひきかえすことは できません」',
    '「じゅんびは よろしいですか？」');
  if(await ask('リーグに いどむ？',['いどむ！','じゅんびする'])!==0){ renderLocation(); return; }
  for(let i=0;i<LEAGUE.length;i++){
    const s=LEAGUE[i];
    await say(`だい${i+1}のま。${s.n}が まっている。`);
    const r=await trainerBattleData({...s, money:3000+i*500});
    if(r==='lose'){ await handleLoss(); return; }
    if(r!=='win'){ renderLocation(); return; }
    if(i<LEAGUE.length-1 && await ask('つぎのまに すすむまえに…',['バッグを つかう','このまま すすむ'])===0){
      await fieldBagUse();
    }
  }
  // champion
  await say('さいごの とびらが ひらく…',
    'そこに たっていたのは ――',
    'ソラ「…よう。やっぱり おまえだったか」',
    'ソラ「おれ、チャンピオンに なったんだ。四賢者を ぜんぶ たおしてさ」',
    'ソラ「でも ずっと まってた。さいごの あいては おまえじゃなきゃ ダメなんだ」',
    'チャンピオン ソラとの さいしゅうけっせん！');
  const r=await trainerBattleData({n:'チャンピオン ソラ',
    mons:[['tornecle',46],['gandorosu',47],['stelladia',47],['noxreive',48],[STARTER_CHAIN[RIVAL_PICK[G.starter]][2],50]],
    money:12000,
    pre:'いくぜ ' + G.name + '！ さいきょうの ライバルたいけつだ！',
    win:'……まけたのに、なんでだろうな。すっげー きもちいいや。おめでとう、しんチャンピオン！'});
  if(r==='lose'){ await handleLoss(); return; }
  if(r!=='win'){ renderLocation(); return; }
  G.flags.champion=true;
  save();
  renderHallOfFame();
}

function renderHallOfFame(){
  app.innerHTML=`<div id="hof">
    <h1>でんどういり</h1>
    <div class="muted">HALL OF FAME</div>
    <div style="height:10px"></div>
    <div class="hof-party">${G.party.map(m=>spriteSVG(m.sp)).join('')}</div>
    <div style="margin-top:8px">${G.party.map(m=>`${DEX[m.sp].n} Lv${m.lv}`).join(' ／ ')}</div>
    <div style="height:14px"></div>
    <div>チャンピオン　${esc(G.name)}</div>
    <div class="muted" style="margin-top:16px; line-height:2">
      ハルモニア地方の へいわは まもられた。<br>
      きみと ビーストたちの ぼうけんは<br>これからも つづく ——<br><br>
      ASTRAL BEASTS<br>
      <span style="font-size:11px">企画・制作：アストラル開発室<br>スペシャルサンクス：すべての トレーナー</span>
    </div>
    <div style="height:14px"></div>
    <button class="btn" id="hof-ok" style="width:220px;text-align:center">つづける</button>
  </div>`;
  $id('hof-ok').onclick=()=>{ beep(880,.08); renderMap(); };
}

// ---------- party / bag / box / shop ----------
function renderParty(back){
  let html=`<div class="screen-pad">${header('てもちモンスター')}`;
  G.party.forEach((m,i)=>{
    const mx=maxHP(m), r=m.hp/mx;
    html+=`<div class="party-card ${m.hp<=0?'fainted':''}">
      <div class="sp">${spriteSVG(m.sp)}</div>
      <div class="info">
        <b>${DEX[m.sp].n}</b> Lv${m.lv}　${typeChips(m.sp)}
        <div class="hp-outer"><div class="hp-inner ${hpClass(r)}" style="width:${Math.max(0,r*100)}%"></div></div>
        <div class="muted">HP ${Math.max(0,m.hp)}/${mx}　こうげき${atkOf(m)} ぼうぎょ${defOf(m)} すばやさ${spdOf(m)}</div>
        <div class="muted">わざ：${m.moves.map(id=>MOVES[id].n).join('／')}</div>
      </div>
      ${i>0?`<button class="btn small" data-top="${i}">先頭に</button>`:''}
    </div>`;
  });
  html+=`<button class="btn" id="back">もどる</button></div>`;
  app.innerHTML=html;
  app.querySelectorAll('[data-top]').forEach(b=>{
    b.onclick=()=>{ const i=+b.dataset.top;
      G.party.unshift(G.party.splice(i,1)[0]); save(); renderParty(back); };
  });
  $id('back').onclick=()=>back==='map'?renderMap():renderLocation();
}

async function fieldBagUse(){
  return new Promise(resolve=>{
    let html=`<div class="screen-pad">${header('バッグ')}`;
    const keys=Object.keys(G.items).filter(k=>G.items[k]>0);
    if(!keys.length) html+=`<div class="muted">どうぐを なにも もっていない…</div>`;
    keys.forEach(k=>{
      const it=ITEMS[k];
      html+=`<div class="shop-row"><span>${it.n} ×${G.items[k]}<br><span class="muted">${it.desc}</span></span>
        ${it.kind!=='orb'?`<button class="btn small" data-use="${k}">つかう</button>`:'<span class="muted">せんとうよう</span>'}</div>`;
    });
    html+=`<div style="height:10px"></div><button class="btn" id="back">もどる</button></div>`;
    app.innerHTML=html;
    app.querySelectorAll('[data-use]').forEach(b=>{
      b.onclick=async()=>{
        const k=b.dataset.use, it=ITEMS[k];
        const valid=(m)=>it.kind==='heal'? (m.hp>0&&m.hp<maxHP(m)) : m.hp<=0;
        const cands=G.party.map((m,i)=>({m,i})).filter(o=>valid(o.m));
        if(!cands.length){ await say('つかえる あいてが いない！'); return; }
        const pick=await choose([...cands.map(o=>`${DEX[o.m.sp].n} HP${Math.max(0,o.m.hp)}/${maxHP(o.m)}`),'やめる']);
        if(pick>=cands.length) return;
        const t=cands[pick].m;
        G.items[k]--;
        if(it.kind==='heal') t.hp=Math.min(maxHP(t),t.hp+it.amt);
        else t.hp=Math.floor(maxHP(t)/2);
        beep(900,.1,'triangle',.05); save();
        await say(`${DEX[t.sp].n}は げんきに なった！`);
        resolve(await fieldBagUse());
      };
    });
    $id('back').onclick=()=>resolve();
  });
}
async function renderBag(back){
  await fieldBagUse();
  back==='map'?renderMap():renderLocation();
}

function renderShop(){
  const stock=shopStock(G.badges.length);
  let html=`<div class="screen-pad">${header('ショップ')}
    <div class="muted" style="margin-bottom:8px">てんいん「いらっしゃいませ！」</div>`;
  stock.forEach(k=>{
    const it=ITEMS[k];
    html+=`<div class="shop-row">
      <span>${it.n}<br><span class="muted">${it.desc}</span></span>
      <span class="gold">${it.price}G</span>
      <button class="btn small" data-buy="${k}">かう</button></div>`;
  });
  html+=`<div style="height:10px"></div><button class="btn" id="back">おみせを でる</button></div>`;
  app.innerHTML=html;
  app.querySelectorAll('[data-buy]').forEach(b=>{
    b.onclick=async()=>{
      const k=b.dataset.buy, it=ITEMS[k];
      if(G.money<it.price){ await say('おかねが たりない…！'); return; }
      G.money-=it.price;
      G.items[k]=(G.items[k]||0)+1;
      beep(1100,.07); save();
      renderShop();
    };
  });
  $id('back').onclick=renderLocation;
}

function renderBox(){
  let html=`<div class="screen-pad">${header('モンスターボックス')}
    <div class="muted" style="margin-bottom:8px">あずけている：${G.box.length}ひき</div>`;
  if(!G.box.length) html+=`<div class="muted">ボックスは からっぽだ。</div>`;
  G.box.forEach((m,i)=>{
    html+=`<div class="party-card">
      <div class="sp">${spriteSVG(m.sp)}</div>
      <div class="info"><b>${DEX[m.sp].n}</b> Lv${m.lv}　${typeChips(m.sp)}</div>
      <button class="btn small" data-take="${i}">${G.party.length<6?'てもちへ':'いれかえ'}</button>
    </div>`;
  });
  html+=`<button class="btn" id="back">もどる</button></div>`;
  app.innerHTML=html;
  app.querySelectorAll('[data-take]').forEach(b=>{
    b.onclick=async()=>{
      const i=+b.dataset.take, m=G.box[i];
      if(G.party.length<6){
        G.box.splice(i,1); G.party.push(m);
        await say(`${DEX[m.sp].n}を てもちに くわえた！`);
      }else{
        const pick=await choose([...G.party.map(p=>`${DEX[p.sp].n} Lv${p.lv}`),'やめる']);
        if(pick>=G.party.length) return renderBox();
        const out=G.party[pick];
        G.party[pick]=m; G.box[i]=out;
        await say(`${DEX[out.sp].n}と ${DEX[m.sp].n}を いれかえた！`);
      }
      save(); renderBox();
    };
  });
  $id('back').onclick=renderLocation;
}

// ---------- boot ----------
renderTitle();
