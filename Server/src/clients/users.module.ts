import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entities/users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthProvider } from './providers/Auth.provider';
import { MailModule } from '../mail/mail.module';
import { VerifierProvider } from './providers/verifier.provider';
import { GettersProvider } from './providers/Getters.provider';
import { UpdatersProvider } from './providers/Updaters.provider';
import { PromoteProvider } from './providers/Updates/Promote.providers';
import { UpdateUserProvider } from './providers/Updates/UpdateUser.provider';
import { EmailUpdaterProvider } from './providers/Updates/Data/EmailUpdater.provider';
import { PasswordUpdaterProvider } from './providers/Updates/Data/PasswordUpdater.provider';

@Module({
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([User]), MailModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthProvider,
    VerifierProvider,
    GettersProvider,
    UpdatersProvider,
    PromoteProvider,
    UpdateUserProvider,
    EmailUpdaterProvider,
    PasswordUpdaterProvider,
  ],
})
export class UsersModule {}
