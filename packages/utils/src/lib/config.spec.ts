import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { configBooleanSchema, configNumberSchema, configStringArraySchema, loadConfigFromEnv } from './config';

// Define a schema with Zod
const configSchema = z.object({
  service: z.object({
    name: z.string(),
    version: z.string(),
  }),
  server: z.object({
    port: configNumberSchema,
    url: z.string(),
  }),
  nodeEnv: z.string().default('development'),
  features: configStringArraySchema.optional(),
  isFeatureEnabled: configBooleanSchema.optional(),
});

// Nested environment variable mapping
const nestedEnvMapping = {
  service: {
    name: 'TEST_SERVICE_NAME',
    version: 'TEST_SERVICE_VERSION',
  },
  server: {
    port: 'TEST_SERVICE_PORT',
    url: 'TEST_SERVICE_URL',
  },
  nodeEnv: 'NODE_ENV',
  features: 'FEATURES',
  isFeatureEnabled: 'IS_FEATURE_ENABLED',
};

// Set up the test suite
describe('loadConfigFromEnv', () => {
  beforeEach(() => {
    process.env['TEST_SERVICE_NAME'] = 'MyService';
    process.env['TEST_SERVICE_VERSION'] = '1.0.0';
    process.env['TEST_SERVICE_PORT'] = '8080';
    process.env['TEST_SERVICE_URL'] = 'http://localhost';
    process.env['NODE_ENV'] = 'production';
    process.env['FEATURES'] = 'feature1,feature2';
    process.env['IS_FEATURE_ENABLED'] = 'true';
  });

  describe('with valid environment variables', () => {
    it('should load configuration correctly from env', () => {
      const config = loadConfigFromEnv(configSchema, nestedEnvMapping);

      expect(config.service.name).toBe('MyService');
      expect(config.service.version).toBe('1.0.0');
      expect(config.server.port).toBe(8080);
      expect(config.server.url).toBe('http://localhost');
      expect(config.nodeEnv).toBe('production');
      expect(config.features).toEqual(['feature1', 'feature2']);
      expect(config.isFeatureEnabled).toBe(true);
    });
  });

  describe('with invalid environment variables', () => {
    it('should throw an error for invalid number', () => {
      process.env['TEST_SERVICE_PORT'] = 'not-a-number';
      expect(() => loadConfigFromEnv(configSchema, nestedEnvMapping)).toThrow('Invalid value for port');
    });

    it('should throw an error for invalid boolean', () => {
      process.env['IS_FEATURE_ENABLED'] = 'not-a-boolean';
      expect(() => loadConfigFromEnv(configSchema, nestedEnvMapping)).toThrow('Invalid boolean');
    });
  });

  describe('with default values', () => {
    it('should use default values when environment variables are not set', () => {
      delete process.env['NODE_ENV'];
      const config = loadConfigFromEnv(configSchema, nestedEnvMapping);

      expect(config.nodeEnv).toBe('development');
    });
  });

  describe('with missing environment variables', () => {
    it('should throw an error for missing required variables', () => {
      delete process.env['TEST_SERVICE_NAME'];
      expect(() => loadConfigFromEnv(configSchema, nestedEnvMapping)).toThrow('Invalid value for name');
    });
  });

  // Additional tests for configNumberSchema
  describe('configNumberSchema', () => {
    it('should parse valid numeric strings', () => {
      const result = configNumberSchema.safeParse('123');
      expect(result.success).toBe(true);
      expect(result.data).toBe(123);
    });

    it('should fail on non-numeric strings', () => {
      const result = configNumberSchema.safeParse('abc');
      expect(result.success).toBe(false);
    });

    it('should fail on negative numbers', () => {
      const result = configNumberSchema.safeParse('-123');
      expect(result.success).toBe(false);
    });
  });

  // Additional tests for configBooleanSchema
  describe('configBooleanSchema', () => {
    it('should parse "true" and "True" as true', () => {
      expect(configBooleanSchema.safeParse('true').data).toBe(true);
      expect(configBooleanSchema.safeParse('True').data).toBe(true);
    });

    it('should parse "false" and "False" as false', () => {
      expect(configBooleanSchema.safeParse('false').data).toBe(false);
      expect(configBooleanSchema.safeParse('False').data).toBe(false);
    });

    it('should fail on non-boolean strings', () => {
      const result = configBooleanSchema.safeParse('yes');
      expect(result.success).toBe(false);
    });
  });
  describe('configStringArraySchema', () => {
    it('should parse a comma-separated string into an array', () => {
      const result = configStringArraySchema.safeParse('item1,item2,item3');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle leading and trailing spaces', () => {
      const result = configStringArraySchema.safeParse(' item1 , item2 , item3 ');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['item1', 'item2', 'item3']);
    });

    it('should return an empty array for an empty string', () => {
      const result = configStringArraySchema.safeParse('');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle single item without commas', () => {
      const result = configStringArraySchema.safeParse('singleItem');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['singleItem']);
    });

    it('should throw an error for malformed input', () => {
      const result = configStringArraySchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
