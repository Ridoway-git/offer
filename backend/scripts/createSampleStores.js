const mongoose = require('mongoose');
const Store = require('../models/Store');
require('dotenv').config({ path: __dirname + '/../.env' });

const sampleStores = [
  {
    name: 'Daraz',
    description: 'Online shopping platform with a wide variety of products including electronics, fashion, home goods, and more.',
    website: 'https://www.daraz.com.bd',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkoL99AkJKb1jRx-crJCW4yu3umKfDBttIBw&s',
    category: 'E-commerce',
    contactEmail: 'support@daraz.com',
    isActive: true
  },
  {
    name: 'Foodpanda',
    description: 'Food delivery service bringing your favorite meals from restaurants to your doorstep.',
    website: 'https://www.foodpanda.com.bd',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjnBfCLjtZQ0JbeJkVw1MTUs9riOfK6L28EA&s',
    category: 'Food & Delivery',
    contactEmail: 'support@foodpanda.com',
    isActive: true
  },
  {
    name: 'Bata',
    description: 'Leading footwear brand offering quality shoes for men, women, and children.',
    website: 'https://www.bata.com.bd',
    logo: 'https://substackcdn.com/image/fetch/w_1000,h_1000,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc7a5fbfb-bb7f-40f3-a179-21fead60b632_1000x1000.jpeg',
    category: 'Fashion',
    contactEmail: 'info@bata.com',
    isActive: true
  },
  {
    name: 'Star Tech',
    description: 'Technology retailer specializing in computers, laptops, smartphones, and tech accessories.',
    website: 'https://www.startech.com.bd',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0zbkj1OnV1JHmvd3WJZYL9jhED-kvpYkA6Q&s',
    category: 'Electronics',
    contactEmail: 'info@startechbd.com',
    isActive: true
  },
  {
    name: 'Pathao',
    description: 'Ride-sharing and delivery service providing transportation and logistics solutions.',
    website: 'https://pathao.com',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI3Hi5XV-snqqvVqjsEpux6O4uJWIH9qF27A&s',
    category: 'Transportation',
    contactEmail: 'support@pathao.com',
    isActive: true
  },
  {
    name: 'Pickaboo',
    description: 'Online electronics and gadget store offering smartphones, computers, and home appliances.',
    website: 'https://www.pickaboo.com',
    logo: 'https://play-lh.googleusercontent.com/ZKAN4bJ7aQwFafzoEdR6RqPLkUAYr-doI126t39XBvpx41sIEdsKeP6sYHVetySckw',
    category: 'Electronics',
    contactEmail: 'info@pickaboo.com',
    isActive: true
  }
];

async function createSampleStores() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing stores (optional - remove this line if you want to keep existing stores)
    // await Store.deleteMany({});
    // console.log('Cleared existing stores');

    // Create sample stores
    for (const storeData of sampleStores) {
      try {
        // Check if store already exists
        const existingStore = await Store.findOne({ name: storeData.name });
        if (existingStore) {
          console.log(`Store "${storeData.name}" already exists, updating...`);
          Object.assign(existingStore, storeData);
          await existingStore.save();
          console.log(`✓ Updated store: ${storeData.name}`);
        } else {
          const store = new Store(storeData);
          await store.save();
          console.log(`✓ Created store: ${storeData.name}`);
        }
      } catch (error) {
        console.error(`✗ Error creating/updating store ${storeData.name}:`, error.message);
      }
    }

    console.log('\n✅ Sample stores creation completed!');
    
    // Display all stores
    const allStores = await Store.find({});
    console.log(`\n📊 Total stores in database: ${allStores.length}`);
    allStores.forEach(store => {
      console.log(`- ${store.name} (${store.category}) - ${store.isActive ? 'Active' : 'Inactive'}`);
    });

  } catch (error) {
    console.error('Error creating sample stores:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
createSampleStores(); 