import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoScheduler } from './crypto.scheduler';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [CryptoService, CryptoScheduler],
  exports: [CryptoService],
})
export class CryptoModule {}
