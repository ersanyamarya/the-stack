import { Context } from 'koa';
import { vi } from 'vitest';
import { getKoaServer, ServerEssentialsOptions } from './server-essentials';
export type Logger = {
  info: (message: string, ...optionalParams: unknown[]) => void;
  warn: (message: string, ...optionalParams: unknown[]) => void;
  error: (message: string, ...optionalParams: unknown[]) => void;
  debug: (message: string, ...optionalParams: unknown[]) => void;
};

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
