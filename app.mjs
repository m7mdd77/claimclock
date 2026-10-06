import {validate,status,examples,importEntries,exportEntries} from './domain.mjs';
const $ = id => document.getElementById(id);
let entries = [], editing = null, ascending = true;
try { const saved=localStorage.getItem('claimclock-v1'); entries=saved?importEntries(saved):examples(); } catch { $('notice').textContent='Saved data could not be loaded. Import a valid backup; existing stored data has not been overwritten.'; }
function save(next) { localStorage.setItem('claimclock-v1',exportEntries(next)); entries=next; render(); }
function node(tag,text,className) { const n=document.createElement(tag); n.textContent=text; if(className)n.className=className; return n; }
function render() {
  const real=entries.filter(e=>!e.synthetic); $('total').textContent=real.length;
  for(const s of ['ready','blocked','submitted']) $(s).textContent=real.filter(e=>status(e)===s).length;
  const visible=entries.filter(e=>(e.title.toLowerCase().includes($('search').value.toLowerCase()))&&($('filter').value==='all'||status(e)===$('filter').value)).sort((a,b)=>(Date.parse(a.deadline)-Date.parse(b.deadline))*(ascending?1:-1));
  $('rows').replaceChildren(); $('empty').hidden=visible.length>0;
  for(const e of visible) {
    const row=document.createElement('tr'), title=document.createElement('td'); title.append(node('strong',e.title));
    const link=node('a','Official source ↗'); link.href=e.source; link.target='_blank';link.rel='noopener noreferrer';title.append(link);if(e.synthetic)title.append(node('small','SYNTHETIC · excluded from totals'));
    const deadline=node('td',new Date(e.deadline).toLocaleString()), state=document.createElement('td');state.append(node('span',status(e),'badge '+status(e)));
    const next=node('td',e.requirements.find(r=>!r.done)?.label||'Checklist complete');
    if(e.receipt){const receipt=node('a','View receipt ↗');receipt.href=e.receipt;receipt.target='_blank';receipt.rel='noopener noreferrer';next.replaceChildren(receipt);}
    const action=document.createElement('td'), b=node('button','Edit');b.onclick=()=>open(e);action.append(b);row.append(title,deadline,state,next,action);$('rows').append(row);
  }
}
function open(e) {
  editing=e?.id||null; const f=$('form');f.reset();$('form-error').textContent='';$('checks').replaceChildren();$('delete').hidden=!e;$('edit-title').textContent=e?'Edit opportunity':'Add opportunity';
  if(e){ for(const name of ['title','source','reward','receipt'])f.elements[name].value=e[name]; const d=new Date(e.deadline);f.elements.deadline.value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);f.elements.synthetic.checked=e.synthetic;f.elements.requirements.value=e.requirements.map(r=>r.label).join('\n');
    for(const r of e.requirements){const l=node('label',r.label,'check'),c=document.createElement('input');c.type='checkbox';c.checked=r.done;c.dataset.label=r.label;l.prepend(c);$('checks').append(l);}
  } $('editor').showModal();
}
$('form').onsubmit=event=>{event.preventDefault();try {const f=event.currentTarget,d=new Date(f.elements.deadline.value);const checks=new Map([...$('checks').querySelectorAll('input')].map(c=>[c.dataset.label,c.checked]));const e=validate({id:editing||crypto.randomUUID(),title:f.elements.title.value,source:f.elements.source.value,deadline:d.toISOString(),reward:f.elements.reward.value,receipt:f.elements.receipt.value,synthetic:f.elements.synthetic.checked,requirements:f.elements.requirements.value.split('\n').map(s=>s.trim()).filter(Boolean).map(label=>({label,done:checks.get(label)||false}))});save([...entries.filter(x=>x.id!==editing),e]);$('editor').close();}catch(e){$('form-error').textContent=e.message;}};
$('add').onclick=()=>open();$('close').onclick=()=>$('editor').close();$('delete').onclick=()=>{if(confirm('Delete this entry?')){try{save(entries.filter(e=>e.id!==editing));$('editor').close();}catch(e){$('form-error').textContent=e.message;}}};
$('search').oninput=render;$('filter').onchange=render;$('sort').onclick=()=>{ascending=!ascending;$('sort').textContent='Deadline '+(ascending?'↑':'↓');render();};
$('export').onclick=()=>{const u=URL.createObjectURL(new Blob([exportEntries(entries)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='claimclock.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
$('import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>1024*1024)throw Error('Import is limited to 1 MB.');const next=importEntries(await file.text());if(confirm(`Replace the board with ${next.length} imported entries?`)){save(next);$('notice').textContent='Import complete.';}}catch(e){$('notice').textContent=e.message;}finally{event.target.value='';}};
render();setInterval(render,60000);
