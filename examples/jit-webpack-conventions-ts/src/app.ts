import { IEventAggregator } from '@aurelia/kernel';

export class App {
  public message = 'Hello World!';

  public constructor(
    @IEventAggregator private ea: IEventAggregator,
  ) {}
}
