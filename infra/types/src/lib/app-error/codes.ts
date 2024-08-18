import httpStatusCodes from 'http-status-codes';
import { z } from 'zod';

export const errorCodes = {
  RESOURCE_NOT_FOUND: {
    en: '{resource} not found',
    de: '{resource} nicht gefunden',
    statusCode: httpStatusCodes.NOT_FOUND,
    metaData: z.object({
      resource: z.string(),
    }),
  },
  RESOURCE_ALREADY_EXISTS: {
    en: '{resource} already exists',
    de: '{resource} existiert bereits',
    statusCode: httpStatusCodes.CONFLICT,
    metaData: z.object({
      resource: z.string(),
    }),
  },
  USER_UNAUTHENTICATED: {
    en: 'User unauthenticated',
    de: 'Benutzer nicht authentifiziert',
    statusCode: httpStatusCodes.UNAUTHORIZED,
    metaData: z.object({}),
  },
  USER_UNAUTHORIZED: {
    en: 'User unauthorized',
    de: 'Benutzer nicht autorisiert',
    statusCode: httpStatusCodes.FORBIDDEN,
    metaData: z.object({}),
  },
} as const;

export type ERROR_CODE_KEYS = keyof typeof errorCodes;
