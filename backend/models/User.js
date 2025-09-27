const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Made optional for Google users
  firebaseUid: { type: String, unique: true, sparse: true }, // Firebase UID for Google auth
  photoURL: { type: String }, // Google profile picture
  isGoogleUser: { type: Boolean, default: false }, // Flag for Google users
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema); 