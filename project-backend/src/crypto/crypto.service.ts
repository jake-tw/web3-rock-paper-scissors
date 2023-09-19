import { Injectable, Logger } from '@nestjs/common';
import { ValidationInfo } from '../common/classes/validation-info';
import { Contract, JsonRpcProvider, Wallet, ethers } from 'ethers';
import { ConfigKey, ContractEventType } from '../common/enums';
import { ContractEventObserverItem } from '../common/classes/contract-event-observer-item';
import { IObserver } from '../common/interfaces/observer.interface';
import { v4 as uuid } from 'uuid';
import { abi as rockPaperScissorsAbi } from './contracts/abi/RockPaperScissors.json';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);

  private readonly observers = new Map<string, ContractEventObserverItem>();

  private contract: Contract;

  constructor(private readonly configService: ConfigService) {
    const provider = new JsonRpcProvider(
      this.configService.get(ConfigKey.NODE_URL),
    );
    const abi = JSON.stringify(rockPaperScissorsAbi);
    const wallet = new Wallet(
      this.configService.get(ConfigKey.JUDGE_PRIVATE_KEY),
      provider,
    );
    this.contract = new Contract(
      this.configService.get(ConfigKey.CONTRACT_ADDRESS),
      abi,
      wallet,
    );
  }

  public getContract() {
    return this.contract;
  }

  public addEventObserver(
    type: ContractEventType,
    observer: IObserver,
  ): string {
    const id = uuid();
    this.logger.log(`[${id}] Add observer.`);
    this.observers.set(id, {
      type,
      observer,
    });
    return id;
  }

  public removeObserver(id: string): boolean {
    this.logger.log(`[${id}] Remove observer.`);
    return this.observers.delete(id);
  }

  public async notifyObservers(
    type: ContractEventType,
    values: object,
  ): Promise<void> {
    this.observers.forEach(async (value, key) => {
      try {
        if (value.type === type) {
          this.logger.log(`[${key}] Update observer by type: ${type}`);
          await value.observer.update(values);
        }
      } catch (error) {
        this.logger.log(`[${key}] Update observer error.`, error);
      }
    });
  }

  public async verifySignature(
    validationInfo: ValidationInfo,
  ): Promise<boolean> {
    const message = this.buildMessage(
      validationInfo.walletAddress,
      validationInfo.timestamp,
    );

    return (
      ethers.verifyMessage(message, validationInfo.signature) ===
      validationInfo.walletAddress
    );
  }

  public async showdown(
    id: number,
    bankerSalt: string,
    playerSalt: string,
  ): Promise<void> {
    // TODO check list
    // onchain data
    // call static before execute tx
    // tx fee
    const result = await this.contract.showdown(id, bankerSalt, playerSalt);
  }

  private buildMessage(walletAddress: string, timestamp: number): string {
    return `${walletAddress}${timestamp}`;
  }
}
