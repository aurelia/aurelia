"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectTo = void 0;
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
const runtime_html_1 = require("@aurelia/runtime-html");
const rxjs_1 = require("rxjs");
const store_js_1 = require("./store.js");
const defaultSelector = (store) => store.state;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function connectTo(settings) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _settings = {
        selector: typeof settings === 'function' ? settings : defaultSelector,
        ...settings
    };
    function getSource(store, selector) {
        const source = selector(store);
        if (source instanceof rxjs_1.Observable) {
            return source;
        }
        return store.state;
    }
    function createSelectors() {
        const isSelectorObj = typeof _settings.selector === "object";
        const fallbackSelector = {
            [_settings.target || 'state']: _settings.selector || defaultSelector
        };
        return Object.entries({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(isSelectorObj ? _settings.selector : fallbackSelector)
        }).map(([target, selector]) => ({
            targets: _settings.target && isSelectorObj ? [_settings.target, target] : [target],
            selector,
            // numbers are the starting index to slice all the change handling args,
            // which are prop name, new state and old state
            changeHandlers: {
                [_settings.onChanged || '']: 1,
                [`${_settings.target || target}Changed`]: _settings.target ? 0 : 1,
                propertyChanged: 0
            }
        }));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (target) {
        const originalSetup = typeof settings === 'object' && settings.setup
            ? target.prototype[settings.setup]
            : target.prototype.binding;
        const originalTeardown = typeof settings === 'object' && settings.teardown
            ? target.prototype[settings.teardown]
            : target.prototype.bound;
        target.prototype[typeof settings === 'object' && settings.setup !== undefined ? settings.setup : 'binding'] = function () {
            if (typeof settings === 'object' &&
                typeof settings.onChanged === 'string' &&
                !(settings.onChanged in this)) {
                // Provided onChanged handler does not exist on target VM
                throw new Error('Provided onChanged handler does not exist on target VM');
            }
            const store = runtime_html_1.Controller.getCached(this)
                ? runtime_html_1.Controller.getCached(this).container.get(store_js_1.Store)
                : store_js_1.STORE.container.get(store_js_1.Store); // TODO: need to get rid of this helper for classic unit tests
            this._stateSubscriptions = createSelectors().map(s => getSource(store, s.selector).subscribe((state) => {
                const lastTargetIdx = s.targets.length - 1;
                // eslint-disable-next-line default-param-last
                const oldState = s.targets.reduce((accu = {}, curr) => accu[curr], this);
                Object.entries(s.changeHandlers).forEach(([handlerName, args]) => {
                    if (handlerName in this) {
                        this[handlerName](...[s.targets[lastTargetIdx], state, oldState].slice(args, 3));
                    }
                });
                s.targets.reduce((accu, curr, idx) => {
                    accu[curr] = idx === lastTargetIdx ? state : accu[curr] || {};
                    return accu[curr];
                }, this);
            }));
            if (originalSetup) {
                // eslint-disable-next-line prefer-rest-params
                return originalSetup.apply(this, arguments);
            }
        };
        target.prototype[typeof settings === 'object' && settings.teardown ? settings.teardown : 'bound'] = function () {
            if (this._stateSubscriptions && Array.isArray(this._stateSubscriptions)) {
                this._stateSubscriptions.forEach((sub) => {
                    if (sub instanceof rxjs_1.Subscription && sub.closed === false) {
                        sub.unsubscribe();
                    }
                });
            }
            if (originalTeardown) {
                // eslint-disable-next-line prefer-rest-params
                return originalTeardown.apply(this, arguments);
            }
        };
    };
}
exports.connectTo = connectTo;
//# sourceMappingURL=decorator.js.map