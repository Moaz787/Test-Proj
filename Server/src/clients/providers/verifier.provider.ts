import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VerifierProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async verifyEmail(id: string, token: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.EmailVerificationToken !== token) {
      throw new UnauthorizedException('Invalid token');
    }

    if (
      !user.EmailVerificationTokenExpiry ||
      user.EmailVerificationTokenExpiry < new Date()
    ) {
      throw new UnauthorizedException('Token expired');
    }

    user.EmailVerificationToken = null;
    user.EmailVerificationTokenExpiry = null;
    user.IsEmailVerified = true;

    await this.usersRepository.save(user);

    return { message: 'Email verified successfully' };
  }
}
