const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = decoded; // contains userId and email
    next();
  });
};
