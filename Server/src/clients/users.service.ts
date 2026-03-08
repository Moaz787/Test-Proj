import { Injectable } from '@nestjs/common';
import { RegisterDto } from './DTOs/register.dto';
import { LoginDto } from './DTOs/login.dto';
import { AuthProvider } from './providers/Auth.provider';
import { VerifierProvider } from './providers/verifier.provider';
import { GettersProvider } from './providers/Getters.provider';
import { UpdateUserDto } from './DTOs/updateUser.dto';
import { UpdatersProvider } from './providers/Updaters.provider';
import { UpdateEmailDto } from './DTOs/UpdateEmail.dto';
import { UpdatePasswordDto } from './DTOs/UpdatePassword.dto';
import { UpdateSellerDto } from './DTOs/UpdateSeller.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly verifierProvider: VerifierProvider,
    private readonly gettersProvider: GettersProvider,
    private readonly updatersProvider: UpdatersProvider,
  ) {}

  async registerUser(registerDto: RegisterDto, file: Express.Multer.File) {
    return this.authProvider.registerUser(registerDto, file);
  }

  async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }

  async verifyEmail(id: string, token: string) {
    return this.verifierProvider.verifyEmail(id, token);
  }

  async findUserByEmail(email: string) {
    return this.authProvider.findUserByEmail(email);
  }

  async getProfile(id: string) {
    return this.gettersProvider.getProfile(id);
  }

  async getAll() {
    return this.gettersProvider.getAll();
  }

  async getAllAdmins() {
    return this.gettersProvider.getAllAdmins();
  }

  async getAllUsers() {
    return this.gettersProvider.getAllUsers();
  }

  async getAllSellers() {
    return this.gettersProvider.getAllSellers();
  }

  async updateProfile(
    id: string,
    updaterId: string,
    data: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    return this.updatersProvider.updateProfile(id, updaterId, data, file);
  }

  async updateEmail(id: string, updaterId: string, data: UpdateEmailDto) {
    return this.updatersProvider.updateEmail(id, updaterId, data);
  }

  async promoteUser(id: string, updaterId: string, role: string, data: UpdateSellerDto, file: Express.Multer.File) {
    return this.updatersProvider.promoteUser(id, updaterId, role, data, file);
  }

  async ResetPassword(id: string, data: UpdatePasswordDto) {
    return this.updatersProvider.resetPassword(id, data);
  }

  async ForgetPassword(id: string) {
    return this.updatersProvider.forgetPassword(id);
  }

  async ChangePassword(email: string, code: number, NewPassword: string) {
    return this.updatersProvider.changePassword(email, code, NewPassword);
  }

  async logout(id: string) {
    return this.authProvider.logout(id);
  }
}
