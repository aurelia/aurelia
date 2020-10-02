import { Scheduler } from '@aurelia/scheduler';
import { PLATFORM } from '@aurelia/kernel';
export function ensureSchedulerEmpty(scheduler) {
    var _a, _b, _c, _d, _e;
    if (!scheduler) {
        scheduler = Scheduler.get(PLATFORM.global);
    }
    const $scheduler = scheduler;
    // canceling pending heading to remove the sticky tasks
    const microQueue = $scheduler['microtask'];
    microQueue.flush();
    (_a = microQueue['pendingHead']) === null || _a === void 0 ? void 0 : _a.cancel();
    const renderQueue = $scheduler['render'];
    renderQueue.flush();
    (_b = renderQueue['pendingHead']) === null || _b === void 0 ? void 0 : _b.cancel();
    const macroQueue = $scheduler['macroTask'];
    macroQueue.flush();
    (_c = macroQueue['pendingHead']) === null || _c === void 0 ? void 0 : _c.cancel();
    const postRenderQueue = $scheduler['postRender'];
    postRenderQueue.flush();
    (_d = postRenderQueue['pendingHead']) === null || _d === void 0 ? void 0 : _d.cancel();
    const idleQueue = $scheduler['idle'];
    idleQueue.flush();
    (_e = idleQueue['pendingHead']) === null || _e === void 0 ? void 0 : _e.cancel();
}
//# sourceMappingURL=scheduler.js.map