const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const anomalyController = require('../controllers/anomalyController');
const forecastController = require('../controllers/forecastController');

router.post('/optimize-route', protect, restrictTo('super_admin', 'department_head', 'ward_officer'), analyticsController.getOptimizedRoute);
router.get('/anomalies', protect, restrictTo('super_admin', 'department_head'), anomalyController.detectAnomalies);
router.get('/forecast', protect, restrictTo('super_admin', 'department_head'), forecastController.getForecast);

module.exports = router;
