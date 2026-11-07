(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.23,1,.32,1)';
  const activeAnimations = new Set();
  function fade(element) {
    if (!element.animate) return;
    const animation = element.animate([{opacity:.35},{opacity:1}], {duration:reduced.matches?100:150,easing:ease});
    activeAnimations.add(animation);
    animation.finished.catch(()=>{}).finally(()=>activeAnimations.delete(animation));
  }
  const proof = document.querySelector('.bali-proof');
  if (proof) {
    const buttons = [...proof.querySelectorAll('[data-bm-proof]')];
    const panels = [...proof.querySelectorAll('[data-bm-panel]')];
    const status = proof.querySelector('.bm-proof-status');
    function select(index, announce=false) {
      buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      panels.forEach((panel,i)=>{panel.hidden=i!==index;});
      if (announce) {fade(panels[index]);status.textContent=buttons[index].textContent;}
    }
    buttons.forEach((button,index)=>button.addEventListener('click',()=>select(index,true)));
    select(0);proof.classList.add('proof-ready');
    const fromHash=buttons.findIndex(button=>'#'+button.id===location.hash);
    if(fromHash>=0)select(fromHash);
  }
  const appSections=[...document.querySelectorAll('[data-rb-app]')];
  appSections.forEach(section=>{
    const steps=[...section.querySelectorAll('[data-rb-step]')];
    let previous=-1;
    const sync=()=>{
      const index=steps.findIndex(button=>button.getAttribute('aria-pressed')==='true');
      section.dataset.baliStep=String(index);
      if(previous>=0&&previous!==index)fade(section.querySelector('.rb-phone'));
      previous=index;
    };
    new MutationObserver(sync).observe(section.querySelector('.rb-steps'),{attributes:true,attributeFilter:['aria-pressed'],subtree:true});
    sync();
  });
  const observed=[...(proof?[proof.querySelector('.bm-proof-panels')]:[]),...appSections.map(section=>section.querySelector('.rb-phone-art'))].filter(Boolean);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const owner=entry.target.closest('.bali-proof, [data-rb-app]');
      owner.classList.add(owner===proof?'is-visible':'bm-in-view');
      observer.unobserve(entry.target);
    }),{threshold:.15});
    observed.forEach(element=>observer.observe(element));
  }
  // One bounded frame per native scroll event, only while this route is on screen.
  document.querySelectorAll('[data-bali-route]').forEach(section=>{
    const path=section.querySelector('[data-journey-path]');
    const marker=section.querySelector('[data-journey-marker]');
    const counter=section.querySelector('[data-journey-km]');
    const chapters=[...section.querySelectorAll('[data-journey-chapter]')];
    if(!path||!marker||!counter)return;
    const length=path.getTotalLength();
    let visible=false,frame=0,last=-1,lastKm=-1;
    function render(progress){
      if(progress===last)return;last=progress;
      path.style.strokeDashoffset=String(1-progress);
      const point=path.getPointAtLength(length*progress);
      marker.setAttribute('transform',`translate(${point.x} ${point.y})`);
      const km=Math.round(progress*200);
      if(km!==lastKm){counter.textContent=String(km);lastKm=km;}
      const chapter=Math.min(2,Math.floor(progress*3));
      chapters.forEach((item,index)=>item.classList.toggle('is-current',index===chapter));
    }
    function update(){
      frame=0;
      if(reduced.matches){render(1);return;}
      const box=section.getBoundingClientRect();
      render(Math.round(Math.max(0,Math.min(1,(innerHeight-box.top)/(innerHeight+box.height)*1.65))*1000)/1000);
    }
    function request(){if(visible&&!frame)frame=requestAnimationFrame(update);}
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();},{rootMargin:'100px'}).observe(section);
    else{visible=true;}
    addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
    reduced.addEventListener('change',()=>{last=-1;update();});
    // The complete range remains visible to readers before scrolling and without JS.
    if(reduced.matches)render(1);else request();
  });
  reduced.addEventListener('change',()=>{
    if(reduced.matches){activeAnimations.forEach(animation=>animation.cancel());activeAnimations.clear();}
  });
})();
