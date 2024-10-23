import client from 'prom-client';
import { NextFunction, Request, Response } from 'express';

// Create a custom registry to register all metrics
export const promRegistry = new client.Registry();

// Enable collection of default metrics
client.collectDefaultMetrics({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  app: 'Minda',
  prefix: 'app_', // Optional prefix for all default metrics
  timeout: 5000, // Collect metrics every 5 seconds
  register: promRegistry,
});

// Create a Histogram metric to track request durations
export const httpRequestDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5], // Buckets for response time from 0.1s to 5s
  registers: [promRegistry], // Register this metric
});

// Create a Counter metric to track total HTTP requests
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [promRegistry], // Register this metric
});

// Create a Gauge metric to track memory usage
export const memoryUsageGauge = new client.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  registers: [promRegistry], // Register this metric
});

// Function to simulate memory usage metric
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    memoryUsageGauge.set(Math.random() * 1000000); // Simulate memory usage
  }, 5000);
}

// Middleware function to track HTTP requests
export function trackHttpRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const end = httpRequestDurationHistogram.startTimer({
    method: req.method,
    route: req.route ? req.route.path : 'unknown',
  });

  res.on('finish', () => {
    // Increment the total requests counter
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : 'unknown',
      status_code: res.statusCode,
    });

    // Stop the timer and record the request duration
    end({ status_code: res.statusCode });
  });

  next();
}

// Export the registry and other metrics
export { promRegistry as default };
