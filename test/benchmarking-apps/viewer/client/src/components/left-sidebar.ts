import { customElement, IDisposable, IRouter, IRouterEvents, ISignaler, shadowCSS } from 'aurelia';
import template from './left-sidebar.html';
import css from './left-sidebar.css';

@customElement({
  name: 'left-sidebar',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(css)],
})
export class LeftSidebar {
  private subscription: IDisposable;

  public constructor(
    @IRouter private readonly router: IRouter,
    @IRouterEvents events: IRouterEvents,
    @ISignaler signaler: ISignaler,
  ) {
    this.subscription = events.subscribe('au:router:navigation-end', (_) => {
      signaler.dispatchSignal('navigated');
    });
  }

  public dispose(): void {
    this.subscription.dispose();
    this.subscription = null!;
  }
}
