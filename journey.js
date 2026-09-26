/* Scroll-linked motion, one animation frame per scroll. No input interception. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tall = window.matchMedia('(min-height: 650px)');
  document.querySelectorAll('[data-journey]').forEach(section => {
    const path = section.querySelector('[data-journey-path]');
    const marker = section.querySelector('[data-journey-marker]');
    const counter = section.querySelector('[data-journey-km]');
    const stage = section.querySelector('.journey-stage');
    const chapters = [...section.querySelectorAll('[data-journey-chapter]')];
    if (!path || !marker || !counter || !stage) return;
    const length = path.getTotalLength();
    let pending = 0;
    let active = true;
    let previous = -1;
    function render(progress) {
      const rounded = Math.round(progress * 10000) / 10000;
      if (rounded === previous) return;
      previous = rounded;
      section.style.setProperty('--journey-progress', String(rounded));
      path.style.strokeDashoffset = String(1 - rounded);
      const point = path.getPointAtLength(length * rounded);
      marker.setAttribute('transform', `translate(${point.x} ${point.y})`);
      counter.textContent = String(Math.round(200 * rounded));
      const chapter = Math.min(2, Math.floor(rounded * 3));
      chapters.forEach((item, index) => item.classList.toggle('is-current', index === chapter));
    }
    function update() {
      pending = 0;
      if (reduced.matches || !tall.matches) { render(1); return; }
      const rect = section.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      const travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
      render(Math.max(0, Math.min(1, (stickyTop - rect.top) / travel)));
    }
    function request() { if (active && !pending) pending = requestAnimationFrame(update); }
    function configure() {
      section.classList.toggle('is-enhanced', !reduced.matches && tall.matches);
      previous = -1;
      update();
    }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', configure, { passive: true });
    window.addEventListener('pageshow', configure);
    reduced.addEventListener('change', configure);
    tall.addEventListener('change', configure);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        active = entries[0].isIntersecting;
        if (active) request();
      }, { rootMargin: '200px' }).observe(section);
    }
    configure();
  });
})();
