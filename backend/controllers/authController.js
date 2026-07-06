const authService = require('../services/authService');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const result = await authService.registerUser({ name, email, password });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.loginUser({ email, password });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (protected)
async function getMe(req, res, next) {
  try {
    const user = await authService.getUserById(req.userId);
    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/me  (protected)
async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = await authService.updateUserProfile(req.userId, { name, email });

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};