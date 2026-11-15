'use strict';
// Repository paths are relative to the root of palloxdg/kcm2026.
const CONFIG = { owner: 'palloxdg', repo: 'kcm2026', branch: 'main', folder: 'tierlistimg' };
const KEY = 'kcm-tierlist-v1';
const defaults = () => [{id:'s',name:'S',color:'#f2979c'},{id:'a',name:'A',color:'#f5bf8b'},{id:'b',name:'B',color:'#f2dc8b'},{id:'c',name:'C',color:'#b5d99c'},{id:'d',name:'D',color:'#9cc5e7'}];
let state = {title:'My tier list',tiers:defaults(),placements:{}};
const EDIT_MODE = new URLSearchParams(location.search).get('edit') === '1';
let ready = false;
function validateRanking(value) {
  if (!value || typeof value.title !== 'string' || !Array.isArray(value.tiers) || !value.tiers.length || value.tiers.length > 100 || !value.placements || typeof value.placements !== 'object' || Array.isArray(value.placements)) throw Error('Invalid ranking file.');
  const seenTiers = new Set(), seenImages = new Set(), placements = Object.create(null);
  const tiers = value.tiers.map(t => {
    if (!t || typeof t.id !== 'string' || !/^[a-z0-9_-]+$/i.test(t.id) || ['pool','__proto__','constructor','prototype'].includes(t.id) || seenTiers.has(t.id) || typeof t.name !== 'string' || !/^#[0-9a-f]{6}$/i.test(t.color)) throw Error('Invalid tier in ranking file.');
    seenTiers.add(t.id);
    const items = value.placements[t.id] || [];
    if (!Array.isArray(items) || !items.every(id => typeof id === 'string')) throw Error('Invalid image assignments.');
    placements[t.id] = items.filter(id => { if(seenImages.has(id)) return false; seenImages.add(id); return true; });
    return {id:t.id,name:t.name.slice(0,40),color:t.color};
  });
  return {title:value.title.slice(0,100),tiers,placements};
}
let images=[], selected=null, dragging=null, editing=null, loading=false;
const $=s=>document.querySelector(s);
const announce=message=>{$('#status').textContent=message;};
function save(){if(!EDIT_MODE || !ready)return;try{localStorage.setItem(KEY,JSON.stringify(state));}catch{announce('Browser storage is unavailable. Keep this tab open to retain your rankings.');}}
function ids(tier){return (state.placements[tier]||[]).filter(id=>images.some(i=>i.id===id));}
function locationOf(id){return state.tiers.find(t=>ids(t.id).includes(id))?.id||'pool';}
function list(tier){return tier==='pool'?images.filter(i=>!state.tiers.some(t=>ids(t.id).includes(i.id))).map(i=>i.id):ids(tier);}
function move(id,tier,before=null){if(!EDIT_MODE || !ready)return;if(!images.some(i=>i.id===id)||!['pool',...state.tiers.map(t=>t.id)].includes(tier)||before===id)return; for(const key of Object.keys(state.placements))state.placements[key]=state.placements[key].filter(x=>x!==id);if(tier!=='pool'){const target=state.placements[tier]||[];const index=target.indexOf(before);target.splice(index<0?target.length:index,0,id);state.placements[tier]=target;}selected=null;save();render();}
function card(id){const item=images.find(i=>i.id===id),el=document.createElement('button');el.className='card'+(selected===id?' selected':'');el.draggable=EDIT_MODE && ready;el.dataset.id=id;el.title=item.name;el.setAttribute('aria-label',item.name+(EDIT_MODE?'; select to assign, or use left and right arrows to reorder':''));el.setAttribute('aria-pressed',String(selected===id));const img=document.createElement('img');img.src=item.url;img.alt=item.name;img.loading='lazy';el.append(img);el.onclick=e=>{if(!EDIT_MODE || !ready)return;e.stopPropagation();selected=selected===id?null:id;render();if(selected){document.querySelectorAll('.card').forEach(c=>{if(c.dataset.id===selected)c.focus();});announce('Selected '+item.name+'. Select a tier label or an empty area in a tier.');}};el.onkeydown=e=>{if(!EDIT_MODE || !ready)return;if(!['ArrowLeft','ArrowRight'].includes(e.key))return;const tier=locationOf(id);if(tier==='pool')return;e.preventDefault();const a=ids(tier),at=a.indexOf(id),next=at+(e.key==='ArrowLeft'?-1:1);if(next<0||next>=a.length)return;[a[at],a[next]]=[a[next],a[at]];state.placements[tier]=a;save();render();document.querySelectorAll('.card').forEach(c=>{if(c.dataset.id===id)c.focus();});};el.ondragstart=e=>{dragging=id;e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move';el.classList.add('dragging');};el.ondragend=()=>{dragging=null;document.querySelectorAll('.over,.dragging').forEach(x=>x.classList.remove('over','dragging'));};return el;}
function dropzone(el,tier){if(!EDIT_MODE || !ready)return;el.onclick=()=>{if(selected)move(selected,tier);};el.ondragover=e=>{if(!dragging)return;e.preventDefault();e.dataTransfer.dropEffect='move';el.classList.add('over');};el.ondragleave=e=>{if(!el.contains(e.relatedTarget))el.classList.remove('over');};el.ondrop=e=>{e.preventDefault();el.classList.remove('over');const id=dragging;const before=e.target.closest('.card')?.dataset.id;if(id)move(id,tier,before);};}
function render(){const board=$('#board');board.replaceChildren();state.tiers.forEach((tier,index)=>{const row=document.createElement('div');row.className='tier';const label=document.createElement('button');label.className='tier-label';label.style.background=tier.color;label.textContent=tier.name;label.title=EDIT_MODE?(selected?'Place selected image here':'Edit tier label and color'):tier.name;label.disabled=!EDIT_MODE;label.onclick=()=>selected?move(selected,tier.id):editTier(tier.id);row.append(label);const zone=document.createElement('div');zone.className='dropzone';zone.setAttribute('aria-label',tier.name+' tier');dropzone(zone,tier.id);const items=list(tier.id);items.forEach(id=>zone.append(card(id)));if(!items.length){const hint=document.createElement('span');hint.className='empty-tier';hint.textContent=EDIT_MODE?(selected?'Tap here to place your image':'Drop images here'):'No images in this tier';zone.append(hint);}row.append(zone);const tools=document.createElement('div');tools.className='tier-tools';[['↑',-1],['↓',1],['⚙',0]].forEach(([symbol,delta])=>{const button=document.createElement('button');button.textContent=symbol;button.setAttribute('aria-label',delta?'Move '+tier.name+(delta<0?' up':' down'):'Edit '+tier.name);button.disabled=delta!==0&&(index+delta<0||index+delta>=state.tiers.length);button.onclick=()=>{if(!delta)return editTier(tier.id);[state.tiers[index],state.tiers[index+delta]]=[state.tiers[index+delta],state.tiers[index]];save();render();};tools.append(button);});if(EDIT_MODE)row.append(tools);board.append(row);});const pool=$('#pool');pool.replaceChildren();const unranked=list('pool');unranked.forEach(id=>pool.append(card(id)));if(!unranked.length){const empty=document.createElement('div');empty.className='empty-pool';empty.textContent=images.length?'All ranked. Strong opinions, nicely arranged.':loading?'Loading your images…':'Your images will appear here. Add image files to tierlistimg in your GitHub repository, then refresh.';pool.append(empty);}dropzone(pool,'pool');$('#count').textContent=unranked.length;$('#progress').textContent=images.length?`${images.length-unranked.length} of ${images.length} ranked`:'Ready when you are.';$('#unrank').hidden=!selected;}
function editTier(id){if(!EDIT_MODE || !ready)return;editing=id;const tier=state.tiers.find(t=>t.id===id);$('#tier-name').value=tier.name;$('#tier-color').value=tier.color;$('#delete-tier').disabled=state.tiers.length===1;$('#tier-dialog').showModal();}
$('#tier-dialog').addEventListener('close',()=>{if($('#tier-dialog').returnValue!=='save')return;const tier=state.tiers.find(t=>t.id===editing);if(!tier)return;tier.name=$('#tier-name').value.trim()||'Tier';tier.color=$('#tier-color').value;save();render();});
$('#delete-tier').onclick=()=>{if(!EDIT_MODE || !ready || state.tiers.length===1)return;state.tiers=state.tiers.filter(t=>t.id!==editing);delete state.placements[editing];$('#tier-dialog').close('cancel');save();render();};
$('#add-tier').onclick=()=>{if(!EDIT_MODE || !ready)return;const tier={id:'tier-'+Date.now(),name:'New',color:'#c5adfc'};state.tiers.push(tier);save();render();editTier(tier.id);};
$('#title').value=state.title;$('#title').oninput=e=>{if(!EDIT_MODE || !ready)return;state.title=e.target.value;save();};
$('#unrank').onclick=()=>{if(selected)move(selected,'pool');};
$('#reset').onclick=()=>{if(!EDIT_MODE || !ready)return;if(!confirm('Return all images to unranked? Your tier labels will stay.'))return;state.placements={};selected=null;save();render();announce('Rankings reset.');};
async function loadImages(){if(loading || !EDIT_MODE)return;loading=true;$('#reload').disabled=true;render();announce('Looking for images in tierlistimg…');try{const {owner,repo,branch,folder}=CONFIG;let entries;const manifest=await fetch('./tierlistimg/images.json',{cache:'no-store'});if(manifest.ok){const data=await manifest.json();if(!Array.isArray(data))throw Error('images.json must contain an array of filenames.');entries=data.map(name=>({name,path:folder+'/'+name,url:new URL('./tierlistimg/'+name.split('/').map(encodeURIComponent).join('/'),location.href).href}));}else{const response=await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folder.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});if(!response.ok)throw Error(response.status===404?'The tierlistimg folder is not on GitHub yet.':response.status===403?'GitHub’s public API limit was reached. Try again later or use images.json (see README).':'Could not load images from GitHub ('+response.status+').');const data=await response.json();if(!Array.isArray(data))throw Error('tierlistimg must be a folder.');entries=data.filter(x=>x.type==='file').map(x=>({name:x.name,path:x.path,url:x.download_url}));}images=entries.filter(x=>/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(x.name)).map(x=>({id:x.path,name:x.name.replace(/\.[^.]+$/,'').replace(/[_-]/g,' '),url:x.url}));announce(images.length?`${images.length} images loaded. Rankings save automatically in this browser.`:'No images found yet. Add PNG, JPG, WebP, GIF, AVIF or SVG files to tierlistimg.');}catch(error){announce(error.message+' Check README.md for setup instructions.');}finally{loading=false;$('#reload').disabled=false;render();}}
$('#reload').onclick=loadImages;
function wrapText(ctx,text,width){const words=text.split(/\s+/),lines=[];let line='';for(const word of words){if(ctx.measureText(line+' '+word).width>width&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}lines.push(line);return lines;}
$('#export').onclick=async()=>{const button=$('#export');button.disabled=true;button.textContent='Exporting…';try{const width=1200,label=140,size=100,pad=12,cols=Math.floor((width-label-pad)/(size+8));const rows=state.tiers.map(t=>({...t,items:ids(t.id)}));const canvas=document.createElement('canvas');canvas.width=width;canvas.height=100+rows.reduce((n,t)=>n+Math.max(124,Math.ceil(t.items.length/cols)*(size+8)+pad*2),0);const ctx=canvas.getContext('2d');ctx.fillStyle='#14151c';ctx.fillRect(0,0,width,canvas.height);ctx.fillStyle='#f0f0f4';ctx.font='bold 30px sans-serif';ctx.fillText(state.title||'My tier list',24,60,width-48);let y=100;for(const tier of rows){const height=Math.max(124,Math.ceil(tier.items.length/cols)*(size+8)+pad*2);ctx.fillStyle='#22242e';ctx.fillRect(0,y,width,height-1);ctx.fillStyle=tier.color;ctx.fillRect(0,y,label,height-1);ctx.fillStyle='#191920';ctx.font='bold 23px sans-serif';ctx.textAlign='center';const lines=wrapText(ctx,tier.name,label-18);lines.forEach((line,i)=>ctx.fillText(line,label/2,y+height/2+(i-(lines.length-1)/2)*27, label-18));ctx.textAlign='left';for(let i=0;i<tier.items.length;i++){const item=images.find(x=>x.id===tier.items[i]);const img=await new Promise((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Could not export '+item.name+'. Verify that the image loads and allows cross-origin access.'));im.src=item.url;});const x=label+pad+(i%cols)*(size+8),top=y+pad+Math.floor(i/cols)*(size+8);const edge=Math.min(img.naturalWidth,img.naturalHeight);ctx.drawImage(img,(img.naturalWidth-edge)/2,(img.naturalHeight-edge)/2,edge,edge,x,top,size,size);}y+=height;}const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG export failed.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(state.title||'tier-list').replace(/[^a-z0-9_-]+/gi,'-')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('PNG exported.');}catch(error){announce(error.message);}finally{button.disabled=false;button.textContent='↓ Export PNG';}};
initialize();

function downloadRanking() {
  if(!EDIT_MODE || !ready) return;
  const data = {...validateRanking(state), version:1, publishedAt:new Date().toISOString(), images:images.map(({id,name,url})=>({id,name,url}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='ranking.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  announce('ranking.json downloaded. Upload it to Tiermaker/ on GitHub, replacing the existing file, then commit. The public page updates after deployment.');
}
$('#publish').onclick=downloadRanking;
async function initialize() {
  document.body.classList.toggle('viewer',!EDIT_MODE);
  document.body.classList.toggle('editor',EDIT_MODE);
  $('#title').readOnly=!EDIT_MODE;
  $('.local-badge').textContent=EDIT_MODE?'Editor draft on this device':'Published ranking';
  const subtitle = $('.subtitle');
  if (subtitle) subtitle.textContent=EDIT_MODE?'Arrange your list, then download ranking.json to publish.':'The latest published picks, all in one place.';
  $('.hint').textContent=EDIT_MODE?'Drag to rank, or select an image and then select a tier. Use left/right arrow keys to reorder.':'Everyone sees the same published ranking.';
  $('#editor-link').href=EDIT_MODE?'./':'?edit=1';
  $('#editor-link').textContent=EDIT_MODE?'View published list':'Edit / publish';
  $('#publish').disabled=true;
  let published=null, issue='';
  try {
    const response=await fetch('./ranking.json',{cache:'no-store'});
    if(response.ok) {
      const data=await response.json();published=validateRanking(data);
      if(!Array.isArray(data.images) || !data.images.every(i=>i && typeof i.id==='string' && typeof i.name==='string' && typeof i.url==='string' && ['https:','http:'].includes(new URL(i.url,location.href).protocol))) throw Error('Invalid image catalog in ranking.json.');
      images=data.images.map(i=>({id:i.id,name:i.name,url:new URL(i.url,location.href).href}));
      state=published;
    } else if(response.status!==404) throw Error('Could not load the published ranking ('+response.status+').');
  } catch(error) { published=null;images=[];issue='The published ranking could not be loaded: '+error.message; }
  if(EDIT_MODE) {
    try {const raw=localStorage.getItem(KEY);if(raw)state=validateRanking(JSON.parse(raw));} catch {}
    ready=true;
    $('#title').value=state.title;
    await loadImages();
    $('#publish').disabled=false;
    if(issue)announce(issue+' Your editor draft is available; check the published file before replacing it.');
  } else {
    ready=true;$('#title').value=state.title;render();
    if(!published){$('#board').replaceChildren();$('#title').value='No published ranking yet';$('#export').disabled=true;$('#pool').replaceChildren();announce(issue || 'No ranking has been published yet. Use Edit / publish to create one.');}
    else announce('Showing the published ranking.');
  }
}
