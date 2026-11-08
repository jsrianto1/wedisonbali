(() => {
  'use strict';
  const wrap=document.querySelector('.rb-network-atlas');
  if(!wrap)return;
  const en=document.documentElement.lang==='en', reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const cards=[...wrap.querySelectorAll('.rb-station')], input=wrap.querySelector('#rb-search'), area=wrap.querySelector('#rb-area');
  const filters=[...wrap.querySelectorAll('[data-rb-filter]')], markers=new Map(), results=wrap.querySelector('.rb-results');
  let status='',map,layer,selected;
  const dialog=wrap.querySelector('#rb-google-dialog');let trigger;
  cards.forEach(card=>card.querySelector('[data-rb-google]').addEventListener('click',event=>{
    trigger=event.currentTarget;
    const title=card.querySelector('h3').textContent, frame=dialog.querySelector('iframe');
    dialog.querySelector('b').textContent=title;frame.title='Google Maps: '+title;
    frame.src='https://maps.google.com/maps?'+new URLSearchParams({q:card.dataset.point,z:'16',output:'embed',hl:en?'en':'id'});
    dialog.querySelector('a').href=card.querySelector('a').href;dialog.showModal();
  }));
  dialog.querySelector('[data-rb-google-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{dialog.querySelector('iframe').removeAttribute('src');trigger?.focus({preventScroll:true});});
  function pick(card,scrollList=false){
    selected=card;
    cards.forEach(c=>c.classList.toggle('rb-picked',c===card));
    markers.forEach((marker,c)=>marker.getElement()?.classList.toggle('rb-pin-selected',c===card));
    const halo=markers.get(card)?.getElement()?.querySelector('.rb-pin-halo');
    if(halo&&!reduced.matches)halo.animate([{transform:'scale(1)',opacity:.65},{transform:'scale(1.8)',opacity:0}],{duration:1200,iterations:3,easing:'ease-out'});
    if(scrollList)results.scrollTo({top:card.offsetTop-12,behavior:'auto'});
  }
  if(window.L){
    map=L.map('rb-map',{scrollWheelZoom:false}).setView([-8.61,115.22],10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    layer=L.layerGroup().addTo(map);
    cards.forEach(card=>{
      const point=card.dataset.point.split(',').map(Number), active=card.dataset.status==='operational',name=card.querySelector('h3').textContent;
      const marker=L.marker(point,{title:name+' · '+(active?(en?'Operating':'Aktif'):'Coming soon'),keyboard:true,icon:L.divIcon({className:'rb-brand-pin '+(active?'rb-operating-pin':'rb-planned-pin'),html:'<span class="rb-pin-halo"></span><span class="rb-pin-face"><img src="/assets/wedison-map-mark.svg" width="22" height="22" alt=""></span>',iconSize:[36,42],iconAnchor:[18,40],popupAnchor:[0,-35]})});
      const popup=document.createElement('div');popup.className='rb-popup';
      ['h3','.rb-state','address','a'].forEach(selector=>popup.append(card.querySelector(selector).cloneNode(true)));
      marker.bindPopup(popup,{maxWidth:260});marker.on('click',()=>pick(card,true));markers.set(card,marker);
      card.querySelector('[data-rb-pin]').addEventListener('click',()=>{
        map.setView(point,16,{animate:false});render();marker.openPopup();pick(card);
        if(innerWidth<=800)wrap.querySelector('.rb-map-shell').scrollIntoView({block:'start',behavior:'auto'});
      });
    });
    map.on('zoomend',render);
  }else{
    wrap.querySelector('.rb-map-shell').hidden=true;
    cards.forEach(c=>c.querySelector('[data-rb-pin]').hidden=true);
  }
  function visibleCards(){return cards.filter(c=>!c.hidden);}
  function render(){
    if(!map)return;
    layer.clearLayers();
    const visible=visibleCards(),parents=visible.map((_,i)=>i),positions=visible.map(c=>map.latLngToLayerPoint(markers.get(c).getLatLng()));
    function root(i){while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;}
    if(map.getZoom()<16)for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++)if(positions[i].distanceTo(positions[j])<42)parents[root(j)]=root(i);
    const groups=new Map();visible.forEach((card,i)=>{const key=root(i);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(card);});
    groups.forEach(group=>{
      if(group.length===1){const c=group[0];markers.get(c).addTo(layer);if(c===selected)markers.get(c).getElement()?.classList.add('rb-pin-selected');return;}
      const points=group.map(c=>markers.get(c).getLatLng()),bounds=L.latLngBounds(points),active=group.filter(c=>c.dataset.status==='operational').length;
      const title=group.length+(en?' locations: ':' lokasi: ')+active+(en?' operating, ':' aktif, ')+(group.length-active)+' coming soon; '+(en?'click to zoom':'klik untuk memperbesar');
      const cluster=L.marker(bounds.getCenter(),{title,keyboard:true,icon:L.divIcon({className:'rb-cluster '+(active?'rb-cluster-mixed':'rb-cluster-planned'),html:'<span>'+group.length+'</span><i aria-hidden="true"></i>',iconSize:[42,42],iconAnchor:[21,21]})});
      cluster.on('click',()=>map.fitBounds(bounds,{padding:[60,60],maxZoom:16,animate:false}));cluster.addTo(layer);
    });
  }
  function fit(){if(!map)return;const points=visibleCards().map(c=>markers.get(c).getLatLng());if(points.length)map.fitBounds(L.latLngBounds(points),{padding:[42,42],maxZoom:14,animate:false});render();}
  function draw(){
    const q=input.value.trim().toLowerCase();let count=0;selected=undefined;
    map?.closePopup();
    cards.forEach(card=>{const show=(!status||card.dataset.status===status)&&(!area.value||card.dataset.city===area.value)&&card.textContent.toLowerCase().includes(q);card.hidden=!show;card.classList.remove('rb-picked');if(show)count++;});
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rbFilter===status)));
    wrap.querySelector('#rb-count').textContent=count+' '+(en?(count===1?'location shown':'locations shown'):'lokasi ditampilkan');
    wrap.querySelector('#rb-empty').hidden=count!==0;fit();
  }
  filters.forEach(button=>button.addEventListener('click',()=>{status=button.dataset.rbFilter;draw();}));
  input.addEventListener('input',draw);area.addEventListener('change',draw);
  wrap.querySelector('[data-rb-fit]').addEventListener('click',fit);
  wrap.querySelector('[data-rb-reset]').addEventListener('click',()=>{status='';input.value='';area.value='';draw();input.focus();});
  draw();
})();
