/* Published inputs, adjustable assumptions. No personal data leaves this calculator. */
(function (root) {
  'use strict';
  const models = {edpower:{name:'EdPower',kwh:5.068,range:160},victory:{name:'Victory',kwh:2.534,range:110},athena:{name:'Athena',kwh:2.534,range:110},bees:{name:'Bees',kwh:1.6,range:80}};
  function calculate(v) {
    const m=models[v.model];
    if (!m) throw new RangeError('Invalid model');
    for (const [key,min,max] of [['distance',1,500],['days',1,31],['petrol',1,100000],['efficiency',1,200],['electricity',1,20000],['overhead',0,50],['range',1,400],['engine-cost-year',0,10000000]]) {
      if (!Number.isFinite(v[key]) || v[key]<min || v[key]>max) throw new RangeError('Invalid '+key);
    }
    const km=v.distance*v.days, fuel=km/v.efficiency*v.petrol, oil=v['engine-cost-year']/12, petrol=fuel+oil, energy=km/v.range*m.kwh*(1+v.overhead/100)*v.electricity;
    return {km,fuel,oil,petrol,energy,electric:energy,saving:petrol-energy,annual:(petrol-energy)*12};
  }
  if (typeof module!=='undefined' && module.exports) module.exports={calculate,models};
  if (!root.document) return;
  document.querySelectorAll('[data-calculator]').forEach(panel=>{
    const en=panel.dataset.lang==='en', el=n=>panel.querySelector('[name="'+n+'"]'), currency=new Intl.NumberFormat(en?'en-ID':'id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
    const money=n=>currency.format(n), out=(n,s)=>{const target=panel.querySelector('[data-result="'+n+'"]');if(target)target.textContent=s};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),total=panel.querySelector('[data-result="saving"]');
    const accessible=document.createElement('span');accessible.className='retail-sr-only';total.after(accessible);total.setAttribute('aria-hidden','true');
    let displayValue=0,frame=0;
    function animateTotal(value){cancelAnimationFrame(frame);accessible.textContent=money(value);if(reduced.matches){displayValue=value;out('saving',money(value));return}const from=displayValue,start=performance.now();function tick(now){const progress=Math.min(1,(now-start)/550);displayValue=from+(value-from)*(1-Math.pow(1-progress,3));out('saving',money(displayValue));if(progress<1)frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick)}
    function update(event) {
      if(event?.target===el('ev-model')) {el('range').value=models[el('ev-model').value].range;const bike=document.querySelector('[data-savings-bike]');if(bike){bike.src='/assets/'+el('ev-model').value+'.webp';if(!reduced.matches)bike.animate([{opacity:0,transform:'translateX(18px)'},{opacity:1,transform:'translateX(0)'}],{duration:400,easing:'ease-out'})}}
      if(event?.target===el('distance-slider'))el('distance').value=el('distance-slider').value;
      if(el('distance-slider')){el('distance-slider').value=el('distance').value;el('distance-slider').style.setProperty('--range-fill',((Number(el('distance-slider').value)-1)/499*100)+'%')}
      const m=models[el('ev-model').value];
      const error=panel.querySelector('.calc-error');
      try {
        const v={model:el('ev-model').value,'engine-cost-year':el('engine-cost-year').value.trim()===''?0:Number(el('engine-cost-year').value)};
        for(const n of ['distance','days','petrol','efficiency','electricity','overhead','range']) v[n]=el(n).value.trim()===''?NaN:Number(el(n).value);
        const r=calculate(v); error.hidden=true;
        animateTotal(Math.abs(r.saving));out('annual',money(Math.abs(r.annual))+(r.saving<0?(en?' higher':' lebih mahal'):(en?' lower':' lebih hemat')));
        out('percent',Math.round(Math.abs(r.saving)/r.petrol*100)+'% '+(r.saving>=0?(en?'lower than petrol':'lebih rendah dari bensin'):(en?'higher than petrol':'lebih tinggi dari bensin')));
        panel.querySelector('.savings-result').classList.toggle('is-costlier',r.saving<0);
        document.querySelectorAll('[data-distance-display],[data-savings-distance]').forEach(s=>s.textContent=v.distance);
        out('verdict',r.saving>=0?(en?'Estimated lower monthly cost with Wedison.':'Estimasi biaya bulanan lebih hemat dengan Wedison.'):(en?'Wedison costs more with these settings.':'Biaya Wedison lebih tinggi dengan pengaturan ini.'));
        out('petrol',money(r.petrol));out('electric',money(r.electric));out('model',m.name);
        out('detail',r.km+' km / '+(en?'month':'bulan')+' · '+(en?'electricity ':'listrik ')+money(r.energy));
        out('petrol-detail',(en?'Fuel ':'Bensin ')+money(r.fuel)+(r.oil?' + '+(en?'oil ':'oli ')+money(r.oil):''));
        out('oil-status',r.oil?(en?'Includes your oil spending, averaged over 12 months.':'Termasuk biaya oli dari catatanmu, dirata-ratakan 12 bulan.'):(en?'Energy comparison only. Add your oil spending to see its contribution.':'Saat ini menghitung energi saja. Isi biaya oli untuk melihat tambahan selisihnya.'));
        const max=Math.max(r.petrol,r.electric,1);panel.querySelector('.petrol-bar i').style.width=(r.petrol/max*100)+'%';panel.querySelector('.electric-bar i').style.width=(r.electric/max*100)+'%';
      } catch (_) {cancelAnimationFrame(frame);accessible.textContent='';error.textContent=en?'Enter valid values within the limits shown in each field.':'Isi angka yang valid sesuai batas pada setiap kolom.';error.hidden=false;for(const n of ['saving','annual','petrol','electric','detail','verdict','percent','petrol-detail','oil-status'])out(n,'');}
    }
    panel.addEventListener('input',update);panel.addEventListener('change',update);update();
  });
})(typeof window==='undefined'?globalThis:window);
