/**
 * Current subscription collector
 */
let $watcher = null;
const watchers = [];
// eslint-disable-next-line
export let watching = false;
// todo: layer based collection pause/resume?
export function pauseSubscription() {
    watching = false;
}
export function resumeSubscription() {
    watching = true;
}
export function currentWatcher() {
    return $watcher;
}
export function enterWatcher(watcher) {
    if (watcher == null) {
        throw new Error('watcher cannot be null/undefined');
    }
    if ($watcher == null) {
        $watcher = watcher;
        watchers[0] = $watcher;
        watching = true;
        return;
    }
    if ($watcher === watcher) {
        throw new Error(`Already in this watcher ${watcher.id}`);
    }
    watchers.push($watcher);
    $watcher = watcher;
    watching = true;
}
export function exitWatcher(watcher) {
    if (watcher == null) {
        throw new Error('watcher cannot be null/undefined');
    }
    if ($watcher !== watcher) {
        throw new Error(`${watcher.id} is not currently collecting`);
    }
    watchers.pop();
    $watcher = watchers.length > 0 ? watchers[watchers.length - 1] : null;
    watching = $watcher != null;
}
//# sourceMappingURL=watcher-switcher.js.map