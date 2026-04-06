// Theme toggle
(function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function setGiscusTheme(theme) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: theme } } },
        'https://giscus.app'
      );
    }
  }

  // Sync Giscus theme once its iframe loads
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://giscus.app') return;
    if (e.data && e.data.giscus) {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      setGiscusTheme(current);
    }
  });

  btn.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setGiscusTheme(next);
  });

  // Keep in sync if another tab changes preference
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme' && e.newValue) {
      document.documentElement.setAttribute('data-theme', e.newValue);
      setGiscusTheme(e.newValue);
    }
  });
})();

// Scroll progress bar (only on post pages)
(function () {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
