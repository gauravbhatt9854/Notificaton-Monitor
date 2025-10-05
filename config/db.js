// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: "../.env" }); // Adjust path if db.js is in config/

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // options not needed

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};