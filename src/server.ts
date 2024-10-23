import 'reflect-metadata';
import 'express-async-errors';
import initializeApp from './app';
import config from './config';
import logger from './utils/logger';
import prisma from './prisma/client';
import { figletText } from './utils/helper-functions';
import { data } from './utils/logger';

const PORT = config.server.port || 8000;

async function startServer() {
  try {
    figletText();
    await prisma.$connect();
    const app = await initializeApp();

    app.listen(PORT, () => {
      console.table(Object.values(data));
    });
  } catch (err) {
    logger.error('Failed to start the server:', err);
    process.exit(1);
  }
}

startServer();
