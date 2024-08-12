/* eslint-disable security/detect-object-injection */
import { IncomingMessage, Server, ServerResponse } from 'http';
import { Socket as NetSocket } from 'net';

/* eslint-disable @typescript-eslint/ban-types */

interface Socket extends NetSocket {
  isIdle: boolean;
}

interface SocketsMap {
  [key: number]: Socket;
}

interface Logger {
  info: (message: string, data?: object) => void;
  warn: (message: string, data?: object) => void;
  error: (message: string, data?: object) => void;
}

/**
 * When a request is received, the socket is marked as not idle. When the response is finished, the
 * socket is marked as idle
 * @param {IncomingMessage} request - The incoming HTTP request.
 * @param {ServerResponse} response - The response object.
 * @param {Logger} logger - The logger instance.
 */
const onRequest = (request: IncomingMessage, response: ServerResponse): void => {
  const socket = request.socket as Socket;
  socket.isIdle = false;

  response.on('finish', () => {
    socket.isIdle = true;
  });
};

/**
 * It creates a map of socket IDs to sockets, and adds a listener to the server that listens for new
 * connections. When a new connection is made, it creates a new socket ID and adds the socket to the
 * map. It also adds a listener to the socket that listens for the socket to close, and removes the
 * socket from the map when it does
 * @param {Server} server - The server that the socket is connected to.
 * @returns A map of socket IDs to sockets.
 */
const getSockets = (server: Server): SocketsMap => {
  const sockets: SocketsMap = {};
  let nextSocketId = 0;

  server.on('request', onRequest);
  server.on('connection', (socket: Socket): void => {
    socket.isIdle = true;

    const socketId = nextSocketId++;
    sockets[socketId] = socket;

    socket.once('close', (): void => {
      delete sockets[socketId];
    });
  });

  return sockets;
};

/**
 * Close all idle sockets
 * @param {SocketsMap} sockets - A map of socket IDs to sockets.
 * @param {Logger} logger - The logger instance.
 */
const closeSockets = (sockets: SocketsMap, logger: Logger): void => {
  logger.warn('--------> Closing idle connections <--------');

  Object.values(sockets).forEach((socket: Socket) => {
    if (socket.isIdle) {
      socket.destroy();
    }
  });
};

/**
 * It closes all the sockets, then closes the server, and then exits the process
 * @param {Server} server - The HTTP server that we're shutting down.
 * @param {SocketsMap} sockets - A map of socket IDs to socket instances.
 * @param {Logger} logger - The logger instance.
 * @param {Function} [onShutdown] - A function that will be called when the server is shutting down.
 */
const shutdown = async (server: Server, sockets: SocketsMap, logger: Logger, onShutdown?: Function): Promise<void> => {
  closeSockets(sockets, logger);

  if (onShutdown) {
    await onShutdown();
  }

  server.close(err => {
    if (err) {
      logger.error('Error while shutting down', { err });

      return process.exit(1);
    }

    process.exit(0);
  });
};

/* When the process receives SIGINT or SIGTERM, it will gracefully shutdown the server. */
export const gracefulShutdown = (server: Server, logger: Logger, onShutdown?: Function): void => {
  const sockets: SocketsMap = getSockets(server);

  process.on('SIGINT', async (): Promise<void> => {
    logger.info('Got SIGINT. Graceful shutdown');
    await shutdown(server, sockets, logger, onShutdown);
  });

  process.on('SIGTERM', async (): Promise<void> => {
    logger.info('Got SIGTERM. Graceful shutdown');
    await shutdown(server, sockets, logger, onShutdown);
  });
};
