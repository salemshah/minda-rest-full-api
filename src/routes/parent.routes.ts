import { Router } from 'express';
import { ParentController } from '../controllers/parent.controller';
import { validate } from '../middlewares/validation.middleware';
import { Container } from 'typedi';
import {
  updateEmailSchema,
  completeRegistrationSchema,
  updatePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationEmailSchema,
} from '../validators/parent.validator';

import { authMiddleware } from '../middlewares/auth.middleware';
const parentController = Container.get(ParentController);

const router = Router();

// Public Routes
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  parentController.forgotPassword
);
router.put(
  '/reset-password',
  validate(resetPasswordSchema),
  parentController.resetPassword
);
router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  parentController.verifyEmail
);
router.post(
  '/resend-verification-email',
  validate(resendVerificationEmailSchema),
  parentController.resendVerificationEmail
);

// Private Routes
router.use(authMiddleware);
router.get('/profile', parentController.getParentProfile);
router.put(
  '/update-email',
  validate(updateEmailSchema),
  parentController.updateParentEmail
);
router.put(
  '/update-password',
  validate(updatePasswordSchema),
  parentController.updateParentPassword
);
router.put(
  '/complete-registration',
  validate(completeRegistrationSchema),
  parentController.completeRegistration
);
router.delete(
  '/remove-account',
  validate(deleteAccountSchema),
  parentController.deleteParentAccount
);

export default router;
