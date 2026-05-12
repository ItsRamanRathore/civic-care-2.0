const axios = require('axios');

/**
 * Service to handle geocoding (Address -> Coordinates)
 */
class GeocodingService {
  /**
   * Geocode an address using OpenStreetMap Nominatim (Free, no key required)
   * @param {string} address 
   * @returns {Promise<{lat: number, lng: number}|null>}
   */
  static async geocode(address) {
    if (!address) return null;

    // List of variations to try if the direct search fails
    const city = 'Bhopal';
    const variations = [
      address,
      address.includes(city) ? address : `${address}, ${city}`,
      address.replace(/chauraha/i, 'Square'),
      address.replace(/chauraha/i, ''), // Just remove it
      address.split(' ').slice(0, 3).join(' ') + `, ${city}`, // First 3 words
      address.split(' ').slice(0, 2).join(' ') + `, ${city}`, // First 2 words
      address.split(' ').slice(0, 1).join(' ') + `, ${city}`  // First 1 word
    ];

    try {
      for (const query of variations) {
        console.log(`🌍 Trying geocode query: ${query}`);
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: query, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'CivicCare-App/1.0' }
        });

        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          console.log(`✅ Geocoding success for "${query}": ${lat}, ${lon}`);
          return { lat: parseFloat(lat), lng: parseFloat(lon) };
        }
      }

      // Final fallback: Use AI if traditional geocoding fails
      console.log('🤖 Nominatim failed. Trying AI fallback...');
      const aiService = require('./aiService');
      const aiCoords = await aiService.geocodeAddress(address);
      if (aiCoords) {
        console.log(`✅ AI Geocoding success: ${aiCoords.lat}, ${aiCoords.lng}`);
        return aiCoords;
      }

      console.warn('⚠️ All geocoding attempts failed for address');
      return null;
    } catch (error) {
      console.error('❌ Geocoding failed:', error.message);
      return null;
    }
  }
}

module.exports = GeocodingService;
