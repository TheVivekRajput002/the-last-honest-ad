import { Router } from 'express';
import { GalleryController } from '../controllers/gallery.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', GalleryController.getPosts);
router.post('/:id/publish', requireAuth, GalleryController.publish);

export default router;
