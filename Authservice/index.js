const express = require('express');
const authRoutes = require('./Router/Authrouter'); // Adjust the import path as necessary
const dotenv = require('dotenv');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.listen(process.env.PORT || 3000, () => {
  console.log(`Auth service running on port ${process.env.PORT || 3000}`);
});
module.exports = app;
