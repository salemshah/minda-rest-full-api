import { z } from 'zod';

// Schema for validating login details
export const childLoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

// Schema for validating profile picture update
export const updateProfilePictureSchema = z.object({
  profilePictureUrl: z
    .string()
    .url({ message: 'Invalid URL format for profile picture' }),
});

// Schema for validating forgot password request
export const forgotPasswordSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
});
