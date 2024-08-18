import { Logger } from '@local/infra-types';
import { Context } from 'koa';
import { vi } from 'vitest';
import { getKoaServer, ServerEssentialsOptions } from './koa-server';

export const mockLogger: Logger = {
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
};

export const mockErrorCallback = vi.fn((error: unknown, ctx: Context) => {
  ctx.logger.error('--------------------> Mock Error <--------------------');
});

export const serverConfigurations: ServerEssentialsOptions = {
  logger: mockLogger,
  errorCallback: mockErrorCallback,
  serviceName: 'test-service',
  serviceVersion: '1.0.0',
};

export const appInstance = getKoaServer(serverConfigurations);
export const appInstanceWithLocale = getKoaServer({ ...serverConfigurations, localeCookieName: 'locale' });
