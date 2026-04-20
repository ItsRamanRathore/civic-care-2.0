const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  contact_email: {
    type: String,
    default: null,
  },
  contact_phone: {
    type: String,
    default: null,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
