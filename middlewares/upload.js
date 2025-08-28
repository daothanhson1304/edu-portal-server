import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { ENV } from '../config/env.js';

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ENV.UPLOAD_DIR),
    filename: (_req, file, cb) =>
      cb(null, `${nanoid()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
