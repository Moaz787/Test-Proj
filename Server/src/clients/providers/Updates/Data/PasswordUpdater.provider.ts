import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../Entities/users.entity';
import { CommonService } from '../../../../common/common.service';
import { MailService } from '../../../../mail/mail.service';
import { Repository } from 'typeorm';
import { UpdatePasswordDto } from '../../../DTOs/UpdatePassword.dto';

@Injectable()
export class PasswordUpdaterProvider {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    private readonly commonService: CommonService,
  ) {}

  async ResetPassword(id: string, data: UpdatePasswordDto) {
    let user: User;
    try {
      user = await this.usersRepository.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching user');
    }

    if (!user) throw new NotFoundException('This user is not found');

    await this.commonService.CheckIfUserLoggedInAndVerified(user, null);

    const isValid = await this.commonService.comparePassword(
      data.OldPassword,
      user.password,
    );
    if (!isValid) throw new UnauthorizedException('Invalid old password');

    if (data.NewPassword === user.password)
      throw new BadRequestException(
        'This your old password, please Enter deferent password',
      );

    user.password = await this.commonService.hashPassword(data.NewPassword);

    try {
      await this.usersRepository.save(user);
      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Error while resetting password');
    }
  }

  async ForgetPassword(id: string) {
    let user: User;
    try {
      user = await this.usersRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching user');
    }

    if (!user) throw new NotFoundException('This user is not found');

    const code = await this.commonService.GenerateChangePasswordCode();

    try {
      await this.mailService.sendCode(user.email, code);
    } catch (error) {
      throw new InternalServerErrorException('Error while sending code');
    }

    try {
      await this.usersRepository.update(id, {
        PasswordResetCode: code,
        PasswordResetCodeExpiry: new Date(Date.now() + 60 * 60 * 1000),
      });
      return { message: 'Code sent successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Error while saving user');
    }
  }

  async changePassword(email: string, code: number, NewPassword: string) {
    let user: User;
    try {
      user = await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching user');
    }

    if (!user) throw new NotFoundException('This user is not found');

    if (
      code !== user.PasswordResetCode ||
      user.PasswordResetCodeExpiry < new Date()
    )
      throw new BadRequestException('Invalid code');

    user.password = await this.commonService.hashPassword(NewPassword);
    user.PasswordResetCode = null;
    user.PasswordResetCodeExpiry = null;

    try {
      await this.usersRepository.save(user);
      return { message: 'Password changed successfully' };
    } catch (error) {
      return error;
    }
  }
}
