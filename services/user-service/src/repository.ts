export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  password: string;
};

export type UserRepository = {
  createUser: (user: User) => Promise<void>;
  getUser: (id: string) => Promise<User | null>;
  listUsers: () => Promise<User[]>;
};
