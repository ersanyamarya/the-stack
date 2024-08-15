import Router from '@koa/router';
import Koa from 'koa';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { RootRouteOptions, setupRootRoute } from '.';
import { appInstance, mockErrorCallback } from '../_utils';

const options: RootRouteOptions = {
  serviceName: 'test-service',
  serviceVersion: '1.0.0',
  healthChecks: {
    test: () => ({ status: 'connected', connected: true }),
  },
  showRoutes: true,
};
describe('Root Route', () => {
  describe('when showRoutes is true', () => {
    let app: Koa;
    let router: Router;

    beforeAll(async () => {
      app = await appInstance;
      router = new Router();
      setupRootRoute(options, router);
      app.use(router.routes());
      app.on('error', mockErrorCallback);
      vi.clearAllMocks();
    });

    afterAll(() => {
      app.removeAllListeners();
      router.stack.length = 0;
    });

    it('should instantiate the root route', async () => {
      setupRootRoute(options, router);
      app.use(router.routes());

      const response = await request(app.callback()).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        service: {
          name: 'test-service',
          version: '1.0.0',
          status: 'ok',
        },
        checks: {
          test: {
            status: 'connected',
            connected: true,
          },
        },
      });

      expect(response.body).toHaveProperty('routes');
    });

    it('should return ok on the /ok route', async () => {
      app.use(router.routes());
      app.use(router.allowedMethods());

      const response = await request(app.callback()).get('/ok');

      expect(response.status).toBe(200);
      expect(response.text).toBe('ok');
    });
  });

  describe('when showRoutes is false', () => {
    let app: Koa;
    let router: Router;

    beforeAll(async () => {
      router = new Router();
      setupRootRoute({ ...options, showRoutes: false }, router);
      app = await appInstance;
      app.use(router.routes());
      app.on('error', mockErrorCallback);
      vi.clearAllMocks();
    });

    afterAll(() => {
      app.removeAllListeners();
      router.stack.length = 0;
    });
    it('should instantiate the root route for showRoutes = false', async () => {
      setupRootRoute({ ...options, showRoutes: false }, router);
      app.use(router.routes());

      const response = await request(app.callback()).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        service: {
          name: 'test-service',
          version: '1.0.0',
          status: 'ok',
        },
        checks: {
          test: {
            status: 'connected',
            connected: true,
          },
        },
      });
      expect(response.body).not.toHaveProperty('routes');
    });
  });
});
