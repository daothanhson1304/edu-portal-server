import { Router } from 'express';
import {
  createRule,
  listRules,
  getRule,
  updateRule,
  deleteRule,
} from '../controllers/rule.js';

const router = Router();

router.post('/', createRule);
router.get('/', listRules);
router.get('/:ruleId', getRule);

router.patch('/:ruleId', updateRule);
router.delete('/:ruleId', deleteRule);

export default router;
