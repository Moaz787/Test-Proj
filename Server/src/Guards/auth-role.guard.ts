import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../utils/enums';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request['user'];

      if (!user) throw new UnauthorizedException('User not found');

      return requiredRoles.includes(user.Role);
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }
}
