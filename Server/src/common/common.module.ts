import { forwardRef, Global, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../clients/users.module';
import { MailModule } from '../mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../clients/Entities/users.entity';
import { ProcessImageProvider } from './providers/Images/ProcessImage.provider';
import { DeleteImageProvider } from './providers/Images/DeleteImage.provider';
import { GeneratorsProvider } from './providers/Generators/Generators.provider';
import { ErrorsHandlerProvider } from './providers/Errors/ErrorsHandler.provider';
import { CheckersProvider } from './providers/Checkers/Checkers.provider';
import { OthersProvider } from './providers/Other/Others.provider';
import { SendersProvider } from './providers/Senders/Senders.provider';

@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => MailModule),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    MailService,
    CommonService,
    ProcessImageProvider,
    DeleteImageProvider,
    GeneratorsProvider,
    ErrorsHandlerProvider,
    CheckersProvider,
    OthersProvider,
    SendersProvider,
  ],
  exports: [CommonService, JwtModule],
})
export class CommonModule {}
