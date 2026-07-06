const jwt = require('jsonwebtoken');

/**
 * PLACEHOLDER auth middleware.
 * Swap this out once Person 1 shares their real auth middleware -
 * the important thing is that BOTH services verify tokens with the
 * same JWT_SECRET, so a token issued by Person 1's login endpoint
 * is accepted here too.
 *
 * Expects header: Authorization: Bearer <token>
 * On success, sets req.userId for use in route handlers.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id || decoded._id;
    if (!req.userId) {
      return res.status(401).json({ error: 'Token missing user identifier' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
