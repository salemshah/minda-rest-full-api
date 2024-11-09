import { Response } from 'express';
import figlet from 'figlet';
import chalk from 'chalk';

function excludeField<T extends Record<string, unknown>, Key extends keyof T>(
  data: T,
  keys: Key[]
): Omit<T, Key> {
  const entries = Object.entries(data) as [Key, T[Key]][];
  const filteredEntries = entries.filter(([key]) => !keys.includes(key));
  return Object.fromEntries(filteredEntries) as unknown as Omit<T, Key>;
}

function figletText(): void {
  figlet('MINDA    REST    FULL   A P I', function (err, data) {
    if (err) return;
    console.log(chalk.green(data));
  });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export {
  excludeField,
  figletText,
  setAccessTokenCookie,
  setRefreshTokenCookie,
};
