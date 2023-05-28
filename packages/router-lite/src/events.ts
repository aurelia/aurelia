import { ILogger } from '@aurelia/kernel';

/**
 * Ranges
 * - viewport        : 3000 - 3049
 * - component agent : 3050 - 3099
 * - location manager: 3100 - 3149
 * - route-context   : 3150 - 3199
 * - router-events   : 3200 - 3249
 * - router          : 3250 - 3299
 */

_START_CONST_ENUM();
/**
 * @internal
 */
export const enum Events {
  // #region viewport
  vpHydrated = 3300,
  vpAttaching = 3301,
  vpDetaching = 3302,
  vpDispose = 3303,
  // #endregion
  // #region component agent
  caCreated = 3050,
  caActivateSelf = 3051,
  caActivateInitiator = 3052,
  caDeactivateSelf = 3053,
  caDeactivateInitiator = 3054,
  caDispose = 3055,
  caCanUnload = 3056,
  caCanLoad = 3057,
  caUnloading = 3058,
  caLoading = 3059,
  // #endregion
  // #region location manager
  lmBaseHref = 3100,
  lmStartListening = 3101,
  lmStopListening = 3102,
  lmPushState = 3103,
  lmReplaceState = 3104,
  lmPushStateNonSerializable = 3105,
  lmReplaceStateNonSerializable = 3106,
  // #endregion
  // #region route context
  rcCreated = 3150,
  rcNodeChanged = 3151,
  rcResolveNullishContext = 3152,
  rcResolveInstance = 3153,
  rcResolveNode = 3154,
  rcResolveNodeFailed = 3155,
  rcResolveCe = 3156,
  rcResolveCtrl = 3157,
  rcResolveVpa = 3158,
  rcCreateCa = 3159,
  rcRegisterVp = 3160,
  rcRegisterVpSkip = 3161,
  rcUnregisterVp = 3162,
  rcUnregisterVpSkip = 3163,
  rcRecognizePath = 3164,
  rcAddRoute = 3165,
  rcEagerPathGenerationFailed = 3166,
  // #endregion
  // #region router events
  rePublishingEvent = 3200,
  reInvokingSubscriber = 3201,
  // #endregion
  // #region router
  rtrLoading = 3250,
  rtrIsActive = 3251,
  rtrResolvingRcExisting = 3252,
  rtrResolvingRcNew = 3253,
  rtrIgnoringIdenticalNav = 3254,
  rtrReusingPromise = 3255,
  rtrSchedulingTr = 3256,
  rtrTrSucceeded = 3257,
  rtrRunBegin = 3258,
  rtrRunCancelled = 3259,
  rtrRunVitCompile = 3260,
  rtrRunCanUnload = 3261,
  rtrRunCanLoad = 3262,
  rtrRunUnloading = 3263,
  rtrRunLoading = 3264,
  rtrRunSwapping = 3265,
  rtrRunFinalizing = 3266,
  rtrCancelNavigationStart = 3267,
  rtrCancelNavigationCompleted = 3268,
  rtrNextTr = 3269,
  rtrTrFailed = 3270,
}
_END_CONST_ENUM();

