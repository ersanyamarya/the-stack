import { sendUnaryData, Server, ServerCredentials, ServerUnaryCall, status } from '@grpc/grpc-js';
import { Logger } from '@local/infra-types';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserRequest,
  GetUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  UserServiceServer,
  UserServiceService,
} from '@local/proto';
import { localUserUseCase } from './localUserUseCase';
import { User, UserRepository } from './repository';

const server = new Server();
const ConsoleTextColorLogger: Logger = {
  info: (...optionalParams: unknown[]) => console.log('\x1b[32m', 'ℹ️ ', ...optionalParams, '\x1b[0m'),
  warn: (...optionalParams: unknown[]) => console.log('\x1b[33m', '⚠️ ', ...optionalParams, '\x1b[0m'),
  error: (...optionalParams: unknown[]) => console.log('\x1b[31m', '❌ ', ...optionalParams, '\x1b[0m'),
  debug: (...optionalParams: unknown[]) => console.log('\x1b[34m', '🐛 ', ...optionalParams, '\x1b[0m'),
};
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 50051;

const address = `${HOST}:${PORT}`;

function userServiceServer(userRepository: UserRepository): UserServiceServer {
  return {
    getUser: async (call: ServerUnaryCall<GetUserRequest, GetUserResponse>, callback: sendUnaryData<GetUserResponse>) => {
      const user = await userRepository.getUser(call.request.id);
      if (user) {
        const userPB = GetUserResponse.fromJSON(user);
        const response: GetUserResponse = userPB;
        callback(null, response);
      } else {
        callback({ code: status.INTERNAL }, null);
      }
    },
    createUser: async (call: ServerUnaryCall<CreateUserRequest, CreateUserResponse>, callback: sendUnaryData<CreateUserResponse>) => {
      {
        try {
          const user = CreateUserRequest.toJSON(call.request) as User;
          await userRepository.createUser(user);
          const response: CreateUserResponse = { id: user.id };
          callback(null, response);
        } catch (error) {
          callback({ code: status.INTERNAL }, null);
        }
      }
    },
    listUsers: async (call: ServerUnaryCall<ListUsersRequest, ListUsersResponse>, callback: sendUnaryData<ListUsersResponse>) => {
      const usersPB = await userRepository.listUsers().then(users => users.map(user => GetUserResponse.fromJSON(user)));
      const response: ListUsersResponse = { users: usersPB };
      callback(null, response);
    },
  };
}

server.addService(UserServiceService, userServiceServer(localUserUseCase()));

server.bindAsync(address, ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    ConsoleTextColorLogger.error(err);
    process.exit(1);
  }
  ConsoleTextColorLogger.info(`Server bound on port ${port}`);
  ConsoleTextColorLogger.info(`Server listening on ${address}`);
});
