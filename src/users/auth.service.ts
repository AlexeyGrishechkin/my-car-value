import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    // See if email is use
    const usersAlreadyExist = await this.usersService.find(email);

    if (usersAlreadyExist.length) {
      throw new ConflictException(
        'User with the provided email already exists.',
      );
    }

    // Hash the users password
    // Generate the salt
    const salt = randomBytes(8).toString('hex');

    // Hash and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Joined the hash result and salt together
    const hashPassword = `${salt}.${hash.toString('hex')}`;

    // Create a new user and save it
    const user = this.usersService.create(email, hashPassword);

    return user;
  }

  async signIn(email: string, password: string) {
    const [user] = this.usersService.find(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash !== storedHash.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    return user;
  }
}
