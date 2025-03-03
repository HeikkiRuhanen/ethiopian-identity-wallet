import * as fs from 'node:fs';
import path from 'node:path';
import { pino } from 'pino';

// Ensure log directory exists
export const ensureLogDir = (logFile: string): void => {
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

// Create a logger
export const createLogger = async (logFile: string) => {
  ensureLogDir(logFile);
  
  return pino({
    level: 'info',
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: { destination: logFile }
        },
        {
          target: 'pino-pretty',
          options: {}
        }
      ]
    }
  });
}; 