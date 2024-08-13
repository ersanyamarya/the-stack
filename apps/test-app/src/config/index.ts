import { configNumberSchema, loadConfigFromEnv } from '@local/utils';
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
});

type Config = z.infer<typeof configSchema>;

const eventMapping = {
  name: 'TEST_SERVICE_NAME',
  version: 'TEST_SERVICE_VERSION',
  port: 'TEST_SERVICE_PORT',
  url: 'TEST_SERVICE_URL',
};

export let config: Config;

try {
  console.log('Loading configuration...');
  config = loadConfigFromEnv(configSchema, eventMapping);
} catch (error) {
  console.error(error.message);
}

export function upTime(): string {
  const seconds = process.uptime();
  return new Date(seconds * 1000).toISOString().substr(11, 8);

  // return `${hours}h ${minutes}m ${seconds}s`;
}
