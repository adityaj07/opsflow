type LogLevel = 'info' | 'warn' | 'error';

const isProd = process.env.NODE_ENV === 'production';

const serializeError = (err: unknown) => {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return err;
};

const log = (level: LogLevel, message: string, meta?: unknown) => {
  if (!isProd) {
    // Dev-friendly logs
    console.log(`[${level.toUpperCase()}] ${message}`, meta ?? '');
    return;
  }

  // Prod JSON logs
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta !== undefined && { meta: serializeError(meta) }),
  };

  if (level === 'error') {
    process.stderr.write(JSON.stringify(logEntry) + '\n');
  } else {
    process.stdout.write(JSON.stringify(logEntry) + '\n');
  }
};

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
};
