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
      <li><a href="${base}work-experience">work experience</a></li>
      <li><a href="${base}education">education</a></li>
      <li><a href="${base}leadership">leadership</a></li>
      <li><a href="${base}projects">projects</a></li>
      <li><a href="${base}beyond-academics">beyond academics</a></li>
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

    const existingNotice = document.querySelector('.site-notice');
    if (!existingNotice) {
      const notice = document.createElement('div');
      notice.className = 'site-notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      notice.textContent = 'This website is currently being updated to reflect the most recent academic year.';

      const nav = document.querySelector('nav');
      if (nav && nav.parentNode) {
        nav.parentNode.insertBefore(notice, nav.nextSibling);
      } else {
        document.body.insertBefore(notice, document.body.firstChild);
      }
    }

    document.body.classList.add('has-site-notice');

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
