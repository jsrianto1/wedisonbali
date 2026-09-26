(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const main = document.querySelector('#gallery-main');
  const caption = document.querySelector('#gallery-caption');
  const dialog = document.querySelector('#photo-dialog');
  document.querySelectorAll('.gallery-thumb').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.gallery-thumb').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      main.src = button.dataset.photo;
      main.alt = button.dataset.caption + ' Wedison ' + document.body.dataset.model;
      caption.textContent = button.dataset.caption;
    });
  });
  document.querySelector('.gallery-zoom')?.addEventListener('click', () => {
    dialog.querySelector('img').src = main.src;
    dialog.querySelector('img').alt = main.alt;
    dialog.showModal();
    document.body.classList.add('photo-open');
  });
  dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('close', () => document.body.classList.remove('photo-open'));
  const areaSelect = document.querySelector('#route-area');
  const routeLink = document.querySelector('#route-inquiry');
  function updateRouteLink() {
    const area = areaSelect.value;
    const message = en ? `Hello Wedison Bali, I plan to travel in ${area}. Please help confirm the nearest SuperCharge locations, addresses, opening hours and availability.` : `Halo Wedison Bali, saya berencana bepergian di area ${area}. Mohon bantu cek titik SuperCharge terdekat, alamat, jam operasional, dan ketersediaannya.`;
    routeLink.href = 'https://wa.me/628195693282?text=' + encodeURIComponent(message);
  }
  if (areaSelect && routeLink) {
    areaSelect.addEventListener('change', updateRouteLink);
    updateRouteLink();
  }
  const links = [...document.querySelectorAll('.product-subnav div a')];
  if (links.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -60% 0px' });
    links.forEach(link => { const target = document.querySelector(link.hash); if (target) observer.observe(target); });
  }
})();
