(() => {
  'use strict';
  const search = document.querySelector('#station-search');
  const area = document.querySelector('#station-area');
  const cards = [...document.querySelectorAll('.station-card')];
  const filters = [...document.querySelectorAll('[data-station-filter]')];
  let group = '';
  if (search && area) {
    function draw() {
      const query = search.value.trim().toLocaleLowerCase('id-ID');
      let count = 0;
      cards.forEach(card => {
        const match = (!area.value || card.dataset.area === area.value) && (!group || card.dataset.group === group) && card.textContent.toLocaleLowerCase('id-ID').includes(query);
        card.hidden = !match;
        if (match) count++;
      });
      document.querySelector('#station-count').textContent = document.documentElement.lang === 'en' ? `${count} ${count === 1 ? "location" : "locations"} shown` : `${count} lokasi ditampilkan`;
      document.querySelector('.station-empty').hidden = count > 0;
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stationFilter === group)));
    }
    search.addEventListener('input', draw);
    area.addEventListener('change', draw);
    filters.forEach(button => button.addEventListener('click', () => { group = button.dataset.stationFilter; draw(); }));
    document.querySelector('#station-reset').addEventListener('click', () => {
      search.value = ''; area.value = ''; group = ''; draw(); search.focus();
    });
  }
  const film = document.querySelector('#supercharge-film');
  const play = document.querySelector('.film-start');
  if (film && play) {
    play.addEventListener('click', () => {
      film.play().catch(() => { document.querySelector('.film-error').hidden = false; });
    });
    film.addEventListener('play', () => { play.hidden = true; });
    film.addEventListener('ended', () => { play.hidden = false; });
    film.addEventListener('error', () => { document.querySelector('.film-error').hidden = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && !film.paused) film.pause();
    }, {threshold:0.05}).observe(film);
  }
})();
