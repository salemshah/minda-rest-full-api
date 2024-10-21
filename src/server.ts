import 'reflect-metadata';
import 'express-async-errors';
import initializeApp from './app';
import config from './config';
import logger from './utils/logger';
import prisma from './prisma/client';
import {figletText} from "./utils/helper-functions";
import chalk from 'chalk';

const PORT = config.server.port || 8000;

async function startServer() {
    try {
        figletText()
        await prisma.$connect();
        logger.info('Database connected successfully');
        const app = await initializeApp(); // Await initialization
        app.listen(PORT, () => {
            logger.info(`Server is running on port: ${chalk.blue(PORT)}`);
        });
    } catch (error) {
        logger.error('Failed to start the server:', error);
        process.exit(1);
    }
}

startServer()


