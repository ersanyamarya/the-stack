import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { loadConfigFromEnv } from './config';

// Define a schema with Zod
const exampleSchema = z.object({
  nodeEnv: z.string().default('development'),
  server: z.object({
    port: z
      .string()
      .regex(/^\d+$/, { message: 'Invalid number' })
      .transform(val => parseInt(val, 10))
      .refine(val => !isNaN(val), { message: 'Invalid number' }),
    host: z.string().default('localhost'),
  }),
  telemetryEnabled: z
    .string()
    .transform(val => (val === 'true' || val === 'True' ? true : val))
    .refine(val => typeof val === 'boolean', { message: 'Invalid boolean' }),
});

// Environment variable mapping
const envMapping = {
  nodeEnv: 'NODE_ENV',
  port: 'SERVICE_1_PORT',
  host: 'SERVICE_1_HOST',
  telemetryEnabled: 'TELEMETRY_ENABLED',
};

// Set up the test suite
describe('loadConfigFromEnv', () => {
  describe('with valid environment variables', () => {
    it('should load configuration correctly from env', () => {
      // Setup environment variables
      process.env['NODE_ENV'] = 'test';
      process.env['SERVICE_1_PORT'] = '8080';
      process.env['SERVICE_1_HOST'] = '127.0.0.1';
      process.env['TELEMETRY_ENABLED'] = 'true';

      // Load the config
      const config = loadConfigFromEnv(exampleSchema, envMapping);

      // Assertions
      expect(config.nodeEnv).toBe('test');
      expect(config.server.port).toBe(8080);
      expect(config.server.host).toBe('127.0.0.1');
      expect(config.telemetryEnabled).toBe(true);
    });
  });

  describe('with invalid environment variables', () => {
    it('should throw an error for invalid number', () => {
      process.env['SERVICE_1_PORT'] = 'not-a-number';

      expect(() => loadConfigFromEnv(exampleSchema, envMapping)).toThrow();
    });

    it('should throw an error for invalid boolean', () => {
      process.env['TELEMETRY_ENABLED'] = 'not-a-boolean';

      expect(() => loadConfigFromEnv(exampleSchema, envMapping)).toThrow();
    });
  });

  describe('with default values', () => {
    it('should use default values when environment variables are not set', () => {
      // Load the config without setting any environment variables

      delete process.env['NODE_ENV'];
      process.env['SERVICE_1_PORT'] = '8080';
      process.env['SERVICE_1_HOST'] = '127.0.0.1';
      process.env['TELEMETRY_ENABLED'] = 'true';

      const config = loadConfigFromEnv(exampleSchema, envMapping);

      // Assertions
      expect(config.nodeEnv).toBe('development');
      // expect(config.server.port).toBe(3000);
      // expect(config.server.host).toBe('localhost');
      // expect(config.telemetryEnabled).toBe(false);
    });
  });
});
