import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/clients/Entities/users.entity';

@Injectable()
export class CheckersProvider {
  async CheckIfUserLoggedInAndVerified(user: User, updater: User | null) {
    if (user != null && updater != null) {
      if (
        (user.IsLoggedIn === false ||
          user.IsLoggedIn === null ||
          user.IsLoggedIn === undefined) &&
        (updater.IsLoggedIn === false ||
          updater.IsLoggedIn === null ||
          updater.IsLoggedIn === undefined) &&
        (user.IsEmailVerified === false ||
          user.IsEmailVerified === null ||
          user.IsEmailVerified === undefined) &&
        (updater.IsEmailVerified === false ||
          updater.IsEmailVerified === null ||
          updater.IsEmailVerified === undefined)
      ) {
        throw new UnauthorizedException('User is not logged in or verified');
      }
    } else if (updater == null) {
      if (
        (user.IsLoggedIn === false ||
          user.IsLoggedIn === null ||
          user.IsLoggedIn === undefined) &&
        (user.IsEmailVerified === false ||
          user.IsEmailVerified === null ||
          user.IsEmailVerified === undefined)
      ) {
        throw new UnauthorizedException('User is not logged in or verified');
      }
    }
  }
}
