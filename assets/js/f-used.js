/*
 * Used cars: faceted filters, sorting, shareable URL state, detail dialog.
 * Data: window.FAH_USED (assets/data/used.js).
 */
(function () {
  const CARS = (window.FAH_USED || []).slice();
  const IMG = document.body.dataset.img || 'assets/img/';
  const WA = '5978919554';                       // Sales & Parts WhatsApp
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const usd = (n) => 'USD ' + Math.round(n).toLocaleString('en-US');
  const num = (n) => Math.round(n).toLocaleString('en-US');
  const monthly = (p) => { const f = p * 0.8, r = 0.09 / 12, n = 60; return f * r / (1 - Math.pow(1 + r, -n)); };
  const STATUS = { new: 'Just arrived', special: 'Special offer', stock: 'In stock', sold: 'Recently sold' };

  /* ---------- filter model ---------- */
  const GROUPS = [
    { key: 'status', label: 'Show', field: 'status', options: ['new', 'special'], labels: STATUS },
    { key: 'brand', label: 'Brand', field: 'brand' },
    { key: 'body', label: 'Body type', field: 'body' },
    { key: 'fuel', label: 'Fuel', field: 'fuel' },
    { key: 'trans', label: 'Transmission', field: 'trans' },
    { key: 'drive', label: 'Drive', field: 'drive' }
  ];
  GROUPS.forEach((g) => { if (!g.options) g.options = [...new Set(CARS.map((c) => c[g.field]))].sort(); });
  const years = CARS.map((c) => c.year);
  const Y0 = Math.min(...years), Y1 = Math.max(...years);
  const PMAX = Math.ceil(Math.max(...CARS.map((c) => c.price)) / 5000) * 5000;
  const KMAX = Math.ceil(Math.max(...CARS.map((c) => c.km)) / 25000) * 25000;

  const blank = () => ({ q: '', status: new Set(), brand: new Set(), body: new Set(), fuel: new Set(), trans: new Set(), drive: new Set(), ymin: Y0, ymax: Y1, pmax: PMAX, kmax: KMAX, sold: true, sort: 'arrived' });
  let S = blank();

  /* ---------- URL <-> state ---------- */
  const readURL = () => {
    const p = new URLSearchParams(location.search);
    GROUPS.forEach((g) => { if (p.get(g.key)) S[g.key] = new Set(p.get(g.key).split(',')); });
    if (p.get('q')) S.q = p.get('q');
    if (p.get('from')) S.ymin = +p.get('from');
    if (p.get('to')) S.ymax = +p.get('to');
    if (p.get('price')) S.pmax = +p.get('price');
    if (p.get('km')) S.kmax = +p.get('km');
    if (p.get('sold') === '0') S.sold = false;
    if (p.get('sort')) S.sort = p.get('sort');
    return p.get('car');
  };
  const writeURL = (car) => {
    const p = new URLSearchParams();
    GROUPS.forEach((g) => { if (S[g.key].size) p.set(g.key, [...S[g.key]].join(',')); });
    if (S.q) p.set('q', S.q);
    if (S.ymin !== Y0) p.set('from', S.ymin);
    if (S.ymax !== Y1) p.set('to', S.ymax);
    if (S.pmax !== PMAX) p.set('price', S.pmax);
    if (S.kmax !== KMAX) p.set('km', S.kmax);
    if (!S.sold) p.set('sold', '0');
    if (S.sort !== 'arrived') p.set('sort', S.sort);
    if (car) p.set('car', car);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  };

  /* ---------- matching (optionally ignoring one group, for facet counts) ---------- */
  const match = (c, skip) => {
    if (S.q) {
      const hay = (c.title + ' ' + c.brand + ' ' + c.body + ' ' + c.fuel + ' ' + (c.plate || '') + ' ' + c.colour).toLowerCase();
      if (!S.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    for (const g of GROUPS) {
      if (g.key === skip || !S[g.key].size) continue;
      if (!S[g.key].has(c[g.field])) return false;
    }
    if (c.year < S.ymin || c.year > S.ymax) return false;
    if (S.pmax < PMAX && c.price > S.pmax) return false;
    if (S.kmax < KMAX && c.km > S.kmax) return false;
    return true;
  };
  const SORTS = {
    arrived: (a, b) => (b.arrived || '').localeCompare(a.arrived || ''),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    km: (a, b) => a.km - b.km,
    year: (a, b) => b.year - a.year
  };

  /* ---------- build filter UI ---------- */
  const form = $('#u-form');
  const optHTML = (g) => `<fieldset class="u-group" data-group="${g.key}"><legend>${esc(g.label)}</legend><div class="u-opts">` +
    g.options.map((o) => `<label class="u-opt"><input type="checkbox" name="${g.key}" value="${esc(o)}"><span>${esc(g.labels ? g.labels[o] : o)} <small data-count="${g.key}:${esc(o)}"></small></span></label>`).join('') +
    '</div></fieldset>';
  const yearOpts = (sel) => { let h = ''; for (let y = Y0; y <= Y1; y++) h += `<option value="${y}"${y === sel ? ' selected' : ''}>${y}</option>`; return h; };
  form.innerHTML =
    `<div class="u-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="u-q" placeholder="Search model, plate, colour…" aria-label="Search used cars"></div>` +
    optHTML(GROUPS[0]) + optHTML(GROUPS[1]) +
    `<fieldset class="u-group"><legend>Price</legend><div class="u-range"><label for="u-price">Up to <b id="u-price-out"></b></label><input type="range" id="u-price" min="5000" max="${PMAX}" step="1000"></div></fieldset>` +
    `<fieldset class="u-group"><legend>Year</legend><div class="u-years"><select id="u-ymin" aria-label="From year">${yearOpts(Y0)}</select><span>to</span><select id="u-ymax" aria-label="To year">${yearOpts(Y1)}</select></div></fieldset>` +
    `<fieldset class="u-group"><legend>Mileage</legend><div class="u-range"><label for="u-km">Up to <b id="u-km-out"></b></label><input type="range" id="u-km" min="25000" max="${KMAX}" step="5000"></div></fieldset>` +
    GROUPS.slice(2).map(optHTML).join('') +
    `<fieldset class="u-group"><label class="u-switch">Show recently sold<input type="checkbox" id="u-sold" checked></label></fieldset>`;

  const sync = () => {                         // state -> controls
    $('#u-q').value = S.q;
    GROUPS.forEach((g) => $$(`input[name="${g.key}"]`, form).forEach((i) => { i.checked = S[g.key].has(i.value); }));
    $('#u-price').value = S.pmax; $('#u-km').value = S.kmax;
    $('#u-ymin').value = S.ymin; $('#u-ymax').value = S.ymax;
    $('#u-sold').checked = S.sold;
    $('#u-sort').value = S.sort;
  };

  /* ---------- render ---------- */
  const card = (c) => {
    const sold = c.status === 'sold';
    const badge = c.status === 'stock' ? '' : `<span class="badge badge--${c.status}">${STATUS[c.status]}</span>`;
    return `<${sold ? 'div' : 'button type="button"'} class="ucar${sold ? ' ucar--sold' : ''}" data-car="${c.id}"${sold ? '' : ` aria-label="${esc(c.title)}, ${esc(usd(c.price))}"`}>
      <div class="ucar__img"><img src="${IMG + c.img}" alt="" loading="lazy">${badge}${c.demo ? '<span class="badge badge--demo">Demo</span>' : ''}</div>
      <div class="ucar__body">
        <span class="ucar__title">${esc(c.title)}</span>
        <span class="ucar__meta"><span>${c.year}</span><span>${num(c.km)} km</span><span>${esc(c.trans)}</span><span>${esc(c.drive)}</span></span>
        <div class="ucar__foot">
          <span class="ucar__price">${c.was ? `<s>${usd(c.was)}</s>` : ''}${sold ? 'Sold' : usd(c.price)}</span>
          ${sold ? `<span class="ucar__month">${esc(c.fuel)}</span>` : `<span class="ucar__month">from<b>${usd(monthly(c.price))}/mo</b></span>`}
        </div>
      </div></${sold ? 'div' : 'button'}>`;
  };
  const chip = (label, fn) => ({ label, fn });

  const render = () => {
    const pool = CARS.filter((c) => match(c));
    const avail = pool.filter((c) => c.status !== 'sold').sort(SORTS[S.sort]);
    const soldStatusFilter = S.status.size > 0;              // "Just arrived"/"Special" excludes sold ones
    const sold = S.sold && !soldStatusFilter ? CARS.filter((c) => c.status === 'sold' && match(c, 'status')).sort((a, b) => (b.sold || '').localeCompare(a.sold || '')) : [];

    $('#u-count').innerHTML = `${avail.length} ${avail.length === 1 ? 'car' : 'cars'} <span>in stock</span>`;
    $('#u-grid').innerHTML = avail.length ? avail.map(card).join('') :
      `<div class="u-empty"><h3>No cars match your filters</h3><p>Try fewer filters, or tell us what you're looking for. New trade-ins arrive every week.</p>
       <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn btn--light" type="button" data-clear>Clear all filters <i>×</i></button>
       <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent('Hello Fernandes, I am looking for a used car: ')}">Tell us on WhatsApp <i>↗</i></a></div></div>`;
    $('#u-sold-wrap').hidden = !sold.length;
    $('#u-sold-grid').innerHTML = sold.map(card).join('');

    // facet counts: how many in-stock cars each option would give, with the other filters applied
    GROUPS.forEach((g) => g.options.forEach((o) => {
      const n = CARS.filter((c) => c.status !== 'sold' && c[g.field] === o && match(c, g.key)).length;
      const el = $(`[data-count="${g.key}:${CSS.escape(o)}"]`, form);
      if (el) { el.textContent = n; el.closest('.u-opt').querySelector('input').disabled = n === 0 && !S[g.key].has(o); }
    }));
    $('#u-price-out').textContent = S.pmax >= PMAX ? 'any price' : usd(S.pmax);
    $('#u-km-out').textContent = S.kmax >= KMAX ? 'any mileage' : num(S.kmax) + ' km';

    // active filter chips
    const chips = [];
    if (S.q) chips.push(chip('"' + S.q + '"', () => { S.q = ''; }));
    GROUPS.forEach((g) => S[g.key].forEach((v) => chips.push(chip(g.labels ? g.labels[v] : v, () => S[g.key].delete(v)))));
    if (S.pmax < PMAX) chips.push(chip('Up to ' + usd(S.pmax), () => { S.pmax = PMAX; }));
    if (S.kmax < KMAX) chips.push(chip('Up to ' + num(S.kmax) + ' km', () => { S.kmax = KMAX; }));
    if (S.ymin !== Y0 || S.ymax !== Y1) chips.push(chip(S.ymin + '–' + S.ymax, () => { S.ymin = Y0; S.ymax = Y1; }));
    const box = $('#u-active');
    box.innerHTML = chips.map((c, i) => `<button class="u-chip" type="button" data-chip="${i}">${esc(c.label)} <i aria-hidden="true">×</i><span class="sr-only"> remove</span></button>`).join('') +
      (chips.length > 1 ? '<button class="u-link" type="button" data-clear>Clear all</button>' : '');
    box._chips = chips;
    $('#u-apply-n').textContent = avail.length;
    $('#u-open-n').textContent = chips.length ? '(' + chips.length + ')' : '';
    writeURL(openId);
  };

  /* ---------- events ---------- */
  const update = () => { render(); };
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'u-q') S.q = t.value.trim();
    else if (t.id === 'u-price') S.pmax = +t.value;
    else if (t.id === 'u-km') S.kmax = +t.value;
    else if (t.id === 'u-ymin') { S.ymin = +t.value; if (S.ymin > S.ymax) { S.ymax = S.ymin; $('#u-ymax').value = S.ymax; } }
    else if (t.id === 'u-ymax') { S.ymax = +t.value; if (S.ymax < S.ymin) { S.ymin = S.ymax; $('#u-ymin').value = S.ymin; } }
    else if (t.id === 'u-sold') S.sold = t.checked;
    else if (t.name && S[t.name] instanceof Set) { t.checked ? S[t.name].add(t.value) : S[t.name].delete(t.value); }
    update();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  $('#u-sort').addEventListener('change', (e) => { S.sort = e.target.value; update(); });
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-chip]');
    if (c) { $('#u-active')._chips[+c.dataset.chip].fn(); sync(); update(); return; }
    if (e.target.closest('[data-clear]')) { S = blank(); sync(); update(); return; }
    const car = e.target.closest('button.ucar');
    if (car) openCar(car.dataset.car);
  });

  // mobile filter sheet
  const openSheet = (on) => { document.body.classList.toggle('filters-open', on); $('#u-open').setAttribute('aria-expanded', String(on)); };
  $('#u-open').addEventListener('click', () => openSheet(true));
  $('#u-apply').addEventListener('click', () => openSheet(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openSheet(false); });
  document.addEventListener('click', (e) => { if (document.body.classList.contains('filters-open') && !e.target.closest('.u-filters') && !e.target.closest('#u-open')) openSheet(false); });

  /* ---------- detail dialog ---------- */
  const dlg = $('#u-dialog');
  let openId = null;
  const openCar = (id) => {
    const c = CARS.find((x) => x.id === id);
    if (!c || c.status === 'sold') return;
    openId = id;
    const msg = `Hello Fernandes, I'm interested in the ${c.title}${c.plate ? ' (' + c.plate + ')' : ''}, ${c.year}, ${usd(c.price)}. Is it still available?`;
    $('#u-d').innerHTML = `
      <div class="u-d__img"><img src="${IMG + c.img}" alt="${esc(c.title)}">${c.status !== 'stock' ? `<span class="badge badge--${c.status}">${STATUS[c.status]}</span>` : ''}</div>
      <div class="u-d__body">
        <div><span class="mono muted">${esc(c.brand)} · ${esc(c.body)}${c.plate ? ' · ' + esc(c.plate) : ''}</span><h2 id="u-d-title" style="margin-top:8px">${esc(c.title)}</h2></div>
        <div class="u-d__price"><div><small>Price incl. BTW</small>${c.was ? `<s style="color:var(--muted);font-size:14px">${usd(c.was)}</s> ` : ''}<b>${usd(c.price)}</b></div><div style="text-align:right"><small>Indication*</small><b style="font-size:18px">${usd(monthly(c.price))}/mo</b></div></div>
        <dl>
          <div><dt>Year</dt><dd>${c.year}</dd></div><div><dt>Mileage</dt><dd>${num(c.km)} km</dd></div>
          <div><dt>Transmission</dt><dd>${esc(c.trans)}</dd></div><div><dt>Drive</dt><dd>${c.drive === '4WD' ? '4-wheel drive' : '2-wheel drive'}</dd></div>
          <div><dt>Fuel</dt><dd>${esc(c.fuel)}</dd></div><div><dt>Colour</dt><dd>${esc(c.colour)}</dd></div>
        </dl>
        <div class="u-d__ctas">
          <a class="btn btn--wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}">Ask on WhatsApp <i>↗</i></a>
          <a class="btn" href="tel:+597475046">Call sales · 475046 <i>☎</i></a>
          <a class="btn btn--light" href="mailto:FAH.Sales@fernandes.sr?subject=${encodeURIComponent(c.title + (c.plate ? ' ' + c.plate : ''))}&body=${encodeURIComponent(msg)}">Email sales <i>→</i></a>
        </div>
        <p class="u-d__fine">Inspected in the Fernandes workshop. Changes reserved; prices incl. BTW. * 20% down, 60 months, 9% (indication, not a credit offer).${c.demo ? ' <b>Demo listing.</b>' : ''}</p>
      </div>`;
    dlg.setAttribute('aria-labelledby', 'u-d-title');
    if (!dlg.open) dlg.showModal();
    writeURL(openId);
  };
  dlg.addEventListener('close', () => { openId = null; writeURL(null); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('.u-d__close')) dlg.close(); });

  /* ---------- go ---------- */
  const startCar = readURL();
  sync();
  render();
  if (startCar) openCar(startCar);
})();
