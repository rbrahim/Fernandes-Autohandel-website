/* About / Service pages: opening hours, roadside number of the moment, timeline arrows, booking form. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Local time in Paramaribo (UTC-3, no daylight saving), whatever the visitor's own timezone is.
  const srNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Paramaribo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return { day: get('weekday'), mins: (+get('hour') % 24) * 60 + +get('minute') };
  };

  /* ---------- showroom / workshop open now? (Mon–Fri 8:00–16:30, Sat 9:00–13:00) ---------- */
  const HOURS = { Mon: [480, 990], Tue: [480, 990], Wed: [480, 990], Thu: [480, 990], Fri: [480, 990], Sat: [540, 780] };
  const openState = () => {
    const { day, mins } = srNow();
    const h = HOURS[day];
    const open = !!h && mins >= h[0] && mins < h[1];
    $$('[data-open-now]').forEach((el) => {
      el.classList.toggle('is-open', open);
      el.textContent = open ? 'Open now' : 'Closed now';
    });
  };

  /* ---------- roadside: day number 05:00–17:00, night number 17:00–05:00 ---------- */
  const roadside = () => {
    const { mins } = srNow();
    const day = mins >= 300 && mins < 1020;
    $$('[data-rs]').forEach((el) => el.classList.toggle('is-now', (el.dataset.rs === 'day') === day));
  };

  openState(); roadside();
  setInterval(() => { openState(); roadside(); }, 60000);

  /* ---------- timeline arrows ---------- */
  $$('[data-tl-dir]').forEach((b) => b.addEventListener('click', () => {
    const tl = $('.tl'); if (!tl) return;
    const w = tl.firstElementChild ? tl.firstElementChild.getBoundingClientRect().width + 12 : 300;
    tl.scrollBy({ left: w * 2 * +b.dataset.tlDir, behavior: 'smooth' });
  }));

  /* ---------- booking form: brand -> model, demo submit ---------- */
  const form = $('#book-form');
  if (form) {
    const brand = $('#b-brand'), model = $('#b-model');
    const models = (window.FAH_MODELS || []);
    const fill = () => {
      const list = models.filter((m) => m.brand === brand.value);
      model.innerHTML = '<option value="">Choose a model</option>' +
        list.map((m) => `<option>${m.name}</option>`).join('') + '<option>Other / older model</option>';
      model.disabled = !brand.value || brand.value === 'Other';
      if (brand.value === 'Other') model.innerHTML = '<option>Other brand</option>';
    };
    brand.addEventListener('change', fill);
    // deep link from a model page: service.html?model=hr-v
    const want = new URLSearchParams(location.search).get('model');
    const m = want && models.find((x) => x.id === want);
    if (m) { brand.value = m.brand; fill(); model.value = m.name; }
    else fill();
    const d = $('#b-date');
    if (d) d.min = new Date().toISOString().slice(0, 10);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = $$('[required]', form).filter((i) => !i.value.trim());
      $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
      missing.forEach((i) => i.setAttribute('aria-invalid', 'true'));
      if (missing.length) { missing[0].focus(); return; }
      form.classList.add('sent');
    });
  }

  /* ---------- generic demo forms (rental, lease): validate, show the thank-you, never send ---------- */
  $$('form[data-demo]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    $$('[aria-invalid]', f).forEach((i) => i.removeAttribute('aria-invalid'));
    const missing = $$('[required]', f).filter((i) => !i.value.trim());
    missing.forEach((i) => i.setAttribute('aria-invalid', 'true'));
    if (missing.length) { missing[0].focus(); return; }
    f.classList.add('sent');
  }));

  /* ---------- rental: dates -> number of days, tiles pre-select the vehicle type ---------- */
  const rFrom = $('#r-from'), rTo = $('#r-to'), rDays = $('#r-days'), rType = $('#r-type');
  if (rFrom && rTo && rDays) {
    const today = new Date().toISOString().slice(0, 10);
    rFrom.min = today; rTo.min = today;
    const days = () => {
      if (rFrom.value) rTo.min = rFrom.value;
      if (!rFrom.value || !rTo.value) { rDays.textContent = 'Choose your dates to see the number of days.'; return; }
      const n = Math.round((new Date(rTo.value) - new Date(rFrom.value)) / 864e5);
      if (n < 1) { rDays.textContent = 'The return date must be after the pick-up date.'; return; }
      const car = !rType || !rType.value || rType.value === 'Car';
      rDays.innerHTML = `<b>${n} ${n === 1 ? 'day' : 'days'}</b>` + (car ? ` · cars from <b>USD ${(35 * n).toLocaleString('en-US')}</b>, excluding deposit` : ' · we confirm the rate and deposit for this vehicle type');
    };
    [rFrom, rTo, rType].forEach((i) => i && i.addEventListener('input', days));
    $$('[data-rent]').forEach((a) => a.addEventListener('click', () => { if (rType) { rType.value = a.dataset.rent; days(); } }));
  }

  /* ---------- lease request: model list from the catalogue ---------- */
  const lModel = $('#l-model');
  if (lModel) {
    const models = window.FAH_MODELS || [];
    const group = (w, label) => `<optgroup label="${label}">` + models.filter((m) => m.world === w).map((m) => `<option>${m.brand} ${m.name}</option>`).join('') + '</optgroup>';
    lModel.innerHTML = '<option value="">Choose a model</option>' + group('drive', 'Drive · cars and SUVs') + group('work', 'Work · pick-ups, trucks, ATV') + '<option>Not sure yet, advise me</option>';
  }
})();
