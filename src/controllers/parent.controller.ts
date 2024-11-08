import { Request, Response } from 'express';
import { ParentService } from '../services/parent.service';
import { Service } from 'typedi';
import { asyncWrapper } from '../utils/asyncWrapper';

@Service()
export class ParentController {
  constructor(private parentService: ParentService) {}

  /**
   * Retrieves the authenticated parent's profile.
   * @route GET /parent/profile
   * @access Private
   */
  getParentProfile = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const parentProfile = await this.parentService.getParentById(parentId);
    res.status(200).json({ parent: parentProfile });
  });

  /**
   * Updates the parent's email address.
   * @route PUT /parent/update-email
   * @access Private
   */
  updateParentEmail = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const { newEmail } = req.body;
    const updatedParent = await this.parentService.updateParentEmail(
      parentId,
      newEmail
    );
    res.status(200).json({
      message: 'Email updated successfully. Please verify your new email.',
      parent: updatedParent,
    });
  });

  /**
   * Updates the parent's password.
   * @route PUT /parent/update-password
   * @access Private
   */
  updateParentPassword = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const { oldPassword, newPassword } = req.body;
    await this.parentService.updateParentPassword(
      parentId,
      oldPassword,
      newPassword
    );
    res.status(200).json({ message: 'Password updated successfully' });
  });

  /**
   * Completes the parent's registration with additional details.
   * @route PUT /parent/complete-registration
   * @access Private
   */
  completeRegistration = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const parentEmail = req.parent.email;
    const updatedParent = await this.parentService.completeRegistration(
      req,
      parentId,
      parentEmail
    );
    res.status(200).json({
      message: 'Registration completed successfully',
      parent: updatedParent,
    });
  });

  /**
   * Deletes (deactivates) the parent's account.
   * @route DELETE /parent/remove-account
   * @access Private
   */
  deleteParentAccount = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const { password } = req.body;
    await this.parentService.deleteParentAccount(parentId, password);
    res.status(200).json({ message: 'Account deactivated successfully' });
  });

  /**
   * Initiates the password reset process by sending a reset link to the parent's email.
   * @route POST /parent/forgot-password
   * @access Public
   */
  forgotPassword = asyncWrapper(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.parentService.forgotPassword(email);
    res.status(200).json({
      message: `You will receive a link to reset your password in the email: ${email}`,
    });
  });

  /**
   * Resets the parent's password using the provided reset token.
   * @route PUT /parent/reset-password
   * @access Public
   */
  resetPassword = asyncWrapper(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    await this.parentService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password reset successfully' });
  });

  /**
   * Verifies the parent's email using the provided token.
   * @route POST /parent/verify-email
   * @access Public
   */
  verifyEmail = asyncWrapper(async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await this.parentService.verifyEmail(token);
    res.status(200).json(result);
  });

  /**
   * Resends the email verification link to the parent.
   * @route POST /parent/resend-verification-email
   * @access Public
   */
  resendVerificationEmail = asyncWrapper(
    async (req: Request, res: Response) => {
      const { email } = req.body;
      const result = await this.parentService.resendVerificationEmail(email);
      res.status(200).json(result);
    }
  );

  // ================================================== Child Operations =================================================

  /**
   * Registers a new child under the authenticated parent.
   * @route POST /parent/children
   * @access Private
   */
  registerChild = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const {
      username,
      birthDate,
      password,
      firstName,
      lastName,
      gender,
      schoolLevel,
    } = req.body;

    const newChild = await this.parentService.registerChild(
      parentId,
      username,
      birthDate,
      password,
      firstName,
      lastName,
      gender,
      schoolLevel
    );

    res.status(201).json({
      message: 'Child registered successfully',
      child: newChild,
    });
  });

  /**
   * Updates a child's information.
   * @route PUT /parent/children/:childId
   * @access Private
   */
  updateChild = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const childId = parseInt(req.params.childId, 10);
    const updateData = req.body;

    const updatedChild = await this.parentService.updateChild(
      parentId,
      childId,
      updateData
    );

    res.status(200).json({
      message: 'Child updated successfully',
      child: updatedChild,
    });
  });

  /**
   * Lists all children of the authenticated parent.
   * @route GET /parent/children
   * @access Private
   */
  listChildren = asyncWrapper(async (req: Request, res: Response) => {
    const parentId = req.parent.id;
    const children = await this.parentService.listChildren(parentId);
    res.status(200).json({ children });
  });
}
