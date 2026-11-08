(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  for (const section of document.querySelectorAll('[data-rb-app]')) {
    const steps=[...section.querySelectorAll('[data-rb-step]')], screens=[...section.querySelectorAll('[data-rb-screen]')], notes=[...section.querySelectorAll('[data-rb-note]')];
    let i=0, running=!reduced.matches, visible=false, timer;
    function select(n) { i=n; steps.forEach((b,j)=>{b.setAttribute('aria-pressed',String(i===j));screens[j].classList.toggle('rb-current',i===j);screens[j].setAttribute('aria-hidden',String(i!==j));notes[j].hidden=i!==j;}); }
    function sync(){clearTimeout(timer);if(visible && running && !reduced.matches && !document.hidden && i<steps.length-1)timer=setTimeout(()=>{select(i+1);sync();},5000);}
    function stop(){running=false;sync();}
    steps.forEach((b,j)=>b.addEventListener('click',()=>{stop();select(j);}));
    document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{if(reduced.matches)running=false;sync();});
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.15}).observe(section.querySelector('.rb-phone-art')||section);
    else {visible=true;sync();}
    select(0); sync();
  }
})();
