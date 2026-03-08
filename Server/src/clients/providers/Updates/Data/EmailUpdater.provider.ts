import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../../Entities/users.entity';
import { CommonService } from '../../../../common/common.service';
import { randomBytes } from 'crypto';
import { MailService } from '../../../../mail/mail.service';
import { UpdateEmailDto } from '../../../DTOs/UpdateEmail.dto';

@Injectable()
export class EmailUpdaterProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly commonService: CommonService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {}

  async updateEmail(id: string, updaterId: string, data: UpdateEmailDto) {
    let user = await this.usersRepository.findOne({ where: { id } });
    const updater = await this.usersRepository.findOne({
      where: { id: updaterId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.commonService.CheckIfUserLoggedInAndVerified(user, updater);

    if (user.email !== data.email) {
      user.email = data.email;

      user.IsEmailVerified = false;
      user.EmailVerificationToken = randomBytes(32).toString('hex');
      user.EmailVerificationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      user = await this.usersRepository.save(user);

      const verificationLink =
        await this.commonService.generateVerificationLink(
          user.id,
          user.EmailVerificationToken,
        );
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationLink.MainVerificationLink,
        user.EmailVerificationToken,
      );

      return {
        message:
          'Email updated successfully, please verify your email to continue',
      };
    } else {
      return { message: 'Email is the same as before' };
    }
  }
}
