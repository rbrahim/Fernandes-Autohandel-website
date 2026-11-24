/*
 * Fernandes Autohandel: specifications for the compare page.
 * Only figures that are already published on our own model pages / brochures.
 * A model or row that is missing here shows "On request" — never fill in guesses.
 * Later this maps onto the "Vehicle model" document type in Umbraco.
 */
window.FAH_SPEC_ROWS = [
  'Engine / motor', 'Power', 'Transmission', 'Drive', 'Range', 'Battery', 'Charging',
  'Seats', 'Boot', 'Length / width / height', 'Wheels', 'Screen', 'Climate', 'Warranty'
];

window.FAH_SPECS = {
  'hr-v': {
    version: '1.5 LX AT',
    'Engine / motor': '1.5 litre DOHC i-VTEC, petrol',
    'Transmission': 'Automatic',
    'Wheels': '17" alloy',
    'Screen': '8" touchscreen, Apple CarPlay & Android Auto (wired)',
    'Climate': 'Automatic climate control'
  },
  'aion-v': {
    version: 'Luxury',
    'Engine / motor': 'Fully electric, front-wheel drive',
    'Power': '201 hp / 240 Nm',
    'Range': '602 km',
    'Battery': '75.26 kWh LFP',
    'Charging': 'AC 6.6 kW · DC 10–80% in 24 min',
    'Seats': '5',
    'Boot': '427 L, 978 L seats down',
    'Length / width / height': '4,605 / 1,876 / 1,686 mm',
    'Wheels': '19" alloy',
    'Screen': '14.6" touchscreen, 8.88" cluster',
    'Warranty': '8 yrs / 160,000 km · battery 200,000 km'
  },
  'd-max': {
    version: '4 versions',
    'Engine / motor': '1.9 or 3.0 diesel',
    'Power': '150 PS / 350 Nm to 190 PS / 450 Nm',
    'Transmission': '6-speed manual or automatic',
    'Drive': '4x2 or 4x4',
    'Seats': '2 to 5, by cab',
    'Wheels': '15" steel to 18" alloy',
    'Climate': 'Manual or dual-zone automatic',
    'Warranty': '3 yrs / 100,000 km'
  }
};

/* Brochures in assets/brochures/, by model id. */
window.FAH_BROCHURES = {
  'hr-v': 'assets/brochures/honda-hr-v.pdf',
  'aion-v': 'assets/brochures/gac-aion-v.pdf',
  'd-max': 'assets/brochures/isuzu-d-max-2026.pdf',
  'mu-x': 'assets/brochures/isuzu-mu-x-2026.pdf'
};
