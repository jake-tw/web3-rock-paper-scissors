import { Module } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { ValidationInfo } from '../common/entities/validation-info.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ValidationInfo])],
  providers: [SmtpService],
  exports: [SmtpService],
})
export class SmtpModule {}
