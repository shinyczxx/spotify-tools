/**
 * @file logger.ts
 * @description Logging utility that respects environment settings
 * @author Code Review Implementation
 * @version 1.0.0
 * @date 2025-11-18
 */

type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  minLevel: LogLevel
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
}

class Logger {
  private config: LoggerConfig

  constructor() {
    this.config = {
      enabled: import.meta.env.DEV || import.meta.env.MODE === 'development',
      minLevel: 'debug',
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled && level !== 'error') {
      return false
    }
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...args)
    }
  }

  log(...args: any[]): void {
    if (this.shouldLog('log')) {
      console.log(...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...args)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...args)
    }
  }

  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }
}

export const logger = new Logger()
export default logger
