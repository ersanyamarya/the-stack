import { AppError } from '@local/infra-types';
import { Controller, koaCallback } from '@local/server-essentials';
import { z, infer as ZodInfer } from 'zod';

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

const TestController: Controller<ZodInfer<typeof querySchema>, ZodInfer<typeof paramsSchema>, ZodInfer<typeof bodySchema>> = async ({
  query,
  params,
  method,
  path,
  body,
  headers,
  ctx,
}) => {
  ctx.logger.info('TestController called');
  if (query.search === 'error') throw new AppError('RESOURCE_NOT_FOUND', ctx.logger, { metadata: { resource: 'Test' } });

  return {
    status: 200,
    body: { query, params, method, path, body, locale: ctx.locale, version: ctx.serviceVersion, service: ctx.serviceName },
  };
};

export default [
  {
    name: 'postTest',
    method: 'post',
    path: '/postTest/:id',
    callback: koaCallback(TestController, { querySchema, paramsSchema, bodySchema }),
  },
  {
    name: 'getTest',
    method: 'get',
    path: '/getTest',
    callback: koaCallback(TestController, { querySchema }),
  },
];
