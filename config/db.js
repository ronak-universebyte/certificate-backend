const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/universebyte_verify';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000 // Quick timeout so fallback mode activates smoothly if MongoDB isn't local
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}. Running server with memory fallback store.`);
    return false;
  }
};

module.exports = connectDB;
