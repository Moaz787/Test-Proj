import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { HttpModule } from '@nestjs/axios';
import { forwardRef } from '@nestjs/common';
import { UsersModule } from '../clients/users.module';
import { CommonModule } from 'src/common/common.module';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService, HttpModule],
  imports: [HttpModule, forwardRef(() => UsersModule), forwardRef(() => CommonModule)],
})
export class MailModule {}
