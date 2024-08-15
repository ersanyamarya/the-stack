import { Logger } from './logger';

export const STATUSES = [
  'connected',
  'disconnected',
  'error',
  'connecting',
  'disconnecting',
  'reconnecting',
  'unknown',
] as const;

type Status = (typeof STATUSES)[number];

type HealthCheck = {
  connected?: boolean;
  status?: Status;
};

export type PluginEcosystem = {
  logger: Logger;
  healthCheck: HealthCheck;
};

type PluginConfig<T> = T;

// Define the plugin interface with generics
interface Plugin<T> {
  // Connect function that returns a function to get the health check
  connect(config: PluginConfig<T>): () => HealthCheck;

  // Disconnect function
  disconnect(): void;
}

// Define a factory function for creating plugins with a logger
export type PluginFactory<T> = (logger: Logger) => Plugin<T>;
