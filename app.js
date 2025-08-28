// app.js
import express from 'express';
import cors from 'cors';
import postRoutes from './routes/post.js';
import imageRoute from './routes/image.js';
import ruleRoutes from './routes/rule.js';
import attachmentRoutes from './routes/attachment.js';
import { ENV } from './config/env.js';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({ origin: true, credentials: true }));

if (!fs.existsSync(ENV.UPLOAD_DIR))
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });

app.use('/api/posts', postRoutes);
app.use('/api/image', imageRoute);
app.use('/static', express.static(path.resolve(ENV.UPLOAD_DIR)));
app.use('/api/rules', ruleRoutes);
app.use('/api/attachments', attachmentRoutes);

export default app;
