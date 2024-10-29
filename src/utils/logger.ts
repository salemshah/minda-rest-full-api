import { createLogger, format, transports } from 'winston';
import config from '../config';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(), // Colorize logs
    format.timestamp(), // Add timestamps
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
  transports: [new transports.Console()],
});

const port = config.server.port;

export const data = {
  1: {
    name: 'API',
    URL: `http://localhost:${port}/api`,
    DESCRIPTION: 'Main API endpoint',
  },
  2: {
    name: 'DOCS',
    URL: `http://localhost:${port}/api-docs`,
    DESCRIPTION: 'API documentation (Swagger UI)',
  },
  3: {
    name: 'METRICS',
    URL: `http://localhost:${port}/api-metrics`,
    DESCRIPTION: 'Metrics endpoint for monitoring and HTTP request tracking',
  },
  4: { name: 'PORT', URL: port, DESCRIPTION: 'Application running port' },
  5: {
    name: 'DB',
    URL: 'Connected successfully',
    DESCRIPTION: 'Database connected successfully',
  },
};

export default logger;
