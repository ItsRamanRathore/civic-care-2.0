/**
 * Service to calculate optimized inspection routes for field workers
 */
class RouteOptimizationService {
  /**
   * Sorts a list of coordinates into an optimized sequence (Nearest Neighbor)
   * @param {Array} coordinates - [{ lat, lng, id }]
   * @returns {Array} - Sorted coordinates
   */
  static optimize(locations) {
    if (locations.length <= 2) return locations;

    const unvisited = [...locations];
    const route = [];
    
    // Start with the first location as origin
    let current = unvisited.shift();
    route.push(current);

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const dist = this.getDistance(current, unvisited[i]);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      current = unvisited.splice(nearestIdx, 1)[0];
      route.push(current);
    }

    return route;
  }

  /**
   * Haversine distance between two points
   */
  static getDistance(p1, p2) {
    const R = 6371e3; // metres
    const φ1 = p1.lat * Math.PI / 180;
    const φ2 = p2.lat * Math.PI / 180;
    const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
    const Δλ = (p2.lng - p1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

module.exports = RouteOptimizationService;
