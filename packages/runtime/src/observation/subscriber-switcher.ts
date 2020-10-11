import { IConnectableBinding } from '../binding/connectable';
import { IndexMap } from '../observation';
import { LifecycleFlags } from '../flags';

export interface IWatcher extends IConnectableBinding {
  handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
}

/**
 * Current subscription collector
 */
let $collector: IWatcher | null = null;
const collectors: IWatcher[] = [];
const collectingStatus: boolean[] = [];

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