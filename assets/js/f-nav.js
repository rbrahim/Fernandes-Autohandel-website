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
  const CARDS = body.dataset.megaStyle === 'cards';      // card menu (white homepage); default: columns
  const BRANDS = window.FAH_BRANDS || {};

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const price = (m) => (m.from ? 'USD ' + m.from.toLocaleString('en-US') + '*' : 'On request');
  const href = (m) => m.page || HOME + '#' + m.world;
  const home = (anchor) => HOME + anchor;
  // ★ marks models that already have their own model page
  const star = (m) => (m.page ? '<i class="mstar" title="Own model page" aria-label="(own model page)">★</i>' : '');
  const legend = MODELS.some((m) => m.page) ? '<p class="mega__legend"><i class="mstar" aria-hidden="true">★</i> Own model page</p>' : '';
  window.FAH = Object.assign(window.FAH || {}, { esc, price, href, IMG, MODELS, WORLDS, BRANDS: window.FAH_BRANDS || {} });

  // Card menu: one row per brand/group, every model as an equal card with its whole photo.
  const cardsHTML = (world) => {
    const groups = WORLDS[world].groups;
    const inWorld = MODELS.filter((m) => m.world === world);
    const rows = groups.map((g) => {
      const items = inWorld.filter((m) => m.group === g);
      const b = BRANDS[g];
      const head = b
        ? `<a class="mcard-row__head" href="${b.page}"><img src="${IMG + b.logo}" alt=""><b>${esc(g)}</b><span>All ${esc(g)} →</span></a>`
        : `<div class="mcard-row__head"><b>${esc(g)}</b><span>${items.length} ${items.length === 1 ? 'model' : 'models'}</span></div>`;
      return `<div class="mcard-row">${head}<div class="mcard-row__list">` +
        items.map((m) => `<a class="mcard${m.studio ? ' mcard--studio' : ''}" href="${href(m)}" data-model="${m.id}"><span class="mcard__img"><img src="${IMG + (m.studio || m.img)}" alt="" loading="lazy" style="object-position:${m.studio ? 'center' : m.pos}"></span><b>${esc(m.name)}${star(m)}</b><span>${esc(m.type)}</span><span class="mcard__price">${esc(price(m))}</span></a>`).join('') +
        '</div></div>';
    }).join('');
    const brandLinks = Object.entries(BRANDS).filter(([name]) => inWorld.some((m) => m.brand === name))
      .map(([name, b]) => `<a class="mega__brand" href="${b.page}"><img src="${IMG + b.logo}" alt=""><span>${esc(name)}</span></a>`).join('');
    const links = world === 'drive'
      ? `<a class="mega__link" href="${home('#drive')}">All Drive models <span>→</span></a><a class="mega__link" href="compare.html">Compare models <span>⇄</span></a><a class="mega__link" href="used.html">Used cars <span>→</span></a><a class="mega__link mega__link--accent" href="${home('#contact')}">Book a test drive <span>↗</span></a>`
      : `<a class="mega__link" href="${home('#work')}">All Work vehicles <span>→</span></a><a class="mega__link" href="compare.html?w=work">Compare vehicles <span>⇄</span></a><a class="mega__link" href="rental-lease.html#business">Fleet &amp; business <span>→</span></a><a class="mega__link mega__link--accent" href="${home('#contact')}">Fernandes Truck Center <span>↗</span></a>`;
    return `<div class="mcards">${rows}</div><div class="mega__side"><span class="mono mega__side-label">Shop by brand</span><div class="mega__brands">${brandLinks}</div>${links}${legend}</div>`;
  };

  const megaHTML = (world) => {
    if (CARDS) return cardsHTML(world);
    const groups = WORLDS[world].groups;
    const inWorld = MODELS.filter((m) => m.world === world);
    const cols = groups.map((g) => {
      const items = inWorld.filter((m) => m.group === g);
      const one = items.length <= 4 && groups.length > 2;
      return `<div class="mega__col ${one ? 'mega__col--one' : ''}"><h5>${BRANDS[g] ? `<a class="mega__brandlink" href="${BRANDS[g].page}">${esc(g)} · all models →</a>` : esc(g)}<span>${items.length}</span></h5><div class="mega__list">` +
        items.map((m) => `<a class="mega__model" href="${href(m)}" data-model="${m.id}"><img src="${IMG + (m.studio || m.img)}" alt=""${m.studio ? ' class="is-studio"' : ` style="object-position:${m.pos}"`}><div><b>${esc(m.name)}${star(m)}</b><span>${esc(m.type)} · ${esc(price(m))}</span></div></a>`).join('') +
        '</div></div>';
    }).join('');
    const feat = MODELS.find((m) => m.id === (world === 'drive' ? 'aion-v' : 'd-max'));
    const links = world === 'drive'
      ? `<a class="mega__link" href="${home('#drive')}">All Drive models <span>→</span></a><a class="mega__link" href="compare.html">Compare models <span>⇄</span></a><a class="mega__link" href="used.html">Used cars <span>→</span></a><a class="mega__link mega__link--accent" href="${home('#contact')}">Book a test drive <span>↗</span></a>`
      : `<a class="mega__link" href="${home('#work')}">All Work vehicles <span>→</span></a><a class="mega__link" href="rental-lease.html#rental">Rental fleet <span>→</span></a><a class="mega__link" href="rental-lease.html#business">Fleet &amp; business <span>→</span></a><a class="mega__link mega__link--accent" href="${home('#contact')}">Fernandes Truck Center <span>↗</span></a>`;
    return `<div class="mega__cols" style="--cols:${groups.length}">${cols}</div>` +
      `<div class="mega__side"><a class="mega__feature" href="${href(feat)}" data-default="${feat.id}" data-label="${world === 'drive' ? 'New · Electric' : 'Best seller'}"><span class="mega__preview-tag">Preview</span><img src="${IMG + feat.img}" alt="" style="object-position:${feat.pos}"><div><span class="mono">${world === 'drive' ? 'New · Electric' : 'Best seller'}</span><b>${esc(feat.brand)} ${esc(feat.name)}</b><span>from ${esc(price(feat))}</span></div></a>${links}${legend}</div>`;
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
    document.querySelectorAll('[data-mega]').forEach((el) => { el.innerHTML = megaHTML(el.dataset.mega); el.classList.toggle('mega--cards', CARDS); megas[el.dataset.mega] = el; if (!touch && !CARDS) previewIn(el); });
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
