import express from 'express';
import {
  createPost,
  getPostById,
  getPostsWithPagination,
} from '../controllers/post.js';

const router = express.Router();

router.post('/', createPost);
router.get('/', getPostsWithPagination);
router.get('/:id', getPostById);

export default router;
