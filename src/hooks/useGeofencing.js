import { useState, useEffect } from 'react';

/**
 * Hook to monitor user proximity to civic issues and trigger alerts.
 * @param {Array} issues - List of localized issues.
 * @param {number} radiusKm - Geofencing radius in kilometers (default 0.5km).
 */
const useGeofencing = (issues, radiusKm = 0.5) => {
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [lastAlertedId, setLastAlertedId] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (!navigator.geolocation || !issues || issues.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        const nearby = issues.filter(issue => {
          if (!issue.coordinates) return false;
          const dist = calculateDistance(
            latitude, longitude, 
            issue.coordinates.lat, issue.coordinates.lng
          );
          return dist <= radiusKm;
        });

        setNearbyIssues(nearby);

        // Alert logic: If we find a new nearby issue that is 'critical'
        if (nearby.length > 0) {
          const topIssue = nearby.sort((a,b) => b.priority === 'critical' ? 1 : -1)[0];
          if (topIssue._id !== lastAlertedId) {
            triggerAlert(topIssue);
            setLastAlertedId(topIssue._id);
          }
        }
      },
      (error) => console.warn('Geofencing tracking error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [issues, radiusKm, lastAlertedId]);

  const triggerAlert = (issue) => {
    if (Notification.permission === 'granted') {
      new Notification('Civic Care: Issue Nearby', {
        body: `${issue.title} located within ${radiusKm * 1000}m of you.`,
        icon: '/logo192.png'
      });
    } else {
      console.log('🔔 Proximity Alert:', issue.title);
    }
  };

  return { nearbyIssues };
};

export default useGeofencing;
