import Router from '@koa/router';
import { HealthCheck } from '@local/infra-types';

export type RootRouteOptions = {
  serviceName: string;
  serviceVersion: string;
  showRoutes?: boolean;
  healthChecks: {
    [pluginName: string]: () => HealthCheck;
  };
  [key: string]: unknown;
};

export function setupRootRoute(
  { serviceName, serviceVersion, showRoutes = false, healthChecks, ...info }: RootRouteOptions,
  router: Router
) {
  const checks: Record<string, HealthCheck> = {};
  if (healthChecks) {
    Object.entries(healthChecks).forEach(([pluginName, callback]) => {
      Object.assign(checks, { [pluginName]: callback() });
    });
  }

  router.get('health', '/', ctx => {
    ctx.body = {
      service: {
        name: serviceName,
        version: serviceVersion,
        status: 'ok',
        uptime: upTime(),
      },
      checks,
      ...info,
      ...(showRoutes
        ? {
            routes: router.stack.map(({ methods, path, name }) => ({
              methods: methods.join(','),
              path,
              name,
            })),
          }
        : {}),
    };
  });

  router.get('/ok', ctx => {
    ctx.body = 'ok';
  });
}

export function upTime(): string {
  const seconds = process.uptime();
  return new Date(seconds * 1000).toISOString().substr(11, 8);
}
