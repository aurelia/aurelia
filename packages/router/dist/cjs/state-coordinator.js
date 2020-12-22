"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateCoordinator = exports.Entity = void 0;
const open_promise_js_1 = require("./open-promise.js");
class Entity {
    constructor(entity) {
        this.entity = entity;
        this.running = false;
        this.states = [];
        this.checkedStates = [];
        this.syncState = null;
        this.syncPromise = null;
    }
}
exports.Entity = Entity;
class StateCoordinator {
    constructor() {
        this.entities = [];
        this.hasAllEntities = false;
        this.syncStates = new Map();
        this.checkedSyncStates = new Set();
    }
    // public constructor(@ILogger private readonly logger: ILogger) {
    //   this.logger = logger.root.scopeTo('StateCoordinator');
    //   this.logger.trace('constructor()');
    // }
    addSyncState(state) {
        const openPromise = new open_promise_js_1.OpenPromise();
        this.syncStates.set(state, openPromise);
    }
    addEntity(entity) {
        // console.log('Entity received', entity);
        const ent = new Entity(entity);
        this.entities.push(ent);
        this.resetSyncStates();
        return ent;
    }
    addEntityState(entity, state) {
        // console.log(`#### EntityState received ${state}`, (entity as any).name);
        let ent = this.entities.find(e => e.entity === entity);
        if (ent === void 0) {
            ent = this.addEntity(entity);
        }
        ent.states.push(state);
        this.checkSyncState(state);
    }
    syncState(state, entity = null) {
        const openPromise = this.syncStates.get(state);
        if (openPromise === void 0) {
            return;
        }
        if (entity !== null) {
            const ent = this.entities.find(e => e.entity === entity);
            if (ent?.syncPromise === null && openPromise.isPending) {
                ent.syncState = state;
                ent.syncPromise = new open_promise_js_1.OpenPromise();
                ent.checkedStates.push(state);
                this.checkedSyncStates.add(state);
                Promise.resolve().then(() => { this.checkSyncState(state); }).catch(err => { throw err; });
                return ent.syncPromise.promise;
            }
        }
        // this.checkSyncState(state);
        return openPromise.promise;
    }
    checkingSyncState(state) {
        return this.syncStates.has(state);
    }
    finalEntity() {
        this.hasAllEntities = true;
        // console.log('Final entity received', this.entities.length);
        this.syncStates.forEach((_promise, state) => this.checkSyncState(state));
    }
    finalize() { }
    cancel() { }
    // A new navigation should cancel replaced instructions
    cancelReplaced(navigation) { }
    checkSyncState(state) {
        // console.log('StateCoordinator check state', state, this);
        const openPromise = this.syncStates.get(state);
        if (openPromise === void 0) {
            return;
        }
        if (this.hasAllEntities &&
            openPromise.isPending &&
            // Check that this state has been done by all state entities and if so resolve the promise
            this.entities.every(ent => ent.states.includes(state)) &&
            // Check that this state has been checked (reached) by all state entities and if so resolve the promise
            (!this.checkedSyncStates.has(state) || this.entities.every(ent => ent.checkedStates.includes(state)))) {
            for (const entity of this.entities) {
                if (entity.syncState === state) {
                    // console.log('Resolving entity promise for ', state, (entity.entity as any).toString());
                    entity.syncPromise?.resolve();
                    entity.syncPromise = null;
                    entity.syncState = null;
                }
            }
            openPromise.resolve();
            // console.log('#### StateCoordinator state resolved', state /*, this */);
        }
    }
    resetSyncStates() {
        this.syncStates.forEach((promise, state) => {
            if (!promise.isPending &&
                !this.entities.every(entity => entity.states.includes(state))) {
                this.addSyncState(state);
            }
        });
    }
}
exports.StateCoordinator = StateCoordinator;
//# sourceMappingURL=state-coordinator.js.map