const eventMessageMap: Record<Events, string> = {
  // #region viewport
  [Events.vpHydrated]: 'hydrated',
  [Events.vpAttaching]: 'attaching',
  [Events.vpDetaching]: 'detaching',
  [Events.vpDispose]: 'dispose',
  // #endregion

  // #region component agent
  [Events.caCreated]: 'created',
  [Events.caActivateSelf]: 'activating - self',
  [Events.caActivateInitiator]: 'activating - via initiator',
  [Events.caDeactivateSelf]: 'deactivating - self',
  [Events.caDeactivateInitiator]: 'deactivating - via initiator',
  [Events.caDispose]: 'disposing',
  [Events.caCanUnload]: 'canUnload(next:%s) - invoking %s hooks',
  [Events.caCanLoad]: 'canLoad(next:%s) - invoking %s hooks',
  [Events.caUnloading]: 'unloading(next:%s) - invoking %s hooks',
  [Events.caLoading]: 'loading(next:%s) - invoking %s hooks',
  // #endregion

  // #region location manager
  [Events.lmBaseHref]: 'baseHref set to path: %s',
  [Events.lmStartListening]: 'starting listening to %s',
  [Events.lmStopListening]: 'stopping listening to %s',
  [Events.lmPushState]: 'pushing to history state: %s (title: \'%s\', url: \'%s\')',
  [Events.lmReplaceState]: 'replacing history state: %s (title: \'%s\', url: \'%s\')',
  [Events.lmPushStateNonSerializable]: 'pushing to history state: NOT_SERIALIZABLE (title: \'%s\', url: \'%s\')',
  [Events.lmReplaceStateNonSerializable]: 'replacing history state: NOT_SERIALIZABLE (title: \'%s\', url: \'%s\')',
  // #endregion

  // #region route context
  [Events.rcCreated]: 'created',
  [Events.rcNodeChanged]: 'Node changed from %s to %s',
  [Events.rcResolveNullishContext]: 'The given context is nullish (%s); resolving to root RouteContext',
  [Events.rcResolveInstance]: 'The given context (%s) is an instance of RouteContext; resolving to it',
  [Events.rcResolveNode]: 'The given context is a node (nodeName:%s); resolving RouteContext from controller\'s RenderContext',
  [Events.rcResolveNodeFailed]: 'Failed to resolve RouteContext from node %s; error: %s',
  [Events.rcResolveCe]: 'The given context is a custom element viewmodel (name:%s); resolving RouteContext from controller\'s RenderContext',
  [Events.rcResolveCtrl]: 'The given context is a custom element controller (name:%s); resolving RouteContext from controller\'s RenderContext',
  [Events.rcResolveVpa]: 'Resolving viewport agent for the request: %s',
  [Events.rcCreateCa]: 'Creating component agent for the node: %s',
  [Events.rcRegisterVp]: 'Registering viewport: %s',
  [Events.rcRegisterVpSkip]: 'Skipping registering viewport: %s; it is already registered',
  [Events.rcUnregisterVp]: 'Unregistering viewport: %s',
  [Events.rcUnregisterVpSkip]: 'Skipping unregistering viewport: %s; it is not registered',
  [Events.rcRecognizePath]: 'Recognizing path: %s',
  [Events.rcAddRoute]: 'Adding route: %s',
  [Events.rcEagerPathGenerationFailed]: 'Unable to eagerly generate path for %s; reasons: %s',
  // #endregion

  // #region router events
  [Events.rePublishingEvent]: 'Publishing event: %s',
  [Events.reInvokingSubscriber]: 'Invoking subscriber #%s (event: %s)',
  // #endregion

  // #region router
  [Events.rtrLoading]: 'Loading instruction: %s',
  [Events.rtrIsActive]: 'Checking if the route %s is active in context %s',
  [Events.rtrResolvingRcExisting]: 'Resolving existing RouteContext for %s',
  [Events.rtrResolvingRcNew]: 'Creating new RouteContext for %s',
  [Events.rtrIgnoringIdenticalNav]: 'Ignoring navigation triggered by \'%s\' because it is the same URL as the previous navigation which was triggered by \'api\'.',
  [Events.rtrReusingPromise]: 'Reusing promise/resolve/reject from the previously failed transition %s',
  [Events.rtrSchedulingTr]: 'Scheduling transition: %s',
  [Events.rtrTrSucceeded]: 'Transition succeeded: %s',
  [Events.rtrRunBegin]: 'Running transition: %s',
  [Events.rtrRunCancelled]: 'Aborting transition %s because a new transition was queued in response to the NavigationStartEvent',
  [Events.rtrRunVitCompile]: 'Compiling viewport instructions tree %s',
  [Events.rtrRunCanUnload]: 'invoking canUnload on %s nodes',
  [Events.rtrRunCanLoad]: 'invoking canLoad on %s nodes',
  [Events.rtrRunUnloading]: 'invoking unloading on %s nodes',
  [Events.rtrRunLoading]: 'invoking loading on %s nodes',
  [Events.rtrRunSwapping]: 'invoking swapping on %s nodes',
  [Events.rtrRunFinalizing]: 'finalizing transition',
  [Events.rtrCancelNavigationStart]: 'navigation %s',
  [Events.rtrCancelNavigationCompleted]: 'navigation %s; finished.',
  [Events.rtrNextTr]: 'scheduling next transition: %s',
  [Events.rtrTrFailed]: 'Transition %s failed with error: %s',
  // #endregion
};

/**
 * Only happens in DEV mode.
 *
 * @internal
 */
export function trace(logger: ILogger, event: Events, ...optionalParameters: unknown[]): void {
  const message = eventMessageMap[event] ?? 'Unknown event';
  logger.trace(`AUR${event}: ${message}`, ...optionalParameters);
}

/**
 * Only happens in DEV mode.
 *
 * @internal
 */
export function debug(logger: ILogger, event: Events, ...optionalParameters: unknown[]): void {
  const message = eventMessageMap[event] ?? 'Unknown event';
  logger.debug(`AUR${event}: ${message}`, ...optionalParameters);
}

/** @internal */
export function warn(logger: ILogger, event: Events, ...optionalParameters: unknown[]): void {
  if (__DEV__) {
    const message = eventMessageMap[event];
    logger.warn(`AUR${event}: ${message}`, ...optionalParameters);
  } else {
    logger.warn(`AUR${event}`);
  }
}

/** @internal */
export function error(logger: ILogger, event: Events, ...optionalParameters: unknown[]): void {
  if (__DEV__) {
    const message = eventMessageMap[event];
    logger.error(`AUR${event}: ${message}`, ...optionalParameters);
  } else {
    logger.error(`AUR${event}`);
  }
}
