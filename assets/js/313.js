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

  // 8. Natural Scroll-Linked Text Scrub & Highlight (Word by Word illumination)
  function initNaturalTextScrub() {
    const scrubEls = document.querySelectorAll('[data-scrub]');
    scrubEls.forEach((textEl) => {
      const wordSpans = textEl.querySelectorAll('.sw');
      if (!wordSpans.length) return;
      const totalWords = wordSpans.length;

      function onScroll() {
        const rect = textEl.getBoundingClientRect();
        const vh = window.innerHeight;
        // Progress as text moves from entering lower viewport (0.0) to center of viewport (1.0)
        const progress = Math.max(0, Math.min(1, (vh * 0.85 - rect.top) / (vh * 0.45)));
        const litCount = Math.floor(progress * (totalWords + 1));
        wordSpans.forEach((w, i) => {
          w.classList.toggle('on', i < litCount);
        });
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
})();
