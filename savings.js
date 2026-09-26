/* Published inputs, adjustable assumptions. No personal data leaves this calculator. */
(function (root) {
  'use strict';
  const models = {edpower:{name:'EdPower',kwh:5.068,range:160,fee:750000},victory:{name:'Victory',kwh:2.534,range:110,fee:390000},athena:{name:'Athena',kwh:2.534,range:110,fee:390000},bees:{name:'Bees',kwh:1.6,range:80,fee:0}};
  function calculate(v) {
    const m=models[v.model];
    if (!m || !['owned','baas'].includes(v.plan) || (v.plan==='baas' && !m.fee)) throw new RangeError('Invalid model or battery plan');
    for (const [key,min,max] of [['distance',1,500],['days',1,31],['petrol',1,100000],['efficiency',1,200],['electricity',1,20000],['overhead',0,50],['range',1,400]]) {
      if (!Number.isFinite(v[key]) || v[key]<min || v[key]>max) throw new RangeError('Invalid '+key);
    }
    const km=v.distance*v.days, petrol=km/v.efficiency*v.petrol, energy=km/v.range*m.kwh*(1+v.overhead/100)*v.electricity, fee=v.plan==='baas'?m.fee:0;
    return {km,petrol,energy,fee,electric:energy+fee,saving:petrol-energy-fee,annual:(petrol-energy-fee)*12};
  }
  if (typeof module!=='undefined' && module.exports) module.exports={calculate,models};
  if (!root.document) return;
  document.querySelectorAll('[data-calculator]').forEach(panel=>{
    const en=panel.dataset.lang==='en', el=n=>panel.querySelector('[name="'+n+'"]'), currency=new Intl.NumberFormat(en?'en-ID':'id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
    const money=n=>currency.format(n), out=(n,s)=>panel.querySelector('[data-result="'+n+'"]').textContent=s;
    function update(event) {
      if(event?.target===el('ev-model')) el('range').value=models[el('ev-model').value].range;
      const m=models[el('ev-model').value], option=el('battery-plan').querySelector('[value="baas"]');
      option.disabled=!m.fee;
      if(!m.fee) el('battery-plan').value='owned';
      const error=panel.querySelector('.calc-error');
      try {
        const v={model:el('ev-model').value,plan:el('battery-plan').value};
        for(const n of ['distance','days','petrol','efficiency','electricity','overhead','range']) v[n]=el(n).value.trim()===''?NaN:Number(el(n).value);
        const r=calculate(v); error.hidden=true;
        out('saving',money(Math.abs(r.saving)));out('annual',money(Math.abs(r.annual))+(r.saving<0?(en?' higher':' lebih mahal'):(en?' lower':' lebih hemat')));
        out('verdict',r.saving>=0?(en?'Estimated lower monthly cost with Wedison.':'Estimasi biaya bulanan lebih hemat dengan Wedison.'):(en?'Wedison costs more with these settings.':'Biaya Wedison lebih tinggi dengan pengaturan ini.'));
        out('petrol',money(r.petrol));out('electric',money(r.electric));out('model',m.name);
        out('detail',r.km+' km / '+(en?'month':'bulan')+' · '+(en?'electricity ':'listrik ')+money(r.energy)+(r.fee?' + BAAS '+money(r.fee):''));
        const max=Math.max(r.petrol,r.electric,1);panel.querySelector('.petrol-bar i').style.width=(r.petrol/max*100)+'%';panel.querySelector('.electric-bar i').style.width=(r.electric/max*100)+'%';
      } catch (_) {error.textContent=en?'Enter valid values within the limits shown in each field.':'Isi angka yang valid sesuai batas pada setiap kolom.';error.hidden=false;for(const n of ['saving','annual','petrol','electric','detail','verdict'])out(n,'');}
    }
    panel.addEventListener('input',update);panel.addEventListener('change',update);update();
  });
})(typeof window==='undefined'?globalThis:window);
