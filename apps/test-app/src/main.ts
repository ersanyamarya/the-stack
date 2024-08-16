import Router from '@koa/router';
import { HealthCheck, Logger, Plugin } from '@local/infra-types';
import { ErrorCallback, getKoaServer, RequestValidationError, setupRootRoute } from '@local/server-essentials';
import { exceptions, gracefulShutdown } from '@local/utils';
import { config, getConfig } from './config';

import controllers from './controllers';
const errorCallback: ErrorCallback = (error, ctx) => {
  if (error instanceof RequestValidationError) {
    ctx.status = 400;
    ctx.body = error;
    return;
  }
  ctx.status = 500;
  ctx.body = 'Internal server error';
};

const localLogger: Logger = console;

const router = new Router();

type HealthChecks = {
  [service: string]: () => HealthCheck;
};
const plugins: Plugin<any>[] = [
  {
    connect: async () => {
      localLogger.info('Connecting test plugin');
      return Promise.resolve({ name: 'test', healthCheck: async () => ({ connected: true }) });
    },
    disconnect: async () => {
      localLogger.info('Disconnecting test plugin');
    },
  },
  {
    connect: async () => {
      localLogger.info('Connecting test2 plugin');
      return { name: 'test2', healthCheck: async () => ({ connected: true }) };
    },
    disconnect: async () => {
      localLogger.info('Disconnecting test2 plugin');
    },
  },
];
const healthChecks: HealthChecks = {};
const onShutdown = async () => {
  localLogger.info('Shutting down');
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
      nodeEnv: config.nodeEnv,
      showRoutes: !config.isProduction,
    },
    router
  );

  controllers.forEach(({ name, method, path, callback }) => {
    localLogger.info(`Setting up route ${method.toUpperCase()} ${path}`);
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
