require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, BusinessProfile, AppSettings } = require('../models');

const DEMO_USERS = [
  {
    name: 'Super Admin Sai',
    email: 'sai.superadmin@gmail.com',
    password: 'SuperAdmin@123',
    role: 'super_admin',
    company: 'InvoiceFlow System',
  },
  {
    name: 'Admin Sai',
    email: 'sai.admin@gmail.com',
    password: 'Admin@123',
    role: 'admin',
    company: 'Acme Solutions Ltd.',
  },
  {
    name: 'Vendor Sai',
    email: 'sai.vendor@gmail.com',
    password: 'Vendor@123',
    role: 'vendor',
    company: 'Apex Supply Network',
  },
  {
    name: 'Client Sai',
    email: 'sai.client@gmail.com',
    password: 'Client@123',
    role: 'client',
    company: 'Vanguard Retailers',
  },
];

async function seedDemoUsers() {
  console.log('[SEED] Starting demo user initialization...');
  try {
    for (const item of DEMO_USERS) {
      const email = item.email.toLowerCase().trim();
      let user = await User.findOne({ email });

      if (!user) {
        const passwordHash = await bcrypt.hash(item.password, 12);
        user = await User.create({
          name: item.name,
          email,
          password: passwordHash,
          role: item.role,
        });

        const business = await BusinessProfile.create({
          owner: user._id,
          companyName: item.company,
          email,
        });

        user.business = business._id;
        await user.save();

        await AppSettings.create({
          business: business._id,
          currency: 'INR',
          invoicePrefix: 'INV',
        });

        console.log(`[SEED] Created demo account: ${email} (${item.role})`);
      } else {
        console.log(`[SEED] Account exists: ${email} (${user.role})`);
      }
    }
    console.log('[SEED] Seeding finished successfully.');
  } catch (err) {
    console.error('[SEED] Error during seeding:', err.message);
  }
}

// If executed directly from command line: `node config/seed.js` or `npm run seed`
if (require.main === module) {
  const url = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/TestUsers';
  mongoose.connect(url).then(async () => {
    console.log(`[SEED] Connected to MongoDB at ${url}`);
    await seedDemoUsers();
    await mongoose.disconnect();
    console.log('[SEED] Disconnected from MongoDB.');
    process.exit(0);
  }).catch((err) => {
    console.error('[SEED] MongoDB connection failure:', err.message);
    process.exit(1);
  });
}

module.exports = { seedDemoUsers };
