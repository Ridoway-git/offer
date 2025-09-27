const express = require('express');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();


router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/coupons', auth, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).populate('storeId', 'name').sort({ createdAt: 1 });
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/analytics', auth, admin, async (req, res) => {
  try {
    const Store = require('../models/Store');
    
    const userCount = await User.countDocuments();
    const couponCount = await Coupon.countDocuments();
    const storeCount = await Store.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true, expiryDate: { $gt: new Date() } });
    const expiredCoupons = await Coupon.countDocuments({ $or: [ { isActive: false }, { expiryDate: { $lte: new Date() } } ] });
    const featuredCoupons = await Coupon.countDocuments({ isFeatured: true, isActive: true, expiryDate: { $gt: new Date() } });
    
    // Calculate total usage
    const totalUsage = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newCoupons = await Coupon.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newStores = await Store.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    res.json({ 
      userCount, 
      couponCount, 
      storeCount,
      activeCoupons, 
      expiredCoupons, 
      featuredCoupons,
      totalUsage: totalUsage.length > 0 ? totalUsage[0].total : 0,
      recentActivity: {
        newUsers,
        newCoupons,
        newStores
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/admin/stores - Get all stores (including inactive)
router.get('/stores', auth, admin, async (req, res) => {
  try {
    const Store = require('../models/Store');
    const stores = await Store.find({}).sort({ createdAt: -1 });
    res.json({ stores });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', auth, admin, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    
    if (!username || !email || !role) {
      return res.status(400).json({ message: 'Username, email, and role are required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    user.username = username;
    user.email = email;
    user.role = role;

    await user.save();

    res.json({ 
      message: 'User updated successfully', 
      user: { _id: user._id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user.id && user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error in delete user endpoint:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 