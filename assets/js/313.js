/**
 * 313 Interaction Engine — Reverse-Engineered Micro-Interactions & Component Animations
 * 313 Tech Solutions Redesign
 */

(function () {
  'use strict';

  // 1. Magnetic Buttons with spring physics
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const dx = Math.max(-10, Math.min(10, (e.clientX - (rect.left + rect.width / 2)) * 0.28));
        const dy = Math.max(-10, Math.min(10, (e.clientY - (rect.top + rect.height / 2)) * 0.38));
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });

    // Button radial hover origin tracking
    document.querySelectorAll('.btn').forEach((el) => {
      const setFill = (e) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--fx', (e.clientX - rect.left) + 'px');
        el.style.setProperty('--fy', (e.clientY - rect.top) + 'px');
        el.style.setProperty('--fs', (2.4 * Math.hypot(rect.width, rect.height)) + 'px');
      };
      el.addEventListener('pointerenter', setFill);
      el.addEventListener('pointerleave', setFill);
    });
  }

  // 2. Real-time Status Clock (EST / UTC / Local)
  function initClock() {
    const clockEls = document.querySelectorAll('[data-clock]');
    if (!clockEls.length) return;
    function update() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      clockEls.forEach((el) => { el.textContent = timeStr; });
    }
    update();
    setInterval(update, 10000);
  }
  initClock();

  // 3. Navbar scroll detection
  const nav = document.querySelector('.nav');
  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      if (y > 24) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 4. Menu Drawer Toggle
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const isOpen = document.documentElement.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close when clicking internal links inside menu
    document.querySelectorAll('.menu a').forEach((link) => {
      link.addEventListener('click', () => {
        document.documentElement.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 5. Text Scramble Effect
  const chars = '!<>-_\\/[]{}=+*^?#01';
  document.querySelectorAll('[data-scramble]').forEach((el) => {
    const original = el.textContent.trim();
    let frame = 0;
    const totalFrames = 16;
    const step = () => {
      frame++;
      const resolvedLen = Math.floor((original.length * frame) / totalFrames);
      el.textContent =
        original.slice(0, resolvedLen) +
        original.slice(resolvedLen).replace(/[^\s·]/g, () => chars[Math.floor(Math.random() * chars.length)]);
      if (frame < totalFrames) setTimeout(step, 30);
      else el.textContent = original;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          step();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
  });

  // 6. Fast snappy smooth scrolling for anchor links (max 320ms)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();

      const startY = window.pageYOffset;
      const targetY = targetEl.getBoundingClientRect().top + startY - 80;
      const distance = targetY - startY;
      const duration = Math.min(320, Math.max(160, Math.abs(distance) * 0.25));
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startY + distance * ease);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  });

  // 7. Mechanical Odometer Rolling Cylinder Animation (Exact 313 parity)
  function initOdometers() {
    const elements = document.querySelectorAll('.metric-counter, [data-count]');
    elements.forEach((el, elIndex) => {
      const raw = el.getAttribute('data-count') || el.innerText.trim();
      if (!raw || !/^\d+$/.test(raw)) return;

      const digits = raw.split('');
      el.setAttribute('aria-hidden', 'true');
      if (!el.nextElementSibling || !el.nextElementSibling.classList.contains('sr-only')) {
        el.insertAdjacentHTML('afterend', `<span class="sr-only">${raw}</span>`);
      }
      el.classList.add('od');
      const delay = elIndex * 90;
      el.style.setProperty('--dl', delay + 'ms');

      el.innerHTML = digits.map((dStr, j) => {
        const d = parseInt(dStr, 10);
        const list = [];
        // Cycles of digits 0-9 for realistic physical tumbler roll
        for (let cycle = 0; cycle < j + 2; cycle++) {
          for (let num = 0; num < 10; num++) list.push(num);
        }
        for (let num = 0; num <= d; num++) list.push(num);

        const k = list.length - 1;
        const spans = list.map((n) => `<i>${n}</i>`).join('');
        return `<span class="od__d" style="--k:${k};--j:${j}"><span class="od__g">${dStr}</span><span class="od__s">${spans}</span></span>`;
      }).join('');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-on');
          }
        });
      }, { threshold: 0.35 });
      observer.observe(el);
    });
  }
  initOdometers();

  // 8. Natural Scroll-Linked Text Scrub & Highlight (Slowed Down & Silky Smooth)
  function initNaturalTextScrub() {
    const scrubEls = document.querySelectorAll('[data-scrub]');
    scrubEls.forEach((textEl) => {
      const wordSpans = textEl.querySelectorAll('.sw');
      if (!wordSpans.length) return;
      const totalWords = wordSpans.length;

      let targetProgress = 0.0;
      let currentProgress = 0.0;
      let isRunning = false;

      function update() {
        // Silky smooth momentum lerp
        currentProgress += (targetProgress - currentProgress) * 0.065;

        wordSpans.forEach((w, i) => {
          const wordThreshold = i / totalWords;
          const wordWindow = 1.8 / totalWords;
          const wordProg = Math.max(0, Math.min(1, (currentProgress - wordThreshold) / wordWindow));

          if (wordProg >= 0.75) {
            w.classList.add('on');
          } else {
            w.classList.remove('on');
          }
          w.style.opacity = (0.28 + 0.72 * wordProg).toFixed(3);
        });

        if (Math.abs(targetProgress - currentProgress) > 0.001) {
          requestAnimationFrame(update);
        } else {
          isRunning = false;
        }
      }

      function onScroll() {
        const rect = textEl.getBoundingClientRect();
        const vh = window.innerHeight;
        // Start scrub when top reaches 88% of viewport,
        // and complete smoothly across a generous distance of 1.15 * vh (slowed down and luxurious!)
        const scrollStart = vh * 0.88;
        const scrollDistance = vh * 1.15;
        targetProgress = Math.max(0, Math.min(1, (scrollStart - rect.top) / scrollDistance));

        if (!isRunning) {
          isRunning = true;
          requestAnimationFrame(update);
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });
  }
  initNaturalTextScrub();

  // 9. 3D Flipping Rotating Accent Words (.rot, [data-rot])
  function initRotators() {
    const rotators = document.querySelectorAll('[data-rot]');
    rotators.forEach((rot) => {
      const items = rot.querySelectorAll('.rot__i');
      if (items.length < 2) return;
      let cur = 0;
      setInterval(() => {
        const prev = items[cur];
        cur = (cur + 1) % items.length;
        const next = items[cur];
        prev.classList.remove('is-on');
        prev.classList.add('is-out');
        next.classList.remove('is-out');
        next.classList.add('is-on');
        setTimeout(() => {
          prev.classList.remove('is-out');
        }, 850);
      }, 2600);
    });
  }
  initRotators();

  // 10. Capability Step Line Indicators (.step, [data-step])
  function initSteps() {
    const steps = document.querySelectorAll('.step, [data-step]');
    if (!steps.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
        }
      });
    }, { threshold: 0.25 });
    steps.forEach((s) => obs.observe(s));
  }
  initSteps();

  // 11. Potadot-Style Interactive System Orchestration Feature
  function initServeOrchestration() {
    const serveSection = document.querySelector('[data-serve]');
    if (!serveSection) return;

    const tabs = Array.from(serveSection.querySelectorAll('.serve-tab'));
    const scenes = Array.from(serveSection.querySelectorAll('.scene'));
    const stage = serveSection.querySelector('.serve-stage');
    const bars = tabs.map(t => t.querySelector('.bar i'));
    if (!tabs.length || !scenes.length) return;

    let curIndex = 0;
    let autoTimer = null;
    let progressTimer = null;
    let progressStart = 0;
    const DURATION = 8000;
    let isHovered = false;
    let hasStarted = false;

    let sceneIntervals = [];
    function clearSceneAnimators() {
      sceneIntervals.forEach(t => clearTimeout(t));
      sceneIntervals = [];
    }

    function animateScene(index) {
      clearSceneAnimators();
      const scene = scenes[index];
      if (!scene) return;
      const type = scene.getAttribute('data-scene');

      if (type === 'journey') {
        const runner = scene.querySelector('.sa-runner');
        const line = scene.querySelector('.sa-line i');
        const nodes = Array.from(scene.querySelectorAll('.sa-node'));
        const cards = Array.from(scene.querySelectorAll('.sa-card'));
        const stars = Array.from(scene.querySelectorAll('.stars i'));

        nodes.forEach(n => n.classList.remove('on'));
        cards.forEach(c => c.classList.remove('on'));
        stars.forEach(s => s.style.opacity = '0.3');
        if (runner) runner.style.left = '12.5%';
        if (line) line.style.transform = 'scaleX(0)';

        if (cards[0]) cards[0].classList.add('on');
        if (nodes[0]) nodes[0].classList.add('on');

        const positions = ['12.5%', '37.5%', '62.5%', '87.5%'];
        const lineScales = [0, 0.33, 0.66, 1];

        [1, 2, 3].forEach((step, i) => {
          sceneIntervals.push(setTimeout(() => {
            if (runner) runner.style.left = positions[step];
            if (line) line.style.transform = `scaleX(${lineScales[step]})`;
            if (nodes[step]) nodes[step].classList.add('on');
            if (cards[step]) cards[step].classList.add('on');
          }, (i + 1) * 1400));
        });

        sceneIntervals.push(setTimeout(() => {
          stars.forEach((s, idx) => {
            setTimeout(() => { s.style.opacity = '1'; }, idx * 120);
          });
        }, 4600));

      } else if (type === 'frontdesk') {
        const calSpans = Array.from(scene.querySelectorAll('.cal span:not(.hd)'));
        const ptsEl = scene.querySelector('.member .pts');
        const meter = scene.querySelector('.member .meter i');
        const docT = scene.querySelector('.doc .t');
        const stamp = scene.querySelector('.stamp');
        const bell = scene.querySelector('.bell');
        const msgs = Array.from(scene.querySelectorAll('.rem .msg'));

        calSpans.forEach(s => s.classList.remove('on'));
        if (ptsEl) ptsEl.textContent = '0';
        if (meter) meter.style.width = '0%';
        if (stamp) stamp.style.opacity = '0';
        if (docT) docT.textContent = 'Quotation #Q-0142';
        msgs.forEach(m => m.style.opacity = '0.3');

        [2, 5, 8, 9, 12, 16, 17, 19].forEach((dayIdx, i) => {
          sceneIntervals.push(setTimeout(() => {
            if (calSpans[dayIdx]) calSpans[dayIdx].classList.add('on');
          }, 300 + i * 150));
        });

        sceneIntervals.push(setTimeout(() => {
          if (meter) meter.style.width = '68%';
          let count = 0;
          const countTimer = setInterval(() => {
            count += 64;
            if (count >= 1280) {
              count = 1280;
              clearInterval(countTimer);
            }
            if (ptsEl) ptsEl.textContent = count.toLocaleString();
          }, 40);
        }, 800));

        sceneIntervals.push(setTimeout(() => {
          if (docT) docT.textContent = 'Invoice #INV-0142';
          if (stamp) {
            stamp.style.opacity = '1';
            stamp.style.transform = 'translateY(-50%) rotate(-12deg) scale(1.1)';
            setTimeout(() => { stamp.style.transform = 'translateY(-50%) rotate(-12deg) scale(1)'; }, 200);
          }
        }, 2200));

        sceneIntervals.push(setTimeout(() => {
          if (bell) {
            bell.style.transform = 'rotate(15deg)';
            setTimeout(() => { bell.style.transform = 'rotate(-15deg)'; }, 100);
            setTimeout(() => { bell.style.transform = 'none'; }, 200);
          }
          msgs.forEach((m, idx) => {
            setTimeout(() => { m.style.opacity = '1'; }, idx * 300);
          });
        }, 2800));

      } else if (type === 'digital') {
        const kpiEls = Array.from(scene.querySelectorAll('.kpi b'));
        const rows = Array.from(scene.querySelectorAll('.rows div'));
        kpiEls.forEach(k => k.textContent = '0');
        rows.forEach(r => r.style.opacity = '0.3');

        sceneIntervals.push(setTimeout(() => {
          const targets = [650, 500, 200];
          kpiEls.forEach((el, i) => {
            let val = 0;
            const step = Math.ceil(targets[i] / 20);
            const timer = setInterval(() => {
              val += step;
              if (val >= targets[i]) {
                val = targets[i];
                clearInterval(timer);
              }
              el.textContent = val;
            }, 40);
          });
        }, 600));

        sceneIntervals.push(setTimeout(() => {
          rows.forEach((r, idx) => {
            setTimeout(() => { r.style.opacity = '1'; }, idx * 250);
          });
        }, 1200));

      } else if (type === 'founders') {
        const apps = Array.from(scene.querySelectorAll('.app'));
        const platItems = Array.from(scene.querySelectorAll('.plat div'));
        const rocket = scene.querySelector('.launch .rocket');
        const rail = scene.querySelector('.launch .rail i');

        function showApp(idx) {
          apps.forEach((a, i) => a.classList.toggle('on', i === idx));
          platItems.forEach((p, i) => p.classList.toggle('on', i === idx));
          if (rocket) rocket.style.left = `${(idx + 1) * 23}%`;
          if (rail) rail.style.transform = `scaleX(${(idx + 1) * 0.25})`;
        }
        showApp(0);

        [1, 2, 3].forEach((idx, i) => {
          sceneIntervals.push(setTimeout(() => {
            showApp(idx);
          }, (i + 1) * 1800));
        });
      }
    }

    function switchTab(index) {
      curIndex = (index + tabs.length) % tabs.length;

      tabs.forEach((tab, i) => {
        const isSel = i === curIndex;
        tab.setAttribute('aria-selected', isSel ? 'true' : 'false');
        tab.tabIndex = isSel ? 0 : -1;
      });

      scenes.forEach((scene, i) => {
        scene.classList.toggle('is-active', i === curIndex);
      });

      bars.forEach(b => {
        if (b) {
          b.style.transition = 'none';
          b.style.transform = 'scaleX(0)';
        }
      });

      animateScene(curIndex);
      startProgressBar();
    }

    function startProgressBar() {
      clearInterval(progressTimer);
      clearTimeout(autoTimer);
      if (isHovered) return;

      const bar = bars[curIndex];
      if (!bar) return;
      progressStart = Date.now();

      progressTimer = setInterval(() => {
        if (isHovered) return;
        const elapsed = Date.now() - progressStart;
        const progress = Math.min(1, elapsed / DURATION);
        bar.style.transition = 'transform 0.1s linear';
        bar.style.transform = `scaleX(${progress})`;

        if (progress >= 1) {
          clearInterval(progressTimer);
          switchTab(curIndex + 1);
        }
      }, 50);
    }

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        switchTab(idx);
      });
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          switchTab(curIndex + 1);
          tabs[curIndex].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          switchTab(curIndex - 1);
          tabs[curIndex].focus();
        }
      });
    });

    if (stage) {
      stage.addEventListener('mouseenter', () => {
        isHovered = true;
      });
      stage.addEventListener('mouseleave', () => {
        isHovered = false;
        progressStart = Date.now();
      });
    }

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasStarted) {
        hasStarted = true;
        switchTab(0);
      }
    }, { threshold: 0.25 });
    obs.observe(serveSection);
  }
  initServeOrchestration();

  // 12. FAQ Accordion Interactive Controller
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const btn = item.querySelector('.faq-btn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        faqItems.forEach(i => i.classList.remove('is-open'));
        if (!isOpen) {
          item.classList.add('is-open');
        }
      });
    });
  }
  // 13. Cybernetic Mouse Cursor & Staggered Trail System (Reference Parity)
  function initCyberneticCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('has-custom-cursor');

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.innerHTML = '<span></span>';
    const labelSpan = cursor.querySelector('span');

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';

    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    // Staggered Particle Comet Trails
    const trailColors = ['rgba(0, 240, 255, 0.6)', 'rgba(56, 189, 248, 0.45)', 'rgba(139, 92, 246, 0.3)'];
    const trails = trailColors.map((clr, i) => {
      const el = document.createElement('div');
      el.className = 'cursor-trail';
      el.style.background = clr;
      const sz = 6 - i * 1.2;
      el.style.width = sz + 'px';
      el.style.height = sz + 'px';
      document.body.appendChild(el);
      return { el, x: window.innerWidth / 2, y: window.innerHeight / 2, delay: 0.20 + i * 0.08 };
    });

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let dotX = mouseX, dotY = mouseY;
    let ringX = mouseX, ringY = mouseY;
    let isLive = false;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isLive) {
        isLive = true;
        cursor.classList.add('is-live');
        cursorDot.classList.add('is-live');
        trails.forEach(t => t.el.classList.add('is-live'));
      }
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', () => {
      cursor.classList.remove('is-live');
      cursorDot.classList.remove('is-live');
      trails.forEach(t => t.el.classList.remove('is-live'));
      isLive = false;
    });

    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

    // Contextual Hover States
    document.addEventListener('pointerover', (e) => {
      const target = e.target.closest && e.target.closest('[data-cursor], a, button, .serve-tab, .work-card, .btn, .faq-btn');
      if (!target) {
        cursor.classList.remove('is-hover', 'has-label');
        return;
      }
      const label = target.getAttribute('data-cursor');
      if (label) {
        labelSpan.textContent = label;
        cursor.classList.add('has-label');
        cursor.classList.remove('is-hover');
      } else {
        cursor.classList.add('is-hover');
        cursor.classList.remove('has-label');
      }
    });

    // Magnetic Button Pull
    const magneticEls = document.querySelectorAll('[data-magnetic]');
    magneticEls.forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });

    // Smooth Cursor Physics Loop
    function renderCursor() {
      if (isLive) {
        dotX += (mouseX - dotX) * 0.45;
        dotY += (mouseY - dotY) * 0.45;
        cursorDot.style.left = dotX.toFixed(1) + 'px';
        cursorDot.style.top = dotY.toFixed(1) + 'px';

        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        cursor.style.left = ringX.toFixed(1) + 'px';
        cursor.style.top = ringY.toFixed(1) + 'px';

        trails.forEach((t) => {
          t.x += (mouseX - t.x) * t.delay;
          t.y += (mouseY - t.y) * t.delay;
          t.el.style.left = t.x.toFixed(1) + 'px';
          t.el.style.top = t.y.toFixed(1) + 'px';
        });
      }
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }
  initCyberneticCursor();


  // ==========================================================================
  // Three.js Immersive 3D Cybernetic Preloader (313 Tech Solutions)
  // Volumetric Curved 3D Extrusion + Dual Orbital Halo Rings + Vertical Liquid Fill
  // Exact Homepage Particle Dot Texture & Additive Blending Parity
  // ==========================================================================
  function initSiteLoader() {
    const loader = document.getElementById('site-loader');
    if (!loader) return;
    const canvas = document.getElementById('loader-canvas');
    if (!canvas) return;

    const counterEl = document.getElementById('loader-counter');
    const labelEl = document.getElementById('loader-status-text');
    const fillBarEl = document.getElementById('loader-progress-bar');

    if (typeof THREE === 'undefined') {
      setTimeout(initSiteLoader, 40);
      return;
    }

    // High-Resolution 240x56 Sampled Logo Points (4,067 coordinate pairs)
    const LOGO_POINTS = new Uint8Array([26, 0, 27, 0, 28, 0, 29, 0, 30, 0, 54, 0, 55, 0, 56, 0, 71, 0, 72, 0, 73, 0, 74, 0, 96, 0, 97, 0, 158, 0, 159, 0, 160, 0, 161, 0, 162, 0, 24, 1, 25, 1, 26, 1, 27, 1, 28, 1, 29, 1, 30, 1, 53, 1, 54, 1, 55, 1, 56, 1, 57, 1, 58, 1, 69, 1, 70, 1, 71, 1, 72, 1, 73, 1, 74, 1, 75, 1, 96, 1, 97, 1, 106, 1, 107, 1, 108, 1, 109, 1, 110, 1, 111, 1, 112, 1, 113, 1, 114, 1, 115, 1, 116, 1, 117, 1, 118, 1, 119, 1, 120, 1, 158, 1, 159, 1, 160, 1, 161, 1, 162, 1, 21, 2, 22, 2, 23, 2, 24, 2, 25, 2, 26, 2, 27, 2, 28, 2, 29, 2, 30, 2, 31, 2, 51, 2, 52, 2, 53, 2, 54, 2, 55, 2, 56, 2, 57, 2, 58, 2, 59, 2, 66, 2, 67, 2, 68, 2, 69, 2, 70, 2, 71, 2, 72, 2, 73, 2, 74, 2, 75, 2, 76, 2, 96, 2, 97, 2, 106, 2, 107, 2, 108, 2, 109, 2, 110, 2, 111, 2, 112, 2, 113, 2, 114, 2, 115, 2, 116, 2, 117, 2, 118, 2, 119, 2, 120, 2, 158, 2, 159, 2, 160, 2, 161, 2, 162, 2, 20, 3, 21, 3, 22, 3, 23, 3, 24, 3, 25, 3, 26, 3, 27, 3, 28, 3, 29, 3, 30, 3, 31, 3, 32, 3, 50, 3, 51, 3, 52, 3, 53, 3, 54, 3, 55, 3, 56, 3, 57, 3, 58, 3, 59, 3, 64, 3, 65, 3, 66, 3, 67, 3, 68, 3, 69, 3, 70, 3, 71, 3, 72, 3, 73, 3, 74, 3, 75, 3, 76, 3, 77, 3, 96, 3, 97, 3, 106, 3, 107, 3, 108, 3, 109, 3, 110, 3, 111, 3, 112, 3, 113, 3, 114, 3, 115, 3, 116, 3, 117, 3, 118, 3, 119, 3, 120, 3, 158, 3, 159, 3, 160, 3, 161, 3, 162, 3, 18, 4, 19, 4, 20, 4, 21, 4, 22, 4, 23, 4, 24, 4, 25, 4, 26, 4, 27, 4, 28, 4, 29, 4, 30, 4, 31, 4, 32, 4, 33, 4, 50, 4, 51, 4, 52, 4, 53, 4, 54, 4, 55, 4, 56, 4, 57, 4, 58, 4, 63, 4, 64, 4, 65, 4, 66, 4, 67, 4, 68, 4, 69, 4, 70, 4, 71, 4, 72, 4, 73, 4, 74, 4, 75, 4, 76, 4, 77, 4, 78, 4, 96, 4, 97, 4, 106, 4, 107, 4, 108, 4, 109, 4, 110, 4, 111, 4, 112, 4, 113, 4, 114, 4, 115, 4, 116, 4, 117, 4, 118, 4, 119, 4, 120, 4, 158, 4, 159, 4, 160, 4, 161, 4, 162, 4, 16, 5, 17, 5, 18, 5, 19, 5, 20, 5, 21, 5, 22, 5, 23, 5, 24, 5, 25, 5, 26, 5, 27, 5, 28, 5, 29, 5, 30, 5, 31, 5, 32, 5, 33, 5, 34, 5, 49, 5, 50, 5, 51, 5, 52, 5, 53, 5, 54, 5, 55, 5, 56, 5, 57, 5, 61, 5, 62, 5, 63, 5, 64, 5, 65, 5, 66, 5, 67, 5, 68, 5, 69, 5, 70, 5, 71, 5, 72, 5, 73, 5, 74, 5, 75, 5, 76, 5, 77, 5, 78, 5, 79, 5, 96, 5, 97, 5, 107, 5, 108, 5, 109, 5, 110, 5, 111, 5, 112, 5, 113, 5, 114, 5, 115, 5, 116, 5, 117, 5, 118, 5, 119, 5, 127, 5, 128, 5, 129, 5, 130, 5, 131, 5, 132, 5, 133, 5, 145, 5, 146, 5, 147, 5, 148, 5, 149, 5, 150, 5, 151, 5, 158, 5, 159, 5, 160, 5, 161, 5, 162, 5, 165, 5, 166, 5, 167, 5, 168, 5, 169, 5, 15, 6, 16, 6, 17, 6, 18, 6, 19, 6, 20, 6, 21, 6, 22, 6, 23, 6, 24, 6, 25, 6, 31, 6, 32, 6, 33, 6, 34, 6, 49, 6, 50, 6, 51, 6, 52, 6, 53, 6, 54, 6, 55, 6, 56, 6, 60, 6, 61, 6, 62, 6, 63, 6, 64, 6, 65, 6, 66, 6, 67, 6, 68, 6, 69, 6, 70, 6, 76, 6, 77, 6, 78, 6, 79, 6, 96, 6, 97, 6, 111, 6, 112, 6, 113, 6, 114, 6, 115, 6, 125, 6, 126, 6, 127, 6, 128, 6, 129, 6, 130, 6, 131, 6, 132, 6, 133, 6, 134, 6, 135, 6, 143, 6, 144, 6, 145, 6, 146, 6, 147, 6, 148, 6, 149, 6, 150, 6, 151, 6, 152, 6, 158, 6, 159, 6, 160, 6, 161, 6, 162, 6, 163, 6, 164, 6, 165, 6, 166, 6, 167, 6, 168, 6, 169, 6, 170, 6, 171, 6, 14, 7, 15, 7, 16, 7, 17, 7, 18, 7, 19, 7, 20, 7, 21, 7, 22, 7, 23, 7, 31, 7, 32, 7, 33, 7, 34, 7, 35, 7, 48, 7, 49, 7, 50, 7, 51, 7, 52, 7, 53, 7, 54, 7, 55, 7, 59, 7, 60, 7, 61, 7, 62, 7, 63, 7, 64, 7, 65, 7, 66, 7, 67, 7, 68, 7, 76, 7, 77, 7, 78, 7, 79, 7, 80, 7, 96, 7, 97, 7, 111, 7, 112, 7, 113, 7, 114, 7, 115, 7, 124, 7, 125, 7, 126, 7, 127, 7, 128, 7, 129, 7, 130, 7, 131, 7, 132, 7, 133, 7, 134, 7, 135, 7, 136, 7, 142, 7, 143, 7, 144, 7, 145, 7, 146, 7, 147, 7, 148, 7, 149, 7, 150, 7, 151, 7, 152, 7, 153, 7, 158, 7, 159, 7, 160, 7, 161, 7, 162, 7, 163, 7, 164, 7, 165, 7, 166, 7, 167, 7, 168, 7, 169, 7, 170, 7, 171, 7, 172, 7, 13, 8, 14, 8, 15, 8, 16, 8, 17, 8, 18, 8, 19, 8, 20, 8, 21, 8, 30, 8, 31, 8, 32, 8, 33, 8, 34, 8, 35, 8, 47, 8, 48, 8, 49, 8, 50, 8, 51, 8, 52, 8, 53, 8, 54, 8, 55, 8, 58, 8, 59, 8, 60, 8, 61, 8, 62, 8, 63, 8, 64, 8, 65, 8, 66, 8, 75, 8, 76, 8, 77, 8, 78, 8, 79, 8, 80, 8, 96, 8, 97, 8, 111, 8, 112, 8, 113, 8, 114, 8, 115, 8, 124, 8, 125, 8, 126, 8, 127, 8, 128, 8, 129, 8, 130, 8, 131, 8, 132, 8, 133, 8, 134, 8, 135, 8, 136, 8, 137, 8, 141, 8, 142, 8, 143, 8, 144, 8, 145, 8, 146, 8, 147, 8, 148, 8, 149, 8, 150, 8, 151, 8, 152, 8, 153, 8, 154, 8, 158, 8, 159, 8, 160, 8, 161, 8, 162, 8, 163, 8, 164, 8, 165, 8, 166, 8, 167, 8, 168, 8, 169, 8, 170, 8, 171, 8, 172, 8, 13, 9, 14, 9, 15, 9, 16, 9, 17, 9, 18, 9, 19, 9, 20, 9, 29, 9, 30, 9, 31, 9, 32, 9, 33, 9, 34, 9, 35, 9, 47, 9, 48, 9, 49, 9, 50, 9, 51, 9, 52, 9, 53, 9, 54, 9, 58, 9, 59, 9, 60, 9, 61, 9, 62, 9, 63, 9, 64, 9, 74, 9, 75, 9, 76, 9, 77, 9, 78, 9, 79, 9, 96, 9, 97, 9, 111, 9, 112, 9, 113, 9, 114, 9, 115, 9, 123, 9, 124, 9, 125, 9, 126, 9, 127, 9, 128, 9, 129, 9, 131, 9, 132, 9, 133, 9, 134, 9, 135, 9, 136, 9, 137, 9, 141, 9, 142, 9, 143, 9, 144, 9, 145, 9, 146, 9, 147, 9, 148, 9, 149, 9, 150, 9, 151, 9, 152, 9, 153, 9, 154, 9, 155, 9, 158, 9, 159, 9, 160, 9, 161, 9, 162, 9, 163, 9, 164, 9, 165, 9, 166, 9, 167, 9, 168, 9, 169, 9, 170, 9, 171, 9, 172, 9, 173, 9, 14, 10, 15, 10, 16, 10, 17, 10, 18, 10, 29, 10, 30, 10, 31, 10, 32, 10, 33, 10, 34, 10, 46, 10, 47, 10, 48, 10, 49, 10, 50, 10, 51, 10, 52, 10, 53, 10, 54, 10, 59, 10, 60, 10, 61, 10, 62, 10, 63, 10, 73, 10, 74, 10, 75, 10, 76, 10, 77, 10, 78, 10, 79, 10, 96, 10, 97, 10, 111, 10, 112, 10, 113, 10, 114, 10, 115, 10, 123, 10, 124, 10, 125, 10, 126, 10, 127, 10, 133, 10, 134, 10, 135, 10, 136, 10, 137, 10, 138, 10, 140, 10, 141, 10, 142, 10, 143, 10, 144, 10, 145, 10, 150, 10, 151, 10, 152, 10, 153, 10, 154, 10, 155, 10, 158, 10, 159, 10, 160, 10, 161, 10, 162, 10, 163, 10, 168, 10, 169, 10, 170, 10, 171, 10, 172, 10, 173, 10, 14, 11, 15, 11, 16, 11, 17, 11, 27, 11, 28, 11, 29, 11, 30, 11, 31, 11, 32, 11, 33, 11, 45, 11, 46, 11, 47, 11, 48, 11, 49, 11, 50, 11, 51, 11, 52, 11, 53, 11, 59, 11, 60, 11, 61, 11, 62, 11, 72, 11, 73, 11, 74, 11, 75, 11, 76, 11, 77, 11, 78, 11, 96, 11, 97, 11, 111, 11, 112, 11, 113, 11, 114, 11, 115, 11, 122, 11, 123, 11, 124, 11, 125, 11, 126, 11, 127, 11, 129, 11, 131, 11, 133, 11, 134, 11, 135, 11, 136, 11, 137, 11, 138, 11, 140, 11, 141, 11, 142, 11, 143, 11, 144, 11, 151, 11, 152, 11, 153, 11, 154, 11, 155, 11, 158, 11, 159, 11, 160, 11, 161, 11, 162, 11, 169, 11, 170, 11, 171, 11, 172, 11, 173, 11, 15, 12, 16, 12, 17, 12, 26, 12, 27, 12, 28, 12, 29, 12, 30, 12, 31, 12, 32, 12, 44, 12, 45, 12, 46, 12, 47, 12, 48, 12, 49, 12, 50, 12, 51, 12, 52, 12, 53, 12, 60, 12, 61, 12, 62, 12, 71, 12, 72, 12, 73, 12, 74, 12, 75, 12, 76, 12, 77, 12, 96, 12, 97, 12, 111, 12, 112, 12, 113, 12, 114, 12, 115, 12, 122, 12, 123, 12, 124, 12, 125, 12, 126, 12, 127, 12, 128, 12, 129, 12, 130, 12, 131, 12, 132, 12, 133, 12, 134, 12, 135, 12, 136, 12, 137, 12, 138, 12, 140, 12, 141, 12, 142, 12, 143, 12, 144, 12, 158, 12, 159, 12, 160, 12, 161, 12, 162, 12, 169, 12, 170, 12, 171, 12, 172, 12, 173, 12, 16, 13, 25, 13, 26, 13, 27, 13, 28, 13, 29, 13, 30, 13, 31, 13, 44, 13, 45, 13, 46, 13, 47, 13, 48, 13, 49, 13, 50, 13, 51, 13, 52, 13, 61, 13, 70, 13, 71, 13, 72, 13, 73, 13, 74, 13, 75, 13, 76, 13, 96, 13, 97, 13, 111, 13, 112, 13, 113, 13, 114, 13, 115, 13, 122, 13, 123, 13, 124, 13, 125, 13, 126, 13, 127, 13, 128, 13, 129, 13, 130, 13, 131, 13, 132, 13, 133, 13, 134, 13, 135, 13, 136, 13, 137, 13, 138, 13, 140, 13, 141, 13, 142, 13, 143, 13, 144, 13, 158, 13, 159, 13, 160, 13, 161, 13, 162, 13, 169, 13, 170, 13, 171, 13, 172, 13, 173, 13, 23, 14, 24, 14, 25, 14, 26, 14, 27, 14, 28, 14, 29, 14, 30, 14, 43, 14, 44, 14, 45, 14, 46, 14, 47, 14, 48, 14, 49, 14, 50, 14, 51, 14, 52, 14, 68, 14, 69, 14, 70, 14, 71, 14, 72, 14, 73, 14, 74, 14, 96, 14, 97, 14, 111, 14, 112, 14, 113, 14, 114, 14, 115, 14, 122, 14, 123, 14, 124, 14, 125, 14, 126, 14, 127, 14, 128, 14, 129, 14, 130, 14, 131, 14, 132, 14, 133, 14, 134, 14, 135, 14, 136, 14, 137, 14, 138, 14, 140, 14, 141, 14, 142, 14, 143, 14, 144, 14, 158, 14, 159, 14, 160, 14, 161, 14, 162, 14, 169, 14, 170, 14, 171, 14, 172, 14, 173, 14, 21, 15, 22, 15, 23, 15, 24, 15, 25, 15, 26, 15, 27, 15, 28, 15, 42, 15, 43, 15, 44, 15, 45, 15, 47, 15, 48, 15, 49, 15, 50, 15, 51, 15, 52, 15, 66, 15, 67, 15, 68, 15, 69, 15, 70, 15, 71, 15, 72, 15, 73, 15, 96, 15, 97, 15, 111, 15, 112, 15, 113, 15, 114, 15, 115, 15, 122, 15, 123, 15, 124, 15, 125, 15, 126, 15, 127, 15, 140, 15, 141, 15, 142, 15, 143, 15, 144, 15, 158, 15, 159, 15, 160, 15, 161, 15, 162, 15, 169, 15, 170, 15, 171, 15, 172, 15, 173, 15, 19, 16, 20, 16, 21, 16, 22, 16, 23, 16, 24, 16, 25, 16, 26, 16, 27, 16, 41, 16, 42, 16, 43, 16, 44, 16, 46, 16, 47, 16, 48, 16, 49, 16, 50, 16, 51, 16, 64, 16, 65, 16, 66, 16, 67, 16, 68, 16, 69, 16, 70, 16, 71, 16, 72, 16, 96, 16, 97, 16, 111, 16, 112, 16, 113, 16, 114, 16, 115, 16, 123, 16, 124, 16, 125, 16, 126, 16, 127, 16, 133, 16, 134, 16, 135, 16, 136, 16, 137, 16, 140, 16, 141, 16, 142, 16, 143, 16, 144, 16, 145, 16, 151, 16, 152, 16, 153, 16, 154, 16, 155, 16, 158, 16, 159, 16, 160, 16, 161, 16, 162, 16, 169, 16, 170, 16, 171, 16, 172, 16, 173, 16, 17, 17, 18, 17, 19, 17, 20, 17, 21, 17, 22, 17, 23, 17, 24, 17, 25, 17, 40, 17, 41, 17, 42, 17, 43, 17, 46, 17, 47, 17, 48, 17, 49, 17, 50, 17, 51, 17, 62, 17, 63, 17, 64, 17, 65, 17, 66, 17, 67, 17, 68, 17, 69, 17, 70, 17, 96, 17, 97, 17, 111, 17, 112, 17, 113, 17, 114, 17, 115, 17, 123, 17, 124, 17, 125, 17, 126, 17, 127, 17, 128, 17, 132, 17, 133, 17, 134, 17, 135, 17, 136, 17, 137, 17, 141, 17, 142, 17, 143, 17, 144, 17, 145, 17, 146, 17, 149, 17, 150, 17, 151, 17, 152, 17, 153, 17, 154, 17, 155, 17, 158, 17, 159, 17, 160, 17, 161, 17, 162, 17, 169, 17, 170, 17, 171, 17, 172, 17, 173, 17, 16, 18, 17, 18, 18, 18, 19, 18, 20, 18, 21, 18, 22, 18, 23, 18, 24, 18, 38, 18, 39, 18, 40, 18, 41, 18, 42, 18, 46, 18, 47, 18, 48, 18, 49, 18, 50, 18, 51, 18, 61, 18, 62, 18, 63, 18, 64, 18, 65, 18, 66, 18, 67, 18, 68, 18, 69, 18, 96, 18, 97, 18, 111, 18, 112, 18, 113, 18, 114, 18, 115, 18, 123, 18, 124, 18, 125, 18, 126, 18, 127, 18, 128, 18, 129, 18, 130, 18, 131, 18, 132, 18, 133, 18, 134, 18, 135, 18, 136, 18, 137, 18, 141, 18, 142, 18, 143, 18, 144, 18, 145, 18, 146, 18, 147, 18, 148, 18, 149, 18, 150, 18, 151, 18, 152, 18, 153, 18, 154, 18, 158, 18, 159, 18, 160, 18, 161, 18, 162, 18, 169, 18, 170, 18, 171, 18, 172, 18, 173, 18, 16, 19, 17, 19, 18, 19, 19, 19, 20, 19, 21, 19, 22, 19, 38, 19, 39, 19, 40, 19, 41, 19, 45, 19, 46, 19, 47, 19, 48, 19, 49, 19, 50, 19, 60, 19, 61, 19, 62, 19, 63, 19, 64, 19, 65, 19, 66, 19, 67, 19, 96, 19, 97, 19, 111, 19, 112, 19, 113, 19, 114, 19, 115, 19, 124, 19, 125, 19, 126, 19, 127, 19, 128, 19, 129, 19, 130, 19, 131, 19, 132, 19, 133, 19, 134, 19, 135, 19, 136, 19, 142, 19, 143, 19, 144, 19, 145, 19, 146, 19, 147, 19, 148, 19, 149, 19, 150, 19, 151, 19, 152, 19, 153, 19, 154, 19, 158, 19, 159, 19, 160, 19, 161, 19, 162, 19, 169, 19, 170, 19, 171, 19, 172, 19, 173, 19, 16, 20, 17, 20, 18, 20, 19, 20, 20, 20, 21, 20, 22, 20, 23, 20, 24, 20, 25, 20, 26, 20, 38, 20, 39, 20, 40, 20, 45, 20, 46, 20, 47, 20, 48, 20, 49, 20, 50, 20, 60, 20, 61, 20, 62, 20, 63, 20, 64, 20, 65, 20, 66, 20, 67, 20, 68, 20, 69, 20, 70, 20, 71, 20, 96, 20, 97, 20, 111, 20, 112, 20, 113, 20, 114, 20, 115, 20, 125, 20, 126, 20, 127, 20, 128, 20, 129, 20, 130, 20, 131, 20, 132, 20, 133, 20, 134, 20, 135, 20, 143, 20, 144, 20, 145, 20, 146, 20, 147, 20, 148, 20, 149, 20, 150, 20, 151, 20, 152, 20, 153, 20, 158, 20, 159, 20, 160, 20, 161, 20, 162, 20, 169, 20, 170, 20, 171, 20, 172, 20, 173, 20, 16, 21, 17, 21, 18, 21, 19, 21, 20, 21, 21, 21, 22, 21, 23, 21, 24, 21, 25, 21, 26, 21, 27, 21, 28, 21, 29, 21, 38, 21, 39, 21, 45, 21, 46, 21, 47, 21, 48, 21, 49, 21, 50, 21, 61, 21, 62, 21, 63, 21, 64, 21, 65, 21, 66, 21, 67, 21, 68, 21, 69, 21, 70, 21, 71, 21, 72, 21, 73, 21, 74, 21, 96, 21, 97, 21, 111, 21, 112, 21, 113, 21, 114, 21, 115, 21, 127, 21, 128, 21, 129, 21, 130, 21, 131, 21, 132, 21, 133, 21, 134, 21, 144, 21, 145, 21, 146, 21, 147, 21, 148, 21, 149, 21, 150, 21, 151, 21, 158, 21, 159, 21, 160, 21, 161, 21, 162, 21, 169, 21, 170, 21, 171, 21, 172, 21, 173, 21, 16, 22, 17, 22, 18, 22, 19, 22, 20, 22, 21, 22, 22, 22, 23, 22, 24, 22, 25, 22, 26, 22, 27, 22, 28, 22, 29, 22, 30, 22, 31, 22, 32, 22, 44, 22, 45, 22, 46, 22, 47, 22, 48, 22, 49, 22, 61, 22, 62, 22, 63, 22, 64, 22, 65, 22, 66, 22, 67, 22, 68, 22, 69, 22, 70, 22, 71, 22, 72, 22, 73, 22, 74, 22, 75, 22, 76, 22, 77, 22, 96, 22, 97, 22, 16, 23, 17, 23, 18, 23, 19, 23, 20, 23, 21, 23, 22, 23, 23, 23, 24, 23, 25, 23, 26, 23, 27, 23, 28, 23, 29, 23, 30, 23, 31, 23, 32, 23, 33, 23, 34, 23, 44, 23, 45, 23, 46, 23, 47, 23, 48, 23, 49, 23, 61, 23, 62, 23, 63, 23, 64, 23, 65, 23, 66, 23, 67, 23, 68, 23, 69, 23, 70, 23, 71, 23, 72, 23, 73, 23, 74, 23, 75, 23, 76, 23, 77, 23, 78, 23, 79, 23, 96, 23, 97, 23, 16, 24, 17, 24, 18, 24, 19, 24, 25, 24, 26, 24, 27, 24, 28, 24, 29, 24, 30, 24, 31, 24, 32, 24, 33, 24, 34, 24, 35, 24, 44, 24, 45, 24, 46, 24, 47, 24, 48, 24, 49, 24, 61, 24, 62, 24, 63, 24, 64, 24, 70, 24, 71, 24, 72, 24, 73, 24, 74, 24, 75, 24, 76, 24, 77, 24, 78, 24, 79, 24, 80, 24, 96, 24, 97, 24, 29, 25, 30, 25, 31, 25, 32, 25, 33, 25, 34, 25, 35, 25, 36, 25, 44, 25, 45, 25, 46, 25, 47, 25, 48, 25, 49, 25, 74, 25, 75, 25, 76, 25, 77, 25, 78, 25, 79, 25, 80, 25, 81, 25, 96, 25, 97, 25, 31, 26, 32, 26, 33, 26, 34, 26, 35, 26, 36, 26, 43, 26, 44, 26, 45, 26, 46, 26, 47, 26, 48, 26, 76, 26, 77, 26, 78, 26, 79, 26, 80, 26, 81, 26, 96, 26, 97, 26, 32, 27, 33, 27, 34, 27, 35, 27, 36, 27, 43, 27, 44, 27, 45, 27, 46, 27, 47, 27, 48, 27, 77, 27, 78, 27, 79, 27, 80, 27, 81, 27, 96, 27, 97, 27, 33, 28, 34, 28, 35, 28, 36, 28, 43, 28, 44, 28, 45, 28, 46, 28, 47, 28, 48, 28, 78, 28, 79, 28, 80, 28, 81, 28, 96, 28, 97, 28, 33, 29, 34, 29, 35, 29, 36, 29, 43, 29, 44, 29, 45, 29, 46, 29, 47, 29, 48, 29, 78, 29, 79, 29, 80, 29, 81, 29, 96, 29, 97, 29, 183, 29, 184, 29, 33, 30, 34, 30, 35, 30, 36, 30, 42, 30, 43, 30, 44, 30, 45, 30, 46, 30, 47, 30, 48, 30, 78, 30, 79, 30, 80, 30, 81, 30, 96, 30, 97, 30, 182, 30, 183, 30, 184, 30, 185, 30, 32, 31, 33, 31, 34, 31, 35, 31, 36, 31, 42, 31, 43, 31, 44, 31, 45, 31, 46, 31, 47, 31, 48, 31, 77, 31, 78, 31, 79, 31, 80, 31, 81, 31, 96, 31, 97, 31, 143, 31, 144, 31, 145, 31, 146, 31, 147, 31, 148, 31, 181, 31, 182, 31, 183, 31, 184, 31, 185, 31, 186, 31, 31, 32, 32, 32, 33, 32, 34, 32, 35, 32, 36, 32, 42, 32, 43, 32, 44, 32, 45, 32, 46, 32, 47, 32, 76, 32, 77, 32, 78, 32, 79, 32, 80, 32, 81, 32, 96, 32, 97, 32, 111, 32, 112, 32, 113, 32, 114, 32, 115, 32, 116, 32, 117, 32, 118, 32, 143, 32, 144, 32, 145, 32, 146, 32, 147, 32, 148, 32, 171, 32, 172, 32, 173, 32, 174, 32, 175, 32, 181, 32, 182, 32, 183, 32, 184, 32, 185, 32, 186, 32, 31, 33, 32, 33, 33, 33, 34, 33, 35, 33, 36, 33, 42, 33, 43, 33, 44, 33, 45, 33, 46, 33, 47, 33, 76, 33, 77, 33, 78, 33, 79, 33, 80, 33, 81, 33, 96, 33, 97, 33, 109, 33, 110, 33, 111, 33, 112, 33, 113, 33, 114, 33, 115, 33, 116, 33, 117, 33, 118, 33, 119, 33, 120, 33, 143, 33, 144, 33, 145, 33, 146, 33, 147, 33, 148, 33, 171, 33, 172, 33, 173, 33, 174, 33, 175, 33, 181, 33, 182, 33, 183, 33, 184, 33, 185, 33, 186, 33, 30, 34, 31, 34, 32, 34, 33, 34, 34, 34, 35, 34, 36, 34, 42, 34, 43, 34, 44, 34, 45, 34, 46, 34, 47, 34, 75, 34, 76, 34, 77, 34, 78, 34, 79, 34, 80, 34, 81, 34, 96, 34, 97, 34, 108, 34, 109, 34, 110, 34, 111, 34, 112, 34, 113, 34, 114, 34, 115, 34, 116, 34, 117, 34, 118, 34, 119, 34, 120, 34, 121, 34, 143, 34, 144, 34, 145, 34, 146, 34, 147, 34, 148, 34, 171, 34, 172, 34, 173, 34, 174, 34, 175, 34, 181, 34, 182, 34, 183, 34, 184, 34, 185, 34, 186, 34, 29, 35, 30, 35, 31, 35, 32, 35, 33, 35, 34, 35, 35, 35, 42, 35, 43, 35, 44, 35, 45, 35, 46, 35, 47, 35, 74, 35, 75, 35, 76, 35, 77, 35, 78, 35, 79, 35, 80, 35, 96, 35, 97, 35, 108, 35, 109, 35, 110, 35, 111, 35, 112, 35, 113, 35, 114, 35, 115, 35, 116, 35, 117, 35, 118, 35, 119, 35, 120, 35, 121, 35, 143, 35, 144, 35, 145, 35, 146, 35, 147, 35, 148, 35, 171, 35, 172, 35, 173, 35, 174, 35, 175, 35, 182, 35, 183, 35, 184, 35, 185, 35, 28, 36, 29, 36, 30, 36, 31, 36, 32, 36, 33, 36, 34, 36, 35, 36, 42, 36, 43, 36, 44, 36, 45, 36, 46, 36, 47, 36, 48, 36, 73, 36, 74, 36, 75, 36, 76, 36, 77, 36, 78, 36, 79, 36, 80, 36, 96, 36, 97, 36, 107, 36, 108, 36, 109, 36, 110, 36, 111, 36, 112, 36, 113, 36, 114, 36, 115, 36, 116, 36, 117, 36, 118, 36, 119, 36, 120, 36, 121, 36, 122, 36, 129, 36, 130, 36, 131, 36, 132, 36, 133, 36, 134, 36, 135, 36, 136, 36, 143, 36, 144, 36, 145, 36, 146, 36, 147, 36, 148, 36, 151, 36, 152, 36, 153, 36, 154, 36, 155, 36, 162, 36, 163, 36, 164, 36, 165, 36, 166, 36, 169, 36, 170, 36, 171, 36, 172, 36, 173, 36, 174, 36, 175, 36, 176, 36, 177, 36, 178, 36, 179, 36, 181, 36, 182, 36, 183, 36, 184, 36, 185, 36, 186, 36, 193, 36, 194, 36, 195, 36, 196, 36, 197, 36, 198, 36, 199, 36, 200, 36, 208, 36, 209, 36, 210, 36, 211, 36, 212, 36, 214, 36, 215, 36, 216, 36, 217, 36, 218, 36, 219, 36, 229, 36, 230, 36, 231, 36, 232, 36, 233, 36, 234, 36, 235, 36, 236, 36, 26, 37, 27, 37, 28, 37, 29, 37, 30, 37, 31, 37, 32, 37, 33, 37, 34, 37, 43, 37, 44, 37, 45, 37, 46, 37, 47, 37, 48, 37, 71, 37, 72, 37, 73, 37, 74, 37, 75, 37, 76, 37, 77, 37, 78, 37, 79, 37, 96, 37, 97, 37, 107, 37, 108, 37, 109, 37, 110, 37, 111, 37, 112, 37, 117, 37, 118, 37, 119, 37, 120, 37, 121, 37, 122, 37, 127, 37, 128, 37, 129, 37, 130, 37, 131, 37, 132, 37, 133, 37, 134, 37, 135, 37, 136, 37, 137, 37, 138, 37, 143, 37, 144, 37, 145, 37, 146, 37, 147, 37, 148, 37, 151, 37, 152, 37, 153, 37, 154, 37, 155, 37, 156, 37, 162, 37, 163, 37, 164, 37, 165, 37, 166, 37, 167, 37, 169, 37, 170, 37, 171, 37, 172, 37, 173, 37, 174, 37, 175, 37, 176, 37, 177, 37, 178, 37, 179, 37, 181, 37, 182, 37, 183, 37, 184, 37, 185, 37, 186, 37, 191, 37, 192, 37, 193, 37, 194, 37, 195, 37, 196, 37, 197, 37, 198, 37, 199, 37, 200, 37, 201, 37, 202, 37, 207, 37, 208, 37, 209, 37, 210, 37, 211, 37, 212, 37, 213, 37, 214, 37, 215, 37, 216, 37, 217, 37, 218, 37, 219, 37, 220, 37, 221, 37, 227, 37, 228, 37, 229, 37, 230, 37, 231, 37, 232, 37, 233, 37, 234, 37, 235, 37, 236, 37, 237, 37, 25, 38, 26, 38, 27, 38, 28, 38, 29, 38, 30, 38, 31, 38, 32, 38, 33, 38, 45, 38, 46, 38, 47, 38, 48, 38, 70, 38, 71, 38, 72, 38, 73, 38, 74, 38, 75, 38, 76, 38, 77, 38, 78, 38, 96, 38, 97, 38, 107, 38, 108, 38, 109, 38, 110, 38, 111, 38, 112, 38, 117, 38, 118, 38, 119, 38, 120, 38, 121, 38, 122, 38, 126, 38, 127, 38, 128, 38, 129, 38, 130, 38, 131, 38, 132, 38, 133, 38, 134, 38, 135, 38, 136, 38, 137, 38, 138, 38, 139, 38, 143, 38, 144, 38, 145, 38, 146, 38, 147, 38, 148, 38, 151, 38, 152, 38, 153, 38, 154, 38, 155, 38, 156, 38, 162, 38, 163, 38, 164, 38, 165, 38, 166, 38, 167, 38, 169, 38, 170, 38, 171, 38, 172, 38, 173, 38, 174, 38, 175, 38, 176, 38, 177, 38, 178, 38, 179, 38, 181, 38, 182, 38, 183, 38, 184, 38, 185, 38, 186, 38, 190, 38, 191, 38, 192, 38, 193, 38, 194, 38, 195, 38, 196, 38, 197, 38, 198, 38, 199, 38, 200, 38, 201, 38, 202, 38, 203, 38, 207, 38, 208, 38, 209, 38, 210, 38, 211, 38, 212, 38, 213, 38, 214, 38, 215, 38, 216, 38, 217, 38, 218, 38, 219, 38, 220, 38, 221, 38, 222, 38, 226, 38, 227, 38, 228, 38, 229, 38, 230, 38, 231, 38, 232, 38, 233, 38, 234, 38, 235, 38, 236, 38, 237, 38, 238, 38, 24, 39, 25, 39, 26, 39, 27, 39, 28, 39, 29, 39, 30, 39, 31, 39, 32, 39, 69, 39, 70, 39, 71, 39, 72, 39, 73, 39, 74, 39, 75, 39, 76, 39, 77, 39, 96, 39, 97, 39, 107, 39, 108, 39, 109, 39, 110, 39, 111, 39, 112, 39, 113, 39, 114, 39, 125, 39, 126, 39, 127, 39, 128, 39, 129, 39, 130, 39, 131, 39, 132, 39, 133, 39, 134, 39, 135, 39, 136, 39, 137, 39, 138, 39, 139, 39, 143, 39, 144, 39, 145, 39, 146, 39, 147, 39, 148, 39, 151, 39, 152, 39, 153, 39, 154, 39, 155, 39, 156, 39, 162, 39, 163, 39, 164, 39, 165, 39, 166, 39, 167, 39, 169, 39, 170, 39, 171, 39, 172, 39, 173, 39, 174, 39, 175, 39, 176, 39, 177, 39, 178, 39, 179, 39, 181, 39, 182, 39, 183, 39, 184, 39, 185, 39, 186, 39, 190, 39, 191, 39, 192, 39, 193, 39, 194, 39, 195, 39, 196, 39, 197, 39, 198, 39, 199, 39, 200, 39, 201, 39, 202, 39, 203, 39, 204, 39, 207, 39, 208, 39, 209, 39, 210, 39, 211, 39, 212, 39, 213, 39, 214, 39, 215, 39, 216, 39, 217, 39, 218, 39, 219, 39, 220, 39, 221, 39, 222, 39, 226, 39, 227, 39, 228, 39, 229, 39, 230, 39, 231, 39, 232, 39, 233, 39, 234, 39, 235, 39, 236, 39, 237, 39, 238, 39, 22, 40, 23, 40, 24, 40, 25, 40, 26, 40, 27, 40, 28, 40, 29, 40, 30, 40, 31, 40, 67, 40, 68, 40, 69, 40, 70, 40, 71, 40, 72, 40, 73, 40, 74, 40, 75, 40, 76, 40, 96, 40, 97, 40, 108, 40, 109, 40, 110, 40, 111, 40, 112, 40, 113, 40, 114, 40, 115, 40, 116, 40, 117, 40, 125, 40, 126, 40, 127, 40, 128, 40, 129, 40, 130, 40, 131, 40, 132, 40, 133, 40, 134, 40, 135, 40, 136, 40, 137, 40, 138, 40, 139, 40, 140, 40, 143, 40, 144, 40, 145, 40, 146, 40, 147, 40, 148, 40, 151, 40, 152, 40, 153, 40, 154, 40, 155, 40, 156, 40, 162, 40, 163, 40, 164, 40, 165, 40, 166, 40, 167, 40, 169, 40, 170, 40, 171, 40, 172, 40, 173, 40, 174, 40, 175, 40, 176, 40, 177, 40, 178, 40, 179, 40, 181, 40, 182, 40, 183, 40, 184, 40, 185, 40, 186, 40, 189, 40, 190, 40, 191, 40, 192, 40, 193, 40, 194, 40, 195, 40, 196, 40, 197, 40, 198, 40, 199, 40, 200, 40, 201, 40, 202, 40, 203, 40, 204, 40, 207, 40, 208, 40, 209, 40, 210, 40, 211, 40, 212, 40, 213, 40, 214, 40, 215, 40, 216, 40, 217, 40, 218, 40, 219, 40, 220, 40, 221, 40, 222, 40, 223, 40, 226, 40, 227, 40, 228, 40, 229, 40, 230, 40, 231, 40, 232, 40, 233, 40, 234, 40, 235, 40, 236, 40, 237, 40, 238, 40, 239, 40, 21, 41, 22, 41, 23, 41, 24, 41, 25, 41, 26, 41, 27, 41, 28, 41, 29, 41, 30, 41, 66, 41, 67, 41, 68, 41, 69, 41, 70, 41, 71, 41, 72, 41, 73, 41, 74, 41, 96, 41, 97, 41, 108, 41, 109, 41, 110, 41, 111, 41, 112, 41, 113, 41, 114, 41, 115, 41, 116, 41, 117, 41, 118, 41, 119, 41, 124, 41, 125, 41, 126, 41, 127, 41, 128, 41, 129, 41, 130, 41, 135, 41, 136, 41, 137, 41, 138, 41, 139, 41, 140, 41, 143, 41, 144, 41, 145, 41, 146, 41, 147, 41, 148, 41, 151, 41, 152, 41, 153, 41, 154, 41, 155, 41, 156, 41, 162, 41, 163, 41, 164, 41, 165, 41, 166, 41, 167, 41, 171, 41, 172, 41, 173, 41, 174, 41, 175, 41, 181, 41, 182, 41, 183, 41, 184, 41, 185, 41, 186, 41, 189, 41, 190, 41, 191, 41, 192, 41, 193, 41, 194, 41, 199, 41, 200, 41, 201, 41, 202, 41, 203, 41, 204, 41, 205, 41, 207, 41, 208, 41, 209, 41, 210, 41, 211, 41, 212, 41, 213, 41, 217, 41, 218, 41, 219, 41, 220, 41, 221, 41, 222, 41, 223, 41, 226, 41, 227, 41, 228, 41, 229, 41, 230, 41, 234, 41, 235, 41, 236, 41, 237, 41, 238, 41, 239, 41, 19, 42, 20, 42, 21, 42, 22, 42, 23, 42, 24, 42, 25, 42, 26, 42, 27, 42, 28, 42, 64, 42, 65, 42, 66, 42, 67, 42, 68, 42, 69, 42, 70, 42, 71, 42, 72, 42, 73, 42, 96, 42, 97, 42, 109, 42, 110, 42, 111, 42, 112, 42, 113, 42, 114, 42, 115, 42, 116, 42, 117, 42, 118, 42, 119, 42, 120, 42, 124, 42, 125, 42, 126, 42, 127, 42, 128, 42, 129, 42, 136, 42, 137, 42, 138, 42, 139, 42, 140, 42, 141, 42, 143, 42, 144, 42, 145, 42, 146, 42, 147, 42, 148, 42, 151, 42, 152, 42, 153, 42, 154, 42, 155, 42, 156, 42, 162, 42, 163, 42, 164, 42, 165, 42, 166, 42, 167, 42, 171, 42, 172, 42, 173, 42, 174, 42, 175, 42, 181, 42, 182, 42, 183, 42, 184, 42, 185, 42, 186, 42, 188, 42, 189, 42, 190, 42, 191, 42, 192, 42, 193, 42, 200, 42, 201, 42, 202, 42, 203, 42, 204, 42, 205, 42, 207, 42, 208, 42, 209, 42, 210, 42, 211, 42, 212, 42, 218, 42, 219, 42, 220, 42, 221, 42, 222, 42, 223, 42, 226, 42, 227, 42, 228, 42, 229, 42, 230, 42, 231, 42, 232, 42, 233, 42, 234, 42, 235, 42, 236, 42, 237, 42, 238, 42, 17, 43, 18, 43, 19, 43, 20, 43, 21, 43, 22, 43, 23, 43, 24, 43, 25, 43, 26, 43, 27, 43, 62, 43, 63, 43, 64, 43, 65, 43, 66, 43, 67, 43, 68, 43, 69, 43, 70, 43, 71, 43, 72, 43, 96, 43, 97, 43, 110, 43, 111, 43, 112, 43, 113, 43, 114, 43, 115, 43, 116, 43, 117, 43, 118, 43, 119, 43, 120, 43, 121, 43, 124, 43, 125, 43, 126, 43, 127, 43, 128, 43, 129, 43, 136, 43, 137, 43, 138, 43, 139, 43, 140, 43, 141, 43, 143, 43, 144, 43, 145, 43, 146, 43, 147, 43, 148, 43, 151, 43, 152, 43, 153, 43, 154, 43, 155, 43, 156, 43, 162, 43, 163, 43, 164, 43, 165, 43, 166, 43, 167, 43, 171, 43, 172, 43, 173, 43, 174, 43, 175, 43, 181, 43, 182, 43, 183, 43, 184, 43, 185, 43, 186, 43, 188, 43, 189, 43, 190, 43, 191, 43, 192, 43, 193, 43, 200, 43, 201, 43, 202, 43, 203, 43, 204, 43, 205, 43, 207, 43, 208, 43, 209, 43, 210, 43, 211, 43, 212, 43, 218, 43, 219, 43, 220, 43, 221, 43, 222, 43, 223, 43, 226, 43, 227, 43, 228, 43, 229, 43, 230, 43, 231, 43, 232, 43, 233, 43, 234, 43, 235, 43, 236, 43, 1, 44, 15, 44, 16, 44, 17, 44, 18, 44, 19, 44, 20, 44, 21, 44, 22, 44, 23, 44, 24, 44, 25, 44, 26, 44, 45, 44, 46, 44, 59, 44, 60, 44, 61, 44, 62, 44, 63, 44, 64, 44, 65, 44, 66, 44, 67, 44, 68, 44, 69, 44, 70, 44, 71, 44, 96, 44, 97, 44, 113, 44, 114, 44, 115, 44, 116, 44, 117, 44, 118, 44, 119, 44, 120, 44, 121, 44, 122, 44, 124, 44, 125, 44, 126, 44, 127, 44, 128, 44, 129, 44, 136, 44, 137, 44, 138, 44, 139, 44, 140, 44, 141, 44, 143, 44, 144, 44, 145, 44, 146, 44, 147, 44, 148, 44, 151, 44, 152, 44, 153, 44, 154, 44, 155, 44, 156, 44, 162, 44, 163, 44, 164, 44, 165, 44, 166, 44, 167, 44, 171, 44, 172, 44, 173, 44, 174, 44, 175, 44, 181, 44, 182, 44, 183, 44, 184, 44, 185, 44, 186, 44, 188, 44, 189, 44, 190, 44, 191, 44, 192, 44, 193, 44, 200, 44, 201, 44, 202, 44, 203, 44, 204, 44, 205, 44, 207, 44, 208, 44, 209, 44, 210, 44, 211, 44, 212, 44, 218, 44, 219, 44, 220, 44, 221, 44, 222, 44, 223, 44, 227, 44, 228, 44, 229, 44, 230, 44, 231, 44, 232, 44, 233, 44, 234, 44, 235, 44, 236, 44, 237, 44, 238, 44, 0, 45, 1, 45, 2, 45, 3, 45, 12, 45, 13, 45, 14, 45, 15, 45, 16, 45, 17, 45, 18, 45, 19, 45, 20, 45, 21, 45, 22, 45, 23, 45, 24, 45, 45, 45, 46, 45, 47, 45, 48, 45, 57, 45, 58, 45, 59, 45, 60, 45, 61, 45, 62, 45, 63, 45, 64, 45, 65, 45, 66, 45, 67, 45, 68, 45, 69, 45, 96, 45, 97, 45, 116, 45, 117, 45, 118, 45, 119, 45, 120, 45, 121, 45, 122, 45, 124, 45, 125, 45, 126, 45, 127, 45, 128, 45, 129, 45, 136, 45, 137, 45, 138, 45, 139, 45, 140, 45, 141, 45, 143, 45, 144, 45, 145, 45, 146, 45, 147, 45, 148, 45, 151, 45, 152, 45, 153, 45, 154, 45, 155, 45, 156, 45, 162, 45, 163, 45, 164, 45, 165, 45, 166, 45, 167, 45, 171, 45, 172, 45, 173, 45, 174, 45, 175, 45, 181, 45, 182, 45, 183, 45, 184, 45, 185, 45, 186, 45, 188, 45, 189, 45, 190, 45, 191, 45, 192, 45, 193, 45, 200, 45, 201, 45, 202, 45, 203, 45, 204, 45, 205, 45, 207, 45, 208, 45, 209, 45, 210, 45, 211, 45, 212, 45, 218, 45, 219, 45, 220, 45, 221, 45, 222, 45, 223, 45, 228, 45, 229, 45, 230, 45, 231, 45, 232, 45, 233, 45, 234, 45, 235, 45, 236, 45, 237, 45, 238, 45, 0, 46, 1, 46, 2, 46, 3, 46, 4, 46, 5, 46, 6, 46, 7, 46, 8, 46, 9, 46, 10, 46, 11, 46, 12, 46, 13, 46, 14, 46, 15, 46, 16, 46, 17, 46, 18, 46, 19, 46, 20, 46, 21, 46, 22, 46, 23, 46, 45, 46, 46, 46, 47, 46, 48, 46, 49, 46, 50, 46, 51, 46, 52, 46, 53, 46, 54, 46, 55, 46, 56, 46, 57, 46, 58, 46, 59, 46, 60, 46, 61, 46, 62, 46, 63, 46, 64, 46, 65, 46, 66, 46, 67, 46, 68, 46, 96, 46, 97, 46, 107, 46, 108, 46, 109, 46, 110, 46, 111, 46, 112, 46, 117, 46, 118, 46, 119, 46, 120, 46, 121, 46, 122, 46, 124, 46, 125, 46, 126, 46, 127, 46, 128, 46, 129, 46, 136, 46, 137, 46, 138, 46, 139, 46, 140, 46, 141, 46, 143, 46, 144, 46, 145, 46, 146, 46, 147, 46, 148, 46, 151, 46, 152, 46, 153, 46, 154, 46, 155, 46, 156, 46, 162, 46, 163, 46, 164, 46, 165, 46, 166, 46, 167, 46, 171, 46, 172, 46, 173, 46, 174, 46, 175, 46, 181, 46, 182, 46, 183, 46, 184, 46, 185, 46, 186, 46, 188, 46, 189, 46, 190, 46, 191, 46, 192, 46, 193, 46, 200, 46, 201, 46, 202, 46, 203, 46, 204, 46, 205, 46, 207, 46, 208, 46, 209, 46, 210, 46, 211, 46, 212, 46, 218, 46, 219, 46, 220, 46, 221, 46, 222, 46, 223, 46, 230, 46, 231, 46, 232, 46, 233, 46, 234, 46, 235, 46, 236, 46, 237, 46, 238, 46, 239, 46, 1, 47, 2, 47, 3, 47, 4, 47, 5, 47, 6, 47, 7, 47, 8, 47, 9, 47, 10, 47, 11, 47, 12, 47, 13, 47, 14, 47, 15, 47, 16, 47, 17, 47, 18, 47, 19, 47, 20, 47, 21, 47, 46, 47, 47, 47, 48, 47, 49, 47, 50, 47, 51, 47, 52, 47, 53, 47, 54, 47, 55, 47, 56, 47, 57, 47, 58, 47, 59, 47, 60, 47, 61, 47, 62, 47, 63, 47, 64, 47, 65, 47, 66, 47, 96, 47, 97, 47, 107, 47, 108, 47, 109, 47, 110, 47, 111, 47, 112, 47, 117, 47, 118, 47, 119, 47, 120, 47, 121, 47, 122, 47, 124, 47, 125, 47, 126, 47, 127, 47, 128, 47, 129, 47, 130, 47, 135, 47, 136, 47, 137, 47, 138, 47, 139, 47, 140, 47, 141, 47, 143, 47, 144, 47, 145, 47, 146, 47, 147, 47, 148, 47, 151, 47, 152, 47, 153, 47, 154, 47, 155, 47, 156, 47, 161, 47, 162, 47, 163, 47, 164, 47, 165, 47, 166, 47, 167, 47, 171, 47, 172, 47, 173, 47, 174, 47, 175, 47, 181, 47, 182, 47, 183, 47, 184, 47, 185, 47, 186, 47, 188, 47, 189, 47, 190, 47, 191, 47, 192, 47, 193, 47, 194, 47, 199, 47, 200, 47, 201, 47, 202, 47, 203, 47, 204, 47, 205, 47, 207, 47, 208, 47, 209, 47, 210, 47, 211, 47, 212, 47, 218, 47, 219, 47, 220, 47, 221, 47, 222, 47, 223, 47, 225, 47, 226, 47, 227, 47, 228, 47, 229, 47, 230, 47, 234, 47, 235, 47, 236, 47, 237, 47, 238, 47, 239, 47, 2, 48, 3, 48, 4, 48, 5, 48, 6, 48, 7, 48, 8, 48, 9, 48, 10, 48, 11, 48, 12, 48, 13, 48, 14, 48, 15, 48, 16, 48, 17, 48, 18, 48, 19, 48, 20, 48, 47, 48, 48, 48, 49, 48, 50, 48, 51, 48, 52, 48, 53, 48, 54, 48, 55, 48, 56, 48, 57, 48, 58, 48, 59, 48, 60, 48, 61, 48, 62, 48, 63, 48, 64, 48, 65, 48, 96, 48, 97, 48, 107, 48, 108, 48, 109, 48, 110, 48, 111, 48, 112, 48, 113, 48, 114, 48, 116, 48, 117, 48, 118, 48, 119, 48, 120, 48, 121, 48, 122, 48, 125, 48, 126, 48, 127, 48, 128, 48, 129, 48, 130, 48, 131, 48, 132, 48, 133, 48, 134, 48, 135, 48, 136, 48, 137, 48, 138, 48, 139, 48, 140, 48, 143, 48, 144, 48, 145, 48, 146, 48, 147, 48, 148, 48, 151, 48, 152, 48, 153, 48, 154, 48, 155, 48, 156, 48, 157, 48, 158, 48, 159, 48, 160, 48, 161, 48, 162, 48, 163, 48, 164, 48, 165, 48, 166, 48, 167, 48, 171, 48, 172, 48, 173, 48, 174, 48, 175, 48, 176, 48, 177, 48, 178, 48, 181, 48, 182, 48, 183, 48, 184, 48, 185, 48, 186, 48, 189, 48, 190, 48, 191, 48, 192, 48, 193, 48, 194, 48, 195, 48, 196, 48, 197, 48, 198, 48, 199, 48, 200, 48, 201, 48, 202, 48, 203, 48, 204, 48, 207, 48, 208, 48, 209, 48, 210, 48, 211, 48, 212, 48, 218, 48, 219, 48, 220, 48, 221, 48, 222, 48, 223, 48, 225, 48, 226, 48, 227, 48, 228, 48, 229, 48, 230, 48, 231, 48, 234, 48, 235, 48, 236, 48, 237, 48, 238, 48, 239, 48, 3, 49, 4, 49, 5, 49, 6, 49, 7, 49, 8, 49, 9, 49, 10, 49, 11, 49, 12, 49, 13, 49, 14, 49, 15, 49, 16, 49, 17, 49, 18, 49, 48, 49, 49, 49, 50, 49, 51, 49, 52, 49, 53, 49, 54, 49, 55, 49, 56, 49, 57, 49, 58, 49, 59, 49, 60, 49, 61, 49, 62, 49, 63, 49, 96, 49, 97, 49, 108, 49, 109, 49, 110, 49, 111, 49, 112, 49, 113, 49, 114, 49, 115, 49, 116, 49, 117, 49, 118, 49, 119, 49, 120, 49, 121, 49, 122, 49, 125, 49, 126, 49, 127, 49, 128, 49, 129, 49, 130, 49, 131, 49, 132, 49, 133, 49, 134, 49, 135, 49, 136, 49, 137, 49, 138, 49, 139, 49, 140, 49, 143, 49, 144, 49, 145, 49, 146, 49, 147, 49, 148, 49, 152, 49, 153, 49, 154, 49, 155, 49, 156, 49, 157, 49, 158, 49, 159, 49, 160, 49, 161, 49, 162, 49, 163, 49, 164, 49, 165, 49, 166, 49, 167, 49, 171, 49, 172, 49, 173, 49, 174, 49, 175, 49, 176, 49, 177, 49, 178, 49, 179, 49, 181, 49, 182, 49, 183, 49, 184, 49, 185, 49, 186, 49, 189, 49, 190, 49, 191, 49, 192, 49, 193, 49, 194, 49, 195, 49, 196, 49, 197, 49, 198, 49, 199, 49, 200, 49, 201, 49, 202, 49, 203, 49, 204, 49, 207, 49, 208, 49, 209, 49, 210, 49, 211, 49, 212, 49, 218, 49, 219, 49, 220, 49, 221, 49, 222, 49, 223, 49, 226, 49, 227, 49, 228, 49, 229, 49, 230, 49, 231, 49, 232, 49, 233, 49, 234, 49, 235, 49, 236, 49, 237, 49, 238, 49, 239, 49, 4, 50, 5, 50, 6, 50, 7, 50, 8, 50, 9, 50, 10, 50, 11, 50, 12, 50, 13, 50, 14, 50, 15, 50, 16, 50, 49, 50, 50, 50, 51, 50, 52, 50, 53, 50, 54, 50, 55, 50, 56, 50, 57, 50, 58, 50, 59, 50, 60, 50, 61, 50, 96, 50, 97, 50, 108, 50, 109, 50, 110, 50, 111, 50, 112, 50, 113, 50, 114, 50, 115, 50, 116, 50, 117, 50, 118, 50, 119, 50, 120, 50, 121, 50, 126, 50, 127, 50, 128, 50, 129, 50, 130, 50, 131, 50, 132, 50, 133, 50, 134, 50, 135, 50, 136, 50, 137, 50, 138, 50, 139, 50, 143, 50, 144, 50, 145, 50, 146, 50, 147, 50, 148, 50, 152, 50, 153, 50, 154, 50, 155, 50, 156, 50, 157, 50, 158, 50, 159, 50, 160, 50, 161, 50, 162, 50, 163, 50, 164, 50, 165, 50, 166, 50, 167, 50, 171, 50, 172, 50, 173, 50, 174, 50, 175, 50, 176, 50, 177, 50, 178, 50, 179, 50, 181, 50, 182, 50, 183, 50, 184, 50, 185, 50, 186, 50, 190, 50, 191, 50, 192, 50, 193, 50, 194, 50, 195, 50, 196, 50, 197, 50, 198, 50, 199, 50, 200, 50, 201, 50, 202, 50, 203, 50, 207, 50, 208, 50, 209, 50, 210, 50, 211, 50, 212, 50, 218, 50, 219, 50, 220, 50, 221, 50, 222, 50, 223, 50, 226, 50, 227, 50, 228, 50, 229, 50, 230, 50, 231, 50, 232, 50, 233, 50, 234, 50, 235, 50, 236, 50, 237, 50, 238, 50, 239, 50, 5, 51, 6, 51, 7, 51, 8, 51, 9, 51, 10, 51, 11, 51, 12, 51, 13, 51, 50, 51, 51, 51, 52, 51, 53, 51, 54, 51, 55, 51, 56, 51, 57, 51, 58, 51, 96, 51, 97, 51, 109, 51, 110, 51, 111, 51, 112, 51, 113, 51, 114, 51, 115, 51, 116, 51, 117, 51, 118, 51, 119, 51, 120, 51, 127, 51, 128, 51, 129, 51, 130, 51, 131, 51, 132, 51, 133, 51, 134, 51, 135, 51, 136, 51, 137, 51, 138, 51, 143, 51, 144, 51, 145, 51, 146, 51, 147, 51, 148, 51, 153, 51, 154, 51, 155, 51, 156, 51, 157, 51, 158, 51, 159, 51, 160, 51, 161, 51, 162, 51, 163, 51, 164, 51, 165, 51, 166, 51, 167, 51, 172, 51, 173, 51, 174, 51, 175, 51, 176, 51, 177, 51, 178, 51, 179, 51, 181, 51, 182, 51, 183, 51, 184, 51, 185, 51, 186, 51, 191, 51, 192, 51, 193, 51, 194, 51, 195, 51, 196, 51, 197, 51, 198, 51, 199, 51, 200, 51, 201, 51, 202, 51, 207, 51, 208, 51, 209, 51, 210, 51, 211, 51, 212, 51, 218, 51, 219, 51, 220, 51, 221, 51, 222, 51, 223, 51, 227, 51, 228, 51, 229, 51, 230, 51, 231, 51, 232, 51, 233, 51, 234, 51, 235, 51, 236, 51, 237, 51, 238, 51, 8, 52, 9, 52, 53, 52, 54, 52, 96, 52, 97, 52, 111, 52, 112, 52, 113, 52, 114, 52, 115, 52, 116, 52, 117, 52, 118, 52, 119, 52, 128, 52, 129, 52, 130, 52, 131, 52, 132, 52, 133, 52, 134, 52, 135, 52, 136, 52, 137, 52, 143, 52, 144, 52, 145, 52, 146, 52, 147, 52, 148, 52, 154, 52, 155, 52, 156, 52, 157, 52, 158, 52, 159, 52, 160, 52, 161, 52, 162, 52, 163, 52, 164, 52, 165, 52, 166, 52, 167, 52, 173, 52, 174, 52, 175, 52, 176, 52, 177, 52, 178, 52, 179, 52, 181, 52, 182, 52, 183, 52, 184, 52, 185, 52, 186, 52, 192, 52, 193, 52, 194, 52, 195, 52, 196, 52, 197, 52, 198, 52, 199, 52, 200, 52, 201, 52, 207, 52, 208, 52, 209, 52, 210, 52, 211, 52, 212, 52, 218, 52, 219, 52, 220, 52, 221, 52, 222, 52, 223, 52, 228, 52, 229, 52, 230, 52, 231, 52, 232, 52, 233, 52, 234, 52, 235, 52, 236, 52, 237, 52, 96, 53, 97, 53, 114, 53, 115, 53, 116, 53, 131, 53, 132, 53, 133, 53, 134, 53, 157, 53, 158, 53, 159, 53, 195, 53, 196, 53, 197, 53, 198, 53, 231, 53, 232, 53, 233, 53, 234, 53, 96, 54, 97, 54, 96, 55, 97, 55]);
    const numLogoPts = LOGO_POINTS.length / 2;

    // 3 Volumetric 3D Layers: Front Face (0.42), Mid Lattice (0.0), Back Face (-0.42)
    const VOLUMETRIC_LAYERS = 3;
    const totalLogoParticles = numLogoPts * VOLUMETRIC_LAYERS;
    const ring1Count = 1200;
    const ring2Count = 1000;
    const dustCount = 800;

    // Three.js Scene & Perspective Camera (camera at z=18 for grand 3D perspective)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    scene.add(group);

    // Exact Circular Multi-Stop Glow Texture from Homepage
    function createDotTexture() {
      const cv = document.createElement('canvas');
      cv.width = 64;
      cv.height = 64;
      const ctx = cv.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.28, 'rgba(186,230,253,0.95)');
      grad.addColorStop(0.58, 'rgba(0,240,255,0.72)');
      grad.addColorStop(0.85, 'rgba(139,92,246,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const tex = new THREE.Texture(cv);
      tex.needsUpdate = true;
      return tex;
    }

    const dotTexture = createDotTexture();

    // 1. Volumetric Curved 3D Logo Particle Cloud
    const logoGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(totalLogoParticles * 3);
    const basePositions = new Float32Array(totalLogoParticles * 3);
    const velocities = new Float32Array(totalLogoParticles * 3);
    const colors = new Float32Array(totalLogoParticles * 3);
    const normU = new Float32Array(totalLogoParticles);
    const normV = new Float32Array(totalLogoParticles);
    const normHeight = new Float32Array(totalLogoParticles); // Vertical height 0 (bottom) to 1 (top)
    const shimmer = new Float32Array(totalLogoParticles);

    const GRID_W = 239;
    const GRID_H = 55;
    const aspect = GRID_W / GRID_H;

    function getDimensions() {
      const vFOV = (camera.fov * Math.PI) / 180;
      const visibleH = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const visibleW = visibleH * (window.innerWidth / window.innerHeight);
      const maxW = Math.min(14.2, visibleW * 0.78);
      const logoW = maxW;
      const logoH = logoW / aspect;
      return { logoW, logoH, visibleW, visibleH };
    }

    let { logoW, logoH, visibleW, visibleH } = getDimensions();

    const colorCyan = new THREE.Color(0x00f0ff);
    const colorSky = new THREE.Color(0x38bdf8);
    const colorWhite = new THREE.Color(0xffffff);

    // Populate Volumetric 3D Logo Particles
    // Layer 0: Front Face (+0.42), Layer 1: Mid Lattice (Jitter), Layer 2: Back Face (-0.42)
    for (let layer = 0; layer < VOLUMETRIC_LAYERS; layer++) {
      for (let p = 0; p < numLogoPts; p++) {
        const i = layer * numLogoPts + p;
        const gx = LOGO_POINTS[p * 2];
        const gy = LOGO_POINTS[p * 2 + 1];

        const u = gx / GRID_W;
        const v = gy / GRID_H;
        normU[i] = u;
        normV[i] = v;
        normHeight[i] = 1.0 - v; // 0 at bottom, 1 at top
        shimmer[i] = Math.random();

        // 3D Curved Cylindrical Arc (52-degree curve)
        const angle = (u - 0.5) * 0.92;
        const R_cyl = 14.5;
        const bx_cyl = R_cyl * Math.sin(angle);
        const bz_cyl = R_cyl * Math.cos(angle) - R_cyl;
        const by = (0.5 - v) * logoH + 0.55;

        // Volumetric depth per layer
        let zOffset = 0;
        let xJitter = 0;
        let yJitter = 0;
        if (layer === 0) {
          // Front face
          zOffset = 0.42 + (Math.random() - 0.5) * 0.08;
        } else if (layer === 1) {
          // Mid volumetric lattice
          zOffset = (Math.random() - 0.5) * 0.70;
          xJitter = (Math.random() - 0.5) * 0.06;
          yJitter = (Math.random() - 0.5) * 0.06;
        } else {
          // Back face
          zOffset = -0.42 + (Math.random() - 0.5) * 0.08;
        }

        const bx = bx_cyl + xJitter;
        const bz = bz_cyl + zOffset;
        const finalY = by + yJitter;

        basePositions[i * 3] = bx;
        basePositions[i * 3 + 1] = finalY;
        basePositions[i * 3 + 2] = bz;

        positions[i * 3] = bx;
        positions[i * 3 + 1] = finalY;
        positions[i * 3 + 2] = bz;

        // Initial dim twilight state
        colors[i * 3] = 0.03;
        colors[i * 3 + 1] = 0.08;
        colors[i * 3 + 2] = 0.16;
      }
    }

    logoGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    logoGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Crisp point size matching homepage clarity
    const pointSize = Math.max(0.082, Math.min(0.105, window.innerWidth / 13000));

    const logoMat = new THREE.PointsMaterial({
      size: pointSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      map: dotTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const logoSystem = new THREE.Points(logoGeo, logoMat);
    group.add(logoSystem);

    // 2. Dual Orbital Halo Rings (Tilted 3D Rings circling the 3D logo)
    // Ring 1: Primary wide orbit tilted around X
    const ring1Geo = new THREE.BufferGeometry();
    const ring1Pos = new Float32Array(ring1Count * 3);
    const ring1Colors = new Float32Array(ring1Count * 3);
    const ring1RadX = logoW * 0.64;
    const ring1RadY = logoH * 1.6;

    for (let i = 0; i < ring1Count; i++) {
      const angle = (i / ring1Count) * Math.PI * 2;
      const rJitter = (Math.random() - 0.5) * 0.35;
      const rx = Math.cos(angle) * (ring1RadX + rJitter);
      const ry = Math.sin(angle) * (ring1RadY + rJitter) * 0.38 + 0.55;
      const rz = Math.sin(angle) * (ring1RadX * 0.52) + (Math.random() - 0.5) * 0.35;

      ring1Pos[i * 3] = rx;
      ring1Pos[i * 3 + 1] = ry;
      ring1Pos[i * 3 + 2] = rz;

      ring1Colors[i * 3] = 0.0;
      ring1Colors[i * 3 + 1] = 0.55;
      ring1Colors[i * 3 + 2] = 0.85;
    }

    ring1Geo.setAttribute('position', new THREE.BufferAttribute(ring1Pos, 3));
    ring1Geo.setAttribute('color', new THREE.BufferAttribute(ring1Colors, 3));

    const ring1Mat = new THREE.PointsMaterial({
      size: pointSize * 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      map: dotTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const ring1System = new THREE.Points(ring1Geo, ring1Mat);
    ring1System.rotation.x = Math.PI * 0.18;
    ring1System.rotation.z = -Math.PI * 0.06;
    group.add(ring1System);

    // Ring 2: Secondary counter-orbit tilted around Y & Z
    const ring2Geo = new THREE.BufferGeometry();
    const ring2Pos = new Float32Array(ring2Count * 3);
    const ring2Colors = new Float32Array(ring2Count * 3);
    const ring2RadX = logoW * 0.72;
    const ring2RadY = logoH * 1.9;

    for (let i = 0; i < ring2Count; i++) {
      const angle = (i / ring2Count) * Math.PI * 2;
      const rJitter = (Math.random() - 0.5) * 0.4;
      const rx = Math.cos(angle) * (ring2RadX + rJitter);
      const ry = Math.sin(angle) * (ring2RadY + rJitter) * 0.32 + 0.55;
      const rz = Math.cos(angle) * (ring2RadX * 0.45) + (Math.random() - 0.5) * 0.4;

      ring2Pos[i * 3] = rx;
      ring2Pos[i * 3 + 1] = ry;
      ring2Pos[i * 3 + 2] = rz;

      ring2Colors[i * 3] = 0.4;
      ring2Colors[i * 3 + 1] = 0.25;
      ring2Colors[i * 3 + 2] = 0.85;
    }

    ring2Geo.setAttribute('position', new THREE.BufferAttribute(ring2Pos, 3));
    ring2Geo.setAttribute('color', new THREE.BufferAttribute(ring2Colors, 3));

    const ring2Mat = new THREE.PointsMaterial({
      size: pointSize * 0.80,
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      map: dotTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const ring2System = new THREE.Points(ring2Geo, ring2Mat);
    ring2System.rotation.x = -Math.PI * 0.22;
    ring2System.rotation.y = Math.PI * 0.12;
    group.add(ring2System);

    // 3. Ambient 3D Cosmic Particle Dust (Starfield Parity)
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * visibleW * 1.25;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * visibleH * 1.25;
      dustPos[i * 3 + 2] = -9 + Math.random() * 14;

      dustVel[i * 3] = (Math.random() - 0.5) * 0.006;
      dustVel[i * 3 + 1] = 0.003 + Math.random() * 0.007;
      dustVel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;

      const dc = Math.random() > 0.4 ? colorCyan : colorSky;
      dustColors[i * 3] = dc.r * 0.45;
      dustColors[i * 3 + 1] = dc.g * 0.45;
      dustColors[i * 3 + 2] = dc.b * 0.45;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: pointSize * 0.70,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      map: dotTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const dustSystem = new THREE.Points(dustGeo, dustMat);
    scene.add(dustSystem);

    // Resize Handler
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      const dims = getDimensions();
      logoW = dims.logoW;
      logoH = dims.logoH;
      visibleW = dims.visibleW;
      visibleH = dims.visibleH;

      for (let layer = 0; layer < VOLUMETRIC_LAYERS; layer++) {
        for (let p = 0; p < numLogoPts; p++) {
          const i = layer * numLogoPts + p;
          const u = normU[i];
          const v = normV[i];
          const angle = (u - 0.5) * 0.92;
          const R_cyl = 14.5;
          const bx_cyl = R_cyl * Math.sin(angle);
          const bz_cyl = R_cyl * Math.cos(angle) - R_cyl;
          const by = (0.5 - v) * logoH + 0.55;

          let zOffset = layer === 0 ? 0.42 : (layer === 1 ? (Math.random() - 0.5) * 0.70 : -0.42);
          basePositions[i * 3] = bx_cyl;
          basePositions[i * 3 + 1] = by;
          basePositions[i * 3 + 2] = bz_cyl + zOffset;
        }
      }
    }
    window.addEventListener('resize', onResize, { passive: true });

    // Interactive Hover Tracking (Responsive 3D Parallax & Proximity Dynamics)
    let targetMouseX = 0, targetMouseY = 0;
    let mouseX = 0, mouseY = 0;
    let isHovered = false;

    window.addEventListener('pointermove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      isHovered = true;
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      isHovered = false;
      targetMouseX = 0;
      targetMouseY = 0;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        isHovered = true;
      }
    }, { passive: true });

    // Loading Progress Simulation
    let progress = 0.0;
    let targetProgress = 0.0;
    let isComplete = false;
    let animId = null;
    const clock = new THREE.Clock();

    const isRepeat = !!sessionStorage.getItem('313_seen_loader');
    const totalDuration = isRepeat ? 1.0 : 2.2;
    try { sessionStorage.setItem('313_seen_loader', '1'); } catch (e) {}

    // Animation Loop
    function animate() {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Progress Calculation
      const rawLinear = Math.min(1.0, time / totalDuration);
      targetProgress = Math.min(1.0, rawLinear * (0.35 + 0.65 * rawLinear));
      if (document.readyState === 'complete' && time > (totalDuration * 0.75)) {
        targetProgress = 1.0;
      }

      progress += (targetProgress - progress) * 0.10;
      if (progress > 0.995 && targetProgress >= 1.0) {
        progress = 1.0;
      }

      // HUD Telemetry
      const pctVal = Math.floor(progress * 100);
      if (counterEl) counterEl.textContent = pctVal + '%';
      if (fillBarEl) fillBarEl.style.width = (progress * 100).toFixed(1) + '%';
      if (labelEl) {
        if (pctVal < 25) labelEl.textContent = 'INITIALIZING 3D QUANTUM CORE';
        else if (pctVal < 55) labelEl.textContent = 'CHARGING VOLUMETRIC MESH';
        else if (pctVal < 85) labelEl.textContent = 'ORCHESTRATING LIQUID PARTICLES';
        else if (pctVal < 100) labelEl.textContent = 'ALIGNING 3D INTERFACE';
        else labelEl.textContent = '313 ACTIVE — SYSTEM LIVE';
      }

      // Smooth mouse lerp (Deep 3D perspective camera tilt)
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      group.rotation.y = mouseX * 0.42;
      group.rotation.x = -mouseY * 0.32;

      ring1System.rotation.y = time * 0.32;
      ring2System.rotation.y = -time * 0.26;

      // Mouse position in 3D world space
      const cursorWorldX = mouseX * (visibleW * 0.48);
      const cursorWorldY = mouseY * (visibleH * 0.48);
      const rInfSq = 9.5;

      // ======================================================================
      // VERTICAL LOADING FILL (Rises from bottom 0% to top 100%)
      // ======================================================================
      const fillThreshold = progress * 1.14 - 0.06;
      const crestBand = 0.048;

      const posArr = logoGeo.attributes.position.array;
      const colArr = logoGeo.attributes.color.array;

      for (let i = 0; i < totalLogoParticles; i++) {
        const u = normU[i];
        const v = normV[i];
        const h = normHeight[i]; // Vertical height 0 (bottom) to 1 (top)

        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];

        // 3D Harmonic Wave Motion (Volumetric undulating ripples)
        const waveY = Math.sin(u * 7.5 - time * 3.4) * 0.28 + Math.cos(v * 6.0 + time * 2.2) * 0.16;
        const waveZ = Math.sin(u * 5.5 + v * 3.5 - time * 2.8) * 0.42;
        const waveX = Math.cos(u * 4.0 - time * 2.0) * 0.08;

        const tx = bx + waveX;
        const ty = by + waveY;
        const tz = bz + waveZ;

        let cx = posArr[i * 3];
        let cy = posArr[i * 3 + 1];
        let cz = posArr[i * 3 + 2];

        // Interactive Mouse Proximity Repulsion in 3D space
        if (isHovered) {
          const dx = cx - cursorWorldX;
          const dy = cy - cursorWorldY;
          const dSq = dx * dx + dy * dy;
          if (dSq < rInfSq && dSq > 0.001) {
            const dist = Math.sqrt(dSq);
            const force = (1.0 - dist / 3.1) * 1.8;
            velocities[i * 3] += (dx / dist) * force;
            velocities[i * 3 + 1] += (dy / dist) * force;
            velocities[i * 3 + 2] += force * 0.9;
          }
        }

        // Spring Damping
        velocities[i * 3] += (tx - cx) * 0.14;
        velocities[i * 3 + 1] += (ty - cy) * 0.14;
        velocities[i * 3 + 2] += (tz - cz) * 0.14;

        velocities[i * 3] *= 0.82;
        velocities[i * 3 + 1] *= 0.82;
        velocities[i * 3 + 2] *= 0.82;

        cx += velocities[i * 3];
        cy += velocities[i * 3 + 1];
        cz += velocities[i * 3 + 2];

        posArr[i * 3] = cx;
        posArr[i * 3 + 1] = cy;
        posArr[i * 3 + 2] = cz;

        // VERTICAL COLOR FILL: Rises from bottom (h=0) to top (h=1)
        const waveSurface = Math.sin(u * 14.0 + time * 4.2) * 0.038 + Math.cos(u * 8.0 - time * 2.5) * 0.020;
        const effectiveFill = fillThreshold + waveSurface;

        if (h > effectiveFill + crestBand) {
          // Uncharged: Deep cybernetic dark twilight indigo
          colArr[i * 3] = 0.03;
          colArr[i * 3 + 1] = 0.08;
          colArr[i * 3 + 2] = 0.16;
        } else if (Math.abs(h - effectiveFill) <= crestBand) {
          // Active Liquid Surface Crest: Blazing white-hot plasma energy spark!
          colArr[i * 3] = 1.0;
          colArr[i * 3 + 1] = 1.0;
          colArr[i * 3 + 2] = 1.0;
        } else {
          // Charged: Luminous electric cyan -> sky blue with white diamond shimmer
          let r = 0.0, g = 0.94, b = 1.0;
          if (shimmer[i] > 0.80) {
            r = 0.90; g = 0.98; b = 1.0; // brilliant diamond-white sparkle
          } else if (h > 0.5) {
            g = 0.84; b = 0.96; // soft electric sky transition
          }
          colArr[i * 3] = r;
          colArr[i * 3 + 1] = g;
          colArr[i * 3 + 2] = b;
        }
      }

      logoGeo.attributes.position.needsUpdate = true;
      logoGeo.attributes.color.needsUpdate = true;

      // Drift Ambient Cosmic Dust
      const dPosArr = dustGeo.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        dPosArr[i * 3] += dustVel[i * 3];
        dPosArr[i * 3 + 1] += dustVel[i * 3 + 1];
        dPosArr[i * 3 + 2] += dustVel[i * 3 + 2];

        if (dPosArr[i * 3 + 1] > visibleH * 0.72) {
          dPosArr[i * 3 + 1] = -visibleH * 0.72;
          dPosArr[i * 3] = (Math.random() - 0.5) * visibleW * 1.25;
        }
      }
      dustGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);

      // Completion Handler
      if (progress >= 1.0 && !isComplete) {
        isComplete = true;
        setTimeout(() => {
          loader.classList.add('is-loaded');
          window.dispatchEvent(new CustomEvent('313:loaded'));
          setTimeout(() => {
            if (animId) cancelAnimationFrame(animId);
            renderer.dispose();
          }, 900);
        }, 340);
      }
    }

    animate();
  }

  initSiteLoader();
})();
