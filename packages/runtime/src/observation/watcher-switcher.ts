import { LifecycleFlags } from '../flags';
import { Collection } from '../observation';

// todo:
// merge collection subscription to property subscription
// and make IWatcher simpler, so observers in static observation won't have to implement many methods
// An alternative way is to make collection observation manual & user controllable
// so it works even without proxy
export interface IWatcher {
  observeProperty(flags: LifecycleFlags, obj: object, property: PropertyKey): void;
  observeCollection<T extends Collection>(collection: T): T;
  observeLength<T extends Collection>(collection: T): T;
}

/**
 * Current subscription collector
 */
let $watcher: IWatcher | null = null;
const watchers: IWatcher[] = [];
// const collectingStatus: boolean[] = [];

export let watching = false;

// todo: layer based collection pause/resume?
export function pauseSubscription() {
  watching = false;
}

export function resumeSubscription() {
  watching = true;
}

export function currentWatcher(): IWatcher | null {
  return $watcher;
}

export function enterWatcher(subscriber: IWatcher): void {
  if ($watcher == null) {
    watchers[0] = $watcher = subscriber;
    watching = true;
    return;
  }
  if ($watcher === subscriber) {
    throw new Error('Already in this watcher {watcher.id}');
  }
  watchers.push($watcher = subscriber);
  watching = true;
}

export function exitWatcher(subscriber: IWatcher): void {
  if ($watcher == null || $watcher !== subscriber) {
    throw new Error('${watcher?.id} is not currently collecting');
  }

  watchers.pop();
  $watcher = watchers.length > 0 ? watchers[watchers.length - 1] : null;
  watching = $watcher != null;
}

// export const DepCollectorSwitcher = Object.freeze({
//   getCurrentSubscriber: currentSub,
//   enterSubscriber: enterSub,
//   exitSubscriber: exitSub,
//   pauseSubscription,
//   resumeSubscription,
// });