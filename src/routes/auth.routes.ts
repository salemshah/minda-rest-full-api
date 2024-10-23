import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

router.post(
  '/parent-register',
  validate(registerSchema),
  AuthController.parentRegister
);
router.post('/parent-login', validate(loginSchema), AuthController.parentLogin);
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  AuthController.refreshToken
);
router.post('/logout', AuthController.logout);

export default router;
