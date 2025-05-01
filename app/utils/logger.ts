type LogLevel = 'info' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];

  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  private saveLog(entry: LogEntry) {
    this.logs.push(entry);
    console.log(`[${entry.level.toUpperCase()}] ${entry.timestamp}: ${entry.message}`);
    if (entry.data) {
      console.log('Data:', JSON.stringify(entry.data, null, 2));
    }
  }

  info(message: string, data?: any) {
    const entry = this.createEntry('info', message, data);
    this.saveLog(entry);
  }

  error(message: string, data?: any) {
    const entry = this.createEntry('error', message, data);
    this.saveLog(entry);
  }

  debug(message: string, data?: any) {
    const entry = this.createEntry('debug', message, data);
    this.saveLog(entry);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }
}

export const logger = new Logger();