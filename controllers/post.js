import Post from '../models/post.js';
import mongoose from 'mongoose';

export const createPost = async (req, res) => {
  try {
    const { title, content, thumbnailUrl, status, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const newPost = await Post.create({
      title,
      content,
      thumbnailUrl,
      status: status || 'draft',
      tags: tags || [],
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ post });
};

export const getPostsWithPagination = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = '', // 'draft' | 'published'
      tag = '', // lọc 1 tag cụ thể
      type = '', // alias: sẽ lọc trong tags luôn
      dateFrom = '', // ISO date string
      dateTo = '', // ISO date string
    } = req.query;

    // Validate page/limit
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (
      Number.isNaN(pageNum) ||
      Number.isNaN(limitNum) ||
      pageNum < 1 ||
      limitNum < 1 ||
      limitNum > 100
    ) {
      return res.status(400).json({
        error:
          'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
      });
    }

    // Build query
    const query = {};

    // Status filter
    if (status) query.status = status;

    // Tag / Type filter (đều map vào tags)
    if (type) query.type = type;
    if (tag) {
      // tìm bài có chứa tag đó
      query.tags = { $in: [tag] };
    }

    // Search title & content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range (createdAt)
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Sort
    const sortOptions = {};
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'views'];
    sortOptions[allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'] =
      sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    // Exec
    const [posts, totalCount] = await Promise.all([
      Post.find(query)
        // chọn trường trả về cho FE (có thể thêm/bớt tuỳ ý)
        .select('_id title thumbnailUrl createdAt updatedAt status tags views')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Chuẩn hoá DTO (id, image)
    const data = posts.map(p => ({
      id: p._id.toString(),
      title: p.title,
      content: p.content,
      image: p.thumbnailUrl || '',
      createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
      updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
      // Optional: nếu FE cần thêm
      status: p.status,
      tags: p.tags ?? [],
      views: p.views ?? 0,
      type: p.type ?? '',
      thumbnailUrl: p.thumbnailUrl ?? '',
    }));

    return res.status(200).json({
      data,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
      },
      filters: {
        search,
        status,
        tag,
        sortBy: allowedSortFields.includes(sortBy) ? sortBy : 'createdAt',
        sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
        dateFrom,
        dateTo,
        type,
      },
    });
  } catch (err) {
    console.error('Error in getPostsWithPagination:', err);
    return res.status(500).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Thiếu id' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'id không hợp lệ' });
    }

    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ error: 'Không tìm thấy bài viết' });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete post error:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Thiếu id' });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'id không hợp lệ' });
    }

    // Chỉ nhận các field cho phép (tránh update bừa)
    const { title, content, thumbnailUrl, status, tags } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (thumbnailUrl !== undefined) update.thumbnailUrl = thumbnailUrl;
    if (status !== undefined) update.status = status;
    if (tags !== undefined) update.tags = tags;

    const updated = await Post.findByIdAndUpdate(id, update, {
      new: true, // trả về document sau khi update
      runValidators: true, // chạy validate của schema
    });

    if (!updated)
      return res.status(404).json({ error: 'Không tìm thấy bài viết' });

    return res.json({ ok: true, post: updated });
  } catch (err) {
    console.error('Update post error:', err);

    // Lỗi validate của Mongoose → 400
    if (err?.name === 'ValidationError') {
      return res
        .status(400)
        .json({ error: 'Dữ liệu không hợp lệ', details: err.errors });
    }

    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
