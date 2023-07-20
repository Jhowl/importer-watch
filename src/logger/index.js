import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.prettyPrint()
  ),
  transports: [
    new transports.Console(),
    // new transports.File({ filename: 'logs/app.log' })
  ]
});

export default logger;
