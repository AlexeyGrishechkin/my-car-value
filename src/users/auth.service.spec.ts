import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // create fake copy of usersService
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * users.length),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  test('can create auth service instance', async () => {
    expect(service).toBeDefined();
  });

  test('creates a new user with a salted and hashed password', async () => {
    const user = await service.signUp('5bYpB@example.com', 'asdf');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  test('throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = () => {
      return Promise.resolve([
        {
          id: 1,
          email: '5bYpB@example.com',
          password: 'asdf',
        } as User,
      ]);
    };

    await expect(service.signUp('5bYpB@example.com', 'asdf')).rejects.toThrow(
      ConflictException,
    );
  });

  test('throws if an invalid password is provided', async () => {
    await service.signUp('5bYpB@example.com', 'asdf');

    await expect(
      service.signIn('5bYpB@example.com', 'invalid_password'),
    ).rejects.toThrow(BadRequestException);
  });

  test('throws if signin is called with an unused email', async () => {
    await service.signUp('5bYpB@example.com', 'asdf');

    await expect(service.signIn('unused@example.com', 'asdf')).rejects.toThrow(
      NotFoundException,
    );
  });

  test('returns a user if correct password is provided', async () => {
    await service.signUp('5bYpB@example.com', 'asdf');
    const user = await service.signIn('5bYpB@example.com', 'asdf');
    expect(user).toBeDefined();
  });
});
