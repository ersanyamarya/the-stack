import Router from '@koa/router';
import { HealthCheck, isAppError, Logger, Plugin } from '@local/infra-types';
import { ErrorCallback, getKoaServer, isRequestValidationError, setupRootRoute } from '@local/server-essentials';
import { exceptions, gracefulShutdown } from '@local/utils';
import httpStatusCodes from 'http-status-codes';
import { config, getConfig } from './config';
// green color for info, yellow for warn, red for error, and blue for debug
const ConsoleTextColorLogger: Logger = {
  info: (...optionalParams: unknown[]) => console.log('\x1b[32m', 'ℹ️ ', ...optionalParams, '\x1b[0m'),
  warn: (...optionalParams: unknown[]) => console.log('\x1b[33m', '⚠️ ', ...optionalParams, '\x1b[0m'),
  error: (...optionalParams: unknown[]) => console.log('\x1b[31m', '❌ ', ...optionalParams, '\x1b[0m'),
  debug: (...optionalParams: unknown[]) => console.log('\x1b[34m', '🐛 ', ...optionalParams, '\x1b[0m'),
};

import controllers from './controllers';
const errorCallback: ErrorCallback = (error, ctx) => {
  if (isRequestValidationError(error)) {
    ctx.status = httpStatusCodes.BAD_REQUEST;
    ctx.body = error;
    return;
  }
  if (isAppError(error)) {
    ctx.status = error.statusCode;
    ctx.body = {
      status: error.statusCode,
      errorCode: error.errorCode,
      metadata: error.metadata,
    };
    return;
  }
  ctx.status = 500;
  ctx.body = 'Internal server error';
};

const localLogger: Logger = ConsoleTextColorLogger;

const router = new Router();

type HealthChecks = {
  [service: string]: () => Promise<HealthCheck>;
};
const plugins: Plugin<any>[] = [
  {
    connect: async () => {
      localLogger.info('Connecting TEST-1 plugin');
      return { name: 'TEST-1', healthCheck: async (): Promise<HealthCheck> => ({ connected: true, status: 'connected' }) };
    },
    disconnect: async () => {
      localLogger.warn('Disconnecting TEST-1 plugin');
    },
  },
  {
    connect: async () => {
      localLogger.info('Connecting TEST-2 plugin');
      return { name: 'TEST-2', healthCheck: async (): Promise<HealthCheck> => ({ connected: true, status: 'error' }) };
    },
    disconnect: async () => {
      localLogger.warn('Disconnecting TEST-2 plugin');
    },
  },
];

const healthChecks: HealthChecks = {};
const onShutdown = async () => {
  localLogger.warn('Shutting down');
  await Promise.all(plugins.map(plugin => plugin.disconnect()));
};
plugins.forEach(async plugin => {
  const { name, healthCheck } = await plugin.connect(null);
  Object.assign(healthChecks, { [name]: healthCheck });
});

exceptions(localLogger);

async function main() {
  getConfig();

  const koaApp = await getKoaServer({
    logger: localLogger,
    errorCallback,
    serviceName: config.service.name,
    serviceVersion: config.service.version,
  });

  setupRootRoute(
    {
      serviceName: config.service.name,
      serviceVersion: config.service.version,
      healthChecks,
      showRoutes: !config.isProduction,
      nodeEnv: config.nodeEnv,
    },
    router
  );

  controllers.forEach(({ name, method, path, callback }) => {
    localLogger.info(`--> Setting up route ${method.toUpperCase()} ${path}`);
    // eslint-disable-next-line security/detect-object-injection
    router[method](name, path, callback);
  });

  koaApp.use(router.routes());
  koaApp.use(router.allowedMethods());

  const server = koaApp
    .listen(config.server.port, () => {
      localLogger.info(`Server listening on ${config.server.url}`);
    })
    .on('error', error => {
      localLogger.error(error.message);
      process.exit(1);
    });

  gracefulShutdown(localLogger, onShutdown, server);
}

main().catch(error => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  } else {
    console.error('An unknown error occurred');
    process.exit(1);
  }
});
