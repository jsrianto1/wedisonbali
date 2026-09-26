(() => {
  // Keep the current model query and section when changing language.
  document.querySelectorAll('[data-language]').forEach(link => {
    const destination = new URL(link.href);
    destination.search = location.search;
    destination.hash = location.hash;
    link.href = destination.href;
    link.addEventListener('click', () => {
      destination.search = location.search;
      destination.hash = location.hash;
      link.href = destination.href;
    });
  });
})();
