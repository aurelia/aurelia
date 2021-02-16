// import { INavigatorState, NavigatorViewerState } from './navigator.js';

// export class NavigatorStateChangeEvent /* extends NavigatorViewerState */ {
//   public static eventName = 'au:router:navigation-state-change';

//   public constructor(
//     public readonly eventName: string,
//     public readonly viewerState: NavigatorViewerState,
//     public readonly event: PopStateEvent,
//     public readonly state: INavigatorState,
//   ) { }
//   public static createEvent(
//     viewerState: NavigatorViewerState,
//     ev: PopStateEvent,
//     navigatorState: INavigatorState,
//   ): NavigatorStateChangeEvent {
//     return new NavigatorStateChangeEvent(
//       NavigatorStateChangeEvent.eventName,
//       viewerState,
//       ev,
//       navigatorState);
//   }
// }
