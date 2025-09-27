const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
require('dotenv').config({ path: __dirname + '/../.env' });

async function removeSearchCategory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all coupons with "search" category (case insensitive)
    const searchCoupons = await Coupon.find({
      category: { $regex: /search/i }
    });

    console.log(`Found ${searchCoupons.length} coupons with "search" category:`);
    
    if (searchCoupons.length > 0) {
      searchCoupons.forEach(coupon => {
        console.log(`- ${coupon.title} (${coupon.code}) - Category: ${coupon.category}`);
      });

      // Delete all coupons with "search" category
      const result = await Coupon.deleteMany({
        category: { $regex: /search/i }
      });

      console.log(`\n✅ Successfully deleted ${result.deletedCount} coupons with "search" category`);
    } else {
      console.log('No coupons found with "search" category');
    }

    // Show updated categories
    const categories = await Coupon.distinct('category', { 
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    
    console.log(`\n📋 Current active categories: ${categories.join(', ')}`);

  } catch (error) {
    console.error('Error removing search category:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
removeSearchCategory();
