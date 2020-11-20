/**
 * Current subscription collector
 */
let $watcher = null;
const watchers = [];
// eslint-disable-next-line
export let watching = false;
// todo: layer based collection pause/resume?
export function pauseWatching() {
    watching = false;
}
export function resumeWatching() {
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
export const WatcherSwitcher = Object.freeze({
    get current() {
        return $watcher;
    },
    get watching() {
        return watching;
    },
    enter: enterWatcher,
    exit: exitWatcher,
    pause: pauseWatching,
    resume: resumeWatching,
});
//# sourceMappingURL=watcher-switcher.js.map