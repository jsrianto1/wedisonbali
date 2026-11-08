(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),en=document.documentElement.lang==='en';
  document.querySelectorAll('[data-bm-daytrip]').forEach(section=>{
    const path=section.querySelector('[data-daytrip-path]'),marker=section.querySelector('[data-daytrip-marker]'),buttons=[...section.querySelectorAll('[data-daytrip-step]')],notes=[...section.querySelectorAll('[data-daytrip-note]')];
    const length=path.getTotalLength();let progress=0,frame=0,seen=false;
    function paint(value){progress=value;path.style.strokeDashoffset=String(1-value);const p=path.getPointAtLength(length*value);marker.setAttribute('transform',`translate(${p.x} ${p.y})`);}
    function move(target,instant=false){cancelAnimationFrame(frame);if(instant||reduced.matches){paint(target);return;}const start=performance.now(),from=progress;function tick(now){const t=Math.min(1,(now-start)/650);paint(from+(target-from)*t);if(t<1&&!document.hidden)frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);}
    function select(index,instant=false){buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(index===i)));notes.forEach((n,i)=>n.hidden=index!==i);move([.28,.64,1][index],instant);}
    buttons.forEach((b,i)=>b.addEventListener('click',event=>{seen=true;select(i,event.detail===0);}));
    paint(reduced.matches?.28:0);
    if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!seen){seen=true;select(0);observer.disconnect();}},{threshold:.18});observer.observe(section);}else select(0,true);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);});
    reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);select(Math.max(0,buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true')),true);});
  });
  document.querySelectorAll('[data-rb-app]').forEach(section=>{
    const steps=[...section.querySelectorAll('[data-rb-step]')],phone=section.querySelector('.bf-device'),value=section.querySelector('[data-app-percent]'),fill=section.querySelector('[data-app-fill]');
    if(!phone||!value||!fill)return;
    let visible=false,frame=0,animated=false;
    function charge(){cancelAnimationFrame(frame);if(reduced.matches){value.textContent='95';fill.style.transform='scaleX(.95)';return;}value.textContent='10';fill.style.transform='scaleX(.1)';const start=performance.now();let last=10;function tick(now){if(!visible||document.hidden)return;const t=Math.min(1,(now-start)/2600),p=10+85*t;const number=Math.round(p);if(number!==last){value.textContent=String(number);last=number;}fill.style.transform=`scaleX(${p/100})`;if(t<1)frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);}
    function sync(){const index=steps.findIndex(b=>b.getAttribute('aria-pressed')==='true');if(index===1&&visible&&!animated){animated=true;charge();}if(index!==1){cancelAnimationFrame(frame);animated=false;}}
    new MutationObserver(sync).observe(section.querySelector('.rb-steps'),{attributes:true,attributeFilter:['aria-pressed'],subtree:true});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;section.classList.toggle('bf-app-visible',visible);if(visible){animated=false;sync();}else cancelAnimationFrame(frame);},{threshold:.2}).observe(phone);
    else{visible=true;sync();}
    document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else if(visible){animated=false;sync();}});
    reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);animated=false;sync();});
  });
  const film=document.querySelector('#supercharge-film[data-video-src]'),button=document.querySelector('[data-video-load]');
  if(film&&button){
    const label=button.textContent;
    button.addEventListener('click',()=>{
      button.disabled=true;button.textContent=en?'Loading video…':'Memuat video…';
      if(!film.getAttribute('src'))film.src=film.dataset.videoSrc;
      film.controls=true;
      film.play().then(()=>{button.hidden=true;}).catch(error=>{button.disabled=false;button.hidden=false;button.textContent=label;if(error.name!=='AbortError')document.querySelector('.film-error').hidden=false;});
    });
    film.addEventListener('playing',()=>{button.hidden=true;document.querySelector('.film-error').hidden=true;});
    film.addEventListener('ended',()=>{button.disabled=false;button.hidden=false;button.textContent=en?'Watch again ↗':'Tonton lagi ↗';});
    film.addEventListener('error',()=>{button.disabled=false;button.hidden=false;button.textContent=label;document.querySelector('.film-error').hidden=false;});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&!film.paused)film.pause();},{threshold:.05}).observe(film);
  }
})();
