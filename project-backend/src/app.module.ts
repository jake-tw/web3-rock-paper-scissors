import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { CryptoModule } from './crypto/crypto.module';
import { SmtpModule } from './smtp/smtp.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigKey } from './common/enums';
import { ConfigModule } from '@nestjs/config';
import { Customer } from './common/entities/customer.entity';
import { GameInfo } from './common/entities/game-info.entity';
import { ValidationInfo } from './common/entities/validation-info.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ConfigKey.DATABASE_HOST],
      port: Number(process.env[ConfigKey.DATABASE_PORT]),
      username: process.env[ConfigKey.DATABASE_USER],
      password: process.env[ConfigKey.DATABASE_PASS],
      database: process.env[ConfigKey.DATABASE_NAME],
      entities: [Customer, GameInfo, ValidationInfo],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_AUTH_USER,
          pass: process.env.SMTP_AUTH_PASS,
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
    CustomerModule,
    CryptoModule,
    SmtpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
