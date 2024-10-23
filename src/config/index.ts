import dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

const config = {
  server: {
    port: process.env.PORT || (8000 as number),
  },
  jwt: {
    accessTokenSecret:
      process.env.ACCESS_TOKEN_SECRET || ('minda_secret' as string),
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET || ('minda_refresh_secret' as string),
    refreshTokenExpiresIn: '7d' as string,
    accessTokenExpiresIn: '15m' as string,
  },
  smtp: {
    host: process.env.EMAIL_HOST || ('smtp-relay.brevo.com' as string),
    port: process.env.EMAIL_PORT || ('587' as string),
    isSecure: false,
    user: process.env.EMAIL_USER || ('xyz@smtp-brevo.com' as string),
    password: process.env.EMAIL_PASS || ('xyz' as string),
    from: process.env.EMAIL_FROM || ('salem@gmail.com' as string),
  },
  client: {
    frontendUrlVerifyEmail:
      process.env.FRONTEND_URL_VERIFY_EMAIL ||
      ('http://localhost/api/parent/reset-password' as string),
    frontendUrlForgotPassword:
      process.env.FRONTEND_URL_FORGOT_PASSWORD ||
      ('http://localhost/api/parent/verify-email' as string),
  },
};

export default config;
