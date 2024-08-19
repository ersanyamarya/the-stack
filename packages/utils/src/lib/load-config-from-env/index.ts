/* eslint-disable security/detect-object-injection */
import { z, ZodObject, ZodRawShape } from 'zod';

// Function to load configuration using a schema and a mapping
export function loadConfigFromEnv<ConfigShape extends ZodRawShape, EnvMapping extends Record<string, unknown>>(
  schema: ZodObject<ConfigShape>,
  envMapping: EnvMapping
): z.infer<typeof schema> {
  const config: Record<string, unknown> = {};

  for (const key in schema.shape) {
    const envKey = envMapping[key] || key.toUpperCase(); // Use the mapping or default to uppercase key

    const schemaType = schema.shape[key];

    if (isZodObject(schemaType)) {
      // Recursively handle nested configurations
      config[key] = loadConfigFromEnv(schemaType, envMapping[key] as Record<string, unknown>);
    } else {
      const envValue = process.env[envKey as string];
      // Parse the environment variable or use the default
      const data = schemaType.safeParse(envValue);
      if (data.success) config[key] = data.data;
      else throw new Error(`Invalid value for ${key}/${envKey}: ${data.error.errors[0].message}`);
    }
  }

  return config as z.infer<typeof schema>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isZodObject(schemaType: any): schemaType is ZodObject<any> {
  return !!schemaType._def.shape;
}
