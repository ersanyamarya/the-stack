import Router from '@koa/router';
import Koa from 'koa';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { koaCallback, RequestValidationError } from '.';
import { appInstance, mockErrorCallback } from '../_utils';

// Define Zod schemas for testing
const querySchema = z.object({
  search: z.string(),
  page: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val), { message: 'Invalid number' }),
  active: z
    .string()
    .transform(val => (val === 'true' || val === 'True' ? true : val))
    .refine(val => typeof val === 'boolean', { message: 'Invalid boolean' }),
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  name: z.string(),
  age: z.number().min(34),
});

// Mock controller for testing
const mockController = async ({ query, params, method, path, body, headers }: Record<string, unknown>) => {
  return {
    status: 200,
    body: { query, params, method, path, body, headers },
  };
};

describe('koaCallback Error Handling', () => {
  let app: Koa;

  beforeEach(async () => {
    app = await appInstance;
    app.on('error', mockErrorCallback);
    vi.clearAllMocks();
  });

  describe('Query Parameter Validation', () => {
    it('should handle valid query parameters', async () => {
      const router = new Router();
      router.get('/test', koaCallback(mockController, { querySchema }));
      app.use(router.routes());

      const response = await request(app.callback()).get('/test?search=valid&page=1&active=true');
      expect(response.status).toBe(200);
      expect(response.body.query).toEqual({ search: 'valid', page: 1, active: true });
    });

    it('should invoke mockErrorCallback for invalid number in query parameters', async () => {
      const router = new Router();
      router.get('/test', koaCallback(mockController, { querySchema }));
      app.use(router.routes());

      await request(app.callback()).get('/test?search=valid&page=not-a-number&active=True');
      expect(mockErrorCallback).toHaveBeenCalled();

      const errorArg = mockErrorCallback.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(RequestValidationError);
      if (errorArg instanceof RequestValidationError) expect(errorArg.status).toBe('INVALID_QUERY_PARAMS');
    });

    it('should invoke mockErrorCallback for invalid boolean in query parameters', async () => {
      const router = new Router();
      router.get('/test', koaCallback(mockController, { querySchema }));
      app.use(router.routes());

      await request(app.callback()).get('/test?search=valid&page=1&active=not-a-boolean');
      expect(mockErrorCallback).toHaveBeenCalled();

      const errorArg = mockErrorCallback.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(RequestValidationError);
      if (errorArg instanceof RequestValidationError) expect(errorArg.status).toBe('INVALID_QUERY_PARAMS');
    });
  });

  describe('Body Parameter Validation', () => {
    it('should invoke mockErrorCallback for missing body parameters', async () => {
      const router = new Router();
      router.post('/test/:id', koaCallback(mockController, { paramsSchema, bodySchema }));
      app.use(router.routes());

      await request(app.callback()).post('/test/123e4567-e89b-12d3-a456-426614174000').send({ name: 'John' }); // Missing age
      expect(mockErrorCallback).toHaveBeenCalled();

      const errorArg = mockErrorCallback.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(RequestValidationError);
      if (errorArg instanceof RequestValidationError) expect(errorArg.status).toBe('INVALID_REQUEST_BODY');
    });

    it('should invoke mockErrorCallback for invalid body parameter type', async () => {
      const router = new Router();
      router.post('/test/:id', koaCallback(mockController, { paramsSchema, bodySchema }));
      app.use(router.routes());

      await request(app.callback())
        .post('/test/123e4567-e89b-12d3-a456-426614174000')
        .send({ name: 'John', age: 'thirty' }); // Age should be a number
      expect(mockErrorCallback).toHaveBeenCalled();

      const errorArg = mockErrorCallback.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(RequestValidationError);
      if (errorArg instanceof RequestValidationError) expect(errorArg.status).toBe('INVALID_REQUEST_BODY');
    });

    it('should invoke mockErrorCallback for body parameter below minimum', async () => {
      const router = new Router();
      router.post('/test/:id', koaCallback(mockController, { paramsSchema, bodySchema }));
      app.use(router.routes());

      await request(app.callback()).post('/test/123e4567-e89b-12d3-a456-426614174000').send({ name: 'John', age: 30 });
      expect(mockErrorCallback).toHaveBeenCalled();

      const errorArg = mockErrorCallback.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(RequestValidationError);
      if (errorArg instanceof RequestValidationError) expect(errorArg.status).toBe('INVALID_REQUEST_BODY');
    });

    it('should handle valid body parameters', async () => {
      const router = new Router();
      router.post('/test/:id', koaCallback(mockController, { paramsSchema, bodySchema }));
      app.use(router.routes());

      const response = await request(app.callback())
        .post('/test/123e4567-e89b-12d3-a456-426614174000')
        .send({ name: 'John', age: 35 });
      expect(response.status).toBe(200);
      expect(response.body.body).toEqual({ name: 'John', age: 35 });
    });
  });

  describe('Route Parameter Validation', () => {
    it('should invoke mockErrorCallback for invalid route parameters', async () => {
      const router = new Router();
      router.post('/test/:id', koaCallback(mockController, { paramsSchema, bodySchema }));
      app.use(router.routes());

      await request(app.callback()).post('/test/invalid-id').send({ name: 'John', age: 35 });
      expect(mockErrorCallback).toHaveBeenCalled();

      const errorArg = mockErrorCallback.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(RequestValidationError);
      if (errorArg instanceof RequestValidationError) expect(errorArg.status).toBe('INVALID_ROUTE_PARAMS');
    });

    it('should handle valid route parameters', async () => {
      const router = new Router();
      router.post('/test/:id', koaCallback(mockController, { paramsSchema, bodySchema }));
      app.use(router.routes());

      const response = await request(app.callback())
        .post('/test/123e4567-e89b-12d3-a456-426614174000')
        .send({ name: 'John', age: 35 });
      expect(response.status).toBe(200);
      expect(response.body.params).toEqual({ id: '123e4567-e89b-12d3-a456-426614174000' });
    });
  });
});
