(() => {
  const remember = language => {
    if (!['id','en'].includes(language)) return;
    document.cookie = 'wedison_language=' + language + '; Path=/; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  };
  remember(document.documentElement.lang === 'en' ? 'en' : 'id');
  // Keep the current model query and section when changing language.
  document.querySelectorAll('[data-language]').forEach(link => {
    const destination = new URL(link.href);
    destination.search = location.search;
    destination.hash = location.hash;
    link.href = destination.href;
    link.addEventListener('click', () => {
      remember(link.dataset.language);
      destination.search = location.search;
      destination.hash = location.hash;
      link.href = destination.href;
    });
  });
})();
