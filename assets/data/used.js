/*
 * Used cars (occasions). Same fields as the current Fernandes listing, plus a few for filtering.
 * In the live site this list comes from Fernandes' stock system (the current site loads photos
 * from /sharepoint/images/), so the page only reads it and never needs manual HTML edits.
 *
 * status:  'stock' | 'new' (just arrived) | 'special' (special offer) | 'sold' (recently sold)
 * price:   USD incl. BTW. was: previous price for special offers.
 * imgs:    optional photo gallery (first = cover). Falls back to [img].
 * demo:    true = demo record for the presentation; only PH5429 is a real listing.
 */
window.FAH_USED = [
  { id: 'ph5429', title: 'Honda City AT', brand: 'Honda', body: 'Sedan', year: 2017, km: 24000, trans: 'Automatic', drive: '2WD', fuel: 'Petrol', colour: 'Silver', price: 10450, status: 'stock', plate: 'PH5429', arrived: '2026-10-28', img: 'used/PH5429.jpeg' },

  { id: 'd01', title: 'Honda HR-V EX', brand: 'Honda', body: 'SUV', year: 2021, km: 38000, trans: 'Automatic', drive: '2WD', fuel: 'Petrol', colour: 'White', price: 23900, status: 'new', arrived: '2026-11-20', img: 'honda/hr-v/13471.jpg', imgs: ['honda/hr-v/13471.jpg','honda/hr-v/13481.jpg','honda/hr-v/hr-v-2022-rhd-exterior-495.jpg','honda/hr-v/hr-v-2022-rhd-interior-501.jpg','honda/hr-v/hr-v-2022-rhd-interior-503.jpg','honda/hr-v/hr-v-2022-rhd-interior-504.jpg'], demo: true },
  { id: 'd02', title: 'Isuzu D-Max Crew Cab 4x4', brand: 'Isuzu', body: 'Pick-up', year: 2020, km: 72000, trans: 'Manual', drive: '4WD', fuel: 'Diesel', colour: 'Black', price: 24500, status: 'sold', arrived: '2026-10-02', sold: '2026-11-14', img: 'isuzu/d-max/front-onyx-black.png', demo: true },
  { id: 'd03', title: 'Honda CR-V', brand: 'Honda', body: 'SUV', year: 2019, km: 61000, trans: 'Automatic', drive: '4WD', fuel: 'Petrol', colour: 'Grey', price: 21750, status: 'stock', arrived: '2026-10-15', img: 'honda/cr-v/15860.jpg', imgs: ['honda/cr-v/15860.jpg','honda/cr-v/studio.jpg'], demo: true },
  { id: 'd04', title: 'Isuzu Traviz', brand: 'Isuzu', body: 'Truck', year: 2023, km: 18000, trans: 'Manual', drive: '2WD', fuel: 'Diesel', colour: 'White', price: 27800, status: 'new', arrived: '2026-11-18', img: 'trucks/dsc05162.jpg', imgs: ['trucks/dsc05162.jpg','trucks/dsc05157_.jpg'], demo: true },
  { id: 'd05', title: 'Isuzu MU-X 4x4', brand: 'Isuzu', body: 'SUV', year: 2022, km: 41000, trans: 'Automatic', drive: '4WD', fuel: 'Diesel', colour: 'Silver', price: 33500, was: 35900, status: 'special', arrived: '2026-09-30', img: 'isuzu/mu-x/front-silver.png', imgs: ['isuzu/mu-x/front-silver.png','isuzu/mu-x/hero.png','isuzu/mu-x/studio.jpg'], demo: true },
  { id: 'd06', title: 'GAC Aion UT', brand: 'GAC', body: 'Hatchback', year: 2025, km: 6000, trans: 'Automatic', drive: '2WD', fuel: 'Electric', colour: 'Green', price: 22900, status: 'new', arrived: '2026-11-21', img: 'gac/aion-ut/kv.jpg', demo: true },
  { id: 'd07', title: 'Honda HR-V LX', brand: 'Honda', body: 'SUV', year: 2020, km: 55000, trans: 'Automatic', drive: '2WD', fuel: 'Petrol', colour: 'Black', price: 19900, status: 'stock', arrived: '2026-10-09', img: 'honda/hr-v/13465.jpg', imgs: ['honda/hr-v/13465.jpg','honda/hr-v/13477.jpg','honda/hr-v/hr-v-2022-rhd-interior-501.jpg','honda/hr-v/hr-v-2022-rhd-interior-502.jpg'], demo: true },
  { id: 'd08', title: 'Isuzu D-Max Regular Cab', brand: 'Isuzu', body: 'Pick-up', year: 2018, km: 118000, trans: 'Manual', drive: '2WD', fuel: 'Diesel', colour: 'White', price: 13900, was: 15500, status: 'special', arrived: '2026-09-12', img: 'isuzu/d-max/front-splash-white.png', demo: true },
  { id: 'd09', title: 'Honda City Hatchback', brand: 'Honda', body: 'Hatchback', year: 2016, km: 87000, trans: 'Automatic', drive: '2WD', fuel: 'Petrol', colour: 'Blue', price: 8950, status: 'stock', arrived: '2026-10-21', img: 'honda/city/40.jpg', imgs: ['honda/city/40.jpg','honda/city/studio.jpg'], demo: true },
  { id: 'd10', title: 'GAC GS3 Emzoom', brand: 'GAC', body: 'SUV', year: 2024, km: 14000, trans: 'Automatic', drive: '2WD', fuel: 'Petrol', colour: 'Blue', price: 21500, status: 'stock', arrived: '2026-11-03', img: 'gac/gs3/hero.jpg', imgs: ['gac/gs3/hero.jpg','gac/gs3/studio.jpg'], demo: true },
  { id: 'd11', title: 'Isuzu N-Series NPR', brand: 'Isuzu', body: 'Truck', year: 2015, km: 210000, trans: 'Manual', drive: '2WD', fuel: 'Diesel', colour: 'White', price: 18500, status: 'stock', arrived: '2026-08-25', img: 'trucks/n-series.jpg', demo: true },
  { id: 'd12', title: 'Honda Elevate', brand: 'Honda', body: 'SUV', year: 2024, km: 9000, trans: 'Automatic', drive: '2WD', fuel: 'Petrol', colour: 'Red', price: 22500, status: 'sold', arrived: '2026-10-20', sold: '2026-11-19', img: 'honda/elevate/hero.jpg', demo: true },
  { id: 'd13', title: 'Isuzu D-Max Extended Cab 4x4', brand: 'Isuzu', body: 'Pick-up', year: 2021, km: 64000, trans: 'Manual', drive: '4WD', fuel: 'Diesel', colour: 'Green', price: 23200, status: 'stock', arrived: '2026-10-30', img: 'isuzu/d-max/front-green.png', imgs: ['isuzu/d-max/front-green.png','isuzu/d-max/interior-dashboard_45_gexp-rhd_rbe_leather_4x4_at.jpg','isuzu/d-max/interior-side-view-leather-brown.png','isuzu/d-max/interior-dashboard_gexp-rhd_rbe_leather_4x4_at_black-brown.jpg'], demo: true },
  { id: 'd14', title: 'GAC GS8', brand: 'GAC', body: 'SUV', year: 2025, km: 11000, trans: 'Automatic', drive: '4WD', fuel: 'Hybrid', colour: 'Green', price: 41900, status: 'sold', arrived: '2026-10-11', sold: '2026-11-08', img: 'gac/gs8/pr15.jpg', demo: true }
];
