// Inject shared site navbar and wire mobile behavior
(function () {
  function createNav() {
    const path = window.location.pathname;
    // Determine base for relative links (pages inside project folders need ../)
    const parts = path.split('/');
    const isProjectSubdir = parts.includes('projects') || parts.includes('project-pages');
    const base = isProjectSubdir ? '../' : '';

    const navHtml = `
<nav>
  <div class="nav-inner">
    <a class="brand" href="https://maako.dev">maako fangajei</a>
    <button class="nav-toggle" aria-label="Toggle menu"><span class="bar"></span></button>
    <ul class="nav-links">
      <li><a href="#about">about me</a></li>
      <li><a href="#work-experience">experience</a></li>
      <li><a href="#education">education</a></li>
      <li><a href="#leadership">leadership</a></li>
      <li><a href="#projects">projects</a></li>
    </ul>
  </div>
</nav>
`;

    const container = document.getElementById('site-nav');
    if (container) {
      container.innerHTML = navHtml;
    } else {
      const temp = document.createElement('div');
      temp.innerHTML = navHtml;
      document.body.insertBefore(temp.firstElementChild, document.body.firstChild);
    }

    // Wire hamburger toggle
    const toggle = document.querySelector('.nav-toggle');
    toggle && toggle.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    // Close menu on nav link click
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));
  }

  // If a placeholder exists in the DOM at load time, create the nav immediately.
  // Otherwise, wait for DOMContentLoaded before injecting.
  if (document.getElementById('site-nav')) {
    createNav();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNav);
  } else {
    createNav();
  }
})();
