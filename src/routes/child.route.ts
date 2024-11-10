import { Router } from 'express';
import { ChildController } from '../controllers/child.controller';
import { validate } from '../middlewares/validation.middleware';
import { childAuthMiddleware } from '../middlewares/childAuth.middleware';
import {
  childLoginSchema,
  forgotPasswordSchema,
  updateProfilePictureSchema,
} from '../validators/child.validator';
import { Container } from 'typedi';

const router = Router();
const childController = Container.get(ChildController);

// Public routes
router.post('/login', validate(childLoginSchema), childController.loginChild);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  childController.forgotPassword
);

// Protected routes
router.get('/profile', childAuthMiddleware, childController.getChildProfile);
router.put(
  '/profile-picture',
  childAuthMiddleware,
  validate(updateProfilePictureSchema),
  childController.changeProfilePicture
);

export default router;
