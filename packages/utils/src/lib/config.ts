import { ZodTypeAny } from 'zod';

export function getConfig<T extends ZodTypeAny>(schema: T): NoInfer<T> {
  return schema.parse(process.env);
}
