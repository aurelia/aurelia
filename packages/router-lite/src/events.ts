import { ILogger } from '@aurelia/kernel';

/**
 * Ranges
 * - viewport        : 3000 - 3049
 * - component agent : 3050 - 3099
 * - location manager: 3100 - 3149
 */

_START_CONST_ENUM();
/**
 * @internal
 */
export const enum Events {
  // viewport
  vpHydrated = 3300,
  vpAttaching = 3301,
  vpDetaching = 3302,
  vpDispose = 3303,

  // component agent
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

  // location manager
  lmBaseHref = 3100,
  lmStartListening = 3101,
  lmStopListening = 3102,
  lmPushState = 3103,
  lmReplaceState = 3104,
  lmPushStateNonSerializable = 3105,
  lmReplaceStateNonSerializable = 3106,
}
_END_CONST_ENUM();

const eventMessageMap: Record<Events, string> = {
  // viewport
  [Events.vpHydrated]: 'hydrated',
  [Events.vpAttaching]: 'attaching',
  [Events.vpDetaching]: 'detaching',
  [Events.vpDispose]: 'dispose',

  // component agent
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

  // location manager
  [Events.lmBaseHref]: 'baseHref set to path: %s',
  [Events.lmStartListening]: 'starting listening to %s',
  [Events.lmStopListening]: 'stopping listening to %s',
  [Events.lmPushState]: 'pushing to history state: %s (title: \'%s\', url: \'%s\')',
  [Events.lmReplaceState]: 'replacing history state: %s (title: \'%s\', url: \'%s\')',
  [Events.lmPushStateNonSerializable]: 'pushing to history state: NOT_SERIALIZABLE (title: \'%s\', url: \'%s\')',
  [Events.lmReplaceStateNonSerializable]: 'replacing history state: NOT_SERIALIZABLE (title: \'%s\', url: \'%s\')',
};

/**
 * Only happens in DEV mode.
 *
 * @internal
 */
export function traceEvent(logger: ILogger, event: Events, ...optionalParameters: unknown[]): void {
  const message = eventMessageMap[event] ?? 'Unknown event';
  logger.trace(`AUR${event}: ${message}`, ...optionalParameters);
}

/**
 * Only happens in DEV mode.
 *
 * @internal
 */
export function debugEvent(logger: ILogger, event: Events, ...optionalParameters: unknown[]): void {
  const message = eventMessageMap[event] ?? 'Unknown event';
  logger.debug(`AUR${event}: ${message}`, ...optionalParameters);
}

export function warnEvent(logger: ILogger, event: Events, ...optionalParameters: unknown[]): void {
  if (__DEV__) {
    const message = eventMessageMap[event];
    logger.warn(`AUR${event}: ${message}`, ...optionalParameters);
  } else {
    logger.warn(`AUR${event}`);
  }
}
