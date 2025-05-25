import { format } from 'date-fns';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      level,
      message,
      data,
      error,
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 
                           entry.level === 'debug' ? 'debug' : 'log';
      
      console[consoleMethod](
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        entry.data || '',
        entry.error || ''
      );
    }

    // In production, you would send logs to a logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement production logging service integration
      // Example: sendToLoggingService(entry);
    }
  }

  info(message: string, data?: any) {
    this.addLog(this.formatLog('info', message, data));
  }

  warn(message: string, data?: any) {
    this.addLog(this.formatLog('warn', message, data));
  }

  error(message: string, error?: Error, data?: any) {
    this.addLog(this.formatLog('error', message, data, error));
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.addLog(this.formatLog('debug', message, data));
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance(); 