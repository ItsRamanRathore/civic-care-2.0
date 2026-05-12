const mongoose = require('mongoose');
const IssueUpdate = require('./IssueUpdate');

const civicIssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['roads', 'sanitation', 'utilities', 'infrastructure', 'safety', 'environment', 'other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['submitted', 'in_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'submitted',
  },
  
  // Location information
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  
  // User information
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.reporter_name; // Required if not anonymous
    }
  },
  assigned_department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null,
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  // Contact information (mainly for anonymous or fallback)
  reporter_name: String,
  reporter_email: String,
  reporter_phone: String,
  
  resolved_at: {
    type: Date,
    default: null,
  },
  
  // AI Oversight & Metadata
  ai_analysis: {
    suggested_category: String,
    suggested_priority: String,
    reasoning: String,
    confidence: { type: Number, default: 0 },
    is_reviewed: { type: Boolean, default: false }
  },
  duplicate_of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CivicIssue',
    default: null
  },
  is_ai_categorized: {
    type: Boolean,
    default: false
  },

  // Geospatial Support (GeoJSON)
  location_geojson: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  custom_id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  }
}, {
  timestamps: true,
});

// Indexes for Performance
civicIssueSchema.index({ location_geojson: '2dsphere' });
civicIssueSchema.index({ status: 1, createdAt: -1 });
civicIssueSchema.index({ category: 1, priority: 1 });
civicIssueSchema.index({ title: 'text', description: 'text' });

// Sync location_geojson with latitude/longitude & Generate Friendly ID
civicIssueSchema.pre('save', async function(next) {
  // 1. Generate Friendly ID if it doesn't exist
  if (!this.custom_id) {
    try {
      const year = new Date().getFullYear();
      const count = await this.constructor.countDocuments({ 
        createdAt: { 
          $gte: new Date(year, 0, 1), 
          $lt: new Date(year + 1, 0, 1) 
        } 
      });
      this.custom_id = `CC-${year}-${(count + 1).toString().padStart(3, '0')}`;
    } catch (err) {
      console.error('Error generating friendly ID:', err);
      // Fallback or unique random if count fails
      this.custom_id = `CC-${Date.now().toString().slice(-8)}`;
    }
  }

  // 2. Geospatial Sync
  if (this.latitude !== null && this.longitude !== null) {
    this.location_geojson = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude] // Mongo uses [lng, lat]
    };
  }
  next();
});

// To match Supabase's virtual or calculated fields if needed
civicIssueSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

civicIssueSchema.set('toJSON', {
  virtuals: true
});

civicIssueSchema.set('toObject', {
  virtuals: true
});

// Virtual for coordinates object to match frontend expectation
civicIssueSchema.virtual('coordinates').get(function() {
  if (this.latitude !== null && this.latitude !== undefined && 
      this.longitude !== null && this.longitude !== undefined) {
    return { lat: this.latitude, lng: this.longitude };
  }
  
  // Fallback to location_geojson if direct fields are missing
  if (this.location_geojson && 
      this.location_geojson.coordinates && 
      this.location_geojson.coordinates.length === 2 &&
      (this.location_geojson.coordinates[0] !== 0 || this.location_geojson.coordinates[1] !== 0)) {
    return { 
      lat: this.location_geojson.coordinates[1], 
      lng: this.location_geojson.coordinates[0] 
    };
  }
  
  return null;
});

civicIssueSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

civicIssueSchema.virtual('reportedAt').get(function() {
  return this.createdAt;
});

civicIssueSchema.virtual('reporter').get(function() {
  return {
    name: this.reporter_name || 'Anonymous',
    id: this.reporter_id
  };
});

// Replicate Supabase trigger: Create an issue update on status change
civicIssueSchema.post('save', async function(doc) {
  // Logic moved to controller for robustness
});

const CivicIssue = mongoose.model('CivicIssue', civicIssueSchema);
module.exports = CivicIssue;
