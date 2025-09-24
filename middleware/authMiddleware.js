const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log('Attempting to verify token:', token.substring(0, 20) + '...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('Token decoded successfully:', { userId: decoded.id });
      
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        console.error('User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('User found:', { id: user._id, name: user.name, role: user.role });
      req.user = user;
      next();
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      req.user = null; // Ensure req.user is null when token fails
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token is not valid' });
      } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      } else {
        return res.status(401).json({ message: 'Authentication failed' });
      }
    }
  } else {
    console.log('No authorization header found');
    req.user = null; // Ensure req.user is null when no token
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
