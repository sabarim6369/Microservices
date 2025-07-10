  const prisma = require('../lib/prisma'); // Adjust the import path as necessary
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');

  const SALT_ROUNDS = 10;

  exports.signup = async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },  
      });

      res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.getProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId; // Make sure JWT middleware attaches this
    const { /* any other data */ } = req.body;

    // Example: insert a cart with just userId
    const cart = await prisma.cart.create({
      data: {
        userId, // This links cart to user
        // Add other fields if needed
      },
    });

    res.status(201).json({ message: 'Cart created successfully', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
