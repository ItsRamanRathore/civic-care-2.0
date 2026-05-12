const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const CivicIssue = require('../models/CivicIssue');
const GeocodingService = require('../utils/geocodingService');

async function fixMissingCoordinates() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_care');
    console.log('Connected!');

    const issues = await CivicIssue.find({
      $or: [
        { latitude: null },
        { longitude: null },
        { latitude: 0, longitude: 0 } // Potential equator errors
      ]
    });
    
    console.log(`Found ${issues.length} issues with missing or zero coordinates.`);

    for (const issue of issues) {
      if (issue.address && issue.address !== 'Reported via Bot') {
        console.log(`\nFixing issue: ${issue.custom_id || issue._id}`);
        console.log(`Address: ${issue.address}`);
        
        const coords = await GeocodingService.geocode(issue.address);
        if (coords) {
          issue.latitude = coords.lat;
          issue.longitude = coords.lng;
          // location_geojson will be updated by pre('save') hook
          await issue.save();
          console.log(`✅ Fixed! Coordinates: ${coords.lat}, ${coords.lng}`);
        } else {
          console.warn(`❌ Could not geocode address even with fallback.`);
        }
      }
    }

    console.log('\nMaintenance complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixMissingCoordinates();
