const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

const verifyCustomer = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'customer') {
      return res.status(403).json({ error: 'Access restricted to customers' });
    }
    req.user = decoded; // Attach user data (id, role, etc.)
    console.log('Customer verified:', req.user);
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
//verify admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to admin' });
    }
    req.user = decoded; // Attach user data (id, role, etc.)
    console.log('Admin verified:', req.user);
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
//verify staff
const verifyStaff = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    if (!decoded.email || !decoded.email.startsWith('staff')) {
      return res.status(403).json({ error: 'Access restricted to staff' });
    }

    req.user = decoded; // Attach user data (id, role, etc.)
    console.log('Staff verified:', req.user);
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
// Export the middleware functions
module.exports = {
  verifyCustomer,
  verifyAdmin,
  verifyStaff
};

