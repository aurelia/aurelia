import { IConnectableBinding } from '../binding/connectable';
import { Collection, ICollectionSubscriber } from '../observation';

// todo:
// merge collection subscription to property subscription
// and make IWatcher simpler, so observers in static observation won't have to implement many methods
// An alternative way is to make collection observation manual & user controllable
// so it works even without proxy
export interface IWatcher extends IConnectableBinding, ICollectionSubscriber {
  observeCollection(collection: Collection): void;
  observeCollectionSize(collection: Collection): void;
  observeArrayIndex(arr: unknown[], index: number): void;
}

/**
 * Current subscription collector
 */
let $collector: IWatcher | null = null;
const collectors: IWatcher[] = [];
// const collectingStatus: boolean[] = [];

export let collecting = false;

// todo: layer based collection pause/resume?
export function pauseSubscription() {
  collecting = false;
}

export function resumeSubscription() {
  collecting = true;
}

export function currentSub(): IWatcher | null {
  return $collector;
}

export function enterWatcher(subscriber: IWatcher): void {
  if ($collector == null) {
    collectors[0] = $collector = subscriber;
    collecting = true;
    return;
  }
  if ($collector === subscriber) {
    throw new Error('Already in this watcher {watcher.id}');
  }
  collectors.push($collector = subscriber);
  collecting = true;
}

export function exitWatcher(subscriber: IWatcher): void {
  if ($collector == null || $collector !== subscriber) {
    throw new Error('${watcher?.id} is not currently collecting');
  }

  collectors.pop();
  $collector = collectors.length > 0 ? collectors[collectors.length - 1] : null;
  collecting = $collector != null;
}

// export const DepCollectorSwitcher = Object.freeze({
//   getCurrentSubscriber: currentSub,
//   enterSubscriber: enterSub,
//   exitSubscriber: exitSub,
//   pauseSubscription,
//   resumeSubscription,
// });