export function lifecycleLogger(name) {
    const lifecycles = [
        'canLeave', 'leave',
        'canEnter', 'enter',
        'created',
        'beforeBind', 'afterBind',
        'beforeAttach', 'afterAttach',
        'beforeDetach', 'afterDetach',
        'beforeUnbind', 'afterUnbind',
    ];
    return function (target) {
        for (const lifecycle of lifecycles) {
            const existing = target.prototype[lifecycle];
            if (existing !== void 0) {
                target.prototype[lifecycle] = function (...args) {
                    console.log(`${name} ${lifecycle}`, args);
                    return existing.apply(target, args);
                };
            }
            else {
                target.prototype[lifecycle] = function (...args) {
                    console.log(`${name} ${lifecycle}`, args);
                    if (lifecycle.startsWith('can')) {
                        return true;
                    }
                };
            }
        }
    };
}
export class LifecycleClass {
    canEnter() { console.log(`name canEnter`); return true; }
    enter(params) { console.log(`name enter`); }
    created() { console.log(`name created`); }
    beforeBind() { console.log(`name binding`); }
    afterBind() { console.log(`name bound`); }
    beforeAttach() { console.log(`name beforeAttach`); }
    afterAttach() { console.log(`name afterAttach`); }
    canLeave() { console.log(`name canLeave`); return true; }
    leave() { console.log(`name leave`); }
    beforeDetach() { console.log(`name beforeDetach`); }
    afterDetach() { console.log(`name afterDetach`); }
    beforeUnbind() { console.log(`name beforeUnbind`); }
    afterUnbind() { console.log(`name unbound`); }
}
//# sourceMappingURL=lifecycle-logger.js.map