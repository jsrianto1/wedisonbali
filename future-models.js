(() => {
  'use strict';
  const dialog = document.querySelector('#future-model-dialog');
  if (!dialog) return;
  let trigger;
  document.querySelectorAll('[data-future-photo]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      const image = dialog.querySelector('img');
      image.src = button.dataset.futurePhoto;
      image.alt = button.querySelector('img').alt;
      dialog.querySelector('h3').textContent = 'Wedison ' + button.dataset.futureName;
      dialog.showModal();
      document.body.classList.add('future-photo-open');
    });
  });
  dialog.querySelector('[data-future-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('future-photo-open');
    trigger?.focus({preventScroll: true});
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-arriving');
        observer.unobserve(entry.target);
      }
    }), {threshold: .15});
    document.querySelectorAll('.future-model-card').forEach(card => observer.observe(card));
  }
})();
