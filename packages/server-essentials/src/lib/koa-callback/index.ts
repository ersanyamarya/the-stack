import { IncomingHttpHeaders } from 'http';
import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { infer as ZodInfer, ZodIssue, ZodTypeAny } from 'zod';

type ERROR_CODES = 'INVALID_QUERY_PARAMS' | 'INVALID_ROUTE_PARAMS' | 'INVALID_REQUEST_BODY';

export class RequestValidationError extends Error {
  status: ERROR_CODES;
  details: ZodIssue[];

  constructor(status: ERROR_CODES, details: ZodIssue[]) {
    super(status);
    Object.setPrototypeOf(this, RequestValidationError.prototype);
    this.status = status;
    this.details = details;
  }
}

export type BaseControllerData<Query, Params, Body> = {
  query: Query;
  params: Params;
  path: string;
  headers: IncomingHttpHeaders;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  ctx: Context;
  body?: Body;
};

export type ControllerResponse = {
  status: StatusCodes;
  body: unknown;
};

export type Controller<Query, Params, Body> = (
  data: BaseControllerData<Query, Params, Body>
) => Promise<ControllerResponse>;

export type ValidationSchemas<Query extends ZodTypeAny, Params extends ZodTypeAny, Body extends ZodTypeAny> = {
  querySchema?: Query;
  paramsSchema?: Params;
  bodySchema?: Body;
};

export function koaCallback<Query extends ZodTypeAny, Params extends ZodTypeAny, Body extends ZodTypeAny>(
  controller: Controller<ZodInfer<Query>, ZodInfer<Params>, ZodInfer<Body>>,
  schemas: ValidationSchemas<Query, Params, Body> = {}
): (ctx: Context) => Promise<void> {
  return async (ctx: Context) => {
    const params = ctx['params'] as Record<string, string>;
    let query = ctx.query;
    const path = ctx.path;
    const method = ctx.method as 'GET' | 'POST' | 'PUT' | 'DELETE';
    const headers = ctx.headers;

    if (schemas.querySchema) {
      const queryValidation = schemas.querySchema.safeParse(query);
      if (!queryValidation.success) {
        throw new RequestValidationError('INVALID_QUERY_PARAMS', queryValidation.error.errors);
      }
      query = queryValidation.data;
    }

    if (schemas.paramsSchema) {
      const paramsValidation = schemas.paramsSchema.safeParse(params);
      if (!paramsValidation.success) {
        throw new RequestValidationError('INVALID_ROUTE_PARAMS', paramsValidation.error.errors);
      }
    }

    let body: ZodInfer<Body> | undefined;
    if (method === 'POST' || method === 'PUT') {
      body = ctx.request.body;
      if (schemas.bodySchema) {
        const bodyValidation = schemas.bodySchema.safeParse(body);
        if (!bodyValidation.success) {
          throw new RequestValidationError('INVALID_REQUEST_BODY', bodyValidation.error.errors);
        }
      }
    }

    const result = await controller({ query, params, body, method, path, headers, ctx } as BaseControllerData<
      ZodInfer<Query>,
      ZodInfer<Params>,
      ZodInfer<Body>
    >);
    ctx.status = result.status;
    ctx.body = result.body;
  };
}

// function getQuery(query: Record<string, string | string[] | undefined>): Record<string, unknown> {
//   return Object.fromEntries(Object.entries(query).map(([key, value]) => [key, value ?? '']));
// }
