// server.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { ENV } from './config/env.js';

dotenv.config();

mongoose
  .connect(ENV.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
