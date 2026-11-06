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

  // 7. Mechanical Odometer Rolling Cylinder Animation (Exact 313 parity - Silky Smooth)
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
      const delay = elIndex * 120;
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

      // Intersection Observer: Start smoothly when scroll reaches the element
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              el.classList.add('is-on');
            });
          } else if (entry.boundingClientRect.top > (window.innerHeight || document.documentElement.clientHeight)) {
            // Reset when scrolled back above, so scrolling down replays smoothly
            el.classList.remove('is-on');
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px'
      });
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
        // Responsive smooth momentum lerp
        currentProgress += (targetProgress - currentProgress) * 0.12;

        wordSpans.forEach((w, i) => {
          const wordThreshold = i / totalWords;
          const wordWindow = 1.4 / totalWords;
          const wordProg = Math.max(0, Math.min(1, (currentProgress - wordThreshold) / wordWindow));

          if (wordProg >= 0.7) {
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
        // Start scrub when top enters comfortably (78% of viewport)
        // and complete highlight when centered in viewport (35% from top), before ever reaching top edge!
        const scrollStart = vh * 0.78;
        const scrollDistance = vh * 0.48;
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
  initFaqAccordion();

  // 13. Potadot-Style Interactive Services Expandable Accordion ([data-sx-root])
  // Reverse-engineered 1:1 from Potadot (https://potadot.com.my)
  function initSxServices() {
    const roots = document.querySelectorAll('[data-sx-root]');
    roots.forEach((root) => {
      const items = Array.from(root.querySelectorAll('.sx-item'));
      if (!items.length) return;
      let cur = 0;
      let userInteracted = false;
      let autoTimer = null;

      function setActive(idx) {
        cur = (idx + items.length) % items.length;
        items.forEach((item, i) => {
          const isOpen = i === cur;
          item.classList.toggle('is-open', isOpen);
          item.setAttribute('aria-expanded', String(isOpen));
        });
      }

      let nextAllowedTime = 0;
      let pendingHoverIdx = -1;
      let pendingTimer = null;

      function triggerItem(idx) {
        if (idx !== cur) {
          setActive(idx);
          nextAllowedTime = performance.now() + 620; // 620ms smooth transition buffer
        }
      }

      items.forEach((item, idx) => {
        item.addEventListener('pointermove', (e) => {
          if (e.pointerType !== 'mouse' || idx === cur) return;
          userInteracted = true;
          const now = performance.now();
          if (now >= nextAllowedTime) {
            clearTimeout(pendingTimer);
            pendingHoverIdx = -1;
            triggerItem(idx);
            return;
          }
          if (pendingHoverIdx !== idx) {
            pendingHoverIdx = idx;
            clearTimeout(pendingTimer);
            pendingTimer = setTimeout(() => {
              pendingHoverIdx = -1;
              if (item.matches(':hover')) triggerItem(idx);
            }, nextAllowedTime - now + 20);
          }
        });

        item.addEventListener('pointerleave', () => {
          if (pendingHoverIdx === idx) {
            clearTimeout(pendingTimer);
            pendingHoverIdx = -1;
          }
        });

        item.addEventListener('focusin', () => {
          userInteracted = true;
          triggerItem(idx);
        });

        item.addEventListener('click', (e) => {
          if (!e.target.closest('a')) {
            userInteracted = true;
            triggerItem(idx);
          }
        });
      });

      // Auto-cycle through items if user has not interacted
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          clearInterval(autoTimer);
          if (entries[0] && entries[0].isIntersecting && window.innerWidth > 900) {
            autoTimer = setInterval(() => {
              if (userInteracted) {
                clearInterval(autoTimer);
              } else {
                setActive(cur + 1);
              }
            }, 5200);
          }
        }, { threshold: 0.35 }).observe(root);
      }

      setActive(0);
    });
  }
  initSxServices();

  // 14. Cybernetic Mouse Cursor & Staggered Trail System (Reference Parity)
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
  // Orizon Lab "The Eclipse" 3D Kinetic Ring Loader
  // Tailored to 313 Tech Solutions Theme (Polished Obsidian Titanium, Electric Cyan & Violet)
  // Welcoming visitor messaging + Studio Lighting & Metallic Iridescent Waves
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

    // Parameters matching Orizon Lab "Eclipse" with 313 Tech Solutions Theme
    const cfg = {
      count: 48,
      spread: 48,
      position: 60,
      separation: 180,
      spinSpeed: 0.48,
      waveSpeed: 0.14,
      growth: 0.08,
      width: 1.05,
      thickness: 1.05,
      spacing: 0.95,
      tilt: 14,
      tiltAmount: 0.25,
      tiltSpeed: 0.48,
      roughness: 0.22,
      baseColor: new THREE.Color('#0a1122'),       // Deep polished obsidian titanium
      accentCyan: new THREE.Color('#00f0ff'),      // Signature electric cyan
      accentViolet: new THREE.Color('#8b5cf6'),    // Signature deep violet
      accentEmerald: new THREE.Color('#00e599'),   // Signature emerald
      accentWhite: new THREE.Color('#ffffff'),     // Pure white specular flare
      cameraPos: [0, 2.1745, 8.5225],
      cameraTarget: [0, -0.12, 0]
    };

    // Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(cfg.cameraPos[0], cfg.cameraPos[1], cfg.cameraPos[2]);
    const target = new THREE.Vector3(cfg.cameraTarget[0], cfg.cameraTarget[1], cfg.cameraTarget[2]);
    camera.lookAt(target);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const mainGroup = new THREE.Group();
    mainGroup.rotation.set(0.20, 0.38, 0.10);
    scene.add(mainGroup);

    // 313 Cybernetic Studio Multi-Point Lighting System
    const ambientLight = new THREE.AmbientLight(0x050d1a, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    const cyanLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    cyanLight.position.set(-6, 4, 4);
    scene.add(cyanLight);

    const violetLight = new THREE.DirectionalLight(0x8b5cf6, 1.8);
    violetLight.position.set(6, -4, -4);
    scene.add(violetLight);

    const rimLight = new THREE.DirectionalLight(0x00e599, 1.2);
    rimLight.position.set(0, -6, -5);
    scene.add(rimLight);

    const centerGlow = new THREE.PointLight(0x00f0ff, 2.2, 16);
    centerGlow.position.set(0, 0, 1.2);
    mainGroup.add(centerGlow);

    // Build Single Beveled Blade Geometry (Orizon Mathematical Squircle Profile)
    function buildBladeGeometry() {
      const positions = [];
      const indices = [];
      const rings = 18;
      const segs = 36;
      const c = 0.36; // squircle curve power
      const m = 0.62;
      const f = 0.74;

      function sgnPow(val, exp) {
        return Math.sign(val) * Math.pow(Math.abs(val), exp);
      }

      for (let h = 0; h <= rings; h++) {
        for (let d = 0; d <= segs; d++) {
          const p = (h / rings) * Math.PI;
          const g = (d / segs) * Math.PI * 2;
          const sinP = Math.pow(Math.sin(p), 0.3);
          const x = m * sinP * sgnPow(Math.cos(g), c);
          const y = f * sinP * sgnPow(Math.sin(g), c);
          const z = 0.065 * Math.cos(p);
          positions.push(x, y, z);
        }
      }

      for (let h = 0; h < rings; h++) {
        for (let d = 0; d < segs; d++) {
          const p = h * (segs + 1) + d;
          const g = p + segs + 1;
          indices.push(p, g, p + 1);
          indices.push(g, g + 1, p + 1);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }

    const bladeGeo = buildBladeGeometry();

    // Material: Brushed Reflective Metallic Blade matching 313 Cybernetic Theme
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.90,
      roughness: cfg.roughness,
      envMapIntensity: 1.4
    });

    const instancedMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, cfg.count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mainGroup.add(instancedMesh);

    // Glowing Inner Energy Aperture in Center
    const innerRingGeo1 = new THREE.RingGeometry(0.32, 0.36, 64);
    const innerRingMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const innerRing1 = new THREE.Mesh(innerRingGeo1, innerRingMat1);
    innerRing1.rotation.x = Math.PI / 2;
    mainGroup.add(innerRing1);

    const innerRingGeo2 = new THREE.RingGeometry(0.52, 0.55, 64);
    const innerRingMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const innerRing2 = new THREE.Mesh(innerRingGeo2, innerRingMat2);
    innerRing2.rotation.x = Math.PI / 2;
    mainGroup.add(innerRing2);

    // Mathematical Wave & Accent Calculations (Exact Orizon Algorithms)
    function vl(i, e) {
      return Math.atan2(Math.sin(i - e), Math.cos(i - e));
    }

    function calculateWaves(i, phase, s) {
      const n = vl(i, (s.position * Math.PI) / 180 + phase);
      const spreadRad = ((s.spread * Math.PI) / 180) * 0.45;
      const wave1 = Math.exp(-0.5 * Math.pow(n / spreadRad, 2));
      const a = vl(n, (s.separation * Math.PI) / 180);
      const wave2 = Math.exp(-0.5 * Math.pow(a / spreadRad, 2));
      return { wave1, wave2, waveFactor: Math.max(wave1, wave2) };
    }

    // Temporary Math Objects for Performance (Zero GC)
    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();
    const basisMat = new THREE.Matrix4();
    const radial = new THREE.Vector3();
    const normal = new THREE.Vector3(0, 0, 1);
    const tangent = new THREE.Vector3();

    // Mouse Tracking for Interactive 3D Parallax Tilt
    let targetMouseX = 0, targetMouseY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener('pointermove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize, { passive: true });

    // Progress & Timing Simulation
    let progress = 0.0;
    let targetProgress = 0.0;
    let isComplete = false;
    let animId = null;
    const clock = new THREE.Clock();

    const isRepeat = !!sessionStorage.getItem('313_seen_loader');
    const totalDuration = isRepeat ? 2.2 : 3.6;
    try { sessionStorage.setItem('313_seen_loader', '1'); } catch (e) {}

    let spin = 0;
    let phase = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.06);
      const time = clock.getElapsedTime();

      // Progress Calculation
      const rawLinear = Math.min(1.0, time / totalDuration);
      targetProgress = Math.min(1.0, rawLinear * (0.35 + 0.65 * rawLinear));
      if (document.readyState === 'complete' && time > (totalDuration * 0.82)) {
        targetProgress = 1.0;
      }

      progress += (targetProgress - progress) * 0.08;
      if (progress > 0.995 && targetProgress >= 1.0) {
        progress = 1.0;
      }

      // WELCOMING VISITOR MESSAGING IN HUD
      const pctVal = Math.floor(progress * 100);
      if (counterEl) counterEl.textContent = pctVal + '%';
      if (fillBarEl) fillBarEl.style.width = (progress * 100).toFixed(1) + '%';
      if (labelEl) {
        if (pctVal < 25) labelEl.textContent = 'WELCOME TO 313 TECH SOLUTIONS';
        else if (pctVal < 55) labelEl.textContent = 'CRAFTING IMMERSIVE EXPERIENCES';
        else if (pctVal < 85) labelEl.textContent = 'PREPARING DIGITAL TRANSFORMATION';
        else if (pctVal < 100) labelEl.textContent = 'WELCOME ABOARD';
        else labelEl.textContent = 'WELCOME TO 313 — SYSTEM ACTIVE';
      }

      // Update Spin & Wave Phase
      const In = Math.PI * 2;
      spin = ((spin + dt * cfg.spinSpeed * 0.5) % In + In) % In;
      phase = ((phase + dt * cfg.waveSpeed * 0.72) % In + In) % In;

      // Mouse Parallax Tilt
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      mainGroup.rotation.y = 0.38 + mouseX * 0.25;
      mainGroup.rotation.x = 0.20 - mouseY * 0.20;

      innerRing1.rotation.z = time * 0.45;
      innerRing2.rotation.z = -time * 0.35;

      // Ring Radius Parameters
      const ringRadius = 1.35 * cfg.spacing;
      const count = cfg.count;

      for (let i = 0; i < count; i++) {
        const bladeAngle = (i / count) * In + spin;
        const { wave1, wave2, waveFactor } = calculateWaves(bladeAngle, phase, cfg);
        const growthDelta = cfg.growth * waveFactor;
        const tiltAngle = (cfg.tilt + cfg.tiltAmount * waveFactor * 25) * (Math.PI / 180);

        const w = cfg.width * (1 + growthDelta);
        const h = 1 + growthDelta * 0.65;
        const th = cfg.thickness;
        const dist = ringRadius + 0.62 * (w - 1);

        // Position on Ring
        radial.set(Math.cos(bladeAngle), Math.sin(bladeAngle), 0);
        tangent.set(Math.sin(bladeAngle), -Math.cos(bladeAngle), 0);

        basisMat.makeBasis(radial, normal, tangent);
        dummy.quaternion.setFromRotationMatrix(basisMat);
        dummy.rotateX(tiltAngle + growthDelta * 0.14);
        dummy.rotateY(0.14);

        dummy.position.set(
          dist * Math.cos(bladeAngle),
          dist * Math.sin(bladeAngle),
          0.04 * Math.sin(bladeAngle * 2 + time * 1.5)
        );
        dummy.scale.set(w, h, th);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(i, dummy.matrix);

        // 313 Theme Color Interpolation:
        // Polished Obsidian Titanium base -> Electric Cyan (Wave 1) & Neon Violet/Emerald (Wave 2)
        tempColor.copy(cfg.baseColor);

        if (wave1 > 0.01) {
          tempColor.lerp(cfg.accentCyan, Math.min(1, wave1 * 1.35));
        }
        if (wave2 > 0.01) {
          const violetEmerald = cfg.accentViolet.clone().lerp(cfg.accentEmerald, (Math.sin(bladeAngle) + 1) * 0.35);
          tempColor.lerp(violetEmerald, Math.min(1, wave2 * 1.35));
        }

        // Diamond-white specular highlight at wave crests
        if (waveFactor > 0.72) {
          const crestSurge = (waveFactor - 0.72) / 0.28;
          tempColor.lerp(cfg.accentWhite, crestSurge * 0.55);
        }

        // Global surge when approaching 100%
        if (progress > 0.85) {
          const surge = (progress - 0.85) / 0.15;
          tempColor.lerp(cfg.accentCyan, surge * 0.45);
        }

        instancedMesh.setColorAt(i, tempColor);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

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
            bladeGeo.dispose();
            bladeMat.dispose();
          }, 900);
        }, 350);
      }
    }

    animate();
  }

  initSiteLoader();
})();
