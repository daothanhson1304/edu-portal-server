import express from 'express';
import { createPost, getPosts, getPostById } from '../controllers/post.js';

const router = express.Router();

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);

export default router;
