(() => {
  'use strict';
  const frame = document.getElementById('bali-google-map');
  if (!frame) return;
  const cards = [...document.querySelectorAll('.mapped-station')];
  const panel = document.querySelector('.station-map-panel');
  const overviewButton = document.getElementById('station-map-overview');
  const mode = document.getElementById('station-map-mode');
  const en = document.documentElement.lang === 'en';
  let selected = cards.find(card => card.classList.contains('is-selected'));
  function overview() {
    selected = null;
    cards.forEach(card => {
      card.classList.remove('is-selected');
      card.querySelectorAll('[data-select-station]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    });
    if (frame.src !== frame.dataset.overview) frame.src = frame.dataset.overview;
    frame.title = en ? 'Google Maps: 15 Wedison SuperCharge Bali locations' : 'Google Maps: 15 lokasi Wedison SuperCharge Bali';
    overviewButton.setAttribute('aria-pressed', 'true');
    document.getElementById('selected-station-name').textContent = en ? '15 locations. One network.' : '15 titik. Satu jaringan.';
    document.getElementById('selected-station-address').textContent = en ? 'Denpasar, Badung and Gianyar. Zoom in to select nearby pins.' : 'Denpasar, Badung dan Gianyar. Perbesar peta untuk memilih pin yang berdekatan.';
    document.getElementById('selected-station-directions').href = frame.dataset.publicMap;
    mode.textContent = en ? 'Click a pin for location details' : 'Klik pin untuk detail lokasi';
  }
  overviewButton.addEventListener('click', overview);
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
    overviewButton.setAttribute('aria-pressed', 'false');
    mode.textContent = en ? 'Selected location' : 'Lokasi dipilih';
    if (manual && matchMedia('(max-width: 900px)').matches) panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  cards.forEach(card => card.querySelectorAll('[data-select-station]').forEach(button => button.addEventListener('click', () => select(card, true))));
  document.addEventListener('station-filter-changed', () => {
    if (selected && selected.hidden) overview();
  });
})();
