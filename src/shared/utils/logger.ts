import pino from 'pino';

declare const __PKG_VERSION__: string;

export const APP_VERSION = __PKG_VERSION__;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  tool?: string;
  requestId?: string;
  target?: string;
  adapter?: string;
  [key: string]: unknown;
}

const logLevel = (process.env['LOG_LEVEL'] as LogLevel) ?? 'info';

const baseLogger = pino(
  {
    level: logLevel,
    base: {
      service: 'AccesibilityHub',
      version: APP_VERSION,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  pino.destination(2)
);

export const logger = {
  debug(message: string, context?: LogContext): void {
    baseLogger.debug(context ?? {}, message);
  },

  info(message: string, context?: LogContext): void {
    baseLogger.info(context ?? {}, message);
  },

  warn(message: string, context?: LogContext): void {
    baseLogger.warn(context ?? {}, message);
  },

  error(message: string, context?: LogContext & { error?: Error }): void {
    const { error, ...rest } = context ?? {};
    if (error) {
      baseLogger.error(
        {
          ...rest,
          err: {
            message: error.message,
            name: error.name,
            stack: error.stack,
          },
        },
        message
      );
    } else {
      baseLogger.error(rest, message);
    }
  },
};

export function createToolLogger(toolName: string) {
  return {
    debug(message: string, context?: Omit<LogContext, 'tool'>): void {
      logger.debug(message, { ...context, tool: toolName });
    },

    info(message: string, context?: Omit<LogContext, 'tool'>): void {
      logger.info(message, { ...context, tool: toolName });
    },

    warn(message: string, context?: Omit<LogContext, 'tool'>): void {
      logger.warn(message, { ...context, tool: toolName });
    },

    error(message: string, context?: Omit<LogContext, 'tool'> & { error?: Error }): void {
      logger.error(message, { ...context, tool: toolName });
    },
  };
}

export function createAdapterLogger(adapterName: string) {
  return {
    debug(message: string, context?: Omit<LogContext, 'adapter'>): void {
      logger.debug(message, { ...context, adapter: adapterName });
    },

    info(message: string, context?: Omit<LogContext, 'adapter'>): void {
      logger.info(message, { ...context, adapter: adapterName });
    },

    warn(message: string, context?: Omit<LogContext, 'adapter'>): void {
      logger.warn(message, { ...context, adapter: adapterName });
    },

    error(message: string, context?: Omit<LogContext, 'adapter'> & { error?: Error }): void {
      logger.error(message, { ...context, adapter: adapterName });
    },
  };
}

export function createRequestLogger(requestId: string) {
  return {
    debug(message: string, context?: Omit<LogContext, 'requestId'>): void {
      logger.debug(message, { ...context, requestId });
    },

    info(message: string, context?: Omit<LogContext, 'requestId'>): void {
      logger.info(message, { ...context, requestId });
    },

    warn(message: string, context?: Omit<LogContext, 'requestId'>): void {
      logger.warn(message, { ...context, requestId });
    },

    error(message: string, context?: Omit<LogContext, 'requestId'> & { error?: Error }): void {
      logger.error(message, { ...context, requestId });
    },
  };
}

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
