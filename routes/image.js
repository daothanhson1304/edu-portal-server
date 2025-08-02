import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'edu-portal' },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({ url: result.secure_url });
      }
    );

    Readable.from(buffer).pipe(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'edu-portal/',
      max_results: 50,
    });

    const urls = result.resources.map(file => file.secure_url);
    res.json({ images: urls });
  } catch (err) {
    console.error('Cloudinary fetch error', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

export default router;
