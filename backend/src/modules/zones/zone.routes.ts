import { Router } from 'express';
import { getZones, getZoneById, createZone, updateZone, deleteZone } from './zone.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', getZones);
router.get('/:id', getZoneById);

router.post('/', authenticate, authorize('ADMIN'), createZone);
router.put('/:id', authenticate, authorize('ADMIN'), updateZone);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteZone);

export default router;
