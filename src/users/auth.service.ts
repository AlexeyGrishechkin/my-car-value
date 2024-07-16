import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';

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

    // Create a new user and save it

    // return the user
  }

  signIn(email: string, password: string) {}
}
