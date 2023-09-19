import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoScheduler } from './crypto.scheduler';

@Module({
  providers: [CryptoService, CryptoScheduler],
  exports: [CryptoService],
})
export class CryptoModule {}
