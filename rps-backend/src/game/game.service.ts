import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GameInfo } from '../common/entities/game-info.entity';
import { CryptoService } from '../crypto/crypto.service';
import { ContractEventType } from 'src/common/enums';
import { GameSetup } from '../common/classes/game-setup';
import { GameMatched } from 'src/common/classes/game-matched';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(GameInfo)
    private readonly gameInfoRepository: Repository<GameInfo>,
    private readonly cryptoService: CryptoService,
  ) {
    const gameSetupId = this.cryptoService.addEventObserver(
      ContractEventType.GAME_SETUP,
      {
        update: async (values: GameSetup) => {
          await this.updateBankerInfo(values.id, values.banker);
        },
      },
    );
    this.logger.log(`Game setup event observer id: ${gameSetupId}`);

    const gameMatchedId = this.cryptoService.addEventObserver(
      ContractEventType.GAME_MATCHED,
      {
        update: async (values: GameMatched) => {
          await this.updatePlayerInfo(values.id, values.player);
        },
      },
    );
    this.logger.log(`Game matched event observer id: ${gameMatchedId}`);
  }

  public async updateBankerInfo(id: number, banker: string): Promise<void> {
    await this.gameInfoRepository.save({
      id,
      banker,
    });
  }

  public async updatePlayerInfo(id: number, player: string): Promise<void> {
    await this.gameInfoRepository
      .createQueryBuilder()
      .update()
      .set({ player })
      .where({ id })
      .execute();
  }

  public async addSalt(
    id: number,
    walletAddress: string,
    salt: string,
  ): Promise<void> {
    const gameInfo = await this.gameInfoRepository.findOneBy({ id });

    switch (walletAddress) {
      case gameInfo.banker:
        await this.gameInfoRepository
          .createQueryBuilder()
          .update()
          .set({ bankerSlat: salt })
          .where({ id })
          .execute();
        await this.cryptoService.showdown(id, salt, gameInfo.playerSlat);
        break;
      case gameInfo.player:
        await this.gameInfoRepository
          .createQueryBuilder()
          .update()
          .set({ playerSlat: salt })
          .where({ id })
          .execute();
        await this.cryptoService.showdown(id, gameInfo.bankerSlat, salt);
        break;
      default:
        throw new BadRequestException('Not on the table.');
    }
  }
}
