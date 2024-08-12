/* eslint-disable security/detect-object-injection */
import { z, ZodObject, ZodRawShape } from 'zod';

// Function to load configuration using a schema and a mapping
export function loadConfigFromEnv<T extends ZodRawShape>(
  schema: ZodObject<T>,
  envMapping: Record<string, string>
): z.infer<ZodObject<T>> {
  const config: Record<string, unknown> = {};

  for (const key in schema.shape) {
    const envKey = envMapping[key] || key.toUpperCase(); // Use the mapping or default to uppercase key
    const envValue = process.env[envKey];
    const schemaType = schema.shape[key];

    if (schemaType instanceof ZodObject) {
      // Recursively handle nested configurations
      config[key] = loadConfigFromEnv(schemaType, envMapping);
    } else {
      // Parse the environment variable or use the default
      const data = schemaType.safeParse(envValue);
      if (data.success) config[key] = data.data;
      else throw new Error(`Invalid value for ${key}: ${data.error.errors[0].message}`);
    }
  }

  return config as z.infer<ZodObject<T>>;
}
