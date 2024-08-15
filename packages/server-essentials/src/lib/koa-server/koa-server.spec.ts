import Koa from 'koa';
import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { appInstance, mockErrorCallback, mockLogger } from '../_utils';

let testServer: Koa;

describe('getKoaServer', () => {
  beforeAll(async () => {
    testServer = await appInstance;
  });

  describe('Server Instance', () => {
    it('should be defined and an instance of Koa', () => {
      expect(testServer).toBeDefined();
      expect(testServer).toBeInstanceOf(Koa);
    });
  });

  describe('Middleware Functionality', () => {
    it('should set the right properties on the context object', async () => {
      const mockDataFunction = vi.fn();
      testServer.use(async (ctx, next) => {
        mockDataFunction(ctx.logger, ctx.serviceName, ctx.serviceVersion);
        await next();
      });
      await request(testServer.callback()).get('/');

      expect(mockDataFunction).toHaveBeenCalledWith(mockLogger, 'test-service', '1.0.0');
    });

    it('should call logger.info with the correct message', () => {
      expect(mockLogger.info).toHaveBeenCalledWith('--------------------> Starting server <--------------------');
    });

    it('should respond with 404 for unknown routes', async () => {
      const response = await request(testServer.callback()).get('/unknown-route');
      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should call the error callback when an error is thrown', async () => {
      const error = new Error('test error');

      testServer.use(async () => {
        throw error;
      });

      await request(testServer.callback()).get('/');
      expect(mockErrorCallback).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });
});
