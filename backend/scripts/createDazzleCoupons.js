const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Store = require('../models/Store');
require('dotenv').config({ path: __dirname + '/../.env' });

async function createDazzleCoupons() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Dazzle store
    const dazzleStore = await Store.findOne({ name: 'Dazzle' });
    if (!dazzleStore) {
      console.log('Dazzle store not found. Please create it first.');
      return;
    }

    console.log(`Found Dazzle store: ${dazzleStore.name} (${dazzleStore.category})`);

    const dazzleCoupons = [
      {
        title: 'Dazzle Electronics Bonanza',
        description: 'Massive discounts on all electronics including smartphones, laptops, tablets, and smart devices. Limited time offer!',
        discount: '30',
        discountType: 'percentage',
        code: 'DAZZLE30',
        category: 'Electronics',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        minPurchaseAmount: 3000
      },
      {
        title: 'Dazzle Gaming Gear Sale',
        description: 'Level up your gaming experience with huge discounts on gaming accessories, controllers, headsets, and more!',
        discount: '25',
        discountType: 'percentage',
        code: 'GAMING25',
        category: 'Gaming',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        minPurchaseAmount: 1500
      },
      {
        title: 'Dazzle Smart Home Collection',
        description: 'Transform your home with smart devices. Discounts on smart bulbs, security cameras, and home automation products.',
        discount: '20',
        discountType: 'percentage',
        code: 'SMARTHOME20',
        category: 'Smart Home',
        isFeatured: false,
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        minPurchaseAmount: 2000
      },
      {
        title: 'Dazzle Mobile Mania',
        description: 'Get the latest smartphones at unbeatable prices. Special deals on iPhone, Samsung, and other premium brands.',
        discount: '15',
        discountType: 'percentage',
        code: 'MOBILE15',
        category: 'Mobile Phones',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        minPurchaseAmount: 8000
      },
      {
        title: 'Dazzle Laptop Festival',
        description: 'Upgrade your computing experience with amazing deals on laptops, notebooks, and accessories.',
        discount: '18',
        discountType: 'percentage',
        code: 'LAPTOP18',
        category: 'Computers',
        isFeatured: false,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        minPurchaseAmount: 25000
      },
      {
        title: 'Dazzle Audio Equipment Sale',
        description: 'Premium audio equipment at discounted prices. Headphones, speakers, and sound systems.',
        discount: '22',
        discountType: 'percentage',
        code: 'AUDIO22',
        category: 'Audio',
        isFeatured: false,
        expiryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        minPurchaseAmount: 1200
      },
      {
        title: 'Dazzle Camera & Photography',
        description: 'Capture perfect moments with professional cameras and photography equipment at great prices.',
        discount: '12',
        discountType: 'percentage',
        code: 'CAMERA12',
        category: 'Photography',
        isFeatured: false,
        expiryDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
        minPurchaseAmount: 5000
      },
      {
        title: 'Dazzle Flash Sale - 50 BDT Off',
        description: 'Quick flash sale! Get 50 BDT off on any purchase above 500 BDT. Limited time only!',
        discount: '50',
        discountType: 'fixed',
        code: 'FLASH50',
        category: 'Electronics',
        isFeatured: true,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        minPurchaseAmount: 500
      }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const couponData of dazzleCoupons) {
      try {
        // Check if coupon already exists
        const existingCoupon = await Coupon.findOne({ code: couponData.code });
        
        const finalCouponData = {
          ...couponData,
          storeId: dazzleStore._id,
          storeName: dazzleStore.name
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
          console.log(`✓ Created coupon: ${couponData.title} (${couponData.code}) for ${dazzleStore.name}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`✗ Error creating/updating coupon ${couponData.title}:`, error.message);
      }
    }

    console.log(`\n✅ Dazzle coupons process completed!`);
    console.log(`📊 Created: ${createdCount} coupons`);
    console.log(`📊 Updated: ${updatedCount} coupons`);
    
    // Display all Dazzle coupons
    const allDazzleCoupons = await Coupon.find({ storeId: dazzleStore._id }).populate('storeId', 'name category');
    console.log(`\n📋 Total Dazzle coupons in database: ${allDazzleCoupons.length}`);
    
    allDazzleCoupons.forEach(coupon => {
      const status = coupon.isActive ? '🟢 Active' : '🔴 Inactive';
      const featured = coupon.isFeatured ? '⭐ Featured' : '';
      const expiryStatus = new Date(coupon.expiryDate) > new Date() ? '✅ Valid' : '❌ Expired';
      console.log(`- ${coupon.title} (${coupon.code}) - ${coupon.category} ${status} ${featured} ${expiryStatus}`);
    });

  } catch (error) {
    console.error('Error creating Dazzle coupons:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
createDazzleCoupons();






