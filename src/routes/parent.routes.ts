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
  childUpdateChildSchema,
  childRegisterChildSchema,
} from '../validators/parent.validator';

import { parentAuthMiddleware } from '../middlewares/parentAuth.middleware';

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
router.use(parentAuthMiddleware);
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

// ================================== Child Operations ==================================

// Register Child
/**
 * @route POST /parent/children
 * @desc Register a new child under the authenticated parent
 * @access Private
 */
router.post(
  '/children',
  validate(childRegisterChildSchema),
  parentController.registerChild
);

// Update Child
/**
 * @route PUT /parent/children/:childId
 * @desc Update a child's information
 * @access Private
 */
router.put(
  '/children/:childId',
  validate(childUpdateChildSchema),
  parentController.updateChild
);

// List Children
/**
 * @route GET /parent/children
 * @desc List all children of the authenticated parent
 * @access Private
 */
router.get('/children', parentController.listChildren);

export default router;
