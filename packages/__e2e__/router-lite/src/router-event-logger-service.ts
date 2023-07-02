import { IRouterEvents, PathUrlParser } from '@aurelia/router-lite';
import { DI, IDisposable } from 'aurelia';

export const IRouterEventLoggerService = /*@__PURE__*/DI.createInterface<IRouterEventLoggerService>('ISomeService', x => x.singleton(RouterEventLoggerService));
export interface IRouterEventLoggerService extends RouterEventLoggerService { }
export class RouterEventLoggerService implements IDisposable {
  private readonly subscriptions: IDisposable[];
  public log: string[] = [];
  public constructor(@IRouterEvents events: IRouterEvents) {
    const parser = PathUrlParser.instance;
    this.subscriptions = [
      events.subscribe('au:router:location-change', (event) => {
        this.log.push(`${event.name} - '${event.url}'`);
      }),
      events.subscribe('au:router:navigation-start', (event) => {
        this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, parser)}'`);
      }),
      events.subscribe('au:router:navigation-end', (event) => {
        this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, parser)}'`);
      }),
      events.subscribe('au:router:navigation-cancel', (event) => {
        this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, parser)}' - ${String(event.reason)}`);
      }),
      events.subscribe('au:router:navigation-error', (event) => {
        this.log.push(`${event.name} - ${event.id} - '${event.instructions.toUrl(false, parser)}' - ${String(event.error)}`);
      }),
    ];
  }
  public clear() {
    this.log = [];
  }
  public dispose(): void {
    const subscriptions = this.subscriptions;
    this.subscriptions.length = 0;
    const len = subscriptions.length;
    for (let i = 0; i < len; i++) {
      subscriptions[i].dispose();
    }
  }
}
