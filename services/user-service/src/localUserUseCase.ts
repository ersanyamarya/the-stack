import { User, UserRepository } from './repository';

const users: User[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe.example.com',
    photoUrl: 'https://example.com/john-doe.jpg',
    password: 'password',
    id: '1',
  },
  //   {
  //     firstName: 'Jane',
  //     lastName: 'Doe',
  //     email: 'jane.doe.example.com',
  //     photoUrl: 'https://example.com/jane-doe.jpg',
  //     password: 'password',
  //     id: '2',
  //   },
  //   {
  //     firstName: 'Alice',
  //     lastName: 'Smith',
  //     email: 'alice.smith.example.com',
  //     photoUrl: 'https://example.com/alice-smith.jpg',
  //     password: 'password',
  //     id: '3',
  //   },
];

export function localUserUseCase(): UserRepository {
  return {
    createUser: async (user: User) => {
      const newUser = { ...user, id: String(users.length + 1) };
      users.push(newUser);
    },
    getUser: async (id: string) => {
      return users.find(u => u.id === id) || null;
    },
    listUsers: async () => {
      return users;
    },
  };
}
