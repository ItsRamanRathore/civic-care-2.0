const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CivicIssue = require('./models/CivicIssue');
const User = require('./models/User');
const Department = require('./models/Department');

dotenv.config();

const SEED_DATA_COUNT = 100;
const CATEGORIES = ['roads', 'sanitation', 'utilities', 'infrastructure', 'safety', 'environment'];

const seedPhase3 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 Seeding Phase 3 Intelligence Data...');

    // Clear existing issues for a clean analytics state
    await CivicIssue.deleteMany({});

    const admin = await User.findOne({ role: 'super_admin' });
    if (!admin) {
      console.error('❌ Super Admin not found. Run standard seed first.');
      process.exit(1);
    }

    const departments = await Department.find();
    
    const issues = [];
    const now = new Date();

    for (let i = 0; i < SEED_DATA_COUNT; i++) {
       const daysAgo = Math.floor(Math.random() * 30);
       const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
       const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
       
       // Higher density 5-10 days ago to trigger "Anomalies" (spike detection comparison)
       const isSpikePeriod = daysAgo >= 5 && daysAgo <= 10;
       const count = isSpikePeriod ? 5 : 1;

       for(let j=0; j<count; j++) {
         const isResolved = Math.random() > 0.3;
         const resolvedAt = isResolved ? new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000) : null;
         const status = isResolved ? 'resolved' : 'assigned';
         
         issues.push({
           title: `Automated Report: ${category} issue #${i}-${j}`,
           description: `System generated report for ${category} monitoring.`,
           category,
           priority: Math.random() > 0.8 ? 'critical' : (Math.random() > 0.5 ? 'high' : 'medium'),
           status,
           latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
           longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
           address: 'Automated Sample District',
           reporter_id: admin._id,
           reporter_name: admin.full_name,
           assigned_department_id: departments[Math.floor(Math.random() * departments.length)]?._id,
           createdAt,
           updatedAt: resolvedAt || createdAt,
           resolutionTime: isResolved ? (resolvedAt - createdAt) / (1000 * 60 * 60) : null,
           sla_deadline: new Date(createdAt.getTime() + 48 * 24 * 60 * 60 * 1000)
         });
       }
    }

    await CivicIssue.insertMany(issues);
    console.log(`✅ Success! Seeded ${issues.length} issues across the last 30 days.`);
    console.log('📈 Analytics Dashboard should now show Trends, Anomalies, and Forecasts.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedPhase3();
