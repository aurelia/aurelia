import { Collection } from '../observation';

// todo:
// merge collection subscription to property subscription
// and make IWatcher simpler, so observers in static observation won't have to implement many methods
// An alternative way is to make collection observation manual & user controllable
// so it works even without proxy
export interface IWatcher {
  observe(obj: object, property: PropertyKey): void;
  observeCollection(collection: Collection): void;
  observeLength(collection: Collection): void;
}

/**
 * Current subscription collector
 */
let $watcher: IWatcher | null = null;
const watchers: IWatcher[] = [];
// eslint-disable-next-line
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

export function enterWatcher(watcher: IWatcher): void {
  if ($watcher == null) {
    $watcher = watcher;
    watchers[0] = $watcher;
    watching = true;
    return;
  }
  if ($watcher === watcher) {
    throw new Error(`Already in this watcher \${watcher?.id}`);
  }
  watchers.push($watcher);
  $watcher = watcher;
  watching = true;
}

export function exitWatcher(watcher: IWatcher): void {
  if ($watcher == null || $watcher !== watcher) {
    throw new Error(`\${watcher?.id} is not currently collecting`);
  }

  watchers.pop();
  $watcher = watchers.length > 0 ? watchers[watchers.length - 1] : null;
  watching = $watcher != null;
}
