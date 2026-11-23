/*
 * Model page template behaviour. Usage on a model page:
 *   FAHModel({ id, price, imgBase, colours: [{ name, finish, hex, ink, front, rear, accent? }], related: [ids] })
 * The chosen colour becomes the page accent (--paint) everywhere: dots, buttons, price block.
 */
window.FAHModel = function (cfg) {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const esc = (window.FAH && FAH.esc) || ((s) => String(s));
  const usd = (n) => 'USD ' + Math.round(n).toLocaleString('en-US');

  /* ---------- model bar: appears after the hero, highlights the current section ---------- */
  const mbar = $('.mbar');
  const hero = $('.m-hero');
  const barLinks = mbar ? $$('.mbar__links a', mbar) : [];
  const sections = barLinks.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
  const onScroll = () => {
    if (!mbar) return;
    mbar.classList.toggle('show', hero.getBoundingClientRect().bottom < 140);
    let active = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.45) active = i; });
    barLinks.forEach((a, i) => a.classList.toggle('on', i === active));
  };
  addEventListener('scroll', onScroll, { passive: true });
  setInterval(onScroll, 700);
  onScroll();

  /* ---------- colour configurator ---------- */
  const car = $('#car');
  const sw = $('#swatches');
  const note = $('#colour-note');
  const tdColour = $('#td-colour');
  let colour = cfg.start || 0, view = 'front';
  if (car && sw) {
    car.innerHTML = cfg.colours.map((c, i) =>
      ['front', 'rear'].filter((v) => c[v]).map((v) => `<img data-c="${i}" data-v="${v}" src="${cfg.imgBase + c[v]}" alt="${esc(c.name)}, ${v} view" loading="${i === (cfg.start || 0) ? 'eager' : 'lazy'}">`).join('')).join('');
    const hasRear = cfg.colours.some((c) => c.rear);
    $$('.seg').forEach((s) => { if (s.querySelector('[data-view]')) s.hidden = !hasRear; });
    sw.innerHTML = cfg.colours.map((c, i) =>
      `<button class="sw" type="button" data-c="${i}" style="--c:${c.hex}" aria-pressed="false"><i></i><span>${esc(c.name)}${c.finish ? `<small>${esc(c.finish)}</small>` : ''}</span></button>`).join('');
    if (tdColour) tdColour.innerHTML = cfg.colours.map((c, i) => `<option value="${i}">${esc(c.name)}</option>`).join('') + '<option value="">No preference</option>';

    const apply = () => {
      const c = cfg.colours[colour];
      root.style.setProperty('--paint', c.accent || c.hex);
      root.style.setProperty('--paint-ink', c.accent ? '#fff' : c.ink);
      const v = c[view] ? view : 'front';
      $$('img', car).forEach((img) => img.classList.toggle('on', +img.dataset.c === colour && img.dataset.v === v));
      $$('.sw', sw).forEach((b) => { const on = +b.dataset.c === colour; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      if (note) note.textContent = c.name + (c.finish ? ' · ' + c.finish : '');
      if (tdColour) tdColour.value = String(colour);
    };
    sw.addEventListener('click', (e) => { const b = e.target.closest('.sw'); if (b) { colour = +b.dataset.c; apply(); } });
    $$('[data-view]').forEach((b) => b.addEventListener('click', () => {
      view = b.dataset.view;
      $$('[data-view]').forEach((x) => x.classList.toggle('on', x === b));
      apply();
    }));
    if (tdColour) tdColour.addEventListener('change', () => { if (tdColour.value !== '') { colour = +tdColour.value; apply(); } });
    apply();
  }

  /* ---------- monthly calculator (annuity) ---------- */
  const down = $('#c-down'), rate = $('#c-rate'), terms = $('#c-terms');
  if (down && rate && terms) {
    let months = +($('button.on', terms) || { dataset: { m: 60 } }).dataset.m;
    const calc = () => {
      const p = cfg.price, dp = p * (+down.value / 100), fin = p - dp, r = +rate.value / 100 / 12;
      const m = r ? fin * r / (1 - Math.pow(1 + r, -months)) : fin / months;
      $('#c-price').textContent = usd(p);
      $('#c-down-out').textContent = down.value + '% · ' + usd(dp);
      $('#c-rate-out').textContent = (+rate.value).toFixed(1) + '%';
      $('#c-month').textContent = usd(m);
      $('#c-fin').textContent = usd(fin);
      $('#c-total').textContent = usd(dp + m * months);
    };
    down.addEventListener('input', calc);
    rate.addEventListener('input', calc);
    terms.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      months = +b.dataset.m;
      $$('button', terms).forEach((x) => x.classList.toggle('on', x === b));
      calc();
    });
    calc();
  }

  /* ---------- versions: cards + comparison table (optional: cfg.versions) ---------- */
  const vWrap = $('#versions');
  const tdVersion = $('#td-version');
  if (vWrap && cfg.versions && cfg.versions.length) {
    const V = cfg.versions;
    const rows = cfg.versionRows || Object.keys(V[0].specs);
    let picked = V.findIndex((v) => v.default);
    if (picked < 0) picked = V.length - 1;
    const differs = (row) => new Set(V.map((v) => v.specs[row] || '—')).size > 1;
    const priceTxt = (v) => (v.price ? usd(v.price) + '*' : 'On request');

    vWrap.innerHTML =
      `<div class="vcards" style="--n:${V.length}">` +
      V.map((v, i) => `<article class="vcard" data-v="${i}">
          ${v.tag ? `<span class="vcard__tag">${esc(v.tag)}</span>` : ''}
          <span class="mono muted">${esc(v.code || '')}</span>
          <h4>${esc(v.name)}</h4>
          <ul>${(v.highlights || []).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
          <div class="vcard__foot"><div><small>From</small><b>${priceTxt(v)}</b></div>
          <button class="btn btn--light vcard__pick" type="button" data-v="${i}">Select <i>✓</i></button></div>
        </article>`).join('') + '</div>' +
      `<div class="vtable"><div class="vtable__bar"><h4>Compare versions</h4>
          <label class="vtoggle"><input type="checkbox" id="v-diff"> Only show differences</label></div>
        <div class="vtable__scroll"><table><thead><tr><th></th>${V.map((v, i) => `<th data-v="${i}">${esc(v.name)}</th>`).join('')}</tr></thead><tbody>` +
      rows.map((r) => `<tr class="${differs(r) ? 'diff' : 'same'}"><td>${esc(r)}</td>${V.map((v, i) => `<td data-v="${i}">${esc(v.specs[r] || '—')}</td>`).join('')}</tr>`).join('') +
      `<tr class="price-row"><td>Price from</td>${V.map((v, i) => `<td data-v="${i}"><b>${priceTxt(v)}</b></td>`).join('')}</tr>` +
      '</tbody></table></div></div>';

    if (tdVersion) tdVersion.innerHTML = V.map((v, i) => `<option value="${i}">${esc(v.name)}</option>`).join('');

    const select = (i, scroll) => {
      picked = i;
      $$('.vcard', vWrap).forEach((c) => c.classList.toggle('on', +c.dataset.v === i));
      $$('[data-v]', $('.vtable', vWrap)).forEach((c) => c.classList.toggle('on', +c.dataset.v === i));
      if (tdVersion) tdVersion.value = String(i);
      if (V[i].price) {
        cfg.price = V[i].price;
        if (down) down.dispatchEvent(new Event('input'));      // recalculate the monthly amount
      }
      const label = $('#c-version');
      if (label) label.textContent = V[i].name;
      if (scroll) {
        const price = document.getElementById('price');
        if (price) price.scrollIntoView({ behavior: 'smooth' });
      }
    };
    vWrap.addEventListener('click', (e) => {
      const b = e.target.closest('.vcard__pick'); if (b) { select(+b.dataset.v, false); return; }
      const c = e.target.closest('.vcard'); if (c) select(+c.dataset.v, false);
    });
    const diffBox = $('#v-diff', vWrap);
    diffBox.addEventListener('change', () => vWrap.classList.toggle('only-diff', diffBox.checked));
    if (tdVersion) tdVersion.addEventListener('change', () => select(+tdVersion.value, false));
    select(picked, false);
  }

  /* ---------- brochure: one link everywhere (optional: cfg.brochure) ---------- */
  if (cfg.brochure) {
    $$('[data-brochure]').forEach((a) => { a.href = cfg.brochure; a.setAttribute('download', ''); });
    const bar = $('.mbar');
    if (bar && !$('.mbar__brochure', bar)) {
      const a = document.createElement('a');
      a.className = 'mbar__brochure';
      a.href = cfg.brochure;
      a.setAttribute('download', '');
      a.innerHTML = 'Brochure <span aria-hidden="true">↓</span>';
      bar.insertBefore(a, $('.btn', bar));
    }
  }

  /* ---------- test drive form (demo: never sends) ---------- */
  const form = $('#td-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = $$('[required]', form).filter((i) => !i.value.trim());
      missing.forEach((i) => i.setAttribute('aria-invalid', 'true'));
      if (missing.length) { missing[0].focus(); return; }
      form.classList.add('sent');
    });
    const quote = $('#quote-btn');
    if (quote) quote.addEventListener('click', () => { form.requestSubmit(); });
  }

  /* ---------- related models ---------- */
  const rel = $('#related');
  if (rel && window.FAH) {
    rel.innerHTML = cfg.related.map((id) => FAH.MODELS.find((m) => m.id === id)).filter(Boolean).map((m) =>
      `<a href="${FAH.href(m)}"><div class="rel__img"><img src="${FAH.IMG + m.img}" alt="${esc(m.brand + ' ' + m.name)}" loading="lazy" style="object-position:${m.pos}"></div>` +
      `<div class="rel__body"><div><span>${esc(m.brand)} · ${esc(m.type)}</span><b>${esc(m.name)}</b></div><span>${esc(FAH.price(m))}</span></div></a>`).join('');
  }

  /* ---------- EV running-cost comparison (optional: cfg.ev) ---------- */
  const save = $('#save');
  if (save && cfg.ev) {
    const km = $('#s-km', save), fuel = $('#s-fuel', save), kwh = $('#s-kwh', save);
    const cur = cfg.ev.currency || 'USD';                     // running costs are local: SRD in Suriname
    const usd2 = (n) => cur + ' ' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    const run = () => {
      const k = +km.value;
      const petrol = k / 100 * cfg.ev.petrolLper100 * +fuel.value;
      const elec = k / 100 * cfg.ev.kwhPer100 * +kwh.value;
      $('#s-km-out', save).textContent = k.toLocaleString('en-US') + ' km';
      $('#s-fuel-out', save).textContent = cur + ' ' + (+fuel.value).toFixed(2) + ' / L';
      $('#s-kwh-out', save).textContent = cur + ' ' + (+kwh.value).toFixed(2) + ' / kWh';
      $('#s-petrol', save).textContent = usd2(petrol);
      $('#s-ev', save).textContent = usd2(elec);
      $('#s-diff', save).textContent = usd2(Math.max(0, petrol - elec));
      $('#s-year', save).textContent = usd2(Math.max(0, petrol - elec) * 12) + ' a year';
    };
    [km, fuel, kwh].forEach((i) => i.addEventListener('input', run));
    run();
  }
};
