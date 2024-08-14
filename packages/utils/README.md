# utils

## 
## README Section for `config.ts` and `config.spec.ts`

### Overview

This project provides a configuration loader for Node.js applications that reads environment variables and validates them using the **Zod** library. The configuration ensures type safety by transforming string-based environment variables into more useful data types like numbers, booleans, and arrays.

### Files

- **`config.ts`**: Implements the configuration loader and defines custom types for parsing environment variables.
- **`config.spec.ts`**: Contains test cases to ensure the configuration loader functions correctly.

### Key Features

- **Environment Variable Mapping**: Maps environment variables to configuration keys, supporting nested configurations.
- **Type Safety with Zod**: Uses Zod schemas to enforce types and validate configuration values.
- **Custom Schemas for Parsing**:
  - **`configStringArraySchema`**: Parses comma-separated strings into arrays.
  - **`configNumberSchema`**: Parses strings into numbers, validating numeric input.
  - **`configBooleanSchema`**: Parses strings into booleans, recognizing "true"/"false" in various cases.
- **Error Handling**: Provides descriptive error messages for invalid or missing configuration values.

### Usage

1. **Define a Configuration Schema**: Use Zod to define the expected structure and types of your configuration.

   ```typescript
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
   ```

2. **Map Environment Variables**: Define a mapping between environment variables and configuration keys.

   ```typescript
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
   ```

3. **Load Configuration**: Use the `loadConfigFromEnv` function to load and validate the configuration from the environment.

   ```typescript
   const config = loadConfigFromEnv(configSchema, nestedEnvMapping);
   ```

### Custom Types

- **`configStringArraySchema`**: Converts a comma-separated string into an array of strings.
- **`configNumberSchema`**: Converts a string to a number, ensuring the string is a valid numeric representation.
- **`configBooleanSchema`**: Converts a string to a boolean, recognizing "true"/"false" in different cases.

### Testing

The test suite in `config.spec.ts` uses Vitest to verify the configuration loader's behavior. It includes tests for:

- Valid and invalid environment variables.
- Default values when environment variables are not set.
- Handling of missing required variables.
- Custom schema parsing for numbers, booleans, and string arrays.

Run the tests using the following command:

```bash
vitest
```

### Error Handling

The loader throws descriptive errors if:

- An environment variable has an invalid value.
- A required environment variable is missing.
- A value cannot be parsed according to the defined schema.

### Conclusion

This configuration loader is ideal for applications requiring robust configuration management with type safety and validation. By leveraging Zod, it ensures that configurations are both flexible and reliable, transforming string-based environment variables into more useful data types.