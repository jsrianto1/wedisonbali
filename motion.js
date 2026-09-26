(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const footer = document.querySelector('.site-footer');
  const header = document.querySelector('.site-header');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  // Content is visible by default, including when scripting or observers fail.
  const candidates = document.querySelectorAll('.island-hero-copy > :not(.island-hero-index), .hero-frame, .island-product-heading, .section-heading, .product-card, .feature-panel, .charging-copy, .charging-photo, .network-teaser, .bali-network-banner, .app-story, .showroom-info, .booking-copy, .booking-form, .network-directory > .section-heading');
  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches) {
        entry.target.classList.add(entry.target === footer ? 'fx-footer' : 'fx-enter');
      }
      observer.unobserve(entry.target);
    }), {threshold:0.08});
    candidates.forEach((element, index) => {
      element.style.setProperty('--arrival-delay', `${Math.min(index % 3, 2) * 70}ms`);
      observer.observe(element);
    });
    if (footer) observer.observe(footer);
  }

  const coast = document.querySelector('.island-image');
  let pending = false;
  function updateScroll() {
    pending = false;
    header?.classList.toggle('has-scrolled', scrollY > 16);
    if (reduced.matches) return;
    const length = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1, Math.max(0, scrollY / length)) : 0})`;
    if (coast) {
      const rect = coast.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        const shift = Math.max(-12, Math.min(12, (innerHeight / 2 - rect.top - rect.height / 2) * .025));
        coast.style.setProperty('--coast-shift', `${shift}px`);
      }
    }
  }
  function scheduleScroll() {
    if (!pending) { pending = true; requestAnimationFrame(updateScroll); }
  }
  addEventListener('scroll', scheduleScroll, {passive:true});
  addEventListener('resize', scheduleScroll, {passive:true});
  updateScroll();

  const stage = document.querySelector('.island-product-art');
  function resetStage() {
    if (!stage) return;
    ['--bike-x','--bike-y','--scene-x'].forEach(name => stage.style.removeProperty(name));
  }
  stage?.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches) return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    stage.style.setProperty('--bike-x', `${x * 12}px`);
    stage.style.setProperty('--bike-y', `${y * 7}px`);
    stage.style.setProperty('--scene-x', `${-x * 8}px`);
  }, {passive:true});
  stage?.addEventListener('pointerleave', resetStage);
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      document.querySelectorAll('.fx-enter,.fx-footer').forEach(element => element.classList.remove('fx-enter','fx-footer'));
      resetStage();
    }
    scheduleScroll();
  });
})();
