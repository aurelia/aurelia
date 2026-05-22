import { IEventAggregator, resolve } from '@aurelia/kernel';

export class App {
  public message = 'Hello World!';
  public message2 = 'Hello 2!';

  private readonly ea: IEventAggregator = resolve(IEventAggregator);
}
