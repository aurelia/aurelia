import { ILogger } from '@aurelia/kernel';

_START_CONST_ENUM();
/**
 * Prefix: 33xx
 *
 * @internal
 */
export const enum TraceEvents {
  // viewport
  vpCreated = 3300,
  vpHydrated = 3301,
  vpAttaching = 3302,
  vpDetaching = 3303,
  vpDispose = 3304,

  // component agent
  caCreated = 3310,
  caActivateSelf = 3311,
  caActivateInitiator = 3312,
  caDeactivateSelf = 3313,
  caDeactivateInitiator = 3314,
  caDispose = 3315,
}
_END_CONST_ENUM();

const traceEventsMap: Record<TraceEvents, string> = {
  [TraceEvents.vpCreated]: 'created',
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
};

/** @internal */
export function traceEvent(logger: ILogger, event: TraceEvents, ...optionalParameters: unknown[]): void {
  const message = traceEventsMap[event] ?? 'Unknown trace event';
  logger.trace(`AUR${event}: ${message}`, ...optionalParameters);
}
