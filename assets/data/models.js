/*
 * Fernandes Autohandel: vehicle catalogue (demo data).
 * One record per model. Feeds the mega menu, the hero reels and the Drive/Work rails.
 * Later this maps 1:1 onto an Umbraco document type ("Vehicle model").
 *
 * world:  "drive" (Honda & GAC passenger cars) | "work" (Isuzu, trucks, ATV/UTV)
 * group:  menu column / filter inside the world
 * from:   demo price in USD (null = on request). NOT real prices.
 * yt:     official right-hand-drive YouTube video for the hero reel (optional)
 * page:   own model page, if it exists (otherwise links go to the world on the homepage)
 * studio: studio shot on a white/transparent background (optional). Shown whole, never cropped,
 *         in the card menu and on brand pages. Models without one fall back to img.
 */
window.FAH_MODELS = [
  // ---------- Drive · Honda ----------
  { id: 'city',     world: 'drive', brand: 'Honda', group: 'Honda', name: 'City',       type: 'Sedan',       power: 'Petrol',   from: 24900, img: 'honda/city/21.jpg',            pos: '55% 60%', yt: 'iWGNo6GLzDU', ytBy: 'Honda Thailand' },
  { id: 'hr-v',     world: 'drive', brand: 'Honda', group: 'Honda', name: 'HR-V',       type: 'Compact SUV', power: 'Petrol', page: 'hr-v.html',   from: 31500, img: 'honda/hr-v/13471.jpg',          pos: 'center',  yt: 'xstt1aEP6-c', ytBy: 'Honda Thailand', studio: 'honda/hr-v/studio.jpg' },
  { id: 'cr-v',     world: 'drive', brand: 'Honda', group: 'Honda', name: 'CR-V',       type: 'SUV',         power: 'Hybrid',   from: 42900, img: 'honda/cr-v/15860.jpg',          pos: 'center',  yt: '7D9FGdUdTeE', ytBy: 'Honda Thailand', studio: 'honda/cr-v/studio.jpg' },
  { id: 'elevate',  world: 'drive', brand: 'Honda', group: 'Honda', name: 'Elevate',    type: 'Compact SUV', power: 'Petrol',   from: 27500, img: 'honda/elevate/hero.jpg',        pos: 'center' },
  // ---------- Drive · GAC ----------
  { id: 'aion-v',   world: 'drive', brand: 'GAC',   group: 'GAC',   name: 'Aion V',     type: 'SUV',         power: 'Electric', page: 'aion-v.html', from: 38900, img: 'gac/aion/r23.jpg',              pos: '40% center', yt: '8hLUmLvYkgw', ytBy: 'GAC Pakistan', studio: 'gac/aion/studio.jpg' },
  { id: 'aion-ut',  world: 'drive', brand: 'GAC',   group: 'GAC',   name: 'Aion UT',    type: 'Hatchback',   power: 'Electric', from: 26900, img: 'gac/aion-ut/kv.jpg',            pos: 'center' },
  { id: 'emkoo',    world: 'drive', brand: 'GAC',   group: 'GAC',   name: 'Emkoo',      type: 'SUV',         power: 'Hybrid',   from: 36500, img: 'gac/emkoo/hero.jpg',            pos: 'center' },
  { id: 'gs3',      world: 'drive', brand: 'GAC',   group: 'GAC',   name: 'GS3 Emzoom', type: 'Compact SUV', power: 'Petrol',   from: 25900, img: 'gac/gs3/hero.jpg',              pos: 'center' },
  { id: 'gs8',      world: 'drive', brand: 'GAC',   group: 'GAC',   name: 'GS8',        type: '7-seat SUV',  power: 'Hybrid',   from: 49900, img: 'gac/gs8/pr15.jpg',              pos: 'center' },
  { id: 's7',       world: 'drive', brand: 'GAC',   group: 'GAC',   name: 'S7',         type: '7-seat SUV',  power: 'Plug-in hybrid', from: 44500, img: 'gac/s7/w8.jpg',          pos: 'center' },
  // ---------- Drive · Isuzu ----------
  { id: 'mu-x',     world: 'drive', brand: 'Isuzu', group: 'Isuzu', name: 'MU-X',       type: '7-seat SUV',  power: 'Diesel',   from: 39900, img: 'isuzu/mu-x/hero.png',           pos: 'center',  yt: 'Tr2-o6ECTHg', ytBy: 'Isuzu South Africa', studio: 'isuzu/mu-x/studio.jpg' },
  // ---------- Work · Isuzu pick-ups & 4x4 ----------
  { id: 'd-max',    world: 'work',  brand: 'Isuzu', group: 'Pick-up', name: 'D-Max',     type: 'Pick-up',      power: 'Diesel', page: 'd-max.html', from: 23900, img: 'isuzu/d-max/hero.png',   pos: '62% center', yt: '9rURg5ZV7gk', ytBy: 'Isuzu UTE Australia', studio: 'isuzu/d-max/studio.jpg' },
  // ---------- Work · Isuzu trucks ----------
  { id: 'n-series', world: 'work',  brand: 'Isuzu', group: 'Trucks', name: 'N-Series',          type: 'Light truck',  power: 'Diesel', from: null,  img: 'trucks/n-series.jpg',    pos: 'center',     yt: 'GNjf1YFN82Q', ytBy: 'Isuzu South Africa' },
  { id: 'p-series', world: 'work',  brand: 'Isuzu', group: 'Trucks', name: 'P-Series Traviz',   type: 'Light truck',  power: 'Diesel', from: null,  img: 'trucks/dsc05157_.jpg',   pos: 'center' },
  { id: 'q-series', world: 'work',  brand: 'Isuzu', group: 'Trucks', name: 'Q-Series',          type: 'Light truck',  power: 'Diesel', from: null,  img: 'trucks/q-series.jpg',    pos: 'center' },
  { id: 'f-series', world: 'work',  brand: 'Isuzu', group: 'Trucks', name: 'F-Series',          type: 'Medium truck', power: 'Diesel', from: null,  img: 'trucks/f-series.jpg',    pos: '74% center' },
  // ---------- Work · Honda ATV & UTV ----------
  { id: 'foreman',  world: 'work',  brand: 'Honda', group: 'ATV & UTV', name: 'Foreman',     type: 'ATV',          power: 'Petrol', from: 11900, img: 'atv/foreman.jpg',        pos: '60% center' },
  { id: 'pioneer',  world: 'work',  brand: 'Honda', group: 'ATV & UTV', name: 'Pioneer 700', type: 'UTV',          power: 'Petrol', from: 16900, img: 'atv/pioneer.jpg',        pos: '60% center' }
];

window.FAH_WORLDS = {
  drive: { label: 'Drive', groups: ['Honda', 'GAC', 'Isuzu'], filters: ['Sedan', 'Hatchback', 'Compact SUV', 'SUV', '7-seat SUV', 'Electric', 'Hybrid', 'Diesel'] },
  work:  { label: 'Work',  groups: ['Pick-up', 'Trucks', 'ATV & UTV'], filters: [] }
};

/* Brand pages: one record per brand (brand.html?b= is not used; each brand has its own file). */
window.FAH_BRANDS = {
  Honda: { page: 'honda.html', logo: 'brand/honda-logo.png', since: '1997', sinceLabel: 'Honda ATVs in Suriname' },
  GAC:   { page: 'gac.html',   logo: 'brand/gac-logo.png',   since: '2026', sinceLabel: 'Official, exclusive GAC dealer' },
  Isuzu: { page: 'isuzu.html', logo: 'brand/isuzu-logo.png', since: '1963', sinceLabel: 'Isuzu agent in Suriname' }
};
