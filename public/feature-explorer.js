(() => {
  'use strict';
  const dialog = document.getElementById('feature-dialog');
  if (!dialog) return;
  const en = document.documentElement.lang === 'en';
  const t = (id, english) => en ? english : id;
  const body = dialog.querySelector('.feature-dialog-body');
  const tabs = dialog.querySelector('.feature-tabs');
  const close = dialog.querySelector('.feature-close');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let activeModel, activeIndex = 0, opener, previousOverflow;
  const featureCount = model => document.querySelectorAll(`template[id^="feature-${model}-"]`).length;
  const moveDetail = direction => showDetail(activeModel, (activeIndex + direction + featureCount(activeModel)) % featureCount(activeModel));

  function showDetail(model, index) {
    const template = document.getElementById(`feature-${model}-${index}`);
    if (!template) return;
    activeModel = model; activeIndex = index;
    body.replaceChildren(template.content.cloneNode(true));
    body.querySelector('h2').id = 'feature-dialog-title';
    body.querySelector('.feature-detail-copy p').id = 'feature-dialog-description';
    // Keep the visitor's chosen paint when moving from the explorer to a model or booking.
    const paint = document.querySelector(`[data-color-model="${model}"] [aria-pressed="true"]`);
    if (paint) body.querySelectorAll('a').forEach(link => {
      const url = new URL(link.href); url.searchParams.set('color', paint.dataset.color);
      link.href = url.pathname + url.search + url.hash;
    });
    const total = featureCount(model);
    dialog.querySelector('.feature-count').textContent = `${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    tabs.replaceChildren();
    for (let i=0; i<total; i++) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = String(i+1).padStart(2,'0');
      const heading = document.getElementById(`feature-${model}-${i}`).content.querySelector('h2').textContent;
      button.setAttribute('aria-label', heading);
      button.setAttribute('aria-pressed', String(i===index));
      button.addEventListener('click', () => { showDetail(model, i); tabs.children[i].focus({preventScroll:true}); });
      tabs.append(button);
    }
    dialog.scrollTop = 0;
  }
  document.querySelectorAll('[data-feature]').forEach(button => {
    button.addEventListener('click', () => {
      const [model, index] = button.dataset.feature.split('-');
      showDetail(model, Number(index));
      opener = button;
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      close.focus({preventScroll:true});
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow || '';
    opener?.focus({preventScroll:true});
  });
  // Same-page booking anchors must dismiss the modal so the form is usable.
  body.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && new URL(link.href).pathname === location.pathname) dialog.close();
  });
  dialog.querySelector('.feature-prev').addEventListener('click', () => moveDetail(-1));
  dialog.querySelector('.feature-next').addEventListener('click', () => moveDetail(1));
  dialog.addEventListener('keydown', event => {
    if (event.key==='ArrowRight' || event.key==='ArrowLeft') {
      event.preventDefault(); moveDetail(event.key==='ArrowRight'?1:-1);
      // Keep keyboard focus on a persistent control after replacing the photo and tabs.
      dialog.querySelector(event.key==='ArrowRight'?'.feature-next':'.feature-prev').focus();
    }
  });

  const motionButton = document.querySelector('.motion-control');
  let paused = reduced.matches;
  function updateMotion() {
    document.body.classList.toggle('explorer-motion-paused', paused || reduced.matches);
    if (motionButton) {
      motionButton.hidden = false;
      motionButton.setAttribute('aria-pressed', String(paused || reduced.matches));
      motionButton.textContent = paused || reduced.matches ? t('Animasi dijeda','Motion paused') : t('Jeda animasi','Pause motion');
      motionButton.disabled = reduced.matches;
    }
  }
  motionButton?.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; updateMotion(); });
  updateMotion();
  // Only pulse hotspots that are in view. No continuous scroll handler or animation loop.
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('feature-in-view', entry.isIntersecting);
  }), {threshold:.15});
  document.querySelectorAll('.feature-stage').forEach(stage => observer.observe(stage));
  document.documentElement.classList.add('feature-ready');
})();
