// app.js
import express from 'express';
import cors from 'cors';
import postRoutes from './routes/post.js';
import imageRoute from './routes/image.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/image', imageRoute);

export default app;
