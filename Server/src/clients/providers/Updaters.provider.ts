import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../DTOs/updateUser.dto';
import { UpdateEmailDto } from '../DTOs/UpdateEmail.dto';
import { PromoteProvider } from './Updates/Promote.providers';
import { UpdateUserProvider } from './Updates/UpdateUser.provider';
import { EmailUpdaterProvider } from './Updates/Data/EmailUpdater.provider';
import { PasswordUpdaterProvider } from './Updates/Data/PasswordUpdater.provider';
import { UpdatePasswordDto } from '../DTOs/UpdatePassword.dto';
import { UpdateSellerDto } from '../DTOs/UpdateSeller.dto';

@Injectable()
export class UpdatersProvider {
  constructor(
    private readonly promoteProvider: PromoteProvider,
    private readonly EmailUpdaterProvider: EmailUpdaterProvider,
    private readonly PasswordUpdaterProvider: PasswordUpdaterProvider,
    private readonly updateUserProvider: UpdateUserProvider,
  ) {}

  async updateProfile(
    id: string,
    updaterId: string,
    data: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    return this.updateUserProvider.updateProfile(id, updaterId, data, file);
  }

  async updateEmail(id: string, updaterId: string, data: UpdateEmailDto) {
    return this.EmailUpdaterProvider.updateEmail(id, updaterId, data);
  }

  async promoteUser(id: string, updaterId: string, role: string, data: UpdateSellerDto, file: Express.Multer.File) {
    return this.promoteProvider.promoteUser(id, updaterId, role, data, file);
  }

  async resetPassword(id: string, data: UpdatePasswordDto) {
    return this.PasswordUpdaterProvider.ResetPassword(id, data);
  }

  async forgetPassword(id: string) {
    return this.PasswordUpdaterProvider.ForgetPassword(id);
  }

  async changePassword(email: string, code: number, NewPassword: string) {
    return this.PasswordUpdaterProvider.changePassword(email, code, NewPassword);
  }
}
