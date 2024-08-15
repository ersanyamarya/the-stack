import { Logger } from './logger';

export const STATUSES = ['connected', 'disconnected', 'error', 'connecting', 'disconnecting', 'reconnecting', 'unknown'] as const;

type Status = (typeof STATUSES)[number];

export type HealthCheck = {
  connected?: boolean;
  status?: Status;
};

// Define the plugin interface with generics
export interface Plugin<T extends Record<string, unknown>> {
  // Connect function that returns a function to get the health check
  connect(config: T): {
    name: string;
    healthCheck: () => HealthCheck;
  };

  // Disconnect function
  disconnect(): void;
}

// Define a factory function for creating plugins with a logger
export type PluginFactory<T extends Record<string, unknown>> = (logger: Logger) => Plugin<T>;
