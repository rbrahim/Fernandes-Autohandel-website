/*
 * Catalogue pages: brand pages (honda.html, gac.html, isuzu.html) and compare.html.
 * Needs models.js, specs.js and f-nav.js (window.FAH helpers).
 *  - Compare list: up to 3 model ids, kept in the URL on compare.html and remembered per visitor.
 *  - Brand page: <body data-brand="Honda">, #brand-models grid with filters and "Compare" toggles.
 *  - Compare page: #cmp, three slots side by side, "only differences" toggle.
 */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MODELS = window.FAH_MODELS || [];
  const SPECS = window.FAH_SPECS || {};
  const ROWS = window.FAH_SPEC_ROWS || [];
  const BROCHURES = window.FAH_BROCHURES || {};
  const BRANDS = window.FAH_BRANDS || {};
  const IMG = document.body.dataset.img || 'assets/img/';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const price = (m) => (m.from ? 'USD ' + m.from.toLocaleString('en-US') + '*' : 'On request');
  const href = (m) => m.page || 'index.html#' + m.world;
  const byId = (id) => MODELS.find((m) => m.id === id);
  const photo = (m) => `<img src="${IMG + (m.studio || m.img)}" alt="${esc(m.brand + ' ' + m.name)}" loading="lazy" style="object-position:${m.studio ? 'center' : m.pos}">`;
  const MAX = 3;

  /* ---------- compare list (remembered in this browser only; the page works without it) ---------- */
  const KEY = 'fah-compare';
  const load = () => { try { return (JSON.parse(localStorage.getItem(KEY)) || []).filter(byId).slice(0, MAX); } catch (e) { return []; } };
  const save = (ids) => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) { /* private mode: fine */ } };
  let picked = load();

  /* ---------- tray: shows what is picked, on brand pages ---------- */
  const tray = $('#cmp-tray');
  const renderTray = () => {
    if (!tray) return;
    tray.hidden = !picked.length;
    tray.innerHTML = `<div class="tray__items">${picked.map((id) => { const m = byId(id); return `<span class="tray__item${m.studio ? ' is-studio' : ''}">${photo(m)}<b>${esc(m.name)}</b><button type="button" data-drop="${id}" aria-label="Remove ${esc(m.name)}">×</button></span>`; }).join('')}` +
      (picked.length < MAX ? `<span class="tray__hint">${picked.length === 1 ? 'Pick one or two more' : 'Room for one more'}</span>` : '') + '</div>' +
      `<a class="btn" href="compare.html?m=${picked.join(',')}">Compare ${picked.length > 1 ? picked.length + ' models' : ''} <i>⇄</i></a>`;
  };
  const toggle = (id) => {
    picked = picked.includes(id) ? picked.filter((x) => x !== id) : picked.concat(id).slice(-MAX);
    save(picked);
    renderTray();
    syncButtons();
  };
  const syncButtons = () => $$('[data-cmp]').forEach((b) => { const on = picked.includes(b.dataset.cmp); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '✓ Comparing' : '+ Compare'; });
  if (tray) tray.addEventListener('click', (e) => { const b = e.target.closest('[data-drop]'); if (b) toggle(b.dataset.drop); });

  /* ---------- brand page: model grid ---------- */
  const grid = $('#brand-models');
  const brand = document.body.dataset.brand;
  if (grid && brand) {
    const list = MODELS.filter((m) => m.brand === brand);
    const worlds = [...new Set(list.map((m) => m.world))];
    const types = [...new Set(list.map((m) => m.type))];
    grid.innerHTML = list.map((m) => `<article class="bcard${m.studio ? ' bcard--studio' : ''}" data-world="${m.world}" data-type="${esc(m.type)}">
        <a class="bcard__img" href="${href(m)}" tabindex="-1" aria-hidden="true">${photo(m)}<span class="bcard__power" data-p="${esc(m.power)}">${esc(m.power)}</span></a>
        <div class="bcard__body">
          <span class="mono muted">${m.world === 'work' ? 'Work' : 'Drive'} · ${esc(m.type)}</span>
          <h3><a href="${href(m)}">${esc(m.name)}</a></h3>
          <div class="bcard__foot"><span class="bcard__price"><small>From</small>${esc(price(m))}</span>
            <button class="bcard__cmp" type="button" data-cmp="${m.id}" aria-pressed="false">+ Compare</button></div>
          <div class="bcard__links">${m.page ? `<a href="${m.page}">Model page →</a>` : `<a href="https://wa.me/5978919554?text=${encodeURIComponent('Hello, I would like to know more about the ' + m.brand + ' ' + m.name + '.')}">Ask sales →</a>`}${BROCHURES[m.id] ? `<a href="${BROCHURES[m.id]}" download>Brochure ↓</a>` : ''}</div>
        </div></article>`).join('');
    const fbar = $('#brand-filters');
    if (fbar) {
      const btn = (f, label) => `<button type="button" data-f="${esc(f)}">${esc(label)}</button>`;
      fbar.innerHTML = btn('all', 'All ' + list.length) +
        (worlds.length > 1 ? '<span class="sep"></span>' + worlds.map((w) => btn('world:' + w, w === 'work' ? 'Work' : 'Drive')).join('') : '') +
        (types.length > 1 ? '<span class="sep"></span>' + types.map((t) => btn('type:' + t, t)).join('') : '');
      const apply = (f) => {
        $$('button', fbar).forEach((b) => b.classList.toggle('on', b.dataset.f === f));
        const [k, v] = f.split(/:(.+)/);
        $$('.bcard', grid).forEach((c) => { c.hidden = f !== 'all' && c.dataset[k] !== v; });
      };
      fbar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) apply(b.dataset.f); });
      apply('all');
    }
    grid.addEventListener('click', (e) => { const b = e.target.closest('[data-cmp]'); if (b) toggle(b.dataset.cmp); });
    syncButtons();
    renderTray();
  }

  /* ---------- compare page ---------- */
  const cmp = $('#cmp');
  if (cmp) {
    const params = new URLSearchParams(location.search);
    const fromUrl = (params.get('m') || '').split(',').filter(byId);
    const world = params.get('w') === 'work' ? 'work' : 'drive';
    let slots = fromUrl.length ? fromUrl : picked.length ? picked : (world === 'work' ? ['d-max', 'n-series'] : ['hr-v', 'aion-v']);
    slots = slots.slice(0, MAX);
    while (slots.length < MAX) slots.push('');

    const options = (sel) => '<option value="">Add a model…</option>' + Object.keys(BRANDS).map((b) =>
      `<optgroup label="${esc(b)}">` + MODELS.filter((m) => m.brand === b).map((m) => `<option value="${m.id}"${m.id === sel ? ' selected' : ''}>${esc(b + ' ' + m.name)}</option>`).join('') + '</optgroup>').join('');

    const value = (m, row) => {
      const s = SPECS[m.id] || {};
      switch (row) {
        case 'Brand': return m.brand;
        case 'Body type': return m.type;
        case 'Fuel': return m.power;
        case 'Price from': return price(m);
        case 'Version': return s.version || '';
        case 'Range': case 'Battery': case 'Charging': return m.power === 'Electric' ? s[row] || '' : '—';   // EV-only rows
        default: return s[row] || '';
      }
    };

    const render = () => {
      const ms = slots.map(byId);
      const chosen = ms.filter(Boolean);
      const base = ['Brand', 'Body type', 'Fuel', 'Price from', 'Version'];
      // spec rows only when at least one chosen model has the figure
      const rows = base.concat(ROWS.filter((r) => chosen.some((m) => value(m, r))));
      const cell = (m, r) => {
        if (!m) return '<td class="is-empty"></td>';
        const v = value(m, r);
        return v ? `<td>${esc(v)}</td>` : '<td class="is-na">On request</td>';
      };
      const differs = (r) => new Set(chosen.map((m) => value(m, r) || '—')).size > 1;
      cmp.innerHTML = `<div class="cmp__scroll"><table class="cmp__table">
        <thead><tr><th class="cmp__corner" scope="col"><b>${chosen.length} of ${MAX}</b><span>models side by side</span>
          <label class="vtoggle"><input type="checkbox" id="cmp-diff"${cmp.classList.contains('only-diff') ? ' checked' : ''}> Only differences</label></th>` +
        ms.map((m, i) => `<th scope="col"><div class="cmp__slot${m && m.studio ? ' is-studio' : ''}">
            <select data-slot="${i}" aria-label="Model ${i + 1}">${options(m ? m.id : '')}</select>
            ${m ? `<a class="cmp__img" href="${href(m)}">${photo(m)}</a><div class="cmp__name"><span class="mono muted">${esc(m.brand)}</span><b>${esc(m.name)}</b><span class="cmp__price">${esc(price(m))}</span></div>
              <div class="cmp__actions"><a class="btn btn--light" href="${m.page || 'index.html#contact'}">${m.page ? 'View' : 'Ask us'} <i>→</i></a>${BROCHURES[m.id] ? `<a class="cmp__dl" href="${BROCHURES[m.id]}" download>Brochure ↓</a>` : ''}<button type="button" class="cmp__x" data-clear="${i}" aria-label="Remove ${esc(m.name)}">×</button></div>`
              : `<div class="cmp__ph"><span>+</span>Choose a model to compare</div>`}
          </div></th>`).join('') + '</tr></thead><tbody>' +
        rows.map((r) => `<tr class="${chosen.length > 1 && differs(r) ? 'diff' : 'same'}"><th scope="row">${esc(r)}</th>${ms.map((m) => cell(m, r)).join('')}</tr>`).join('') +
        `<tr class="cmp__note"><th scope="row">Full specs</th>${ms.map((m) => !m ? '<td class="is-empty"></td>' : SPECS[m.id] ? '<td>See the model page or brochure</td>' : '<td><a href="https://wa.me/5978919554?text=' + encodeURIComponent('Hello, I would like the specifications of the ' + m.brand + ' ' + m.name + '.') + '">Ask sales on WhatsApp →</a></td>').join('')}</tr>` +
        '</tbody></table></div>';
      const ids = slots.filter(Boolean);
      history.replaceState(null, '', ids.length ? '?m=' + ids.join(',') : location.pathname);
      picked = ids; save(ids);
    };
    cmp.addEventListener('change', (e) => {
      if (e.target.id === 'cmp-diff') { cmp.classList.toggle('only-diff', e.target.checked); return; }
      const s = e.target.closest('[data-slot]');
      if (!s) return;
      const i = +s.dataset.slot;
      const other = slots.indexOf(s.value);
      if (s.value && other > -1 && other !== i) slots[other] = slots[i];   // picked twice: swap instead
      slots[i] = s.value;
      render();
    });
    cmp.addEventListener('click', (e) => { const b = e.target.closest('[data-clear]'); if (b) { slots[+b.dataset.clear] = ''; render(); } });
    render();
  }
})();
