(() => {
  'use strict';
  const header=document.querySelector('.bn-header');
  if(!header)return;
  const nav=header.querySelector('.desktop-nav'), menus=[...nav.querySelectorAll('.bn-dropdown')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const running=new WeakMap(),desired=new WeakMap();
  function cancel(menu){running.get(menu)?.cancel();running.delete(menu);}
  function change(menu,open,keyboard=false){
    cancel(menu);
    desired.set(menu,open);
    const panel=menu.querySelector('.bn-mega');
    if(open){
      menus.forEach(other=>{if(other!==menu){cancel(other);desired.set(other,false);other.open=false;}});
      menu.open=true;
      const trigger=menu.querySelector('summary').getBoundingClientRect(), bounds=panel.getBoundingClientRect();
      panel.style.transformOrigin=(trigger.x+trigger.width/2-bounds.x)+'px 0';
      if(!keyboard&&!reduced.matches)running.set(menu,panel.animate([{opacity:0,transform:'translate(-50%,-8px) scale(.97)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'}));
    }else if(menu.open){
      if(keyboard||reduced.matches){menu.open=false;return;}
      const exit=panel.animate([{opacity:1,transform:'translate(-50%,0) scale(1)'},{opacity:0,transform:'translate(-50%,-8px) scale(.97)'}],{duration:150,easing:'cubic-bezier(.23,1,.32,1)'});
      running.set(menu,exit);
      exit.onfinish=()=>{menu.open=false;running.delete(menu);};
    }
  }
  menus.forEach(menu=>{
    const summary=menu.querySelector('summary');
    summary.addEventListener('click',event=>{event.preventDefault();change(menu,!(desired.get(menu)??menu.open),event.detail===0);});
    menu.addEventListener('focusout',event=>{if(!menu.contains(event.relatedTarget))change(menu,false,true);});
    menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>change(menu,false,true)));
  });
  document.addEventListener('click',event=>{if(!nav.contains(event.target))menus.forEach(menu=>change(menu,false));});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape')menus.forEach(menu=>{if(menu.open){change(menu,false,true);menu.querySelector('summary').focus();}});
  });
  const mobile=document.querySelector('#mobile-menu'),toggle=header.querySelector('.menu-toggle');
  toggle.addEventListener('click',()=>{
    menus.forEach(menu=>change(menu,false,true));
    if(!mobile.hidden&&!reduced.matches)mobile.animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});
  });
  matchMedia('(min-width:1081px)').addEventListener('change',event=>{
    if(event.matches&&!mobile.hidden){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',document.documentElement.lang==='en'?'Open menu':'Buka menu');mobile.hidden=true;document.body.classList.remove('menu-open');}
  });
})();
