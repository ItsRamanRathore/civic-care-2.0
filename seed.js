require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const CivicIssue = require('./models/CivicIssue');

const demoUsers = [
  { full_name: 'Super Admin', email: 'admin@civic.gov', password: 'admin123', role: 'super_admin' },
  { full_name: 'Jane Citizen', email: 'citizen@example.com', password: 'citizen123', role: 'citizen' },
  { full_name: 'Department Head', email: 'dept@civic.gov', password: 'dept123', role: 'department_head' },
  { full_name: 'Ward Officer', email: 'ward@civic.gov', password: 'ward123', role: 'ward_officer' }
];

const demoIssues = [
  {
    title: 'Major Pothole - CP',
    description: 'Dangerous pothole near the metro station.',
    category: 'roads',
    status: 'submitted',
    priority: 'high',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Connaught Place, New Delhi',
    reporter_name: 'System Demo'
  },
  {
    title: 'Water Leak - Rohini',
    description: 'Main pipeline burst.',
    category: 'utilities',
    status: 'in_progress',
    priority: 'critical',
    latitude: 28.6250,
    longitude: 77.2150,
    address: 'Sector 15, Rohini',
    reporter_name: 'System Demo'
  },
  {
    title: 'Garbage Pile - Lajpat Nagar',
    description: 'Uncollected waste for 3 days.',
    category: 'sanitation',
    status: 'submitted',
    priority: 'medium',
    latitude: 28.6100,
    longitude: 77.2200,
    address: 'Lajpat Nagar II',
    reporter_name: 'System Demo'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Users
    const emails = demoUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    
    const seededUsers = [];
    for (const userData of demoUsers) {
      const u = await new User(userData).save();
      seededUsers.push(u);
    }
    console.log('👤 Demo users seeded');

    // Issues
    await CivicIssue.deleteMany({ title: { $in: demoIssues.map(i => i.title) } });
    const adminUser = seededUsers.find(u => u.role === 'super_admin');
    
    for (const issueData of demoIssues) {
      const issue = {
        ...issueData,
        reporter_id: adminUser._id
      };
      await new CivicIssue(issue).save();
    }
    console.log('📍 Demo issues seeded');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};


seedDatabase();
