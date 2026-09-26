(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.ride-menu');
  if (menu) {
    document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
    menu.addEventListener('focusout', event => { if (!menu.contains(event.relatedTarget)) menu.open = false; });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  }
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches) entry.target.classList.add('ride-reveal');
      reveal.unobserve(entry.target);
    }), {threshold:.15});
    document.querySelectorAll('.ride-model-copy,.ride-lineup-heading,.ride-story>div,.ride-film-cta').forEach(item => reveal.observe(item));
  }
  const film = document.querySelector('.ride-film-dialog');
  const open = document.querySelector('.ride-film-open');
  if (film && open) {
    const video = film.querySelector('video');
    open.addEventListener('click', () => { film.showModal(); document.body.classList.add('photo-open'); });
    film.querySelector('.ride-film-close').addEventListener('click', () => film.close());
    film.addEventListener('click', event => { if (event.target === film) film.close(); });
    film.addEventListener('close', () => { video.pause(); document.body.classList.remove('photo-open'); open.focus(); });
  }
})();
