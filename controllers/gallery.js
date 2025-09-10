import cloudinary from '../config/cloudinary.js';
import Gallery from '../models/gallery.js';
import { Readable } from 'stream';

export const uploadGalleryImage = async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      body: req.body,
      fileInfo: req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : null,
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Không có file được upload',
      });
    }

    const { alt, category } = req.body;

    const buffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'edu-portal/gallery',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      Readable.from(buffer).pipe(stream);
    });

    const cloudinaryResult = await uploadPromise;

    // Save to database
    const galleryItem = await Gallery.create({
      filename: fileName,
      url: cloudinaryResult.secure_url,
      alt: alt || fileName.split('.')[0],
      category: category || 'Tổng quan',
      size: fileSize,
      type: mimeType,
      cloudinaryId: cloudinaryResult.public_id,
    });

    res.status(201).json({
      success: true,
      message: 'Upload thành công',
      id: galleryItem._id,
      filename: galleryItem.filename,
      url: galleryItem.url,
      alt: galleryItem.alt,
      category: galleryItem.category,
      size: galleryItem.size,
      type: galleryItem.type,
      createdAt: galleryItem.createdAt,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload thất bại: ' + error.message,
    });
  }
};

export const getGalleryImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { isActive: true };

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { alt: { $regex: req.query.search, $options: 'i' } },
        { filename: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await Gallery.countDocuments(filter);

    // Get images with pagination
    const images = await Gallery.find(filter)
      .select('_id filename url alt category size type createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Transform images to simple format
    const simpleImages = images.map(img => ({
      id: img._id,
      filename: img.filename,
      url: img.url,
      alt: img.alt,
      category: img.category,
      size: img.size,
      type: img.type,
      createdAt: img.createdAt,
    }));

    res.json({
      success: true,
      images: simpleImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Lấy danh sách ảnh thất bại: ' + error.message,
    });
  }
};

export const getGalleryImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Gallery.findOne({ _id: id, isActive: true })
      .select('_id filename url alt category size type createdAt')
      .lean();

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy ảnh',
      });
    }

    res.json({
      success: true,
      id: image._id,
      filename: image.filename,
      url: image.url,
      alt: image.alt,
      category: image.category,
      size: image.size,
      type: image.type,
      createdAt: image.createdAt,
    });
  } catch (error) {
    console.error('Get image by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Lấy thông tin ảnh thất bại: ' + error.message,
    });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy ảnh',
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.cloudinaryId);
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Soft delete from database
    await Gallery.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: 'Xóa ảnh thành công',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: 'Xóa ảnh thất bại: ' + error.message,
    });
  }
};

export const updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt, category } = req.body;

    const updateData = {};
    if (alt) updateData.alt = alt;
    if (category) updateData.category = category;

    const image = await Gallery.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('_id filename url alt category size type createdAt');

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy ảnh',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật ảnh thành công',
      id: image._id,
      filename: image.filename,
      url: image.url,
      alt: image.alt,
      category: image.category,
      size: image.size,
      type: image.type,
      updatedAt: image.updatedAt || new Date(),
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({
      success: false,
      error: 'Cập nhật ảnh thất bại: ' + error.message,
    });
  }
};
