import { ContractEventType } from '../enums';
import { IObserver } from '../interfaces/observer.interface';

export class ContractEventObserverItem {
  type: ContractEventType;
  observer: IObserver;
}
