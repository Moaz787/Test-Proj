import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../DTOs/login.dto';
import { RegisterDto } from '../DTOs/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entities/users.entity';
import { Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';
import { randomBytes } from 'crypto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly commonService: CommonService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {}

  async findUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async registerUser(registerDto: RegisterDto, file: Express.Multer.File) {
    const { username, email, password } = registerDto;

    const user = await this.findUserByEmail(email);

    if (user) throw new UnauthorizedException('User already exists');

    const hashedPassword = await this.commonService.hashPassword(password);

    let filePath;
    if (file) {
      filePath = await this.commonService.processImage('profileImages', file, username);
    }

    let newUser = this.usersRepository.create({
      ...registerDto,
      username,
      email,
      password: hashedPassword,
      ProfileImage: filePath,
      EmailVerificationToken: randomBytes(32).toString('hex'),
      EmailVerificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
    });

    newUser = await this.usersRepository.save(newUser);

    if (!newUser.EmailVerificationToken) throw new NotFoundException('Email verification token not found');

    try {
      const verificationLink = await this.commonService.generateVerificationLink(
        newUser.id,
        newUser.EmailVerificationToken,
      );

      await this.mailService.sendVerificationEmail(
        newUser.email,
        verificationLink.MainVerificationLink,
        newUser.EmailVerificationToken,
      );
    } catch (error) {
      throw new InternalServerErrorException('Error while sending verification email');
    }

    return { message: 'Verification email sent successfully' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    let user = await this.findUserByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    if (
      user.IsEmailVerified &&
      (user.EmailVerificationToken !== '' || user.EmailVerificationToken !== null) &&
      user.EmailVerificationTokenExpiry < new Date()
    ) {
      if (!user.IsEmailVerified) {
        const verificationLink = await this.commonService.generateVerificationLink(
          user.id,
          user.EmailVerificationToken,
        );

        await this.mailService.sendVerificationEmail(
          user.email,
          verificationLink.MainVerificationLink,
          user.EmailVerificationToken,
        );
        return { message: 'Verification email sent successfully' };
      } else {
        const isPasswordMatched = await this.commonService.comparePassword(password, user.password);
        if (!isPasswordMatched) throw new UnauthorizedException('Invalid credentials');

        if (!user.IsLoggedIn) user.IsLoggedIn = true;

        const accessToken = await this.commonService.generateToken({
          id: user.id,
          IsLoggedIn: user.IsLoggedIn,
          Role: user.Role,
        });

        user = await this.usersRepository.save(user);
        return accessToken;
      }
    }
  }

  async logout(id: string) {
    let user: User;
    try {
      user = await this.usersRepository.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException('Error while fetching user');
    }

    if (!user) throw new NotFoundException('This user is not found');

    user.IsLoggedIn = false;

    try {
      await this.usersRepository.save(user);
      return { message: 'User logged out successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Error while logging out user');
    }
  }
}
