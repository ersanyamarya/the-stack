# utils

This library was generated with [Nx](https://nx.dev).

## Building
Here's a README for the `loadConfigFromEnv` function, which provides an overview of its purpose, usage, and examples:

---

# `loadConfigFromEnv`

The `loadConfigFromEnv` function is a utility designed to load and validate configuration settings from environment variables using Zod schemas. It provides a type-safe way to manage application configurations, ensuring that all values conform to specified types and constraints.

## Features

- **Type Safety**: Utilizes Zod schemas to enforce type constraints and provide type inference.
- **Environment Variable Mapping**: Supports mapping between configuration keys and environment variable names.
- **Default Values**: Allows default values to be specified directly within Zod schemas.
- **Validation**: Ensures all configuration values meet the specified validation criteria.


## Usage

### Function Signature

```typescript
function loadConfigFromEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  envMapping: Record<string, string>
): z.infer<ZodObject<T>>;
```

### Parameters

- `schema`: A Zod object schema defining the structure, types, and default values for the configuration.
- `envMapping`: An object mapping configuration keys to environment variable names.

### Returns

- A configuration object with values parsed and validated according to the provided Zod schema.

### Example

Here's an example of how to use the `loadConfigFromEnv` function:

```typescript
import { z } from 'zod';
import { loadConfigFromEnv } from './path/to/your/file';

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

// Load the configuration
const config = loadConfigFromEnv(exampleSchema, envMapping);

console.log(config.nodeEnv);  // Outputs the value of NODE_ENV or 'development'
console.log(config.server.port);  // Outputs the value of SERVICE_1_PORT or 3000
console.log(config.server.host);  // Outputs the value of SERVICE_1_HOST or 'localhost'
console.log(config.telemetryEnabled);  // Outputs the value of TELEMETRY_ENABLED or false
```

### Error Handling

If an environment variable does not meet the specified validation criteria, the function will throw an error. Ensure that all environment variables are correctly set and valid according to the schema.
