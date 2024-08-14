/* eslint-disable security/detect-object-injection */
import { z, ZodObject, ZodRawShape } from 'zod';

// Function to load configuration using a schema and a mapping
export function loadConfigFromEnv<ConfigShape extends ZodRawShape, EnvMapping extends Record<string, unknown>>(
  schema: ZodObject<ConfigShape>,
  envMapping: EnvMapping
): z.infer<typeof schema> {
  const config: Record<string, any> = {};

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

// Helper function to check if a schema is a Zod object

export const configStringArraySchema = z
  .string()
  .transform(val => {
    if (val === '') return [];
    return val.split(',').map(item => item.trim());
  })
  .refine(val => Array.isArray(val), { message: 'Invalid string array' });

export const configNumberSchema = z
  .string()
  .regex(/^\d+$/, { message: 'Invalid number' })
  .transform(val => parseInt(val, 10))
  .refine(val => !isNaN(val), { message: 'Invalid number' });

export const configBooleanSchema = z
  .string()
  .transform(val => {
    if (val === 'true' || val === 'True') return true;
    if (val === 'false' || val === 'False') return false;
    return val;
  })
  .refine(val => typeof val === 'boolean', { message: 'Invalid boolean' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isZodObject(schemaType: any): schemaType is ZodObject<any> {
  return !!schemaType._def.shape;
}
