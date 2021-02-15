import { INavigatorState, NavigatorViewerState } from './navigator.js';

export class NavigatorStateChangeEvent /* extends NavigatorViewerState */ {
  public static eventName = 'au:router:navigation-state-change';

  public viewerState!: NavigatorViewerState;
  public event!: PopStateEvent;
  public state?: INavigatorState;

  public static createEvent(
    viewerState: NavigatorViewerState,
    ev: PopStateEvent,
    navigatorState: INavigatorState,
  ): NavigatorStateChangeEvent {
    return Object.assign(new NavigatorStateChangeEvent(),
      {
        // ...viewerState,
        ...{
          viewerState,
          event: ev,
          state: navigatorState,
        },
      });
  }
}
