import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { EmailRequest } from 'src/common/classes/email.request';
import { CryptoService } from 'src/crypto/crypto.service';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly cryptoService: CryptoService,
  ) {}

  @Put(':walletAddress/mail')
  public async putEmail(
    @Param('walletAddress') walletAddress: string,
    @Body() req: EmailRequest,
  ): Promise<void> {
    if (walletAddress != req.walletAddress) {
      throw new BadRequestException('Invalid wallet address.');
    }

    const isSigner = await this.cryptoService.verifySignature(req);
    if (!isSigner) {
      throw new BadRequestException('Not the signer.');
    }

    await this.customerService.putEmail(req.walletAddress, req.email);
  }

  @Get('verify/:code')
  public async verifyEmail(@Param('code') code: string): Promise<void> {
    await this.customerService.verifyCode(code);
  }
}
