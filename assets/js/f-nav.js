/*
 * Shared nav: builds the Drive/Work mega menus from FAH_MODELS and handles open/close.
 * Page settings on <body>:
 *   data-home="f1-switch.html"   where homepage anchors live ("" = this page)
 *   data-img="../assets/img/"    image base path
 * A model with a `page` field links to its own model page; others link to the world on the homepage.
 */
(function () {
  const MODELS = window.FAH_MODELS || [];
  const WORLDS = window.FAH_WORLDS || {};
  const body = document.body;
  const HOME = body.dataset.home || '';
  const IMG = body.dataset.img || '../assets/img/';
  const touch = matchMedia('(hover: none)').matches;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const price = (m) => (m.from ? 'USD ' + m.from.toLocaleString('en-US') + '*' : 'On request');
  const href = (m) => m.page || HOME + '#' + m.world;
  const home = (anchor) => HOME + anchor;
  window.FAH = Object.assign(window.FAH || {}, { esc, price, href, IMG, MODELS, WORLDS });

  const megaHTML = (world) => {
    const groups = WORLDS[world].groups;
    const inWorld = MODELS.filter((m) => m.world === world);
    const cols = groups.map((g) => {
      const items = inWorld.filter((m) => m.group === g);
      const one = items.length <= 4 && groups.length > 2;
      return `<div class="mega__col ${one ? 'mega__col--one' : ''}"><h5>${esc(g)}<span>${items.length}</span></h5><div class="mega__list">` +
        items.map((m) => `<a class="mega__model" href="${href(m)}" data-model="${m.id}"><img src="${IMG + m.img}" alt="" style="object-position:${m.pos}"><div><b>${esc(m.name)}</b><span>${esc(m.type)} · ${esc(price(m))}</span></div></a>`).join('') +
        '</div></div>';
    }).join('');
    const feat = MODELS.find((m) => m.id === (world === 'drive' ? 'aion-v' : 'd-max'));
    const links = world === 'drive'
      ? `<a class="mega__link" href="${home('#drive')}">All Drive models <span>→</span></a><a class="mega__link" href="#">Compare models <span>⇄</span></a><a class="mega__link" href="used.html">Used cars <span>→</span></a><a class="mega__link mega__link--accent" href="${home('#contact')}">Book a test drive <span>↗</span></a>`
      : `<a class="mega__link" href="${home('#work')}">All Work vehicles <span>→</span></a><a class="mega__link" href="rental-lease.html#rental">Rental fleet <span>→</span></a><a class="mega__link" href="rental-lease.html#business">Fleet &amp; business <span>→</span></a><a class="mega__link mega__link--accent" href="${home('#contact')}">Fernandes Truck Center <span>↗</span></a>`;
    return `<div class="mega__cols" style="--cols:${groups.length}">${cols}</div>` +
      `<div class="mega__side"><a class="mega__feature" href="${href(feat)}" data-default="${feat.id}" data-label="${world === 'drive' ? 'New · Electric' : 'Best seller'}"><span class="mega__preview-tag">Preview</span><img src="${IMG + feat.img}" alt="" style="object-position:${feat.pos}"><div><span class="mono">${world === 'drive' ? 'New · Electric' : 'Best seller'}</span><b>${esc(feat.brand)} ${esc(feat.name)}</b><span>from ${esc(price(feat))}</span></div></a>${links}</div>`;
  };

  // The big card on the right previews whichever model the pointer is on.
  const previewIn = (mega) => {
    const card = mega.querySelector('.mega__feature');
    if (!card) return;
    const img = card.querySelector('img'), label = card.querySelector('.mono'), name = card.querySelector('b'), from = card.querySelector('div > span:last-child');
    let current = card.dataset.default, timer;
    const show = (id, isPreview) => {
      const m = MODELS.find((x) => x.id === id);
      if (!m || id === current) { card.classList.toggle('is-preview', isPreview && !!m); return; }
      current = id;
      card.classList.add('is-swapping');
      clearTimeout(timer);
      timer = setTimeout(() => {
        img.src = IMG + m.img; img.style.objectPosition = m.pos;
        label.textContent = isPreview ? m.type : card.dataset.label;
        name.textContent = m.brand + ' ' + m.name;
        from.textContent = 'from ' + price(m);
        card.href = href(m);
        card.classList.toggle('is-preview', isPreview);
        img.decode ? img.decode().catch(() => {}).then(() => card.classList.remove('is-swapping')) : card.classList.remove('is-swapping');
      }, 120);
    };
    mega.querySelectorAll('.mega__model').forEach((a) => a.addEventListener('pointerenter', () => show(a.dataset.model, true)));
    mega.querySelector('.mega__cols').addEventListener('pointerleave', () => show(card.dataset.default, false));
  };

  const init = () => {
    const megas = {};
    document.querySelectorAll('[data-mega]').forEach((el) => { el.innerHTML = megaHTML(el.dataset.mega); megas[el.dataset.mega] = el; if (!touch) previewIn(el); });
    const triggers = [...document.querySelectorAll('.nav__item[data-menu]')];
    let closeTimer;
    const openMega = (w) => {
      clearTimeout(closeTimer);
      Object.entries(megas).forEach(([k, el]) => el.classList.toggle('open', k === w));
      triggers.forEach((t) => t.setAttribute('aria-expanded', String(t.dataset.menu === w)));
    };
    const closeMega = () => openMega(null);
    const closeSoon = () => { clearTimeout(closeTimer); closeTimer = setTimeout(closeMega, 220); };
    triggers.forEach((t) => {
      t.addEventListener('click', () => {
        if (innerWidth <= 1100) body.classList.remove('menu-open');   // mobile: the model sheet replaces the menu panel
        t.getAttribute('aria-expanded') === 'true' ? closeMega() : openMega(t.dataset.menu);
      });
      if (!touch) { t.addEventListener('pointerenter', () => openMega(t.dataset.menu)); t.addEventListener('pointerleave', closeSoon); }
    });
    Object.values(megas).forEach((el) => {
      el.addEventListener('pointerenter', () => clearTimeout(closeTimer));
      el.addEventListener('pointerleave', closeSoon);
      el.addEventListener('click', (e) => { if (e.target.closest('a')) { closeMega(); body.classList.remove('menu-open'); } });
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMega(); });
    addEventListener('scroll', () => { if (!document.querySelector('.mega.open:hover')) closeMega(); }, { passive: true });
    const toggle = document.querySelector('[data-menu-toggle]');
    if (toggle) toggle.addEventListener('click', closeMega);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
