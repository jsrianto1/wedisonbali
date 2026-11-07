(() => {
  'use strict';
  const elements = document.querySelectorAll('[data-be-motion], .be-network');
  if (!elements.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.22 });
  elements.forEach(element => observer.observe(element));
})();
