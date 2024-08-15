import Router from '@koa/router';
import { HealthCheck, Plugin } from '@local/infra-types';
import {
  Controller,
  ErrorCallback,
  getKoaServer,
  koaCallback,
  RequestValidationError,
  setupRootRoute,
} from '@local/server-essentials';
import { z, infer as ZodInfer } from 'zod';
import { config, getConfig } from './config';

const errorCallback: ErrorCallback = (error, ctx) => {
  if (error instanceof RequestValidationError) {
    ctx.status = 400;
    ctx.body = error;
    return;
  }
  ctx.status = 500;
  ctx.body = 'Internal server error';
};

// Define Zod schemas
const querySchema = z.object({
  search: z.string().optional(),
});

const paramsSchema = z.object({
  id: z.string(),
});

const bodySchema = z.object({
  name: z.string(),
  age: z.number().min(0),
});

const TestController: Controller<
  ZodInfer<typeof querySchema>,
  ZodInfer<typeof paramsSchema>,
  ZodInfer<typeof bodySchema>
> = async ({ query, params, method, path, body, headers }) => {
  return {
    status: 200,
    body: { query, params, method, path, body, headers, config },
  };
};

const router = new Router();
router.post(
  '/getTest/:id',

  koaCallback(TestController, { querySchema, paramsSchema, bodySchema })
);

type HealthChecks = {
  [service: string]: () => HealthCheck;
};
const plugins: Plugin<any>[] = [
  {
    connect: () => ({ name: 'test', healthCheck: () => ({ connected: true }) }),
    disconnect: () => {
      console.log('Disconnecting test plugin');
    },
  },
  {
    connect: () => ({ name: 'test2', healthCheck: () => ({ connected: true }) }),
    disconnect: () => {
      console.log('Disconnecting test2 plugin');
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
    logger: console,
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

  koaApp.use(router.routes());
  koaApp.use(router.allowedMethods());

  koaApp.listen(config.server.port, () => {
    console.log(`Server listening on ${config.server.url}`);
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
