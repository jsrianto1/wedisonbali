(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const t = (id, english) => en ? english : id;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const config = document.querySelector('.baas-config');
  const motionAllowed = () => !reduced.matches && !document.body.classList.contains('explorer-motion-paused');
  const activeAnimations = new Set();
  function animate(el, frames, duration = 500) {
    if (!motionAllowed()) return;
    el.getAnimations().forEach(a => a.cancel());
    const a = el.animate(frames, {duration,easing:'cubic-bezier(.2,.75,.2,1)'});
    activeAnimations.add(a);a.finished.catch(()=>{}).finally(()=>activeAnimations.delete(a));
  }
  if (config) {
    const names = {victory:'Victory',athena:'Athena',edpower:'EdPower'};
    const params = new URLSearchParams(location.search);
    let model = Object.hasOwn(names,params.get('model')) ? params.get('model') : 'victory';
    let variant = model==='victory' && params.get('plan')==='extended' ? 'extended' : 'standard';
    const photo = document.getElementById('baas-bike');
    const price = document.getElementById('baas-price');
    const detail = document.getElementById('baas-detail');
    function update(moved = true) {
      if (model!=='victory') variant='standard';
      const plan = variant==='extended'?'Extended':'Standard';
      const fee = model==='edpower'?750000:variant==='extended'?490000:390000;
      const formatted = 'Rp'+fee.toLocaleString('id-ID');
      const unit = Number(config.querySelector('[data-baas-model="'+model+'"]').dataset.unitPrice);
      const unitFormatted = 'Rp'+unit.toLocaleString('id-ID');
      document.getElementById('baas-unit-price').textContent=unitFormatted;
      config.querySelectorAll('[data-baas-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.baasModel===model)));
      config.querySelectorAll('[data-baas-variant]').forEach(b=>{b.hidden=b.dataset.baasVariant==='extended'&&model!=='victory';b.setAttribute('aria-pressed',String(b.dataset.baasVariant===variant));});
      document.getElementById('baas-plan').textContent=names[model]+' '+plan;
      price.textContent=formatted;
      document.querySelector('.baas-model-word').textContent=names[model];
      const src='/assets/'+model+'.webp';
      if (photo.getAttribute('src')!==src) {
        photo.onload=()=>{if(moved)animate(photo,[{opacity:0,transform:'translateX(20px) scale(.97)'},{opacity:1,transform:'translateX(0) scale(1)'}],650);};
        photo.src=src;photo.alt=t('Motor listrik Wedison ','Wedison electric motorcycle ')+names[model];
      }
      detail.href=(en?'/en':'')+'/motor/'+model+'/';
      const message=t(`Halo Wedison Bali, saya ingin penawaran BAAS ${names[model]} ${plan}, harga unit ${unitFormatted} OTR Bali dan langganan baterai ${formatted} per bulan. Mohon rincian harga motor OTR Bali, total biaya awal, syarat langganan dan garansi.`,`Hello Wedison Bali, I would like a BAAS quotation for ${names[model]} ${plan} with a ${unitFormatted} Bali OTR motorcycle price and ${formatted} monthly battery subscription. Please share the Bali motorcycle price, total upfront cost, subscription terms and warranty details.`);
      document.getElementById('baas-inquiry').href='https://wa.me/628195693282?text='+encodeURIComponent(message);
      const url=new URL(location.href);url.searchParams.set('model',model);url.searchParams.set('plan',variant);history.replaceState(null,'',url.pathname+url.search+url.hash);
      document.querySelectorAll('[data-language]').forEach(link=>{const u=new URL(link.href);u.searchParams.set('model',model);u.searchParams.set('plan',variant);link.href=u.href;});
      if(moved)animate(price,[{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],320);
    }
    config.querySelectorAll('[data-baas-model]').forEach(b=>b.addEventListener('click',()=>{model=b.dataset.baasModel;variant='standard';update();}));
    config.querySelectorAll('[data-baas-variant]').forEach(b=>b.addEventListener('click',()=>{variant=b.dataset.baasVariant;update();}));
    update(false);

  }
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    animate(entry.target,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],650);observer.unobserve(entry.target);
  }),{threshold:.15});
  document.querySelectorAll('.baas-teaser,.baas-benefit-grid article,.baas-rates').forEach(el=>observer.observe(el));
  reduced.addEventListener('change',()=>{if(reduced.matches)activeAnimations.forEach(a=>a.cancel());});
})();
