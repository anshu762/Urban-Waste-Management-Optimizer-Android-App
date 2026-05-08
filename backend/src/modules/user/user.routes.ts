import { Router } from 'express';
import { updateProfile, getDrivers } from './user.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { updateProfileSchema } from './user.schema';

const router = Router();

router.put('/me/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.get('/admin/drivers', authenticate, authorize('ADMIN'), getDrivers);

export default router;
