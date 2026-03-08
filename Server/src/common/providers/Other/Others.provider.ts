import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/clients/Entities/users.entity';
import { Role } from 'src/utils/enums';

@Injectable()
export class OthersProvider {
  async comparePassword(p1: string, p2: string): Promise<boolean> {
    return bcrypt.compare(p1, p2);
  }

  async UpdateRole(id: string, updaterId: string, user: User, updater: User) {
    if (user.Role === Role.USER || user.Role === Role.SELLER) {
      if (id === updaterId) return true;

      if (updater.Role === Role.ADMIN || updater.Role === Role.SUPER_ADMIN) {
        return true;
      } else {
        throw new UnauthorizedException('Unauthorized');
      }
    } else if (user.Role === Role.ADMIN) {
      if (id === updaterId) return true;

      if (updater.Role === Role.SUPER_ADMIN) {
        return true;
      } else {
        throw new UnauthorizedException('Unauthorized');
      }
    } else if (user.Role === Role.SUPER_ADMIN) {
      if (id === updaterId) return true;
      else throw new UnauthorizedException('Unauthorized');
    } else {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
