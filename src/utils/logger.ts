import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.colorize(),          // Colorize logs
        format.timestamp(),         // Add timestamps
        format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level}]: ${stack || message}`;
        })
    ),
    transports: [new transports.Console()],
});

export default logger;
