import { sendUnaryData, Server, ServerCredentials, ServerUnaryCall, status } from '@grpc/grpc-js';
import { CreateUserRequest, CreateUserResponse, GetUserRequest, GetUserResponse, UserServiceServer, UserServiceService } from '@local/proto';
export interface LocalUser {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  password: string;
  id: string;
}

const users: LocalUser[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe.example.com',
    photoUrl: 'https://example.com/john-doe.jpg',
    password: 'password',
    id: '1',
  },
];

const server = new Server();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;

const address = `${HOST}:${PORT}`;

function userServiceServer(): UserServiceServer {
  return {
    getUser: (call: ServerUnaryCall<GetUserRequest, GetUserResponse>, callback: sendUnaryData<GetUserResponse>) => {
      const user = users.find(u => u.id === call.request.id);
      if (user) {
        const userPB = GetUserResponse.fromJSON(user);
        const response: GetUserResponse = userPB;
        callback(null, response);
      } else {
        callback({ code: status.INTERNAL }, null);
      }
    },
    createUser: (call: ServerUnaryCall<CreateUserRequest, CreateUserResponse>, callback: sendUnaryData<CreateUserResponse>) => {
      {
        try {
          const user = CreateUserRequest.toJSON(call.request) as LocalUser;
          users.push(user);
          const response: CreateUserResponse = { id: user.id };
          callback(null, response);
        } catch (error) {
          callback({ code: status.INTERNAL }, null);
        }
      }
    },
  };
}

server.addService(UserServiceService, userServiceServer());

server.bindAsync(address, ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
