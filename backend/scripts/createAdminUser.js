const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: __dirname + '/../.env' });

async function createAdminUser() {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = 'ebonali05@gmail.com';
  const password = 'ebon2580';
  const username = 'admin';
  const role = 'admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists. Updating role to admin...');
    existing.role = 'admin';
    await existing.save();
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, role });
  await user.save();
  console.log('Admin user created!');
  await mongoose.disconnect();
}

createAdminUser(); 