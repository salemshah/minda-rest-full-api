import dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

const config = {
  server: {
    port: process.env.PORT || (8000 as number),
  },
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET as string,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET as string,
    refreshTokenExpiresIn: '7d' as string,
    accessTokenExpiresIn: '15m' as string,
  },
  smtp: {
    host: process.env.EMAIL_HOST as string,
    port: process.env.EMAIL_PORT as string,
    isSecure: false,
    user: process.env.EMAIL_USER as string,
    password: process.env.EMAIL_PASS as string,
    from: process.env.EMAIL_FROM as string,
  },
  client: {
    frontendUrlVerifyEmail: process.env.FRONTEND_URL_VERIFY_EMAIL as string,
    frontendUrlForgotPassword: process.env
      .FRONTEND_URL_FORGOT_PASSWORD as string,
  },
};

export default config;
