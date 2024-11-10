import { Request, Response } from 'express';
import { ChildService } from '../services/child.service';
import { Service } from 'typedi';
import { asyncWrapper } from '../utils/asyncWrapper';
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from '../utils/helper-functions';

@Service()
export class ChildController {
  constructor(private childService: ChildService) {}

  /**
   * Authenticates a child and returns JWT tokens along with the child profile.
   * @route POST /child/login
   * @access Public
   */
  loginChild = asyncWrapper(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const { child, accessToken, refreshToken } =
      await this.childService.loginChild(username, password);
    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);
    setAccessTokenCookie(res, accessToken);

    res.status(200).json({ child, accessToken, refreshToken });
  });

  /**
   * Retrieves the authenticated child's profile.
   * @route GET /child/profile
   * @access Private
   */
  getChildProfile = asyncWrapper(async (req: Request, res: Response) => {
    // Assuming authentication middleware sets req.child with the authenticated child's info
    const childId = req.child.id;

    const childProfile = await this.childService.getChildById(childId);
    res.status(200).json({ child: childProfile });
  });

  /**
   * Changes the authenticated child's profile picture URL.
   * @route PUT /child/profile-picture
   * @access Private
   */
  changeProfilePicture = asyncWrapper(async (req: Request, res: Response) => {
    const childId = req.child.id;
    const { profilePictureUrl } = req.body;

    // Validate input
    if (!profilePictureUrl) {
      return res.status(400).json({
        message: 'Profile picture URL is required',
      });
    }

    const updatedChild = await this.childService.changeProfilePicture(
      childId,
      profilePictureUrl
    );
    res.status(200).json({ child: updatedChild });
  });

  /**
   * Initiates the password reset process by notifying the parent via email.
   * @route POST /child/forgot-password
   * @access Private
   */
  forgotPassword = asyncWrapper(async (req: Request, res: Response) => {
    // Assuming the authenticated child is requesting the password reset
    const { username } = req.body;

    await this.childService.forgotPassword(username);
    res.status(200).json({ message: 'Password reset email sent to parent' });
  });
}
