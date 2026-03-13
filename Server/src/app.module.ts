import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './clients/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { HttpModule } from '@nestjs/axios';
import { ProductModule } from './Shop/shop.module';
import { OrdersModule } from './Orders/Orders.Module';

@Module({
  controllers: [AppController],
  imports: [
    UsersModule,
    ProductModule,
    CommonModule,
    MailModule,
    HttpModule,
    OrdersModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: '624562',
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
  ],
  providers: [
    AppService,
    {
      provide: INTERCEPTORS_METADATA,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
