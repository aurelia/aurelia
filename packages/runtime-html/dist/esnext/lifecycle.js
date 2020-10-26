import { DI } from '@aurelia/kernel';
export var ViewModelKind;
(function (ViewModelKind) {
    ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
    ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
    ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
})(ViewModelKind || (ViewModelKind = {}));
export var State;
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
})(State || (State = {}));
export function stringifyState(state) {
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
export const IController = DI.createInterface('IController').noDefault();
/**
 * Describing characteristics of a mounting operation a controller will perform
 */
export var MountStrategy;
(function (MountStrategy) {
    MountStrategy[MountStrategy["insertBefore"] = 1] = "insertBefore";
    MountStrategy[MountStrategy["append"] = 2] = "append";
})(MountStrategy || (MountStrategy = {}));
//# sourceMappingURL=lifecycle.js.map