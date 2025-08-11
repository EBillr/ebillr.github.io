/* assets/js/common.js */
/* Use this across index.html, login.html, e-billr.html */
(function(){
  const sunSVG = `<svg class="theme-icon" data-icon="sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const moonSVG = `<svg class="theme-icon" data-icon="moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eb_theme', theme);
    // update all toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  }

  function init(){
    // initial theme (default dark)
    const saved = localStorage.getItem('eb_theme') || 'dark';
    setTheme(saved);

    // attach to buttons with class .theme-toggle
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    // header scroll effect
    const header = document.getElementById('site-header');
    if (header){
      const onScroll = () => {
        if (window.scrollY > 8) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      };
      onScroll();
      window.addEventListener('scroll', onScroll);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
