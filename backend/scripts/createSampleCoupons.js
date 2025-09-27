const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Store = require('../models/Store');
require('dotenv').config({ path: __dirname + '/../.env' });

async function createSampleCoupons() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all stores
    const stores = await Store.find({});
    if (stores.length === 0) {
      console.log('No stores found. Please run createSampleStores.js first.');
      return;
    }

    // Clear existing coupons (optional)
    // await Coupon.deleteMany({});
    // console.log('Cleared existing coupons');

    const sampleCoupons = [
      {
        title: 'Summer Electronics Sale',
        description: 'Get massive discounts on all electronics including smartphones, laptops, and gadgets. Limited time offer!',
        discount: '25',
        discountType: 'percentage',
        code: 'SUMMER25',
        category: 'Electronics',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        minPurchaseAmount: 5000
      },
      {
        title: 'Food Delivery Special',
        description: 'Free delivery on orders above 500 BDT plus 20% off on your first three orders!',
        discount: '20',
        discountType: 'percentage',
        code: 'FOOD20',
        category: 'Food & Delivery',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        minPurchaseAmount: 500
      },
      {
        title: 'New Year Footwear Collection',
        description: 'Step into the new year with style! Huge discounts on all footwear collections.',
        discount: '30',
        discountType: 'percentage',
        code: 'NEWYEAR30',
        category: 'Fashion',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        minPurchaseAmount: 1000
      },
      {
        title: 'Tech Gadget Bonanza',
        description: 'Latest tech gadgets at unbeatable prices. From gaming accessories to smart devices.',
        discount: '15',
        discountType: 'percentage',
        code: 'TECH15',
        category: 'Electronics',
        isFeatured: false,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        minPurchaseAmount: 2000
      },
      {
        title: 'Ride & Save Weekend',
        description: 'Special weekend offer! Get 50 BDT off on your rides this weekend.',
        discount: '50',
        discountType: 'fixed',
        code: 'RIDE50',
        category: 'Transportation',
        isFeatured: false,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        minPurchaseAmount: 100
      },
      {
        title: 'Shopping Spree Discount',
        description: 'Shop more, save more! Special discount on all categories with no minimum purchase.',
        discount: '10',
        discountType: 'percentage',
        code: 'SHOP10',
        category: 'E-commerce',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        minPurchaseAmount: 0
      }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const couponData of sampleCoupons) {
      try {
        // Find a store that matches the category
        const matchingStore = stores.find(store => 
          store.category === couponData.category || 
          couponData.category.includes(store.category)
        );

        if (!matchingStore) {
          console.log(`⚠️  No matching store found for category: ${couponData.category}`);
          continue;
        }

        // Check if coupon already exists
        const existingCoupon = await Coupon.findOne({ code: couponData.code });
        
        const finalCouponData = {
          ...couponData,
          storeId: matchingStore._id,
          storeName: matchingStore.name
        };

        if (existingCoupon) {
          // Update existing coupon
          Object.assign(existingCoupon, finalCouponData);
          await existingCoupon.save();
          console.log(`✓ Updated coupon: ${couponData.title} (${couponData.code})`);
          updatedCount++;
        } else {
          // Create new coupon
          const coupon = new Coupon(finalCouponData);
          await coupon.save();
          console.log(`✓ Created coupon: ${couponData.title} (${couponData.code}) for ${matchingStore.name}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`✗ Error creating/updating coupon ${couponData.title}:`, error.message);
      }
    }

    console.log(`\n✅ Sample coupons process completed!`);
    console.log(`📊 Created: ${createdCount} coupons`);
    console.log(`📊 Updated: ${updatedCount} coupons`);
    
    // Display all coupons
    const allCoupons = await Coupon.find({}).populate('storeId', 'name category');
    console.log(`\n📋 Total coupons in database: ${allCoupons.length}`);
    
    allCoupons.forEach(coupon => {
      const status = coupon.isActive ? '🟢 Active' : '🔴 Inactive';
      const featured = coupon.isFeatured ? '⭐ Featured' : '';
      const expiryStatus = new Date(coupon.expiryDate) > new Date() ? '✅ Valid' : '❌ Expired';
      console.log(`- ${coupon.title} (${coupon.code}) - ${coupon.storeName} ${status} ${featured} ${expiryStatus}`);
    });

  } catch (error) {
    console.error('Error creating sample coupons:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
createSampleCoupons(); 