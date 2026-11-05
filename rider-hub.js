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
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.15}).observe(section);
    else {visible=true;sync();}
    select(0); sync();
  }
  const film=document.querySelector('#supercharge-film');
  if(film && 'IntersectionObserver' in window){
    let visible=false;
    const sync=()=>{if(!visible||document.hidden||reduced.matches){film.pause();return;}if(!film.ended)film.play().catch(()=>{});};
    new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.35}).observe(film);
    document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  }
  const wrap=document.querySelector('.rb-directory');
  if(!wrap)return;
  const cards=[...wrap.querySelectorAll('.rb-station')], filters=[...wrap.querySelectorAll('[data-rb-filter]')], input=wrap.querySelector('#rb-search'), area=wrap.querySelector('#rb-area'), markers=new Map();
  let map,layer,status='';
  const googleDialog=wrap.querySelector('#rb-google-dialog');
  let googleTrigger;
  for(const card of cards){
    const button=card.querySelector('[data-rb-google]');
    button.addEventListener('click',()=>{
      googleTrigger=button;
      const title=card.querySelector('h3').textContent;
      googleDialog.querySelector('b').textContent=title;
      const frame=googleDialog.querySelector('iframe');
      frame.title='Google Maps: '+title;
      frame.src='https://maps.google.com/maps?'+new URLSearchParams({q:card.dataset.point,z:'16',output:'embed',hl:en?'en':'id'});
      googleDialog.querySelector('a').href=card.querySelector('a').href;
      googleDialog.showModal();
    });
  }
  googleDialog.querySelector('[data-rb-google-close]').addEventListener('click',()=>googleDialog.close());
  googleDialog.addEventListener('close',()=>{googleDialog.querySelector('iframe').removeAttribute('src');googleTrigger?.focus({preventScroll:true});});
  if(window.L){
    map=L.map('rb-map',{scrollWheelZoom:false}).setView([-8.61,115.22],11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    layer=L.layerGroup().addTo(map);
    cards.forEach(c=>{
      const point=c.dataset.point.split(',').map(Number),active=c.dataset.status==='operational';
      const marker=L.marker(point,{title:c.querySelector('h3').textContent,icon:L.divIcon({className:'rb-marker '+(active?'rb-active':''),html:active?'⚡':'○',iconSize:[28,28],iconAnchor:[14,14]})});
      const popup=document.createElement('div');popup.className='rb-popup';
      for(const selector of ['h3','.rb-state','address','a'])popup.append(c.querySelector(selector).cloneNode(true));
      marker.bindPopup(popup);marker.on('click',()=>{cards.forEach(x=>x.classList.toggle('rb-picked',x===c));});markers.set(c,marker);
      c.querySelector('[data-rb-pin]').addEventListener('click',()=>{map.setView(point,15,{animate:false});marker.openPopup();cards.forEach(x=>x.classList.toggle('rb-picked',x===c));if(innerWidth<=800)wrap.querySelector('.rb-map-shell').scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});});
    });
  } else {document.querySelector('.rb-map-shell').hidden=true;cards.forEach(c=>c.querySelector('[data-rb-pin]').hidden=true);}
  function fit(){if(!map)return;const points=cards.filter(c=>!c.hidden).map(c=>markers.get(c).getLatLng());if(points.length)map.fitBounds(L.latLngBounds(points),{padding:[36,36],maxZoom:15,animate:false});}
  function draw(){
    const q=input.value.trim().toLowerCase();let count=0;
    if(layer){map.closePopup();layer.clearLayers();}
    cards.forEach(c=>{const show=(!area.value||c.dataset.city===area.value)&&(!status||c.dataset.status===status)&&c.textContent.toLowerCase().includes(q);c.hidden=!show;c.classList.remove('rb-picked');if(show){count++;if(layer)markers.get(c).addTo(layer);}});
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rbFilter===status)));
    wrap.querySelector('#rb-count').textContent=count+' '+(en?(count===1?'location shown':'locations shown'):'lokasi ditampilkan');
    wrap.querySelector('#rb-empty').hidden=count!==0;fit();
  }
  input.addEventListener('input',draw);area.addEventListener('change',draw);
  filters.forEach(b=>b.addEventListener('click',()=>{status=b.dataset.rbFilter;draw();}));
  wrap.querySelector('[data-rb-fit]').addEventListener('click',fit);
  wrap.querySelector('[data-rb-reset]').addEventListener('click',()=>{input.value='';area.value='';status='';draw();input.focus();});
  draw();
})();
