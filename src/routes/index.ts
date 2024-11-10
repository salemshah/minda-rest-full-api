import { Router } from 'express';
import userRoutes from './parent.routes';
import authRoutes from './auth.routes';
import childRoute from './child.route';

const router = Router();

router.use('/child', childRoute);
router.use('/parent', userRoutes);
router.use('/auth', authRoutes);

export default router;
