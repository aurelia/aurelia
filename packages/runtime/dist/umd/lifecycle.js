var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BatchQueue = exports.Lifecycle = exports.ILifecycle = exports.IViewFactory = exports.MountStrategy = exports.IController = exports.stringifyState = exports.State = exports.ViewModelKind = void 0;
    const kernel_1 = require("@aurelia/kernel");
    var ViewModelKind;
    (function (ViewModelKind) {
        ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
        ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
        ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
    })(ViewModelKind = exports.ViewModelKind || (exports.ViewModelKind = {}));
    var State;
    (function (State) {
        State[State["none"] = 0] = "none";
        State[State["activating"] = 1] = "activating";
        State[State["beforeBindCalled"] = 2] = "beforeBindCalled";
        State[State["activateChildrenCalled"] = 4] = "activateChildrenCalled";
        State[State["activated"] = 14] = "activated";
        State[State["deactivating"] = 16] = "deactivating";
        State[State["beforeDetachCalled"] = 32] = "beforeDetachCalled";
        State[State["deactivateChildrenCalled"] = 64] = "deactivateChildrenCalled";
        State[State["deactivated"] = 224] = "deactivated";
        State[State["released"] = 256] = "released";
        State[State["disposed"] = 512] = "disposed";
    })(State = exports.State || (exports.State = {}));
    function stringifyState(state) {
        const names = [];
        if ((state & 1 /* activating */) === 1 /* activating */) {
            names.push('activating');
        }
        if ((state & 14 /* activated */) === 14 /* activated */) {
            names.push('activated');
        }
        else {
            if ((state & 2 /* beforeBindCalled */) === 2 /* beforeBindCalled */) {
                names.push('beforeBindCalled');
            }
            if ((state & 4 /* activateChildrenCalled */) === 4 /* activateChildrenCalled */) {
                names.push('activateChildrenCalled');
            }
        }
        if ((state & 16 /* deactivating */) === 16 /* deactivating */) {
            names.push('deactivating');
        }
        if ((state & 224 /* deactivated */) === 224 /* deactivated */) {
            names.push('deactivated');
        }
        else {
            if ((state & 32 /* beforeDetachCalled */) === 32 /* beforeDetachCalled */) {
                names.push('beforeDetachCalled');
            }
            if ((state & 64 /* deactivateChildrenCalled */) === 64 /* deactivateChildrenCalled */) {
                names.push('deactivateChildrenCalled');
            }
        }
        if ((state & 256 /* released */) === 256 /* released */) {
            names.push('released');
        }
        if ((state & 512 /* disposed */) === 512 /* disposed */) {
            names.push('disposed');
        }
        return names.length === 0 ? 'none' : names.join('|');
    }
    exports.stringifyState = stringifyState;
    exports.IController = kernel_1.DI.createInterface('IController').noDefault();
    /**
     * Describing characteristics of a mounting operation a controller will perform
     */
    var MountStrategy;
    (function (MountStrategy) {
        MountStrategy[MountStrategy["insertBefore"] = 1] = "insertBefore";
        MountStrategy[MountStrategy["append"] = 2] = "append";
    })(MountStrategy = exports.MountStrategy || (exports.MountStrategy = {}));
    exports.IViewFactory = kernel_1.DI.createInterface('IViewFactory').noDefault();
    exports.ILifecycle = kernel_1.DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
    class Lifecycle {
        constructor() {
            this.batch = new BatchQueue(this);
        }
    }
    exports.Lifecycle = Lifecycle;
    let BatchQueue = class BatchQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.queue = [];
            this.depth = 0;
        }
        begin() {
            ++this.depth;
        }
        end(flags) {
            if (flags === void 0) {
                flags = 0 /* none */;
            }
            if (--this.depth === 0) {
                this.process(flags);
            }
        }
        inline(fn, flags) {
            this.begin();
            fn();
            this.end(flags);
        }
        add(requestor) {
            this.queue.push(requestor);
        }
        remove(requestor) {
            const index = this.queue.indexOf(requestor);
            if (index > -1) {
                this.queue.splice(index, 1);
            }
        }
        process(flags) {
            while (this.queue.length > 0) {
                const batch = this.queue.slice();
                this.queue = [];
                const { length } = batch;
                for (let i = 0; i < length; ++i) {
                    batch[i].flushBatch(flags);
                }
            }
        }
    };
    BatchQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], BatchQueue);
    exports.BatchQueue = BatchQueue;
});
//# sourceMappingURL=lifecycle.js.map