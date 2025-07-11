const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');
const MessageService = require('./services/messageService');

dotenv.config();

const app = express();
const messageService = new MessageService();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Order Service is running!' });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
const initializeServices = async () => {
  try {
    await connectDB();
    await messageService.init();
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 4000;

initializeServices().then(() => {
  app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`);
  });
});

module.exports = app;
