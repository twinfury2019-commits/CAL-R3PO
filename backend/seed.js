const dotenv   = require('dotenv');
const mongoose = require('mongoose');
const User     = require('./models/User');
const License  = require('./models/License');

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB — seeding...\n');

  // Wipe existing data
  await User.deleteMany({});
  await License.deleteMany({});

  // ─── Users ───────────────────────────────────────────────
  const admin = await User.create({
    username: process.env.SEED_ADMIN_USER || 'admin',
    password: process.env.SEED_ADMIN_PASS || 'ChangeMe@123',
    role:     'admin'
  });

  await User.create({
    username: process.env.SEED_OP_USER || 'operator1',
    password: process.env.SEED_OP_PASS || 'ChangeMe@123',
    role:     'operator'
  });

  // ─── Licenses ────────────────────────────────────────────
  await License.create([
    {
      cnic:        '5440112345678',
      name:        'Muhammad Yousaf Khan',
      fatherName:  'Haji Abdul Karim Khan',
      address:     'House #12, Satellite Town, Chaman',
      licenseNo:   'CHA/AL/2021/00341',
      weaponNo:    'PK-2024-07834',
      weaponType:  'Pistol 9mm (Beretta M9)',
      issueDate:   new Date('2021-03-15'),
      expiryDate:  new Date('2026-03-15'),
      licenseType: 'All Pakistan',
      createdBy:   admin._id
    },
    {
      cnic:        '5440198765432',
      name:        'Abdul Qadir Baloch',
      fatherName:  'Haji Noor Muhammad Baloch',
      address:     'Ward 5, Near Customs Office, Chaman',
      licenseNo:   'CHA/AL/2020/00187',
      weaponNo:    'SG-2023-04512',
      weaponType:  'Shotgun 12-Bore (Double Barrel)',
      issueDate:   new Date('2020-07-04'),
      expiryDate:  new Date('2025-07-04'),
      licenseType: 'Balochistan',
      createdBy:   admin._id
    },
    {
      cnic:        '5440156781234',
      name:        'Khan Muhammad Kakar',
      fatherName:  'Bismillah Khan Kakar',
      address:     'Street 3, Islam Abad Colony, Chaman',
      licenseNo:   'CHA/AL/2022/00512',
      weaponNo:    'RV-2022-01122',
      weaponType:  'Revolver .38 Special',
      issueDate:   new Date('2022-11-10'),
      expiryDate:  new Date('2027-11-10'),
      licenseType: 'All Pakistan',
      createdBy:   admin._id
    }
  ]);

  console.log('✓ Seed complete\n');
  console.log('─────────────────────────────────────────');
  console.log('  Credentials');
  console.log('─────────────────────────────────────────');
  console.log('  Admin     →  admin     / Admin@1234');
  console.log('  Operator  →  operator1 / Op@12345');
  console.log('─────────────────────────────────────────');
  console.log('  Test CNICs');
  console.log('─────────────────────────────────────────');
  console.log('  5440112345678  →  Muhammad Yousaf Khan');
  console.log('  5440198765432  →  Abdul Qadir Baloch');
  console.log('  5440156781234  →  Khan Muhammad Kakar');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
};

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
