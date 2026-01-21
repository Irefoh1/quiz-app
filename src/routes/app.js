const express = require('express');
const cors = require('cors');
const path = require('path');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Fix: Correct path to public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/quiz', quizRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Quiz App running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
  });
}

module.exports = app;