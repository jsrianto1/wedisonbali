(() => {
  'use strict';
  if (!document.body.hasAttribute('data-product-story')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!reduced.matches) {
      entry.target.animate([{opacity:.3,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}], {duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
      entry.target.classList.add('ps-seen');
    }
    observer.unobserve(entry.target);
  }), {threshold:.15});
  document.querySelectorAll('[data-ps-reveal], .ps-range-bars, .ps-charge-bar').forEach(el => observer.observe(el));
})();
