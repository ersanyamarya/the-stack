import { vi } from 'vitest';
import { getKoaServer, Logger, ServerEssentialsOptions } from './server-essentials';
export const mockLogger: Logger = {
  info: vi.fn(),
  log: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
};

export const mockErrorCallback = vi.fn((error: unknown) => {
  // if (error instanceof Error) console.error(error.toString());
  console.error('--------------------> Mock Error <--------------------');
});

export const serverConfigurations: ServerEssentialsOptions = {
  logger: mockLogger,
  errorCallback: mockErrorCallback,
  serviceName: 'test-service',
  serviceVersion: '1.0.0',
};

export const appInstance = getKoaServer(serverConfigurations);
