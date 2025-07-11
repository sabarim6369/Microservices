const express = require('express');
const authRoutes = require('./Router/Authrouter');
const dotenv = require('dotenv');
const MessageService = require('./services/messageService');
require('dotenv').config();

const app = express();
const messageService = new MessageService();

app.use(express.json());
app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize message service
messageService.init().then(() => {
  console.log('Message service initialized');
}).catch(err => {
  console.error('Failed to initialize message service:', err);
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Auth service running on port ${process.env.PORT || 3001}`);
});
module.exports = app;
