
require('dotenv').config();
console.log(process.env.MONGO_URI);
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const mediaRoutes = require('./routes/media');
const backupRoutes = require('./routes/backup');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');

const app = express();

app.use(cors());
app.use(express.json());

// Basic request logging - helps debug "why did this silently fail" during dev/demo
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Health check - useful for confirming the service is up before wiring the frontend
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'media-service' });
});

app.use('/api/media', mediaRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/auth', authRoutes);          // <-- add this
app.use('/api/inventory', inventoryRoutes);

// Basic 404 + error handlers
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);
  // Don't leak internal error details (stack traces, DB errors) to the client
  // in a way that could expose implementation details - keep it generic here,
  // specific handlers (like in mediaController/backupController) already
  // return more helpful messages for expected failure cases.
  res.status(500).json({ error: 'Something went wrong' });
});



const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Media service running on port ${PORT}`);
  });
});
