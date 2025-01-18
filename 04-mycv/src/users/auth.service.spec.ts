import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filterdUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filterdUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
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
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@test.ir', 'test');
    expect(user.password).not.toEqual('test');

    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
    try {
      await service.signup('test@test.ir', 'test');
    } catch (err) {
      expect(err.toString()).toMatch('email in use');
    }
  });

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin('test@test.ir', 'test');
    } catch (error) {
      expect(error.toString()).toMatch('user not found');
    }
  });

  it('throws if an invalid password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test@test.com', password: 'test' } as User,
      ]);

    try {
      await service.signin('test@test.com', 'password');
    } catch (err) {
      expect(err.toString()).toMatch('bad password');
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');

    const user = await service.signin('test@test.com', 'mypassword');

    expect(user).toBeDefined();
  });
});
