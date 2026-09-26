(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const en = document.documentElement.lang === 'en';
  const prefix = en ? '/en' : '';
  const animations = new Set();
  function play(element, frames, options = {}) {
    if (!element || reduced.matches || document.body.classList.contains('explorer-motion-paused') || !element.animate) return;
    const animation = element.animate(frames, {duration:650,easing:'cubic-bezier(.22,1,.36,1)',...options});
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    return animation;
  }
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const sentinel = document.createElement('span');
  sentinel.className = 'header-sentinel';
  sentinel.setAttribute('aria-hidden','true');
  document.body.prepend(sentinel);
  const footer = document.querySelector('.site-footer');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      document.querySelector('.site-header')?.classList.toggle('has-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
    // Content remains visible without JavaScript, observers or motion support.
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches && !document.body.classList.contains('explorer-motion-paused')) entry.target.classList.add(entry.target === footer ? 'fx-footer' : 'fx-enter');
      observer.unobserve(entry.target);
    }), {threshold:0.1});
    const selector = '.compact-heading, .compact-model, .compact-charging, .compact-visit-copy, .island-hero-copy > :not(.island-hero-index), .hero-frame, .island-product-heading, .section-heading, .product-card, .feature-panel, .charging-copy, .charging-photo, .network-teaser, .bali-network-banner, .app-story, .showroom-info, .booking-copy, .booking-form, .network-machine';
    document.querySelectorAll(selector).forEach((element,index) => {
      element.style.setProperty('--arrival-delay', `${index % 3 * 75}ms`);
      observer.observe(element);
    });
    if (footer) observer.observe(footer);
  }
  // Move only the visual; links and labels retain stable hit targets.
  const visuals = document.querySelectorAll('.product-visual, .island-product-art, .compact-model-image');
  let pointerFrame, activeVisual;
  function resetVisual(element) {
    ['--tilt-x','--tilt-y','--light-x','--light-y'].forEach(name => element?.style.removeProperty(name));
    element?.classList.remove('pointer-active');
  }
  visuals.forEach(element => {
    element.addEventListener('pointermove', event => {
      if (reduced.matches || document.body.classList.contains('explorer-motion-paused') || !finePointer.matches || event.pointerType === 'touch') return;
      const x = event.clientX, y = event.clientY;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const px = (x - rect.left) / rect.width, py = (y - rect.top) / rect.height;
        if (activeVisual !== element) resetVisual(activeVisual);
        activeVisual = element;
        element.style.setProperty('--tilt-x',`${(py - .5) * -6}deg`);
        element.style.setProperty('--tilt-y',`${(px - .5) * 9}deg`);
        element.style.setProperty('--light-x',`${px * 100}%`);
        element.style.setProperty('--light-y',`${py * 100}%`);
        element.classList.add('pointer-active');
      });
    },{passive:true});
    element.addEventListener('pointerleave', () => { cancelAnimationFrame(pointerFrame); resetVisual(element); });
  });
  document.querySelectorAll('.button,.nav-cta').forEach(button => {
    button.addEventListener('click', event => {
      if (reduced.matches) return;
      button.querySelectorAll('.tap-wave').forEach(wave => wave.remove());
      const rect = button.getBoundingClientRect();
      const wave = document.createElement('i');
      wave.className = 'tap-wave';
      wave.setAttribute('aria-hidden','true');
      const size = Math.max(rect.width,rect.height) * 2;
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${(event.detail ? event.clientX - rect.left : rect.width / 2) - size / 2}px`;
      wave.style.top = `${(event.detail ? event.clientY - rect.top : rect.height / 2) - size / 2}px`;
      button.append(wave);
      const animation = play(wave,[{transform:'scale(0)',opacity:.32},{transform:'scale(1)',opacity:0}],{duration:550});
      if (animation) animation.finished.catch(() => {}).finally(() => wave.remove());
      else wave.remove();
    });
  });
  // State feedback: animate real changes, never fake changing price counters.
  const price = document.querySelector('#variant-price');
  if (price) new MutationObserver(() => play(price,[{opacity:.35,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:380})).observe(price,{childList:true});
  const comparison = document.querySelector('#comparison');
  if (comparison) new MutationObserver(() => play(comparison,[{opacity:.5,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450})).observe(comparison,{childList:true});
  const gallery = document.querySelector('#gallery-main');
  let galleryAnimation;
  gallery?.addEventListener('load', () => {
    galleryAnimation?.cancel();
    galleryAnimation = play(gallery,[{opacity:.25,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:600});
  });
  new MutationObserver(() => {
    if (!document.body.classList.contains('explorer-motion-paused')) return;
    cancelAnimationFrame(pointerFrame);
    animations.forEach(animation => animation.cancel());
    resetVisual(activeVisual);
    document.querySelectorAll('.fx-enter,.fx-footer').forEach(el => el.classList.remove('fx-enter','fx-footer'));
  }).observe(document.body,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    cancelAnimationFrame(pointerFrame);
    animations.forEach(animation => animation.cancel());
    document.querySelectorAll('.fx-enter,.fx-footer').forEach(element => element.classList.remove('fx-enter','fx-footer'));
    visuals.forEach(resetVisual);
  });
  addEventListener('pagehide', () => { cancelAnimationFrame(pointerFrame); animations.forEach(animation => animation.cancel()); });
})();
