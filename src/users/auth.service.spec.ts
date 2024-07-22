import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

test('can create auth service instance', async () => {
  // create fake copy of usersService
  const fakeUsersService = {
    find: (email: string) => {
      return Promise.resolve([{ id: 1, email, password: 'asdf' } as any]);
    },
    create: (email: string, password: string) => {
      return Promise.resolve({ id: 1, email, password } as any);
    },
  };
  const module = Test.createTestingModule({
    providers: [
      AuthService,
      { provide: UsersService, useValue: fakeUsersService },
    ],
  }).compile();

  const service = (await module).get(AuthService);

  expect(service).toBeDefined();
});
