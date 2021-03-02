import { customElement, IDisposable, IEventAggregator, ISignaler, RouterNavigationEndEvent, shadowCSS } from 'aurelia';
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
    @IEventAggregator ea: IEventAggregator,
    @ISignaler signaler: ISignaler,
  ) {
    this.subscription = ea.subscribe(RouterNavigationEndEvent.eventName, (_) => {
      signaler.dispatchSignal('navigated');
    });
  }

  public dispose(): void {
    this.subscription.dispose();
    this.subscription = null!;
  }
}
