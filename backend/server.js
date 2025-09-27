const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes (to be implemented)
const authRoutes = require('./routes/auth');
const couponRoutes = require('./routes/coupons');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const expireCoupons = require('./utils/expireCoupons');

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Coupon App API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      coupons: '/api/coupons',
      stores: '/api/stores',
      admin: '/api/admin'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);

// Schedule coupon expiry check every hour
setInterval(() => {
  expireCoupons().catch(err => console.error('Error expiring coupons:', err));
}, 1000 * 60 * 60); // every hour

// Connect to MongoDB with timeout settings
const mongooseOptions = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  bufferCommands: false
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 