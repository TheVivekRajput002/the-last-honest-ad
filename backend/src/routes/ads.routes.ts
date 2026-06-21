import { Router } from 'express';
import { AdsController } from '../controllers/ads.controller';

const router = Router();

router.post('/extract', AdsController.extract);
router.post('/generate', AdsController.generate);
router.get('/:id', AdsController.getById);

export default router;
