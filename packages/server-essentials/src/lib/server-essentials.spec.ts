import Koa from 'koa';
import supertest from 'supertest';
import { createServerEssentials, Logger, ServerEssentialsOptions } from './server-essentials';
const mockLogger: Logger = {
  info: vi.fn(),
  log: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
};

const mockErrorCallback = vi.fn((error: unknown) => {
  if (error instanceof Error) console.error(error.toString());
});

const serverConfigurations: ServerEssentialsOptions = {
  logger: mockLogger,
  errorCallback: mockErrorCallback,
  serviceName: 'test-service',
  serviceVersion: '1.0.0',
};

let testServer: Koa;
describe('createServerEssentials', () => {
  beforeAll(async () => {
    testServer = await createServerEssentials(serverConfigurations);
  });

  it('should be defined and an instance of Koa', () => {
    expect(testServer).toBeDefined();
    expect(testServer).toBeInstanceOf(Koa);
  });

  it('should set the right properties on the context object', async () => {
    const mockDataFunction = vi.fn();
    testServer.use(async (ctx, next) => {
      mockDataFunction(ctx.logger, ctx.serviceName, ctx.serviceVersion);
      await next();
    });
    await supertest(testServer.callback()).get('/');

    expect(mockDataFunction).toHaveBeenCalledWith(mockLogger, 'test-service', '1.0.0');
  });

  it('should call logger.info with the correct message', () => {
    expect(mockLogger.info).toHaveBeenCalledWith('--------------------> Starting server <--------------------');
  });

  it('should call the error callback when an error is thrown', async () => {
    const error = new Error('test error');

    testServer.use(async () => {
      throw error;
    });

    await supertest(testServer.callback()).get('/');
    expect(mockErrorCallback).toHaveBeenCalledWith(error, expect.any(Object));
  });
});
