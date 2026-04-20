const express = require('express');
const departmentController = require('../controllers/departmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', departmentController.getAllDepartments);

// Only admins can create departments
router.post('/', protect, restrictTo('admin'), departmentController.createDepartment);

module.exports = router;
