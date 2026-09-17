/**
 * 313 Tech Solutions — Core UI & Theme Engine
 * High-performance, accessible, zero-FOUC theme switcher, crawlable navigation & interactions.
 */
(() => {
  'use strict';

  // ---- Selectors ----
  const navbarContainer = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');

  // ---- Helpers ----
  const getCurrent = () => ({
    page: window.location.pathname.split('/').pop() || 'index.html',
    hash: window.location.hash
  });

  function throttle(fn, wait = 100) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn(...args); }
    };
  }

  // ---- THEME ENGINE (Dark / Light Mode) ----
  function getPreferredTheme() {
    const saved = localStorage.getItem('313_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme, save = true) {
    const targetTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', targetTheme);
    document.documentElement.style.colorScheme = targetTheme;

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', targetTheme === 'dark' ? '#060E1A' : '#0A1931');
    }

    // Update button accessibility labels & state
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      const isDark = targetTheme === 'dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });

    if (save) {
      try {
        localStorage.setItem('313_theme', targetTheme);
      } catch (e) {
        /* storage restricted/safari private */
      }
    }

    // Dispatch event in case subcomponents need to react
    window.dispatchEvent(new CustomEvent('313:themeChange', { detail: { theme: targetTheme } }));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  }

  function initThemeEngine() {
    // Initial sync
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme, false);

    // Bind all theme toggles
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Listen to OS-level preference change if user hasn't explicitly saved
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const hasSaved = localStorage.getItem('313_theme');
        if (!hasSaved) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  // Run theme init immediately to avoid FOUC
  initThemeEngine();

  // ---- Active Link Management ----
  function updateActiveLinks(page, hash) {
    const allLinks = document.querySelectorAll('.navbar-nav a, .sidebar-menu a');
    allLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const [linkPage, linkHashRaw] = href.split('#');
      const linkHash = linkHashRaw ? `#${linkHashRaw}` : '';
      const cleanLinkPage = linkPage.split('/').pop();
      const cleanCurrentPage = page.split('/').pop();

      const matchesPage = (cleanLinkPage === '' || cleanLinkPage === cleanCurrentPage);
      const matchesHash = (!hash && !linkHash) || (linkHash === hash);
      link.classList.toggle('active', matchesPage && matchesHash);
    });
  }

  // ---- In-Page Scroll Spy ----
  function initScrollSpy() {
    const { page } = getCurrent();
    if (page !== '' && page !== 'index.html') return;

    const sectionLinks = Array.from(
      document.querySelectorAll('.navbar-nav a[href*="#"]')
    ).map(link => {
      const hash = link.getAttribute('href') || '';
      const id = hash.includes('#') ? hash.split('#')[1] : '';
      return { id, element: id ? document.getElementById(id) : null, link };
    }).filter(item => item.element);

    if (!sectionLinks.length) return;

    let activeId = null;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          activeId = target.id;
          sectionLinks.forEach(({ link, id }) => {
            link.classList.toggle('active', id === activeId);
          });
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '-80px 0px -50% 0px'
    });

    sectionLinks.forEach(({ element }) => observer.observe(element));
  }

  // ---- Scroll Reveal ----
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  // ---- Counter Animation ----
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target], .counter[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const duration = 1800;
        const startTime = performance.now();

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target) + '+';
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target + '+';
        };

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  // ---- Sticky Navbar Glass Effect ----
  function initStickyNavbar() {
    const navbar = document.querySelector('.navbar-area.navbar-nine');
    if (!navbar) return;

    const onScroll = throttle(() => {
      if (window.pageYOffset > 50) {
        navbar.classList.add('sticky');
      } else {
        navbar.classList.remove('sticky');
      }
    }, 60);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Scroll Top Button ----
  function initScrollTop() {
    const btn = document.querySelector('.scroll-top') || document.getElementById('scrollTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', throttle(() => {
      btn.style.display = window.pageYOffset > 240 ? 'flex' : 'none';
    }, 100), { passive: true });

    btn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Mobile Navbar & Sidebar Behavior ----
  function initNavbarScripts() {
    const toggler     = document.querySelector('.navbar-nine .navbar-toggler');
    const sideMenuBtn = document.querySelector('.navbar-nine .menu-bar');
    const sidebarLeft = document.querySelector('.sidebar-left');
    const overlayLeft = document.querySelector('.overlay-left');
    const closeBtn    = document.querySelector('.sidebar-close .close');

    toggler?.addEventListener('click', () => toggler.classList.toggle('active'));

    function closeSidebar() {
      sidebarLeft?.classList.remove('open');
      overlayLeft?.classList.remove('open');
    }

    sideMenuBtn?.addEventListener('click', () => {
      sidebarLeft?.classList.add('open');
      overlayLeft?.classList.add('open');
    });

    [overlayLeft, closeBtn].forEach(el => el?.addEventListener('click', closeSidebar));

    // Mobile dropdown support
    document.querySelectorAll('.navbar-nine .nav-item.dropdown .dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth < 992) {
          e.preventDefault();
          const menu = toggle.nextElementSibling;
          if (menu) {
            menu.classList.toggle('show');
          }
        }
      });
    });

    // Close sidebar on link click
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) { closeSidebar(); return; }
        e.preventDefault();
        closeSidebar();
        setTimeout(() => window.location.href = href, 250);
      });
    });

    // Smooth scroll for in-page hash links
    document.querySelectorAll('.navbar-nav a, .btn-scroll').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href') || '';
        const hashIdx = href.indexOf('#');
        if (hashIdx === -1) return;

        const targetId = href.slice(hashIdx + 1);
        const target = targetId ? document.getElementById(targetId) : null;

        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const collapse = document.getElementById('navbarNine');
          if (collapse?.classList.contains('show')) {
            const bsCollapse = window.bootstrap?.Collapse?.getInstance(collapse);
            if (bsCollapse) bsCollapse.hide();
            else collapse.classList.remove('show');
          }
          toggler?.classList.remove('active');
        }
      });
    });

    // Sync theme buttons aria labels on newly mounted DOM
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(currentTheme, false);
  }

  // ---- Component Loading (Fallback if not pre-rendered) ----
  async function loadComponents() {
    try {
      const tasks = [];
      const needsNav = navbarContainer && navbarContainer.children.length === 0;
      const needsFoot = footerContainer && footerContainer.children.length === 0;

      if (needsNav) {
        tasks.push(fetch('navbar.html').then(r => r.text()).then(html => {
          if (navbarContainer) navbarContainer.innerHTML = html;
        }));
      }

      if (needsFoot) {
        tasks.push(fetch('footer.html').then(r => r.text()).then(html => {
          if (footerContainer) footerContainer.innerHTML = html;
        }));
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      initNavbarScripts();
      initStickyNavbar();
      initScrollTop();

      const { page, hash } = getCurrent();
      updateActiveLinks(page, hash);
      initScrollSpy();

      setTimeout(() => {
        initScrollReveal();
        initCounters();
      }, 100);

    } catch (err) {
      console.warn('Component loading note:', err);
      initNavbarScripts();
      initStickyNavbar();
      initScrollTop();
      initScrollReveal();
      initCounters();
    }
  }

  // Kickoff on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
  } else {
    loadComponents();
  }

  // Global exports
  window.loadComponents     = loadComponents;
  window.initNavbarScripts  = initNavbarScripts;
  window.initScrollReveal   = initScrollReveal;
  window.initCounters       = initCounters;
  window.toggleTheme        = toggleTheme;
  window.applyTheme         = applyTheme;
})();
