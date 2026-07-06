const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generates a signed JWT for a given user.
 * IMPORTANT: payload key is `userId` because the existing middleware/auth.js
 * reads decoded.userId (it also falls back to decoded.id / decoded._id, but
 * we standardize on userId so both services stay in sync).
 */
function generateToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
}

async function loginUser({ email, password }) {
  // password field has select:false in the schema, so we explicitly ask for it here
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function updateUserProfile(userId, { name, email }) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;

  await user.save();
  return user;
}

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
};