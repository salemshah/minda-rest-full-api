import 'reflect-metadata';
import express, {Application} from 'express';
import expressLoader from './loaders/express.loader';
import metricsLoader from './loaders/metrics.loader';
import errorHandler from './middlewares/error.middleware';
import {notFoundHandler} from './middlewares/notFound.middleware';

const app: Application = express();

async function initializeApp(): Promise<Application> {
    // loaders
    expressLoader(app);
    metricsLoader(app);
    if (process.env.NODE_ENV === 'development') {
        try {
            const {default: swaggerLoader} = await import('./loaders/swagger.loader');
            await swaggerLoader(app);
        } catch (error) {
            console.error('Failed to load Swagger documentation:', error);
        }
    }

    // Error Handling
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app
}

export default initializeApp;
