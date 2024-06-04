import { IEventAggregator, resolve } from '@aurelia/kernel';
import { customElement } from 'aurelia';
import template from './app.html?raw';

@customElement({ name: 'app', template })
export class App {
  public message = 'Hello World!';
  public message2 = 'Hello 2!';
  private readonly id = 1;

  private readonly ea: IEventAggregator = resolve(IEventAggregator);
  public constructor(){
    (window as any).app = this;
  }
}
