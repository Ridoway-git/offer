const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Username validation
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }
    
    if (username.length > 20) {
      return res.status(400).json({ message: 'Username must be less than 20 characters' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    }
    
    if (!/\d/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one special character' });
    }
    
    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      } else {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    // Hash password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { firebaseUid: uid }] });
    
    if (user) {
      // Update user with Google info if not already set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.photoURL = photoURL;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        username: displayName || email.split('@')[0],
        email,
        firebaseUid: uid,
        photoURL,
        isGoogleUser: true
      });
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        photoURL: user.photoURL,
        isGoogleUser: user.isGoogleUser
      } 
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 