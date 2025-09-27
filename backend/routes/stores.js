const express = require('express');
const Store = require('../models/Store');
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// GET /api/stores - Get all stores (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const stores = await Store.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    // Calculate active offers count for each store
    const storesWithOffers = await Promise.all(
      stores.map(async (store) => {
        const activeOffers = await Coupon.countDocuments({
          storeId: store._id,
          isActive: true,
          expiryDate: { $gt: new Date() }
        });
        
        return {
          ...store.toObject(),
          activeOffers
        };
      })
    );
    
    const total = await Store.countDocuments(filter);
    
    res.json({
      stores: storesWithOffers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + stores.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/categories - Get all store categories (public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Store.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:id - Get specific store (public)
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Calculate active offers count for this store
    const activeOffers = await Coupon.countDocuments({
      storeId: store._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    
    const storeWithOffers = {
      ...store.toObject(),
      activeOffers
    };
    
    res.json({ store: storeWithOffers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:id/coupons - Get coupons for specific store (public)
router.get('/:id/coupons', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    const coupons = await Coupon.find({ 
      storeId: req.params.id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Coupon.countDocuments({ 
      storeId: req.params.id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    
    res.json({
      store: {
        id: store._id,
        name: store.name,
        logo: store.logo
      },
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

// POST /api/stores - Create new store (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      logo,
      category,
      contactEmail,
      isActive
    } = req.body;

    // Validation
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }

    // Check if store already exists
    const existingStore = await Store.findOne({ name });
    if (existingStore) {
      return res.status(400).json({ message: 'Store with this name already exists' });
    }

    const store = new Store({
      name,
      description,
      website,
      logo,
      category,
      contactEmail,
      isActive: isActive !== undefined ? isActive : true
    });

    await store.save();

    res.status(201).json({ 
      message: 'Store created successfully', 
      store 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Store name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT /api/stores/:id - Update store (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const {
      name,
      description,
      website,
      logo,
      category,
      contactEmail,
      isActive
    } = req.body;

    // If name is being changed, check for duplicates
    if (name && name !== store.name) {
      const existingStore = await Store.findOne({ name, _id: { $ne: req.params.id } });
      if (existingStore) {
        return res.status(400).json({ message: 'Store name already exists' });
      }
    }

    // Update fields
    if (name) store.name = name;
    if (description) store.description = description;
    if (website) store.website = website;
    if (logo) store.logo = logo;
    if (category) store.category = category;
    if (contactEmail) store.contactEmail = contactEmail;
    if (typeof isActive === 'boolean') store.isActive = isActive;

    await store.save();

    // Update store name in all related coupons if name changed
    if (name && name !== store.name) {
      await Coupon.updateMany(
        { storeId: req.params.id },
        { storeName: name }
      );
    }

    res.json({ 
      message: 'Store updated successfully', 
      store 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Store name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PATCH /api/stores/:id/toggle - Toggle store active status (admin only)
router.patch('/:id/toggle', auth, admin, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.isActive = !store.isActive;
    await store.save();

    // If deactivating store, also deactivate all its coupons
    if (!store.isActive) {
      await Coupon.updateMany(
        { storeId: req.params.id },
        { isActive: false }
      );
    }

    res.json({ 
      message: `Store ${store.isActive ? 'activated' : 'deactivated'} successfully`, 
      store 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/stores/:id - Delete store (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if store has active coupons
    const activeCoupons = await Coupon.countDocuments({ 
      storeId: req.params.id,
      isActive: true 
    });

    if (activeCoupons > 0) {
      return res.status(400).json({ 
        message: `Cannot delete store. It has ${activeCoupons} active coupons. Please deactivate or delete coupons first.` 
      });
    }

    await Store.findByIdAndDelete(req.params.id);

    // Delete all related coupons
    await Coupon.deleteMany({ storeId: req.params.id });

    res.json({ message: 'Store and related coupons deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 