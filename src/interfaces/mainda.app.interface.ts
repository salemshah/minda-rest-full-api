import { Child, Parent } from '@prisma/client';

export interface TokenPayload {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export type SafeChild = Omit<
  Child,
  'resetPasswordToken' | 'password' | 'resetPasswordExpires'
>;

export type SafeParent = Omit<
  Parent,
  | 'password'
  | 'verificationToken'
  | 'verificationTokenExpires'
  | 'resetPasswordToken'
  | 'resetPasswordExpires'
>;

export type AuthChildResponse = {
  child: SafeChild;
  accessToken: string;
  refreshToken: string;
};

export type AuthParentResponse = {
  parent: SafeParent;
  accessToken: string;
  refreshToken: string;
};
