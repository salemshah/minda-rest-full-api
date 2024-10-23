import { Application } from 'express';
import { promRegistry, trackHttpRequests } from '../metrics/metrics';
import logger from '../utils/logger';

export default function metricsLoader(app: Application) {
  // Apply the middleware to track HTTP requests and durations
  app.use(trackHttpRequests);

  // Prometheus metrics endpoint
  app.get('/api-metrics', async (_, res) => {
    try {
      res.set('Content-Type', promRegistry.contentType);
      res.end(await promRegistry.metrics());
    } catch (error) {
      logger.error('Failed to load metrics', error);
      res.status(500).end();
    }
  });
}
