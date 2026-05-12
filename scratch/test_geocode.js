const GeocodingService = require('../utils/geocodingService');

async function testGeocode() {
  const addresses = [
    'Karond chauraha bhopal',
    'Karond Square, Bhopal, Madhya Pradesh, India',
    'Karond, Bhopal'
  ];
  for (const address of addresses) {
    console.log(`\nTesting geocode for: "${address}"`);
    const coords = await GeocodingService.geocode(address);
    console.log('Result:', coords);
  }
}

testGeocode();
