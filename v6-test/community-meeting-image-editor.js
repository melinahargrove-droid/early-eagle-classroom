(()=>{
const KEY='eea-community-meeting-image-layout';
const defaults={
  ready:{x:-1.5,y:0,z:384},
  'breathe-in':{x:-192.5,y:0,z:384},
  'breathe-out':{x:-115,y:-6,z:430},
  repeat:{x:-319.5,y:-6,z:430},
  done:{x:-174,y:-109.5,z:430}
};
let values={};try{values={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){values={...defaults}}
const sprites=[...document.querySelectorAll('.sprite')];
function keyFor(s){return [...s.classList].find(c=>c!=='sprite')}
function apply(s){const k=keyFor(s),v=values[k]||defaults[k];const img=s.querySelector('img');if(!img||!v)return;img.style.left=v.x+'%';img.style.top=v.y+'%';img.style.width=v.z+'%'}
sprites.forEach(apply);
const style=document.createElement('style');style.textContent=`
.cm-edit-btn{position:fixed;left:1.2%;bottom:1.5%;z-index:30;border:1px solid rgba(70,108,122,.25);border-radius:999px;background:#fffdf8;color:#315f70;padding:.7vh 1vw;font-weight:900;cursor:pointer}
.cm-editor{position:fixed;left:1.2%;bottom:6.5%;z-index:40;width:min(340px,30vw);padding:14px;border-radius:18px;background:rgba(255,253,248,.98);border:1.5px solid rgba(70,108,122,.22);box-shadow:0 12px 30px rgba(30,50,55,.18);display:none;color:#315f70;font-weight:800}.cm-editor.open{display:block}.cm-editor h3{margin:0 0 10px;font-size:16px}.cm-editor .stepname{margin-bottom:10px;color:#174f7d;font-size:14px}.cm-editor label{display:grid;grid-template-columns:54px 1fr 54px;gap:8px;align-items:center;margin:8px 0;font-size:12px}.cm-editor input[type=range]{width:100%}.cm-editor output{text-align:right;font-variant-numeric:tabular-nums}.cm-nudges{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.cm-nudges button,.cm-actions button{border:1px solid rgba(70,108,122,.18);border-radius:10px;background:#f4f8f6;color:#315f70;padding:7px;font-weight:900;cursor:pointer}.cm-actions{display:flex;gap:7px;margin-top:10px}.cm-actions button{flex:1}.cm-tip{margin-top:8px;font-size:10px;color:#78908e;line-height:1.3}`;document.head.appendChild(style);
const btn=document.createElement('button');btn.className='cm-edit-btn';btn.textContent='Adjust Image';document.body.appendChild(btn);
const panel=document.createElement('div');panel.className='cm-editor';panel.innerHTML=`<h3>Image Position</h3><div class="stepname" id="cmStep"></div>
<label><span>Left</span><input id="cmX" type="range" min="-380" max="20" step="0.5"><output id="cmXO"></output></label>
<label><span>Top</span><input id="cmY" type="range" min="-180" max="30" step="0.5"><output id="cmYO"></output></label>
<label><span>Zoom</span><input id="cmZ" type="range" min="280" max="520" step="1"><output id="cmZO"></output></label>
<div class="cm-nudges"><button data-n="up">↑ Up</button><button data-n="zin">＋ Zoom</button><button data-n="left">← Left</button><button data-n="right">Right →</button><button data-n="zout">− Zoom</button><button data-n="down">↓ Down</button></div>
<div class="cm-actions"><button id="cmReset">Reset Step</button><button id="cmCopy">Copy Values</button></div><div class="cm-tip">Adjust the image on the current card. Your values save automatically in this browser.</div>`;document.body.appendChild(panel);
const x=document.getElementById('cmX'),y=document.getElementById('cmY'),z=document.getElementById('cmZ'),xo=document.getElementById('cmXO'),yo=document.getElementById('cmYO'),zo=document.getElementById('cmZO'),step=document.getElementById('cmStep');
function activeSprite(){return document.querySelector('.card.active .sprite')}
function loadControls(){const s=activeSprite();if(!s)return;const k=keyFor(s),v=values[k]||defaults[k];step.textContent=k.replaceAll('-',' ').replace(/\b\w/g,m=>m.toUpperCase());x.value=v.x;y.value=v.y;z.value=v.z;syncOutputs()}
function syncOutputs(){xo.textContent=Number(x.value).toFixed(1);yo.textContent=Number(y.value).toFixed(1);zo.textContent=Math.round(Number(z.value))+'%'}
function saveCurrent(){const s=activeSprite();if(!s)return;const k=keyFor(s);values[k]={x:Number(x.value),y:Number(y.value),z:Number(z.value)};localStorage.setItem(KEY,JSON.stringify(values));apply(s);syncOutputs()}
[x,y,z].forEach(el=>el.addEventListener('input',saveCurrent));
panel.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{const n=b.dataset.n;if(n==='up')y.value=Number(y.value)-1;if(n==='down')y.value=Number(y.value)+1;if(n==='left')x.value=Number(x.value)-1;if(n==='right')x.value=Number(x.value)+1;if(n==='zin')z.value=Number(z.value)+4;if(n==='zout')z.value=Number(z.value)-4;saveCurrent()});
document.getElementById('cmReset').onclick=()=>{const s=activeSprite();if(!s)return;const k=keyFor(s);values[k]={...defaults[k]};localStorage.setItem(KEY,JSON.stringify(values));apply(s);loadControls()};
document.getElementById('cmCopy').onclick=async()=>{const text=JSON.stringify(values,null,2);try{await navigator.clipboard.writeText(text);document.getElementById('cmCopy').textContent='Copied!';setTimeout(()=>document.getElementById('cmCopy').textContent='Copy Values',1200)}catch(e){prompt('Copy these values:',text)}};
btn.onclick=()=>{panel.classList.toggle('open');loadControls()};
const obs=new MutationObserver(loadControls);document.querySelectorAll('.card').forEach(c=>obs.observe(c,{attributes:true,attributeFilter:['class']}));
})();