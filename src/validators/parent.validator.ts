// src/validators/user.validator.ts

import { z } from 'zod';

export const updateEmailSchema = z.object({
  newEmail: z.string().email({ message: 'Invalid email address' }),
});

export const completeRegistrationSchema = z.object({
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  phoneNumber: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits' }),
  addressPostal: z.string().min(5, { message: 'Postal address is too short' }),
});

export const updatePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, { message: 'Old password must be at least 6 characters long' }),
  newPassword: z
    .string()
    .min(6, { message: 'New password must be at least 6 characters long' }),
});

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  newPassword: z
    .string()
    .min(6, { message: 'New password must be at least 6 characters long' }),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Verification token is required' }),
});

export const resendVerificationEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});
