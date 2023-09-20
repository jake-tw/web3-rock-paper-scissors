import { BadRequestException, Controller, Get, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { SaltRequest } from '../common/classes/salt.request';
import { CryptoService } from 'src/crypto/crypto.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private cryptoService: CryptoService,
  ) {}

  @Post('salt')
  public async addSalt(req: SaltRequest): Promise<void> {
    const isSigner = await this.cryptoService.verifySignature(req);
    if (!isSigner) {
      throw new BadRequestException('Not the signer.');
    }

    await this.gameService.addSalt(req.gameId, req.walletAddress, req.salt);
  }
}
