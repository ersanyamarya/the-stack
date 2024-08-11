import { StatusCodes } from 'http-status-codes';
import { Context } from 'koa';
import { infer as ZodInfer, ZodTypeAny } from 'zod';

export class RequestValidationError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}

// Define a type that includes the body only for POST and PUT methods
export type BaseControllerData<Query, Params, Body> =
  | { method: 'GET' | 'DELETE'; query: Query; params: Params; path: string }
  | { method: 'POST' | 'PUT'; query: Query; params: Params; path: string; body: Body };

export type ControllerResponse = {
  status: StatusCodes;
  body: unknown;
};

export type Controller<Query, Params, Body> = (data: BaseControllerData<Query, Params, Body>) => Promise<ControllerResponse>;

export type ValidationSchemas<Query extends ZodTypeAny, Params extends ZodTypeAny, Body extends ZodTypeAny> = {
  querySchema?: Query;
  paramsSchema?: Params;
  bodySchema?: Body;
};

export default function koaCallback<QuerySchema extends ZodTypeAny, ParamsSchema extends ZodTypeAny, BodySchema extends ZodTypeAny>(
  controller: Controller<ZodInfer<QuerySchema>, ZodInfer<ParamsSchema>, ZodInfer<BodySchema>>,
  schemas: ValidationSchemas<QuerySchema, ParamsSchema, BodySchema> = {}
) {
  return async (ctx: Context) => {
    let query = getQuery(ctx.query);
    const params = ctx['params'] as Record<string, unknown>;
    const path = ctx.path;
    const method = ctx.method as 'GET' | 'POST' | 'PUT' | 'DELETE';

    // Validate query parameters if a schema is provided
    if (schemas.querySchema) {
      const queryValidation = schemas.querySchema.safeParse(query);
      if (!queryValidation.success) {
        throw new RequestValidationError('Invalid query parameters', StatusCodes.BAD_REQUEST, queryValidation.error.errors);
      }
      query = queryValidation.data;
    }

    // Validate route parameters if a schema is provided
    if (schemas.paramsSchema) {
      const paramsValidation = schemas.paramsSchema.safeParse(params);
      if (!paramsValidation.success) {
        throw new RequestValidationError('Invalid route parameters', StatusCodes.BAD_REQUEST, paramsValidation.error.errors);
      }
    }

    // Validate request body if a schema is provided and method is POST or PUT
    let body: ZodInfer<BodySchema> | undefined;
    if (method === 'POST' || method === 'PUT') {
      body = ctx.request.body;
      if (schemas.bodySchema) {
        const bodyValidation = schemas.bodySchema.safeParse(body);
        if (!bodyValidation.success) {
          throw new RequestValidationError('Invalid request body', StatusCodes.BAD_REQUEST, bodyValidation.error.errors);
        }
      }
    }

    const result = await controller({ query, params, method, path, body } as BaseControllerData<
      ZodInfer<QuerySchema>,
      ZodInfer<ParamsSchema>,
      ZodInfer<BodySchema>
    >);
    ctx.status = result.status;
    ctx.body = result.body;
  };
}

function getQuery(query: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)])) as Record<string, string>;
}
