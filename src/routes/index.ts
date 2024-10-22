// src/routes/index.ts

import {Router} from 'express';
import userRoutes from './parent.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/parent', userRoutes);
router.use('/auth', authRoutes);


export default router;
