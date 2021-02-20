"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observation = exports.IObservation = void 0;
const kernel_1 = require("@aurelia/kernel");
const connectable_js_1 = require("../binding/connectable.js");
const connectable_switcher_js_1 = require("./connectable-switcher.js");
const observer_locator_js_1 = require("./observer-locator.js");
exports.IObservation = kernel_1.DI.createInterface('IObservation', x => x.singleton(Observation));
class Observation {
    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }
    static get inject() { return [observer_locator_js_1.IObserverLocator]; }
    /**
     * Run an effect function an track the dependencies inside it,
     * to re-run whenever a dependency has changed
     */
    run(fn) {
        const effect = new Effect(this.observerLocator, fn);
        // todo: batch effect run after it's in
        effect.run();
        return effect;
    }
}
exports.Observation = Observation;
class Effect {
    constructor(observerLocator, fn) {
        this.observerLocator = observerLocator;
        this.fn = fn;
        this.interceptor = this;
        // to configure this, potentially a 2nd parameter is needed for run
        this.maxRunCount = 10;
        this.queued = false;
        this.running = false;
        this.runCount = 0;
        this.stopped = false;
    }
    handleChange() {
        this.queued = true;
        this.run();
    }
    handleCollectionChange() {
        this.queued = true;
        this.run();
    }
    run() {
        if (this.stopped) {
            throw new Error('Effect has already been stopped');
        }
        if (this.running) {
            return;
        }
        ++this.runCount;
        this.running = true;
        this.queued = false;
        ++this.obs.version;
        try {
            connectable_switcher_js_1.enterConnectable(this);
            this.fn(this);
        }
        finally {
            this.obs.clear(false);
            this.running = false;
            connectable_switcher_js_1.exitConnectable(this);
        }
        // when doing this.fn(this), there's a chance that it has recursive effect
        // continue to run for a certain number before bailing
        // whenever there's a dependency change while running, this.queued will be true
        // so we use it as an indicator to continue to run the effect
        if (this.queued) {
            if (this.runCount > this.maxRunCount) {
                this.runCount = 0;
                throw new Error('Maximum number of recursive effect run reached. Consider handle effect dependencies differently.');
            }
            this.run();
        }
        else {
            this.runCount = 0;
        }
    }
    stop() {
        this.stopped = true;
        this.obs.clear(true);
    }
}
connectable_js_1.connectable(Effect);
//# sourceMappingURL=observation.js.map