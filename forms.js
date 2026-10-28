// On-page forms -> Formspree. Each <form> has action + method=POST, so it still submits without JS.
// With JS: open as a dialog, validate inline, send with fetch (Accept: application/json), show thank-you.
(function(){
  document.documentElement.classList.add('cf-js');
  var last;
  function focusables(m){return [].slice.call(m.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([tabindex="-1"]),textarea,select')).filter(function(el){return el.offsetParent!==null;});}
  function open(id,btn){var m=document.getElementById(id);if(!m||!m.classList.contains('cf-modal'))return;last=btn||null;
    var f=m.querySelector('form'),t=m.querySelector('.cf-thanks');f.hidden=false;t.hidden=true;
    m.classList.add('open');document.body.classList.add('cf-lock');
    setTimeout(function(){var i=f.querySelector('input:not([type=hidden]):not([tabindex="-1"])');i&&i.focus();},30);}
  function close(m){if(!m)return;m.classList.remove('open');document.body.classList.remove('cf-lock');if(location.hash==='#'+m.id)history.replaceState(null,'',location.pathname+location.search);last&&last.focus();}
  document.addEventListener('click',function(e){
    var o=e.target.closest('[data-cf-open]');if(o){e.preventDefault();open(o.getAttribute('data-cf-open'),o);return;}
    var c=e.target.closest('[data-cf-close]');if(c){e.preventDefault();close(c.closest('.cf-modal'));return;}
    if(e.target.classList&&e.target.classList.contains('cf-modal'))close(e.target);});
  document.addEventListener('keydown',function(e){var m=document.querySelector('.cf-modal.open');if(!m)return;
    if(e.key==='Escape'){close(m);return;}
    if(e.key==='Tab'){var f=focusables(m);if(!f.length)return;var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
  var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  document.querySelectorAll('.cf-modal form').forEach(function(f){
    f.setAttribute('novalidate','');
    f.addEventListener('submit',function(e){e.preventDefault();
      var st=f.querySelector('.cf-status');st.textContent='';var first=null;
      f.querySelectorAll('[required]').forEach(function(el){var v=el.value.trim();
        var bad=!v||(el.type==='email'&&!EMAIL.test(v));
        el.setAttribute('aria-invalid',bad?'true':'false');
        var er=f.querySelector('[data-err="'+el.name+'"]');if(er)er.textContent=bad?(el.type==='email'&&v?'Enter a valid email.':'Required.'):'';
        if(bad&&!first)first=el;});
      if(first){first.focus();return;}
      var b=f.querySelector('button[type=submit]'),lbl=b.textContent;b.disabled=true;b.textContent='Sending…';
      var done=function(){var t=f.parentNode.querySelector('.cf-thanks');f.hidden=true;f.reset();t.hidden=false;t.focus();b.disabled=false;b.textContent=lbl;};
      var fail=function(){st.innerHTML='Something went wrong sending that. Please try again, or email <a href="mailto:hello@blackthaimedia.com">hello@blackthaimedia.com</a>.';b.disabled=false;b.textContent=lbl;};
      var fd=new FormData(f);if(fd.get('_gotcha')){done();return;}
      fetch(f.action,{method:'POST',headers:{'Accept':'application/json'},body:fd})
        .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);done();}).catch(fail);
    });});
  window.cfOpen=open;
  if(location.hash==='#quote-form'||location.hash==='#speak-form')open(location.hash.slice(1));
})();
