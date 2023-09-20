import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CryptoModule } from 'src/crypto/crypto.module';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../common/entities/customer.entity';
import { SmtpModule } from 'src/smtp/smtp.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), CryptoModule, SmtpModule],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
