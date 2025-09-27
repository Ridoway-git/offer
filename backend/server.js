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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend server is running',
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 