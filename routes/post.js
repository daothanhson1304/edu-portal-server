import express from 'express';
import {
  createPost,
  getPostById,
  getPostsWithPagination,
  deletePost,
  updatePost,
} from '../controllers/post.js';

const router = express.Router();

router.post('/', createPost);
router.get('/', getPostsWithPagination);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);
router.patch('/:id', updatePost);

export default router;
