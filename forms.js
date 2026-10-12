// ==== Formspree config: paste the two form IDs (the part after formspree.io/f/) ====
const FORMSPREE = { quote: 'REPLACE_QUOTE_ID', speak: 'REPLACE_SPEAK_ID' };
const SUBJECT = { quote: 'Quote request — chrispgiles.com', speak: 'Speaking request — chrispgiles.com' };
// While an ID still starts with REPLACE_, submitting shows the error + mailto fallback (no fake success).
(function(){var last;function open(id,btn){var m=document.getElementById(id);if(!m)return;last=btn;var f=m.querySelector('form');if(f){f.hidden=false;f.querySelector('[name=ts]').value=Date.now();}var t=m.querySelector('.cf-thanks');if(t)t.hidden=true;m.classList.add('open');document.body.classList.add('cf-lock');setTimeout(function(){var i=m.querySelector('input:not([type=hidden]):not([tabindex="-1"])');i&&i.focus();},30);}
function close(m){m.classList.remove('open');document.body.classList.remove('cf-lock');last&&last.focus();}
document.addEventListener('click',function(e){var o=e.target.closest('[data-cf-open]');if(o){e.preventDefault();open(o.getAttribute('data-cf-open'),o);return;}var c=e.target.closest('[data-cf-close]');if(c){close(c.closest('.cf-modal'));return;}if(e.target.classList&&e.target.classList.contains('cf-modal'))close(e.target);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){var m=document.querySelector('.cf-modal.open');m&&close(m);}});
document.querySelectorAll('.cf-modal form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var st=f.querySelector('.cf-status');st.textContent='';var ok=true;f.querySelectorAll('[required]').forEach(function(el){var bad=!el.value.trim()||(el.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()));el.classList.toggle('bad',bad);var er=f.querySelector('[data-err="'+el.name+'"]');if(er)er.textContent=bad?(el.type==='email'&&el.value.trim()?'Enter a valid email.':'Required.'):'';if(bad&&ok){ok=false;el.focus();}});if(!ok)return;
var d={};new FormData(f).forEach(function(v,k){if(d[k]!==undefined){d[k]=[].concat(d[k],v);}else d[k]=v;});if(Number(d.ts)&&Date.now()-Number(d.ts)<4000){st.textContent='One sec, give it another try.';return;}
var b=f.querySelector('button[type=submit]');b.disabled=true;var lbl=b.textContent;b.textContent='Sending…';
var fail=function(){st.innerHTML='Something went wrong sending that. Please email <a class="text-link" href="mailto:hello@blackthaimedia.com">hello@blackthaimedia.com</a> instead.';b.disabled=false;b.textContent=lbl;};
if(d._gotcha){f.hidden=true;f.reset();f.parentNode.querySelector('.cf-thanks').hidden=false;b.disabled=false;b.textContent=lbl;return;}
var key=d.form==='speaking'?'speak':'quote',id=FORMSPREE[key];if(!id||/^REPLACE_/.test(id)){fail();return;}
var fd=new FormData(f);fd.delete('ts');fd.set('_subject',SUBJECT[key]);fd.set('_replyto',(d.email||'').trim());
fetch('https://formspree.io/f/'+id,{method:'POST',headers:{'Accept':'application/json'},body:fd}).then(function(r){if(!r.ok)throw r;f.hidden=true;f.reset();f.parentNode.querySelector('.cf-thanks').hidden=false;b.disabled=false;b.textContent=lbl;}).catch(fail)});});
window.cfOpen=open;var h={"#quote-form":"cf-quote","#speak-form":"cf-speaking"}[location.hash];if(h)open(h);})();
