require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const seedInitialData = require('./utils/seedData');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CATALOG_DIR = path.join(__dirname, '../ml/counterfeit_image_detection/datasets/sampled_sneakers_1024x1024');
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve static assets
app.use('/uploads', express.static(UPLOADS_DIR));
if (fs.existsSync(CATALOG_DIR)) {
  app.use('/catalog', express.static(CATALOG_DIR));
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'TrustNet-AI MERN Backend',
    database: 'MongoDB',
    port: PORT
  });
});

app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Production React static file serving
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/catalog')
    ) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server & Connect MongoDB
async function startServer() {
  try {
    await connectDB();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  TrustNet-AI Backend running on http://127.0.0.1:${PORT}`);
      console.log(`  MongoDB: Connected & Seeded`);
      console.log(`  ML Engine: Target at ${process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001'}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

startServer();
