import { Router } from 'express';
import { updateProfile } from './user.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { updateProfileSchema } from './user.schema';

const router = Router();

router.put('/me/profile', authenticate, validate(updateProfileSchema), updateProfile);

export default router;
