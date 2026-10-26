const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trustnet';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn(`[MongoDB] Continuing with local database retry.`);
    throw error;
  }
};

module.exports = connectDB;
