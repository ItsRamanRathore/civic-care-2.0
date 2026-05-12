const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const CivicIssue = require('../models/CivicIssue');

async function debugIssues() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_care');
    console.log('Connected!');

    const issues = await CivicIssue.find({}).sort('-createdAt').limit(10);
    
    console.log('\n--- Recent Issues ---');
    issues.forEach(issue => {
      console.log(`ID: ${issue.custom_id || issue._id}`);
      console.log(`Title: ${issue.title}`);
      console.log(`Address: ${issue.address}`);
      console.log(`Latitude: ${issue.latitude}`);
      console.log(`Longitude: ${issue.longitude}`);
      console.log(`GeoJSON: ${JSON.stringify(issue.location_geojson)}`);
      console.log(`Virtual Coordinates: ${JSON.stringify(issue.coordinates)}`);
      console.log('-------------------');
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

debugIssues();
