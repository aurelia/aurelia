import { LogLevel, Registration, ILogConfig, LoggerConfiguration, DI, ConsoleSink } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime-html';
import { RouterConfiguration, IRouter } from '@aurelia/router-direct';
import { TestContext } from '@aurelia/testing';
import { IHIAConfig, IHookInvocationAggregator } from './hook-invocation-tracker.js';
import { TestRouterConfiguration } from './configuration.js';
import { startTickLogging } from './tick-logger.js';
export function translateOptions(routerOptionsSpec) {
    let swap;
    switch (routerOptionsSpec.swapStrategy) {
        case 'sequential-add-first':
            swap = 'attach-next-detach-current';
            break;
        case 'sequential-remove-first':
            swap = 'detach-current-attach-next';
            break;
        case 'parallel-remove-first':
            swap = 'detach-attach-simultaneously';
            break;
        default:
            swap = 'attach-next-detach-current';
            break;
    }
    const syncStates = ['guardedUnload', 'swapped', 'completed'];
    if (routerOptionsSpec.resolutionMode != null) {
        switch (routerOptionsSpec.resolutionMode) {
            case 'static':
                syncStates.push('guardedLoad', 'guarded', 'loaded', 'unloaded', 'routed');
                break;
            case 'dynamic':
                break;
        }
    }
    else {
        switch (routerOptionsSpec.deferUntil) {
            case 'load-hooks': // deepscan-disable-line SWITCH_CASE_FALL_THROUGH
                syncStates.push('loaded', 'unloaded', 'routed');
            // eslint-disable-next-line no-fallthrough
            case 'guard-hooks':
                syncStates.push('guardedLoad', 'guarded');
        }
    }
    // const integration = routerOptionsSpec.resolutionStrategy === 'static' ||
    //   routerOptionsSpec.lifecycleStrategy === 'phased'
    //   ? 'separate'
    //   : 'integrated';
    // console.log('SyncStates', syncStates.toString());
    return {
        completeStateNavigations: true,
        swapOrder: swap,
        navigationSyncStates: syncStates,
        // routingHookIntegration: integration,
    };
}
export const IActivityTracker = /*@__PURE__*/ DI.createInterface('IActivityTracker', x => x.singleton(ActivityTracker));
export class ActivityTracker {
    constructor() {
        this.activeVMs = [];
    }
    setActive(vm) {
        this.activeVMs.push(vm);
    }
    setNonActive(vm) {
        this.activeVMs.splice(this.activeVMs.indexOf(vm), 1);
    }
}
export async function createFixture(Component, deps = [], createHIAConfig = null, createRouterOptions = null, level = LogLevel.warn) {
    const hiaConfig = createHIAConfig != null ? createHIAConfig() : null;
    const routerOptions = createRouterOptions != null ? createRouterOptions() : null;
    const ctx = TestContext.create();
    const { container, platform } = ctx;
    // clearBrowserState(platform);
    container.register(Registration.instance(IHIAConfig, hiaConfig));
    container.register(TestRouterConfiguration.for(ctx, level));
    container.register(RouterConfiguration.customize(routerOptions));
    container.register(LoggerConfiguration.create({ sinks: [ConsoleSink], level: LogLevel.warn }));
    container.register(...deps);
    const activityTracker = container.get(IActivityTracker);
    const hia = container.get(IHookInvocationAggregator);
    const router = container.get(IRouter);
    const component = container.get(Component);
    const au = new Aurelia(container);
    const host = ctx.createElement('div');
    const logConfig = container.get(ILogConfig);
    au.app({ component, host });
    hia.setPhase('start');
    await au.start();
    return {
        ctx,
        container,
        au,
        host,
        hia,
        component,
        platform,
        router,
        activityTracker,
        startTracing() {
            logConfig.level = LogLevel.trace;
        },
        stopTracing() {
            logConfig.level = level;
        },
        async tearDown() {
            hia.setPhase('stop');
            RouterConfiguration.customize();
            await au.stop(true);
            au.dispose();
        },
        logTicks(callback) {
            return startTickLogging(window, callback);
        }
    };
}
export async function clearBrowserState(platform, router = null) {
    const { href } = platform.window.location;
    const index = href.indexOf('#');
    if (index >= 0) {
        if (router?.viewer?.replaceNavigatorState == null) {
            platform.window.history.replaceState({}, '', href.slice(0, index));
            await Promise.resolve();
        }
        else {
            await router.viewer.replaceNavigatorState({}, '', href.slice(0, index));
        }
    }
}
export async function wait(milliseconds) {
    return new Promise(res => { setTimeout(res, milliseconds); });
}
//# sourceMappingURL=create-fixture.js.map