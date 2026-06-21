import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/me/history', requireAuth, UsersController.getHistory);
router.patch('/me', requireAuth, UsersController.updateHandle);

export default router;
