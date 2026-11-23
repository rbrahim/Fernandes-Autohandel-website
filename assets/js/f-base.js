/*
 * Shared behaviour for the F family:
 *  - block-aware nav theme + side index
 *  - section paging: one wheel step / PageDown / Space moves to the next full-screen block
 *    (blocks taller than the screen scroll normally until their edge)
 *  - nav hides while scrolling down and returns on scroll up or when the pointer nears the top
 */
(function () {
  const init = () => {
    const body = document.body;
    const blocks = [...document.querySelectorAll('[data-block]')];
    const dots = document.querySelector('.dots');
    if (dots) {
      blocks.forEach((b) => {
        const a = document.createElement('a');
        a.href = '#' + b.id;
        a.innerHTML = '<span>' + b.dataset.block + '</span><i></i>';
        dots.appendChild(a);
      });
    }
    const links = dots ? [...dots.querySelectorAll('a')] : [];

    /* ---------- chrome follows the block underneath ---------- */
    const pick = () => {
      const probe = 40;
      let under = null, best = null, bestArea = 0;
      blocks.forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) under = b;
        const area = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
        if (area > bestArea) { bestArea = area; best = b; }
      });
      body.dataset.on = under && under.classList.contains('block--dark') ? 'dark' : 'light';
      links.forEach((l, i) => l.classList.toggle('on', blocks[i] === best));
    };

    /* ---------- auto-hiding nav ---------- */
    let lastY = scrollY;
    const navState = () => {
      const y = scrollY;
      const menuOpen = body.classList.contains('menu-open') || document.querySelector('.mega.open');
      if (y < 80 || menuOpen) body.classList.remove('nav-hidden');
      else if (y > lastY + 4) body.classList.add('nav-hidden');
      else if (y < lastY - 4) body.classList.remove('nav-hidden');
      lastY = y;
    };
    addEventListener('pointermove', (e) => { if (e.clientY < 90) body.classList.remove('nav-hidden'); }, { passive: true });

    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; pick(); navState(); });
    }, { passive: true });
    addEventListener('resize', pick);
    pick();
    setInterval(pick, 600);   // rAF can be throttled in background tabs; keep the chrome right anyway

    document.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => body.classList.remove('menu-open')));

    /* ---------- section paging ---------- */
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enabled = () => fine.matches && innerWidth >= 900 && blocks.length > 1;
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    let lockUntil = 0, lastWheel = 0, lastPage = 0, animating = false;

    // Own fixed-duration animation (not the browser's smooth scroll, whose speed varies),
    // so every page step lands exactly on the block edge and ends at a known moment.
    const DUR = reduce ? 0 : 700;
    let anim = 0;
    const jump = (y) => scrollTo({ top: y, behavior: 'instant' });
    const scrollToY = (y) => {
      cancelAnimationFrame(anim);
      clearTimeout(scrollToY.t);
      animating = true;
      lastPage = performance.now();
      body.classList.toggle('nav-hidden', y > 80);
      const from = scrollY, d = y - from, t0 = performance.now();
      const done = () => { jump(y); animating = false; lockUntil = performance.now() + 150; };
      if (!DUR) { done(); return; }
      const step = (now) => {
        const p = Math.min(1, (now - t0) / DUR);
        const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;   // easeInOutCubic
        jump(from + d * e);
        if (p < 1) anim = requestAnimationFrame(step); else done();
      };
      anim = requestAnimationFrame(step);
      scrollToY.t = setTimeout(() => { if (animating) { cancelAnimationFrame(anim); done(); } }, DUR + 150);   // rAF can stall on busy pages
    };

    // Which block holds the top of the viewport, and where are its edges?
    // 40px tolerance: a smooth scroll that is still settling counts as "at the block".
    const current = () => {
      const y = scrollY + 40;
      let idx = 0;
      blocks.forEach((b, i) => { if (top(b) <= y) idx = i; });
      const b = blocks[idx];
      return { idx, start: top(b), end: top(b) + b.offsetHeight };
    };

    // Returns the target scroll position, or null to let the browser scroll natively.
    const target = (dir) => {
      const { idx, start, end } = current();
      const y = scrollY;
      const tall = end - start > innerHeight + 4;
      if (dir > 0) {
        if (tall && y + innerHeight < end - 4) return null;          // still content in this block
        const next = blocks[idx + 1];
        return next ? top(next) : null;                               // last block: native scroll to the footer
      }
      if (y > start + 40) {
        if (tall && y - start > innerHeight) return null;           // deep inside a tall block: scroll natively
        return start;                                                 // back to the start of this block
      }
      const prev = blocks[idx - 1];
      if (!prev) return null;
      const pStart = top(prev), pEnd = pStart + prev.offsetHeight;
      return pEnd - pStart > innerHeight + 4 ? pEnd - innerHeight : pStart;   // tall previous block: land on its end
    };

    const ignore = (el) => el && el.closest && el.closest('.mega, textarea, select, input[type="range"], [data-native-scroll]');

    addEventListener('wheel', (e) => {
      if (!enabled() || e.ctrlKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;            // horizontal swipe: rails etc.
      if (ignore(e.target) || body.classList.contains('menu-open')) return;
      const now = performance.now();
      const prev = lastWheel;
      lastWheel = now;
      // One gesture = one page: ignore everything until the wheel/trackpad has been quiet for 200 ms
      const sameGesture = now - prev < 200 && prev >= lastPage;
      if (animating || now < lockUntil || sameGesture) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < 4) return;
      const t = target(Math.sign(e.deltaY));
      if (t === null || Math.abs(t - scrollY) < 2) return;
      e.preventDefault();
      scrollToY(t);
    }, { passive: false });

    addEventListener('keydown', (e) => {
      if (!enabled() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName) && e.key === ' ') return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      const dir = { PageDown: 1, PageUp: -1, ' ': e.shiftKey ? -1 : 1, ArrowDown: 0, ArrowUp: 0 }[e.key];
      if (!dir) return;
      const t = target(dir);
      if (t === null) return;
      e.preventDefault();
      scrollToY(t);
    });

    // side index + in-page links use the same smooth paging
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      scrollToY(top(el));
      history.replaceState(null, '', '#' + id);
    }));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
