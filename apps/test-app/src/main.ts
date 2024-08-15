import Router from '@koa/router';
import { HealthCheck, Logger, Plugin } from '@local/infra-types';
import { ErrorCallback, getKoaServer, RequestValidationError, setupRootRoute } from '@local/server-essentials';
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
    connect: () => ({ name: 'test', healthCheck: () => ({ connected: true }) }),
    disconnect: () => {
      localLogger.info('Disconnecting test plugin');
    },
  },
  {
    connect: () => ({ name: 'test2', healthCheck: () => ({ connected: true }) }),
    disconnect: () => {
      localLogger.info('Disconnecting test2 plugin');
    },
  },
];
const healthChecks: HealthChecks = {};

async function main() {
  getConfig();

  plugins.forEach(plugin => {
    const { name, healthCheck } = plugin.connect(null);
    Object.assign(healthChecks, { [name]: healthCheck });
  });

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
    // eslint-disable-next-line security/detect-object-injection
    localLogger.info(`Setting up route ${method.toUpperCase()} ${path}`);
    router[method](name, path, callback);
  });

  koaApp.use(router.routes());
  koaApp.use(router.allowedMethods());

  koaApp.listen(config.server.port, () => {
    localLogger.info(`Server listening on ${config.server.url}`);
  });
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
