(() => {
  'use strict';
  const frame = document.getElementById('bali-google-map');
  if (!frame) return;
  const cards = [...document.querySelectorAll('.mapped-station')];
  const panel = document.querySelector('.station-map-panel');
  const empty = panel.querySelector('.station-map-empty');
  const en = document.documentElement.lang === 'en';
  let selected = cards.find(card => card.classList.contains('is-selected'));
  function select(card, manual = false) {
    if (!card) return;
    selected = card;
    cards.forEach(item => {
      item.classList.toggle('is-selected', item === card);
      item.querySelectorAll('[data-select-station]').forEach(button => button.setAttribute('aria-pressed', String(item === card)));
    });
    const name = card.querySelector('h3').textContent;
    const url = new URL('https://www.google.com/maps/embed');
    url.searchParams.set('origin', 'mfe');
    url.searchParams.set('pb', '!1m2!2m1!1s' + card.dataset.mapQuery);
    url.searchParams.set('hl', en ? 'en' : 'id');
    if (frame.src !== url.href) frame.src = url.href;
    frame.title = 'Google Maps: ' + name;
    document.getElementById('selected-station-name').textContent = name;
    document.getElementById('selected-station-address').textContent = card.querySelector('address').textContent;
    document.getElementById('selected-station-directions').href = card.querySelector('.station-map-link').href;
    frame.hidden = false; empty.hidden = true;
    panel.querySelector('.station-map-detail').hidden = false;
    if (manual && matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  cards.forEach(card => card.querySelectorAll('[data-select-station]').forEach(button => button.addEventListener('click', () => select(card, true))));
  document.addEventListener('station-filter-changed', () => {
    const visible = cards.filter(card => !card.hidden);
    if (!visible.length) {
      frame.hidden = true; empty.hidden = false;
      panel.querySelector('.station-map-detail').hidden = true;
      document.getElementById('selected-station-name').textContent=en?'No matching locations':'Lokasi tidak ditemukan';
    } else if (!selected || selected.hidden || frame.hidden) select(visible[0]);
  });
})();
