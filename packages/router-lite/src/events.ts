import { ILogger } from '@aurelia/kernel';

/**
 * Ranges
 * - viewport        : 3000 - 3049
 * - component agent : 3050 - 3099
 * - location manager: 3100 - 3149
 * - route-context   : 3150 - 3199
 * - router-events   : 3200 - 3249
 * - router          : 3250 - 3299
 * - viewport agent  : 3300 - 3400
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
  rcNoAppRoot = 3167,
  rcHasRootContext = 3168,
  rcNoRootCtrl = 3169,
  rcResolveInvalidCtxType = 3170,
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
  // #endregion
  // #region viewport agent
  vpaCreated = 3300,
  vpaActivateFromVpNone = 3301,
  vpaActivateFromVpExisting = 3302,
  vpaActivateFromVpNext = 3303,
  vpaDeactivateFromVpNone = 3304,
  vpaDeactivateFromVpExisting = 3305,
  vpaDeactivationFromVpRunning = 3306,
  vpaDeactivateFromVpCurrent = 3307,
  vpaHandlesVpMismatch = 3308,
  vpaHandlesUsedByMismatch = 3309,
  vpaHandles = 3310,
  vpaIsAvailableInactive = 3311,
  vpaIsAvailableScheduled = 3312,
  vpaCanUnloadChildren = 3313,
  vpaCanUnloadExisting = 3314,
  vpaCanUnloadSelf = 3315,
  vpaCanUnloadFinished = 3316,
  vpaCanUnloadNone = 3317,
  vpaCanLoadNext = 3318,
  vpaCanLoadNone = 3319,
  vpaCanLoadResidue = 3320,
  vpaCanLoadResidueDelay = 3321,
  vpaCanLoadChildren = 3322,
  vpaCanLoadFinished = 3323,
  vpaUnloadingChildren = 3324,
  vpaUnloadingExisting = 3325,
  vpaUnloadingSelf = 3326,
  vpaUnloadingFinished = 3327,
  vpaUnloadingNone = 3328,
  vpaLoadingNext = 3329,
  vpaLoadingNone = 3330,
  vpaLoadingChildren = 3331,
  vpaLoadingFinished = 3332,
  vpaDeactivateCurrent = 3333,
  vpaDeactivateNone = 3334,
  vpaDeactivationRunning = 3335,
  vpaActivateNextScheduled = 3336,
  vpaActivateNext = 3337,
  vpaActivateNone = 3338,
  vpaSwapEmptyCurr = 3339,
  vpaSwapEmptyNext = 3340,
  vpaSwapSkipToChildren = 3341,
  vpaSwap = 3342,
  vpaProcessDynamicChildren = 3343,
  vpaScheduleUpdate = 3344,
  vpaCancelUpdate = 3345,
  vpaEndTransitionEmptyCurr = 3346,
  vpaEndTransitionActiveCurrLifecycle = 3347,
  vpaEndTransitionActiveCurrReplace = 3348,
  vpaDispose = 3349,
  // #endregion
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
  [Events.rcNoAppRoot]: 'The provided container has no registered IAppRoot. RouteContext.setRoot can only be used after Aurelia.app was called, on a container that is within that app\'s component tree.',
  [Events.rcHasRootContext]: 'A root RouteContext is already registered. A possible cause is the RouterConfiguration being registered more than once in the same container tree. If you have a multi-rooted app, make sure you register RouterConfiguration only in the "forked" containers and not in the common root.',
  [Events.rcNoRootCtrl]: 'The provided IAppRoot does not (yet) have a controller. A possible cause is calling this API manually before Aurelia.start() is called',
  [Events.rcResolveInvalidCtxType]: 'Invalid context type: %s',
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

  // #region viewport agent
  [Events.vpaCreated]: 'created',
  [Events.vpaActivateFromVpNone]: 'Nothing to activate at %s',
  [Events.vpaActivateFromVpExisting]: 'Activating existing component agent at %s',
  [Events.vpaActivateFromVpNext]: 'Activating next component agent at %s',
  [Events.vpaDeactivateFromVpNone]: 'Nothing to deactivate at %s',
  [Events.vpaDeactivateFromVpExisting]: 'Deactivating existing component agent at %s',
  [Events.vpaDeactivationFromVpRunning]: 'Already deactivating at %s',
  [Events.vpaDeactivateFromVpCurrent]: 'Deactivating current component agent at %s',
  [Events.vpaHandlesVpMismatch]: 'Cannot handle the request %s due to viewport name mismatch %s',
  [Events.vpaHandlesUsedByMismatch]: 'Cannot handle the request %s as componentName not included in usedBy %s',
  [Events.vpaHandles]: 'Viewport %s can handle the request %s',
  [Events.vpaIsAvailableInactive]: 'Viewport is not available as it is inactive',
  [Events.vpaIsAvailableScheduled]: 'Viewport is not available as an update is scheduled for %s',
  [Events.vpaCanUnloadChildren]: 'Invoking on children at %s',
  [Events.vpaCanUnloadExisting]: 'Invoking on existing component at %s',
  [Events.vpaCanUnloadSelf]: 'Finished invoking on children, now invoking on own component at %s',
  [Events.vpaCanUnloadFinished]: 'Finished at %s',
  [Events.vpaCanUnloadNone]: 'Nothing to unload at %s',
  [Events.vpaCanLoadNext]: 'Invoking on next component at %s',
  [Events.vpaCanLoadNone]: 'Nothing to load at %s',
  [Events.vpaCanLoadResidue]: 'Compiling residue for %s; plan is set to %s',
  [Events.vpaCanLoadResidueDelay]: 'Delaying residue compilation for %s until activate',
  [Events.vpaCanLoadChildren]: 'Finished own component; invoking on children at %s',
  [Events.vpaCanLoadFinished]: 'Finished at %s',
  [Events.vpaUnloadingChildren]: 'Invoking on children at %s',
  [Events.vpaUnloadingExisting]: 'Invoking on existing component at %s',
  [Events.vpaUnloadingSelf]: 'Finished invoking on children, now invoking on own component at %s',
  [Events.vpaUnloadingFinished]: 'Finished at %s',
  [Events.vpaUnloadingNone]: 'Nothing to unload at %s',
  [Events.vpaLoadingNext]: 'Invoking on next component at %s',
  [Events.vpaLoadingNone]: 'Nothing to load at %s',
  [Events.vpaLoadingChildren]: 'Finished own component; invoking on children at %s',
  [Events.vpaLoadingFinished]: 'Finished at %s',
  [Events.vpaDeactivateCurrent]: 'Invoking on the current component at %s',
  [Events.vpaDeactivateNone]: 'Nothing to deactivate at %s',
  [Events.vpaDeactivationRunning]: 'Already deactivating at %s',
  [Events.vpaActivateNextScheduled]: 'Invoking canLoad(), loading() and activate() on the next component at %s',
  [Events.vpaActivateNext]: 'Invoking on the next component at %s',
  [Events.vpaActivateNone]: 'Nothing to activate at %s',
  [Events.vpaSwapEmptyCurr]: 'Running activate on next instead, because there is nothing to deactivate at %s',
  [Events.vpaSwapEmptyNext]: 'Running deactivate on current instead, because there is nothing to activate at %s',
  [Events.vpaSwapSkipToChildren]: 'Skipping this level and swapping children instead at %s',
  [Events.vpaSwap]: 'Swapping current and next at %s',
  [Events.vpaProcessDynamicChildren]: 'Processing dynamic children at %s',
  [Events.vpaScheduleUpdate]: 'Scheduling update for %s; plan is set to %s',
  [Events.vpaCancelUpdate]: 'Cancelling update for %s',
  [Events.vpaEndTransitionEmptyCurr]: 'setting currState to State.currIsEmpty at %s',
  [Events.vpaEndTransitionActiveCurrLifecycle]: 'setting currState to State.currIsActive at %s',
  [Events.vpaEndTransitionActiveCurrReplace]: 'setting currState to State.currIsActive and reassigning curCA at %s',
  [Events.vpaDispose]: 'disposing at %s',
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

/** @internal */
export function getMessage(event: Events, ...optionalParameters: unknown[]) {
  if (__DEV__) {
    let message = eventMessageMap[event];
    let offset = 0;
    while (message.includes('%s') || offset < optionalParameters.length) {
      message = message.replace('%s', String(optionalParameters[offset++]));
    }
    return `AUR${event}: ${message}`;
  }
  return `AUR${event}`;
}

export function logAndThrow(err: Error, logger: ILogger): never {
  logger.error(err);
  throw err;
}
