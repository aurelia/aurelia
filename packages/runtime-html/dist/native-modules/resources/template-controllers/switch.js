var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ILogger, nextId, onResolve, resolveAll, } from '../../../../../kernel/dist/native-modules/index.js';
import { BindingMode, IObserverLocator, } from '../../../../../runtime/dist/native-modules/index.js';
import { IRenderLocation } from '../../dom.js';
import { templateController } from '../custom-attribute.js';
import { IViewFactory } from '../../templating/view.js';
import { bindable } from '../../bindable.js';
let Switch = class Switch {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        /** @internal */
        this.cases = [];
        this.activeCases = [];
        /**
         * This is kept around here so that changes can be awaited from the tests.
         * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
         */
        this.promise = void 0;
    }
    link(flags, _parentContext, _controller, _childController, _target, _instruction) {
        this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
    }
    attaching(initiator, parent, flags) {
        const view = this.view;
        const $controller = this.$controller;
        this.queue(() => view.activate(initiator, $controller, flags, $controller.scope, $controller.hostScope));
        this.queue(() => this.swap(initiator, flags, this.value));
        return this.promise;
    }
    detaching(initiator, parent, flags) {
        this.queue(() => {
            const view = this.view;
            return view.deactivate(initiator, this.$controller, flags);
        });
        return this.promise;
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
    valueChanged(_newValue, _oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.queue(() => this.swap(null, flags, this.value));
    }
    caseChanged($case, flags) {
        this.queue(() => this.handleCaseChange($case, flags));
    }
    handleCaseChange($case, flags) {
        const isMatch = $case.isMatch(this.value, flags);
        const activeCases = this.activeCases;
        const numActiveCases = activeCases.length;
        // Early termination #1
        if (!isMatch) {
            /** The previous match started with this; thus clear. */
            if (numActiveCases > 0 && activeCases[0].id === $case.id) {
                return this.clearActiveCases(null, flags);
            }
            /**
             * There are 2 different scenarios here:
             * 1. $case in activeCases: Indicates by-product of fallthrough. The starting case still satisfies. Return.
             * 2. $case not in activeCases: It was previously not active, and currently also not a match. Return.
             */
            return;
        }
        // Early termination #2
        if (numActiveCases > 0 && activeCases[0].id < $case.id) {
            // Even if this case now a match, the previous case still wins by as that has lower ordinal.
            return;
        }
        // compute the new active cases
        const newActiveCases = [];
        let fallThrough = $case.fallThrough;
        if (!fallThrough) {
            newActiveCases.push($case);
        }
        else {
            const cases = this.cases;
            const idx = cases.indexOf($case);
            for (let i = idx, ii = cases.length; i < ii && fallThrough; i++) {
                const c = cases[i];
                newActiveCases.push(c);
                fallThrough = c.fallThrough;
            }
        }
        return onResolve(this.clearActiveCases(null, flags, newActiveCases), () => {
            this.activeCases = newActiveCases;
            return this.activateCases(null, flags);
        });
    }
    swap(initiator, flags, value) {
        const newActiveCases = [];
        let fallThrough = false;
        for (const $case of this.cases) {
            if (fallThrough || $case.isMatch(value, flags)) {
                newActiveCases.push($case);
                fallThrough = $case.fallThrough;
            }
            if (newActiveCases.length > 0 && !fallThrough) {
                break;
            }
        }
        const defaultCase = this.defaultCase;
        if (newActiveCases.length === 0 && defaultCase !== void 0) {
            newActiveCases.push(defaultCase);
        }
        return onResolve(this.activeCases.length > 0
            ? this.clearActiveCases(initiator, flags, newActiveCases)
            : void 0, () => {
            this.activeCases = newActiveCases;
            if (newActiveCases.length === 0) {
                return;
            }
            return this.activateCases(initiator, flags);
        });
    }
    activateCases(initiator, flags) {
        const controller = this.$controller;
        if (!controller.isActive) {
            return;
        }
        const cases = this.activeCases;
        const length = cases.length;
        if (length === 0) {
            return;
        }
        const scope = controller.scope;
        const hostScope = controller.hostScope;
        // most common case
        if (length === 1) {
            return cases[0].activate(initiator, flags, scope, hostScope);
        }
        return resolveAll(...cases.map(($case) => $case.activate(initiator, flags, scope, hostScope)));
    }
    clearActiveCases(initiator, flags, newActiveCases = []) {
        const cases = this.activeCases;
        const numCases = cases.length;
        if (numCases === 0) {
            return;
        }
        if (numCases === 1) {
            const firstCase = cases[0];
            if (!newActiveCases.includes(firstCase)) {
                cases.length = 0;
                return firstCase.deactivate(initiator, flags);
            }
            return;
        }
        return onResolve(resolveAll(...cases.reduce((acc, $case) => {
            if (!newActiveCases.includes($case)) {
                acc.push($case.deactivate(initiator, flags));
            }
            return acc;
        }, [])), () => {
            cases.length = 0;
        });
    }
    queue(action) {
        const previousPromise = this.promise;
        let promise = void 0;
        promise = this.promise = onResolve(onResolve(previousPromise, action), () => {
            if (this.promise === promise) {
                this.promise = void 0;
            }
        });
    }
    accept(visitor) {
        if (this.$controller.accept(visitor) === true) {
            return true;
        }
        if (this.activeCases.some(x => x.accept(visitor))) {
            return true;
        }
    }
};
__decorate([
    bindable
], Switch.prototype, "value", void 0);
Switch = __decorate([
    templateController('switch'),
    __param(0, IViewFactory),
    __param(1, IRenderLocation)
], Switch);
export { Switch };
let Case = class Case {
    constructor(factory, locator, location, logger) {
        this.factory = factory;
        this.locator = locator;
        this.id = nextId('au$component');
        this.fallThrough = false;
        this.debug = logger.config.level <= 1 /* debug */;
        this.logger = logger.scopeTo(`${this.constructor.name}-#${this.id}`);
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        const switchController = controller.parent;
        const $switch = switchController === null || switchController === void 0 ? void 0 : switchController.viewModel;
        if ($switch instanceof Switch) {
            this.$switch = $switch;
            this.linkToSwitch($switch);
        }
        else {
            throw new Error('The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.');
        }
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    isMatch(value, flags) {
        if (this.debug) {
            this.logger.debug('isMatch()');
        }
        const $value = this.value;
        if (Array.isArray($value)) {
            if (this.observer === void 0) {
                this.observer = this.observeCollection(flags, $value);
            }
            return $value.includes(value);
        }
        return $value === value;
    }
    valueChanged(newValue, _oldValue, flags) {
        var _a;
        if (Array.isArray(newValue)) {
            (_a = this.observer) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
            this.observer = this.observeCollection(flags, newValue);
        }
        else if (this.observer !== void 0) {
            this.observer.unsubscribe(this);
        }
        this.$switch.caseChanged(this, flags);
    }
    handleCollectionChange(_indexMap, flags) {
        this.$switch.caseChanged(this, flags);
    }
    activate(initiator, flags, scope, hostScope) {
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags, scope, hostScope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags);
    }
    dispose() {
        var _a, _b;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        (_b = this.view) === null || _b === void 0 ? void 0 : _b.dispose();
        this.view = (void 0);
    }
    linkToSwitch(auSwitch) {
        auSwitch.cases.push(this);
    }
    observeCollection(flags, $value) {
        const observer = this.locator.getArrayObserver($value);
        observer.subscribe(this);
        return observer;
    }
    accept(visitor) {
        var _a;
        if (this.$controller.accept(visitor) === true) {
            return true;
        }
        return (_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor);
    }
};
__decorate([
    bindable
], Case.prototype, "value", void 0);
__decorate([
    bindable({
        set: v => {
            switch (v) {
                case 'true': return true;
                case 'false': return false;
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                default: return !!v;
            }
        },
        mode: BindingMode.oneTime
    })
], Case.prototype, "fallThrough", void 0);
Case = __decorate([
    templateController('case'),
    __param(0, IViewFactory),
    __param(1, IObserverLocator),
    __param(2, IRenderLocation),
    __param(3, ILogger)
], Case);
export { Case };
let DefaultCase = class DefaultCase extends Case {
    linkToSwitch($switch) {
        if ($switch.defaultCase !== void 0) {
            throw new Error('Multiple \'default-case\'s are not allowed.');
        }
        $switch.defaultCase = this;
    }
};
DefaultCase = __decorate([
    templateController('default-case')
], DefaultCase);
export { DefaultCase };
//# sourceMappingURL=switch.js.map