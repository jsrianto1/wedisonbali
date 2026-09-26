(() => {
  'use strict';
  const comparison = document.getElementById('bandingkan');
  function openComparison() {
    if (location.hash === '#bandingkan' && comparison) comparison.open = true;
  }
  openComparison();
  addEventListener('hashchange', openComparison);
  document.querySelectorAll('a[href$="#bandingkan"]').forEach(link => link.addEventListener('click', () => { if (comparison) comparison.open = true; }));
})();
