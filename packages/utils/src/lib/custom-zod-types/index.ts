import { z } from 'zod';

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
