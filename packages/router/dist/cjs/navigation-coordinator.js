"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationCoordinator = exports.NavigationCoordinatorOptions = void 0;
const state_coordinator_js_1 = require("./state-coordinator.js");
class NavigationCoordinatorOptions {
    constructor(input) {
        // console.log('NavigationCoordinatorOptions constructor', input);
        this.syncStates = input.syncStates ?? [];
    }
}
exports.NavigationCoordinatorOptions = NavigationCoordinatorOptions;
class NavigationCoordinator extends state_coordinator_js_1.StateCoordinator {
    constructor() {
        super(...arguments);
        this.running = false;
    }
    static create(router, navigation, options) {
        const coordinator = new NavigationCoordinator();
        coordinator.router = router;
        coordinator.navigation = navigation;
        // TODO: Set flow options from router
        options.syncStates.forEach((state) => coordinator.addSyncState(state));
        // console.log('NavigationCoordinator created', coordinator);
        return coordinator;
    }
    // public get isRestrictedNavigation(): boolean {
    //   return this.syncStates.has('guardedLoad') ||
    //     this.syncStates.has('unloaded') ||
    //     this.syncStates.has('loaded') ||
    //     this.syncStates.has('guarded') ||
    //     this.syncStates.has('routed');
    // }
    run() {
        if (!this.running) {
            // console.log('NavigationCoordinator RUN' /*, { ...this } */);
            this.running = true;
            for (const entity of this.entities) {
                if (!entity.running) {
                    entity.running = true;
                    entity.entity.transition(this);
                }
            }
        }
    }
    addEntity(entity) {
        const ent = super.addEntity(entity);
        if (this.running) {
            ent.entity.transition(this);
        }
        return ent;
    }
    finalize() {
        this.entities.forEach(entity => entity.entity.finalizeContentChange());
    }
    cancel() {
        // TODO: Take care of disabling viewports when cancelling and stateful!
        this.entities.forEach(entity => {
            const abort = entity.entity.abortContentChange();
            if (abort instanceof Promise) {
                abort.catch(error => { throw error; });
            }
        });
        this.router.navigator.cancel(this.navigation).then(() => {
            this.router.processingNavigation = null;
            this.navigation.resolve();
        }).catch(error => { throw error; });
    }
    // A new navigation should cancel replaced instructions
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    cancelReplaced(navigation) { }
}
exports.NavigationCoordinator = NavigationCoordinator;
//# sourceMappingURL=navigation-coordinator.js.map