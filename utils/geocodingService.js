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

    try {
      console.log(`🌍 Geocoding address: ${address}`);
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'CivicCare-App/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        console.log(`✅ Geocoding success: ${lat}, ${lon}`);
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lon)
        };
      }

      console.warn('⚠️ No geocoding results found for address');
      return null;
    } catch (error) {
      console.error('❌ Geocoding failed:', error.message);
      return null;
    }
  }
}

module.exports = GeocodingService;
