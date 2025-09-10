import express from 'express';
import multer from 'multer';
import {
  uploadGalleryImage,
  getGalleryImages,
  getGalleryImageById,
  deleteGalleryImage,
  updateGalleryImage,
} from '../controllers/gallery.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh'), false);
    }
  },
});

// Upload image to gallery
router.post(
  '/upload',
  upload.any(),
  (req, res, next) => {
    console.log('Multer processed files:', req.files);
    console.log('Request body:', req.body);

    // Tìm file đầu tiên (có thể là image, file, hoặc bất kỳ field name nào)
    const file = req.files && req.files[0];
    if (file) {
      // Kiểm tra xem file có phải là ảnh không
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          error: 'Chỉ cho phép upload file ảnh',
        });
      }
      req.file = file; // Gán file đầu tiên vào req.file để controller có thể sử dụng
    }

    next();
  },
  (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File quá lớn. Kích thước tối đa là 10MB',
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Lỗi upload file: ' + error.message,
      });
    } else if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next();
  },
  uploadGalleryImage
);

// Get gallery images with pagination and filters
router.get('/', getGalleryImages);

// Get single image by ID
router.get('/:id', getGalleryImageById);

// Update image metadata
router.put('/:id', updateGalleryImage);

// Delete image (soft delete)
router.delete('/:id', deleteGalleryImage);

export default router;
