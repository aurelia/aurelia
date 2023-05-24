import { ILogger } from '@aurelia/kernel';

_START_CONST_ENUM();
/**
 * Prefix: 33xx
 *
 * @internal
 */
export const enum TraceEvents {
  // viewport
  vpHydrated = 3300,
  vpAttaching = 3301,
  vpDetaching = 3302,
  vpDispose = 3303,

  // component agent
  caCreated = 3310,
  caActivateSelf = 3311,
  caActivateInitiator = 3312,
  caDeactivateSelf = 3313,
  caDeactivateInitiator = 3314,
  caDispose = 3315,
  caCanUnload = 3316,
  caCanLoad = 3317,
  caUnloading = 3318,
  caLoading = 3319,
}
_END_CONST_ENUM();

const traceEventsMap: Record<TraceEvents, string> = {
  [TraceEvents.vpHydrated]: 'hydrated',
  [TraceEvents.vpAttaching]: 'attaching',
  [TraceEvents.vpDetaching]: 'detaching',
  [TraceEvents.vpDispose]: 'dispose',

  [TraceEvents.caCreated]: 'created',
  [TraceEvents.caActivateSelf]: 'activating - self',
  [TraceEvents.caActivateInitiator]: 'activating - via initiator',
  [TraceEvents.caDeactivateSelf]: 'deactivating - self',
  [TraceEvents.caDeactivateInitiator]: 'deactivating - via initiator',
  [TraceEvents.caDispose]: 'disposing',
  [TraceEvents.caCanUnload]: 'canUnload(next:%s) - invoking %s hooks',
  [TraceEvents.caCanLoad]: 'canLoad(next:%s) - invoking %s hooks',
  [TraceEvents.caUnloading]: 'unloading(next:%s) - invoking %s hooks',
  [TraceEvents.caLoading]: 'loading(next:%s) - invoking %s hooks',
};

/** @internal */
export function traceEvent(logger: ILogger, event: TraceEvents, ...optionalParameters: unknown[]): void {
  const message = traceEventsMap[event] ?? 'Unknown trace event';
  logger.trace(`AUR${event}: ${message}`, ...optionalParameters);
}
