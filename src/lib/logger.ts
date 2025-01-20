import { env } from "@/env";
import * as fs from "fs";
import * as path from "path";

enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

type LoggerParams = [string, Record<string, unknown>];

class Logger {
  private logFilePath: string;
  constructor(logFilePath = "application.log") {
    this.logFilePath = path.resolve(logFilePath);
  }
  private getTimestamp(): string {
    return new Date().toISOString();
  }
  private formatMessage(level: LogLevel, msg: string, args: Record<string, unknown>): string {
    const message = { timestamp: this.getTimestamp(), level, msg, ...args };
    if (env.NODE_ENV === "development") {
      console.log(message);
    }
    return JSON.stringify(message);
  }

  private log(level: LogLevel, msg: string, args: Record<string, unknown>): void {
    const logMessage = this.formatMessage(level, msg, args) + "\n";
    fs.appendFile(this.logFilePath, logMessage, (err) => {
      if (err) throw err;
    });
  }
  debug(...args: LoggerParams) {
    if (env.NODE_ENV !== "production") this.log(LogLevel.DEBUG, ...args);
  }
  info(...args: LoggerParams) {
    this.log(LogLevel.INFO, ...args);
  }
  warn(...args: LoggerParams) {
    this.log(LogLevel.WARN, ...args);
  }
  error(...args: LoggerParams) {
    this.log(LogLevel.ERROR, ...args);
  }
}

export const logger = new Logger();
