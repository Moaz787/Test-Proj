import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Render,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './DTOs/register.dto';
import { LoginDto } from './DTOs/login.dto';
import { AuthGuard } from '../Guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from './Entities/users.entity';
import { AuthRoleGuard } from '../Guards/auth-role.guard';
import { UserRole } from '../decorators/auth-role.decorator';
import { Role } from '../utils/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './DTOs/updateUser.dto';
import { UpdateEmailDto } from './DTOs/UpdateEmail.dto';
import { UpdatePasswordDto } from './DTOs/UpdatePassword.dto';
import { memoryStorage } from 'multer';
import { UpdateSellerDto } from './DTOs/UpdateSeller.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: memoryStorage(),
    }),
  )
  async registerUser(@Body() registerDto: RegisterDto, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.registerUser(registerDto, file);
  }

  @Post('auth/login')
  async loginUser(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post('forgetPassword')
  @UseGuards(AuthGuard)
  async forgetPassword(@CurrentUser() user: User) {
    return this.usersService.ForgetPassword(user.id);
  }

  @Get('verify/:id/:token')
  @Render('index')
  async verifyEmail(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode: 400,
        exceptionFactory: () => new BadRequestException('Invalid ID'),
      }),
    )
    id: string,
    @Param('token') token: string,
  ) {
    const result = await this.usersService.verifyEmail(id, token);
    return { message: result.message };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Get('all')
  @UserRole(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, AuthRoleGuard)
  async getAll() {
    return this.usersService.getAll();
  }

  @Get('all/admins')
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.SUPER_ADMIN)
  async getAllAdmins(@CurrentUser() user: User) {
    if (user.Role === Role.SUPER_ADMIN) {
      return this.usersService.getAllAdmins();
    }
    throw new UnauthorizedException('User is not authorized to get all admins');
  }

  @Get('all/users')
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.ADMIN, Role.SUPER_ADMIN)
  async getAllUsers(@CurrentUser() user: User) {
    if (user.Role === Role.SUPER_ADMIN || user.Role === Role.ADMIN) {
      return this.usersService.getAllUsers();
    }
    throw new UnauthorizedException('User is not authorized to get all users');
  }

  @Get('all/sellers')
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.ADMIN, Role.SUPER_ADMIN)
  async getAllSellers(@CurrentUser() user: User) {
    if (user.Role === Role.SUPER_ADMIN || user.Role === Role.ADMIN) {
      return this.usersService.getAllSellers();
    }
    throw new UnauthorizedException('User is not authorized to get all sellers');
  }

  @Patch('update/profile/:id')
  @UseInterceptors(FileInterceptor('ProfileImage'))
  @UseGuards(AuthGuard)
  async updateProfile(
    @Param('id') id: string,
    @CurrentUser() updater: User,
    @Body() data: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(id, updater.id, data, file);
  }

  @Patch('update/email/:id')
  @UseGuards(AuthGuard)
  async updateEmail(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode: 400,
        exceptionFactory: () => new BadRequestException('Invalid ID'),
      }),
    )
    id: string,
    @CurrentUser() updater: User,
    @Body() data: UpdateEmailDto,
  ) {
    return this.usersService.updateEmail(id, updater.id, data);
  }

  @Patch('promote/:role/:id')
  @UseGuards(AuthGuard, AuthRoleGuard)
  @UserRole(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('brandLogo'))
  async promoteUser(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        errorHttpStatusCode: 400,
        exceptionFactory: () => new BadRequestException('Invalid ID'),
      }),
    )
    id: string,
    @Param('role') role: string,
    @CurrentUser() updater: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UpdateSellerDto,
  ) {
    return this.usersService.promoteUser(id, updater.id, role.toUpperCase(), data, file);
  }

  @Patch('resetPassword')
  @UseGuards(AuthGuard)
  async ResetPassword(@CurrentUser() user: User, @Body() data: UpdatePasswordDto) {
    return this.usersService.ResetPassword(user.id, data);
  }

  @Patch('changePassword')
  async changePassword(@Body() data: { email: string; code: number; NewPassword: string }) {
    return this.usersService.ChangePassword(data.email, data.code, data.NewPassword);
  }

  @Patch('logout')
  @UseGuards(AuthGuard)
  async logout(@CurrentUser() user: User) {
    return this.usersService.logout(user.id);
  }
}
