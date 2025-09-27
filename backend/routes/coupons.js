const express = require('express');
const Coupon = require('../models/Coupon');
const Store = require('../models/Store');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// GET /api/coupons - Get all active coupons (public)
router.get('/', async (req, res) => {
  try {
    const { category, store, storeId, featured, limit = 20, page = 1 } = req.query;
    
    const filter = { 
      isActive: true, 
      expiryDate: { $gt: new Date() } 
    };
    
    if (category) filter.category = category;
    if (store) filter.storeName = new RegExp(store, 'i');
    if (storeId) filter.storeId = storeId;
    if (featured === 'true') filter.isFeatured = true;
    
    const skip = (page - 1) * limit;
    
    const coupons = await Coupon.find(filter)
      .populate('storeId', 'name logo website')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Coupon.countDocuments(filter);
    
    res.json({
      coupons,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + coupons.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/featured - Get featured coupons (public)
router.get('/featured', async (req, res) => {
  try {
    const { category, storeId, limit = 6 } = req.query;
    
    const filter = { 
      isActive: true, 
      isFeatured: true,
      expiryDate: { $gt: new Date() } 
    };
    
    if (category) filter.category = category;
    if (storeId) filter.storeId = storeId;
    
    const coupons = await Coupon.find(filter)
    .populate('storeId', 'name logo website')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
    
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/categories - Get all categories (public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Coupon.distinct('category', { 
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/search - Search coupons (public)
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({ coupons: [] });
    }
    
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const filter = {
      isActive: true,
      expiryDate: { $gt: new Date() },
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { storeName: searchRegex },
        { category: searchRegex },
        { code: searchRegex }
      ]
    };
    
    const coupons = await Coupon.find(filter)
      .populate('storeId', 'name logo website')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FAVORITES ROUTES - Must be placed before /:id routes

// GET /api/coupons/favorites - Get user's favorite coupons (authenticated users)
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favoriteCoupons = await Coupon.find({
      _id: { $in: user.favorites },
      isActive: true,
      expiryDate: { $gt: new Date() }
    }).populate('storeId', 'name logo website');

    res.json({ 
      favorites: favoriteCoupons,
      count: favoriteCoupons.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/coupons/:id/favorite - Add/Remove coupon from favorites (authenticated users)
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favorites.includes(coupon._id);
    
    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== coupon._id.toString());
      await user.save();
      res.json({ 
        message: 'Coupon removed from favorites',
        isFavorite: false,
        favoritesCount: user.favorites.length
      });
    } else {
      // Add to favorites
      user.favorites.push(coupon._id);
      await user.save();
      res.json({ 
        message: 'Coupon added to favorites',
        isFavorite: true,
        favoritesCount: user.favorites.length
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/:id/favorite-status - Check if coupon is in user's favorites (authenticated users)
router.get('/:id/favorite-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favorites.includes(req.params.id);
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/coupons/:id - Get specific coupon (public)
router.get('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('storeId', 'name logo website description');
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/coupons - Create new coupon (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      discount,
      discountType,
      code,
      storeId,
      storeName,
      category,
      isFeatured,
      expiryDate,
      maxUsage,
      minPurchaseAmount,
      imageUrl
    } = req.body;

    // Validation
    if (!title || !description || !discount || !code || !storeId || !storeName || !category || !expiryDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(400).json({ message: 'Store not found' });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      title,
      description,
      discount,
      discountType: discountType || 'percentage',
      code: code.toUpperCase(),
      storeId,
      storeName,
      category,
      isFeatured: isFeatured || false,
      expiryDate: new Date(expiryDate),
      maxUsage,
      minPurchaseAmount: minPurchaseAmount || 0,
      imageUrl
    });

    await coupon.save();
    await coupon.populate('storeId', 'name logo website');

    res.status(201).json({ 
      message: 'Coupon created successfully', 
      coupon 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Coupon code already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT /api/coupons/:id - Update coupon (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const {
      title,
      description,
      discount,
      discountType,
      code,
      storeId,
      storeName,
      category,
      isActive,
      isFeatured,
      expiryDate,
      maxUsage,
      minPurchaseAmount,
      imageUrl
    } = req.body;

    // If code is being changed, check for duplicates
    if (code && code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code, _id: { $ne: req.params.id } });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    // If storeId is being changed, verify store exists
    if (storeId && storeId !== coupon.storeId.toString()) {
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(400).json({ message: 'Store not found' });
      }
    }

    // Update fields
    if (title) coupon.title = title;
    if (description) coupon.description = description;
    if (discount) coupon.discount = discount;
    if (discountType) coupon.discountType = discountType;
    if (code) coupon.code = code.toUpperCase();
    if (storeId) coupon.storeId = storeId;
    if (storeName) coupon.storeName = storeName;
    if (category) coupon.category = category;
    if (typeof isActive === 'boolean') coupon.isActive = isActive;
    if (typeof isFeatured === 'boolean') coupon.isFeatured = isFeatured;
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (maxUsage !== undefined) coupon.maxUsage = maxUsage;
    if (minPurchaseAmount !== undefined) coupon.minPurchaseAmount = minPurchaseAmount;
    if (imageUrl !== undefined) coupon.imageUrl = imageUrl;

    await coupon.save();
    await coupon.populate('storeId', 'name logo website');

    res.json({ 
      message: 'Coupon updated successfully', 
      coupon 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Coupon code already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PATCH /api/coupons/:id/toggle - Toggle coupon active status (admin only)
router.patch('/:id/toggle', auth, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({ 
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`, 
      coupon 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/coupons/:id/use - Use coupon (increment usage count)
router.post('/:id/use', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is not active' });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    coupon.usageCount += 1;
    await coupon.save();

    res.json({ 
      message: 'Coupon used successfully',
      usageCount: coupon.usageCount,
      remainingUses: coupon.maxUsage ? coupon.maxUsage - coupon.usageCount : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/coupons/:id - Delete coupon (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router; 