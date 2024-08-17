import httpStatusCodes from 'http-status-codes';
import { z } from 'zod';

export const errorCodes = {
  RESOURCE_NOT_FOUND: {
    en: '{resource} not found',
    statusCode: httpStatusCodes.NOT_FOUND,
    metaData: z.object({
      resource: z.string(),
    }),
  },
  RESOURCE_ALREADY_EXISTS: {
    en: '{resource} already exists',
    statusCode: httpStatusCodes.CONFLICT,
    metaData: z.object({
      resource: z.string(),
    }),
  },
} as const;

export type ERROR_CODE_KEYS = keyof typeof errorCodes;
