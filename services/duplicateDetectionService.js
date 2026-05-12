const CivicIssue = require('../models/CivicIssue');

/**
 * Service to detect potential duplicate civic reports
 */
class DuplicateDetectionService {
  /**
   * Checks if an issue at a given location is a potential duplicate
   * @param {Object} data - { category, latitude, longitude, description }
   * @returns {Promise<Object|null>} - The existing parent issue if found
   */
  static async findDuplicate(data) {
    const { category, latitude, longitude, description } = data;
    
    // 1. Basic Spatial Check (Last 72 hours, 150 meters)
    const timeWindow = new Date(Date.now() - 72 * 60 * 60 * 1000);
    
    if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      const spatialDuplicate = await CivicIssue.findOne({
        category: category,
        status: { $ne: 'resolved' }, // Only check active issues
        createdAt: { $gte: timeWindow },
        location_geojson: {
          $near: {
            $geometry: { type: "Point", coordinates: [longitude, latitude] },
            $maxDistance: 150 // 150 meters radius
          }
        }
      });

      if (spatialDuplicate) return spatialDuplicate;
    }

    // 2. Semantic/Keyword check (fallback if GPS is slightly off)
    // We check for very similar titles/descriptions in the same category
    if (description) {
      const keywords = description.toLowerCase().split(/\W+/).filter(w => w.length > 4);
      if (keywords.length > 0) {
        const textDuplicate = await CivicIssue.findOne({
          category: category,
          status: { $ne: 'resolved' },
          createdAt: { $gte: timeWindow },
          $text: { $search: keywords.join(' ') } // Uses MongoDB text index if available
        }).sort({ score: { $meta: "textScore" } });
        
        return textDuplicate;
      }
    }

    return null;
  }
}

module.exports = DuplicateDetectionService;
