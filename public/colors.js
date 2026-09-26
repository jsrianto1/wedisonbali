(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const t = (id, english) => en ? english : id;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const choices = new Map();
  const groups = [...document.querySelectorAll('[data-color-model]')];
  const bookingModel = document.getElementById('booking-model');
  const bookingColor = document.getElementById('booking-color');
  const query = new URLSearchParams(location.search);
  let models = [];
  const label = button => button.dataset[en ? 'labelEn' : 'labelId'];
  const paintRequests = new Map();
  const readyImages = new Map();
  function changeBody(model, button, animate) {
    const source = `/assets/paints/${model}-${button.dataset.color}.webp`;
    const request = Symbol(); paintRequests.set(model,request);
    const images = [...document.querySelectorAll(`[data-feature-model="${model}"] > img.feature-bike`)];
    if (document.body.dataset.model===model) images.push(...document.querySelectorAll('.product-stage > img'));
    if (!images.length) return;
    let loading = readyImages.get(source);
    if (!loading) {
      const preview = new Image(); preview.src=source;
      loading=preview.decode();readyImages.set(source,loading);
      loading.catch(()=>readyImages.delete(source));
    }
    images.forEach(img=>img.classList.add('paint-loading'));
    loading.then(()=>{
      if (paintRequests.get(model)!==request) return;
      images.forEach(img=>{
        img.src=source;img.alt=`Wedison ${model==='edpower'?'EdPower':model[0].toUpperCase()+model.slice(1)} ${label(button)}. `+t('Visualisasi warna bodi.','Body colour visualisation.');
        img.classList.remove('paint-loading');
        if(animate&&!reduced.matches&&!document.body.classList.contains('explorer-motion-paused')) {
          img.getAnimations().forEach(a=>a.cancel());
          img.animate([{opacity:.25,filter:'blur(2px)',transform:'translateY(7px) scale(.985)'},{opacity:1,filter:'blur(0)',transform:'translateY(0) scale(1)'}],{duration:520,easing:'cubic-bezier(.2,.75,.2,1)'});
        }
      });
    }).catch(()=>{
      if(paintRequests.get(model)!==request)return;
      images.forEach(img=>img.classList.remove('paint-loading'));
      groups.filter(g=>g.dataset.colorModel===model).forEach(g=>{g.querySelector('.paint-selection').textContent=label(button)+' · '+t('Pratinjau belum termuat. Coba lagi.','Preview could not load. Try again.');});
    });
  }

  function selectPaint(model, id, animate = true) {
    const source = groups.find(group => group.dataset.colorModel === model);
    const button = source && [...source.querySelectorAll('[data-color]')].find(item => item.dataset.color === id);
    if (!button) return;
    choices.set(model, id);
    groups.filter(group => group.dataset.colorModel === model).forEach(group => {
      group.querySelectorAll('[data-color]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.color === id)));
      group.querySelector('.paint-selection').textContent = label(button);
    });
    const card = document.querySelector(`[data-paint-model="${model}"]`);
    changeBody(model,button,animate);
    if (card) card.querySelectorAll(`a[href*="/motor/${model}/"]`).forEach(link => {
      const url = new URL(link.href); url.searchParams.set('color',id); link.href = url.pathname + url.search + url.hash;
    });
    if (document.body.dataset.model === model) {
      document.body.dataset.selectedColor = id;
      document.body.dataset.selectedColorLabel = label(button);
      const current = new URL(location.href);
      current.searchParams.set('color', id);
      history.replaceState(null, '', current.pathname + current.search + current.hash);
      document.querySelectorAll('a[data-language]').forEach(link => {
        const url = new URL(link.href); url.searchParams.set('color', id); link.href = url.href;
      });
      document.querySelectorAll('a[href*="model="]').forEach(link => {
        const url = new URL(link.href); url.searchParams.set('color',id); link.href = url.pathname + url.search + url.hash;
      });
      document.dispatchEvent(new CustomEvent('wedison:color'));
    }
    if (bookingModel && bookingColor && models.length) {
      const modelInfo = models.find(item => item.id === model);
      if (modelInfo && card && animate) {
        bookingModel.value = modelInfo.name;
        populateColors();
      }
      if (modelInfo && bookingModel.value === modelInfo.name) bookingColor.value = id;
    }
  }

  groups.forEach(group => group.querySelectorAll('[data-color]').forEach(button => {
    button.addEventListener('click', () => selectPaint(group.dataset.colorModel, button.dataset.color));
  }));
  const product = document.body.dataset.model;
  const defaults={edpower:'grey-glossy',athena:'green-glossy',victory:'black-matte',bees:'white-glossy'};
  new Set(groups.map(g=>g.dataset.colorModel)).forEach(model=>{
    const button=groups.find(g=>g.dataset.colorModel===model).querySelector(`[data-color="${defaults[model]}"]`);
    groups.filter(g=>g.dataset.colorModel===model).forEach(g=>{
      g.querySelector(`[data-color="${defaults[model]}"]`)?.setAttribute('aria-pressed','true');
      g.querySelector('.paint-selection').textContent=label(button);
    });
    changeBody(model,button,false);
  });
  if (product && query.has('color')) selectPaint(product, query.get('color'), false);
  if (!bookingColor || !bookingModel) return;

  function populateColors() {
    const model = models.find(item => item.name === bookingModel.value);
    bookingColor.replaceChildren(new Option(model ? t('Bantu saya memilih warna','Help me choose a colour') : t('Pilih model terlebih dahulu','Choose a model first'),''));
    bookingColor.disabled = !model;
    if (!model) return;
    model.colors.forEach(color => bookingColor.add(new Option(en ? color.en : color.name,color.id)));
    bookingColor.value = choices.get(model.id) || '';
  }
  fetch('/assets/models.json').then(response => {
    if (!response.ok) throw new Error('Catalogue unavailable');
    return response.json();
  }).then(data => {
    models = data;
    const requested = models.find(item => item.id === query.get('model'));
    if (requested && requested.colors.some(color => color.id === query.get('color'))) {
      choices.set(requested.id,query.get('color'));
      selectPaint(requested.id,query.get('color'),false);
    }
    populateColors();
    bookingModel.addEventListener('change',populateColors);
    bookingColor.addEventListener('change',() => {
      const model = models.find(item => item.name === bookingModel.value);
      if (!model) return;
      if (bookingColor.value) selectPaint(model.id,bookingColor.value);
      else choices.delete(model.id);
    });
  }).catch(() => {
    bookingColor.disabled = true;
    bookingColor.replaceChildren(new Option(t('Konsultasikan warna via WhatsApp','Ask about colours on WhatsApp'),''));
  });
})();
