import { env } from "@/env";
import * as fs from "fs";
import * as path from "path";

enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

class Logger {
  private level: LogLevel;
  private logFilePath: string;

  constructor(level: LogLevel = LogLevel.INFO, logFilePath = "application.log") {
    this.level = level;
    this.logFilePath = path.resolve(logFilePath);
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, args: unknown[]): string {
    const message = args
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");

    if (env.NODE_ENV === "development") {
      console.log(message);
    }

    return `[${this.getTimestamp()}] [${level}] ${message}`;
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (this.shouldLog(level)) {
      const logMessage = this.formatMessage(level, args) + "\n";
      fs.appendFile(this.logFilePath, logMessage, (err) => {
        if (err) throw err;
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(...args: unknown[]): void {
    this.log(LogLevel.DEBUG, ...args);
  }

  info(...args: unknown[]): void {
    this.log(LogLevel.INFO, ...args);
  }

  warn(...args: unknown[]): void {
    this.log(LogLevel.WARN, ...args);
  }

  error(...args: unknown[]): void {
    this.log(LogLevel.ERROR, ...args);
  }
}

export const logger = new Logger(env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO);
