import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from '../routes';
import { metricsMiddleware } from '../middlewares/metrics.middleware';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

export default function expressLoader(app: Application): void {
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(
    cors({
      origin: '',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(compression());
  app.use(morgan('combined'));
  app.use(metricsMiddleware);

  // API Routes
  app.use('/api', routes);
}
