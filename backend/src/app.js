const express = require('express');
const cors = require('cors');
const path = require('node:path');
const ticketRoutes = require('./routes/tickets');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Set UTF-8 encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api', ticketRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
