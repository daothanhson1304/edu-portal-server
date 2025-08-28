import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import {
  uploadAttachment,
  listAttachments,
  downloadAttachment,
  deleteAttachment,
} from '../controllers/attachment.js';

const router = Router();

router.post('/rule/:ruleId', upload.single('file'), uploadAttachment);
router.get('/rule/:ruleId', listAttachments);

router.get('/:fileId/download', downloadAttachment);
router.delete('/:fileId', deleteAttachment);

export default router;
