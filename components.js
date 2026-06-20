(() => {
  // ---- Cached selectors ----
  const navbarContainer = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');
  const scrollTopBtn    = document.querySelector('.scroll-top') || document.getElementById('scrollTopBtn');

  // ---- Helpers ----
  const getCurrent = () => ({
    page: window.location.pathname.split('/').pop() || 'index.html',
    hash: window.location.hash
  });

  function updateActiveLinks(page, hash) {
    const allLinks = document.querySelectorAll('.navbar-nav a, .sidebar-menu a');
    allLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const [linkPage, linkHashRaw] = href.split('#');
      const linkHash = linkHashRaw ? `#${linkHashRaw}` : '';
      const matchesPage = (linkPage === '' || linkPage === page);
      const matchesHash = (linkHash === '' || linkHash === hash);
      link.classList.toggle('active', matchesPage && matchesHash);
    });
  }

  function initScrollSpy() {
    const { page } = getCurrent();
    if (page !== '' && page !== 'index.html') return;

    // Build map: section ID → navbar link(s)
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
            const isActive = id === activeId;
            link.classList.toggle('active', isActive);
          });
        }
      });
    }, {
      // Lower threshold so highlight triggers as soon as section enters viewport top
      threshold: 0.05,
      rootMargin: '-70px 0px -55% 0px'
    });

    sectionLinks.forEach(({ element }) => observer.observe(element));
  }

  function throttle(fn, wait = 100) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn(...args); }
    };
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

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
          // Ease out cubic
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
      if (window.pageYOffset > 60) {
        navbar.classList.add('sticky');
      } else {
        navbar.classList.remove('sticky');
      }
    }, 80);

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Scroll Top Button ----
  function initScrollTop() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', throttle(() => {
      btn.style.display = window.pageYOffset > 200 ? 'flex' : 'none';
    }, 100), { passive: true });

    btn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Component loading ----
  async function loadComponents() {
    try {
      const [navRes, footRes] = await Promise.all([
        fetch('navbar.html'),
        fetch('footer.html')
      ]);
      if (navbarContainer) navbarContainer.innerHTML = await navRes.text();
      if (footerContainer) footerContainer.innerHTML = await footRes.text();

      initNavbarScripts();
      initStickyNavbar();
      initScrollTop();
      const { page, hash } = getCurrent();
      updateActiveLinks(page, hash);
      initScrollSpy();

      // Init reveal & counters after DOM settles
      setTimeout(() => {
        initScrollReveal();
        initCounters();
      }, 100);

    } catch (err) {
      console.error('Component load failed:', err);
    }
  }

  // ---- Navbar & sidebar behavior ----
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

    // Close sidebar on link click (smooth navigate)
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) { closeSidebar(); return; }
        e.preventDefault();
        closeSidebar();
        setTimeout(() => window.location.href = href, 350);
      });
    });

    // Smooth scroll for in-page hash links (navbar)
    // Strategy: if the hash target EXISTS on the current page → smooth scroll.
    // Otherwise let the browser navigate normally to the target page+hash.
    document.querySelectorAll('.navbar-nav a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href') || '';
        const hashIdx = href.indexOf('#');
        if (hashIdx === -1) return; // no hash → navigate normally

        const targetId = href.slice(hashIdx + 1);
        const target = targetId ? document.getElementById(targetId) : null;

        if (target) {
          // Section exists on this page — smooth scroll instead of navigating
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close Bootstrap mobile collapse
          const collapse = document.getElementById('navbarNine');
          if (collapse?.classList.contains('show')) {
            const bsCollapse = bootstrap?.Collapse?.getInstance(collapse);
            if (bsCollapse) bsCollapse.hide();
            else collapse.classList.remove('show');
          }
          const togglerEl = document.querySelector('.navbar-nine .navbar-toggler');
          togglerEl?.classList.remove('active');
        }
        // If target not found on this page → let normal navigation happen
      });
    });
  }

  // ---- Kickoff ----
  document.addEventListener('DOMContentLoaded', loadComponents);

  // Expose if needed
  window.loadComponents     = loadComponents;
  window.initNavbarScripts  = initNavbarScripts;
  window.initScrollReveal   = initScrollReveal;
  window.initCounters       = initCounters;
})();
