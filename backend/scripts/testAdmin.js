const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Coupon = require('../models/Coupon');
require('dotenv').config();

async function testAdminFunctionality() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user exists
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Check stores
    const storeCount = await Store.countDocuments();
    console.log(`Total stores: ${storeCount}`);

    // Check coupons
    const couponCount = await Coupon.countDocuments();
    console.log(`Total coupons: ${couponCount}`);

    // Check users
    const userCount = await User.countDocuments();
    console.log(`Total users: ${userCount}`);

    // Test analytics calculation
    const activeCoupons = await Coupon.countDocuments({ isActive: true, expiryDate: { $gt: new Date() } });
    const expiredCoupons = await Coupon.countDocuments({ $or: [ { isActive: false }, { expiryDate: { $lte: new Date() } } ] });
    const featuredCoupons = await Coupon.countDocuments({ isFeatured: true, isActive: true, expiryDate: { $gt: new Date() } });
    
    console.log(`Active coupons: ${activeCoupons}`);
    console.log(`Expired coupons: ${expiredCoupons}`);
    console.log(`Featured coupons: ${featuredCoupons}`);

    console.log('Admin functionality test completed successfully!');
  } catch (error) {
    console.error('Error testing admin functionality:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAdminFunctionality();
