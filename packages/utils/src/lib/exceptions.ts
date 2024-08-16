import { Logger } from '@local/infra-types';

export const exceptions = (logger: Logger): void => {
  process.on('unhandledRejection', reason => {
    throw reason;
  });

  process.on('uncaughtException', error => {
    logger.error(error.message, {
      err: error,
      context: { message: 'Uncaught exception' },
    });
  });
};
