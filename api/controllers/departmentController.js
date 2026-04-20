const Department = require('../models/Department');

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ is_active: true });
    res.status(200).json({ status: 'success', data: departments });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const newDept = await Department.create(req.body);
    res.status(201).json({ status: 'success', data: newDept });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
