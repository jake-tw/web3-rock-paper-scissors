export interface IObserver {
  update(values: object): Promise<void>;
}
