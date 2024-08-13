import cors from '@koa/cors';
import Koa, { Context } from 'koa';

import { bodyParser } from '@koa/bodyparser';
import helmet from 'koa-helmet';
import { Logger } from './_utils';

declare module 'koa' {
  interface BaseContext {
    logger: Logger;
    serviceName: string;
    serviceVersion: string;
  }
}

export type ErrorCallback = (error: unknown, ctx: Context) => void;

export type ServerEssentialsOptions = {
  logger: Logger;
  errorCallback: ErrorCallback;
  serviceName: string;
  serviceVersion: string;
};

export async function getKoaServer({ logger, errorCallback, serviceName, serviceVersion }: ServerEssentialsOptions) {
  logger.info('--------------------> Starting server <--------------------');
  const app = new Koa();
  app.use(helmet());
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
