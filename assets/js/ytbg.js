/*
 * Background video from YouTube (demo only).
 * Usage: <div class="ytbg" data-yt="VIDEO_ID" data-yt-mode="auto|hover"><img class="ytbg__poster" ...></div>
 * auto  = starts when visible; hover = starts on pointer enter / focus (tap on touch).
 * Final site: replace with self-hosted <video> files supplied by the brands.
 */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const buildSrc = (id) =>
    'https://www.youtube-nocookie.com/embed/' + id +
    '?autoplay=1&mute=1&loop=1&playlist=' + id +
    '&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1' +
    '&origin=' + encodeURIComponent(location.origin);

  // Only reveal a frame once YouTube reports it is actually playing (state 1),
  // so a blocked autoplay never shows YouTube's own thumbnail and play button.
  const frames = new Map();
  window.addEventListener('message', (e) => {
    if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
    let data;
    try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (_) { return; }
    const state = data && data.info && data.info.playerState;
    if (state === undefined) return;
    frames.forEach((el, frame) => {
      if (frame.contentWindow === e.source) el.classList.toggle('is-live', state === 1);
    });
  });

  // Touch devices: YouTube forces its own title bar and controls into the embed,
  // so phones get the poster with a slow zoom instead. Self-hosted MP4s will fix this.
  const touch = window.matchMedia('(hover: none)').matches;

  const start = (el) => {
    if (touch) { el.classList.add('is-static'); return; }
    if (el.dataset.ytStarted) { el.classList.add('is-playing'); return; }
    el.dataset.ytStarted = '1';
    const frame = document.createElement('iframe');
    frame.className = 'ytbg__frame';
    frame.src = buildSrc(el.dataset.yt);
    frame.title = el.dataset.ytTitle || 'Background video';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    el.appendChild(frame);
    frames.set(frame, el);
    el.classList.add('is-playing');
    frame.addEventListener('load', () => {
      frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: frames.size }), '*');
    });
  };

  const stop = (el) => el.classList.remove('is-playing');
  window.FAHyt = { start, stop };

  const init = () => {
    if (reduceMotion) return;
    const autoEls = document.querySelectorAll('.ytbg[data-yt-mode="auto"]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { start(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    autoEls.forEach((el) => io.observe(el));

    document.querySelectorAll('[data-yt-trigger]').forEach((trigger) => {
      const el = trigger.querySelector('.ytbg[data-yt-mode="hover"]');
      if (!el) return;
      trigger.addEventListener('pointerenter', () => start(el));
      trigger.addEventListener('focusin', () => start(el));
      trigger.addEventListener('pointerleave', () => stop(el));
      trigger.addEventListener('focusout', () => stop(el));
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Small shared helpers for the style demos */
(function () {
  const init = () => {
    // reveal on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    // header state on scroll
    const header = document.querySelector('[data-header]');
    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // mobile menu
    const toggle = document.querySelector('[data-menu-toggle]');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = document.body.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
