import { SetMetadata } from '@nestjs/common';
import { Role } from '../utils/enums';

export const UserRole = (...roles: Role[]) => SetMetadata('roles', roles);
