import { IEventAggregator } from '@aurelia/kernel';

export class App {
  public message = 'Hello World!';
  public message2 = 'Hello 2!';

  public constructor(
    @IEventAggregator private readonly ea: IEventAggregator,
  ) {
    debugger
  }
}
