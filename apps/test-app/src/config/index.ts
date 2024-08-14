import { configNumberSchema, configStringArraySchema, loadConfigFromEnv } from '@local/utils';
import { z } from 'zod';

const configSchema = z.object({
  service: z.object({
    name: z.string(),
    version: z.string(),
  }),
  server: z.object({
    port: configNumberSchema,
    url: z.string(),
  }),
  features: configStringArraySchema,

  nodeEnv: z.string(),
});

const eventMapping: Record<keyof z.infer<typeof configSchema>, unknown> = {
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
};

type AppConfigType = z.infer<typeof configSchema> & {
  isProduction: boolean;
};

export let config: AppConfigType;

export const getConfig = (): void => {
  const envConfig = loadConfigFromEnv(configSchema, eventMapping);
  config = { ...envConfig, isProduction: ['production', 'prod'].includes(envConfig.nodeEnv) };
};

export function upTime(): string {
  const seconds = process.uptime();
  return new Date(seconds * 1000).toISOString().substr(11, 8);

  // return `${hours}h ${minutes}m ${seconds}s`;
}
