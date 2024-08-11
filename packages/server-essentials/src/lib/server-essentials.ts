import cors from '@koa/cors';
import Koa, { Context } from 'koa';

import { bodyParser } from '@koa/bodyparser';

export type Logger = {
  info: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

declare module 'koa' {
  interface BaseContext {
    logger: Logger;
    serviceName: string;
    serviceVersion: string;
  }
}

export type ServerEssentialsOptions = {
  logger: Logger;
  errorCallback: (error: any, ctx: Context) => void;
  serviceName: string;
  serviceVersion: string;
};

export async function createServerEssentials({ logger, errorCallback, serviceName, serviceVersion }: ServerEssentialsOptions) {
  logger.info('--------------------> Starting server <--------------------');
  const app = new Koa();
  app.use(async (ctx, next) => {
    try {
      ctx.logger = logger;
      ctx.serviceName = serviceName;
      ctx.serviceVersion = serviceVersion;

      await next();
    } catch (error) {
      errorCallback(error, ctx);
    }
  });
  app.use(cors());

  app.use(
    bodyParser({
      encoding: 'utf-8',
      enableTypes: ['json', 'form', 'text', 'xml'],
      formLimit: '56kb',
      onError: errorCallback,
    })
  );

  return app;
}
