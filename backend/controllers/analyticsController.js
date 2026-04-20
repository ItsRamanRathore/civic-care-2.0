const CivicIssue = require('../models/CivicIssue');
const RouteOptimizationService = require('../services/routeOptimizationService');

exports.getOptimizedRoute = async (req, res) => {
  try {
    const { issueIds, startLocation } = req.body;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({ message: 'issueIds array is required' });
    }

    const issues = await CivicIssue.find({ _id: { $in: issueIds } });
    
    if (issues.length === 0) {
      return res.status(404).json({ message: 'No issues found for provided IDs' });
    }

    // Prepare waypoints for the optimization service
    const waypoints = issues.map(issue => ({
      id: issue._id,
      lat: issue.location_geojson.coordinates[1],
      lng: issue.location_geojson.coordinates[0],
      priority: issue.priority_score || 0
    }));

    const optimizedOrder = RouteOptimizationService.optimize(waypoints, startLocation);

    res.status(200).json({
      success: true,
      data: {
        originalCount: issues.length,
        optimizedPath: optimizedOrder,
        optimizedIssueIds: optimizedOrder.map(wp => wp.id)
      }
    });
  } catch (error) {
    console.error('Route Optimization Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
