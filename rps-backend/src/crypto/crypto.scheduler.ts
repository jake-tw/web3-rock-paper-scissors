import { Injectable, Logger } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ContractEventType } from '../common/enums';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CryptoScheduler {
  private readonly logger = new Logger(CryptoScheduler.name);

  private eventHeartBeat = new Map<ContractEventType, boolean>();

  constructor(private readonly cryptoService: CryptoService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  scheduleTasks() {
    for (const [k, v] of this.eventHeartBeat) {
      if (!v) {
        switch (k) {
          case ContractEventType.GAME_SETUP:
            this.onGameSetupEvent();
            break;
          case ContractEventType.GAME_MATCHED:
            this.onGameMatchedEvent();
            break;
        }
      }
    }
  }

  private async onGameSetupEvent(): Promise<void> {
    const contract = this.cryptoService.getContract();
    contract
      .on(
        ContractEventType.GAME_SETUP,
        async (banker, bankerThrowHash, stakes, id) => {
          await this.cryptoService.notifyObservers(
            ContractEventType.GAME_SETUP,
            { banker, bankerThrowHash, stakes, id },
          );
        },
      )
      .then(() => {
        this.eventHeartBeat.set(ContractEventType.GAME_SETUP, true);
      })
      .catch((error) => {
        this.eventHeartBeat.set(ContractEventType.GAME_SETUP, false);
      });
  }

  private async onGameMatchedEvent(): Promise<void> {
    const contract = this.cryptoService.getContract();
    contract
      .on(
        ContractEventType.GAME_MATCHED,
        async (player, playerThrowHash, id) => {
          await this.cryptoService.notifyObservers(
            ContractEventType.GAME_MATCHED,
            { player, playerThrowHash, id },
          );
        },
      )
      .then(() => {
        this.eventHeartBeat.set(ContractEventType.GAME_MATCHED, true);
      })
      .catch((error) => {
        this.eventHeartBeat.set(ContractEventType.GAME_MATCHED, false);
      });
  }
}
