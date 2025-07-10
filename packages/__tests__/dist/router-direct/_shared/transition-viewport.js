export class TransitionViewport {
    static getPrepended(prefix, component, ...hooks) {
        return hooks.map(hook => hook !== '' ? `${prefix}.${component}.${hook}` : '');
    }
    static getInterweaved(...lists) {
        const hooks = [];
        while (lists.length > 0) {
            for (let i = 0, ii = lists.length; i < ii; ++i) {
                const list = lists[i];
                if (list.length === 0) {
                    lists.splice(i, 1);
                    --i;
                    --ii;
                }
                else {
                    let value;
                    do {
                        value = list.shift();
                        if (value !== void 0) {
                            hooks.push(value);
                        }
                    } while (value);
                }
            }
        }
        return hooks;
    }
    static applyDelays(deferUntil, viewports, addViewports, removeViewports) {
        let delayed;
        let guard = 100;
        do {
            let before = JSON.parse(JSON.stringify(viewports.map(viewport => viewport.hooks)));
            delayed = false;
            delayed = TransitionViewport.ensureViewportHookOrder(removeViewports, addViewports) || delayed;
            if (delayed) {
                console.log('delayed within viewport', before, JSON.parse(JSON.stringify(viewports.map(viewport => viewport.hooks))));
                before = JSON.parse(JSON.stringify(viewports.map(viewport => viewport.hooks)));
                delayed = false;
            }
            delayed = TransitionViewport.ensureConfiguredHookOrder(deferUntil, viewports, removeViewports, addViewports) || delayed;
            if (delayed) {
                console.log('delayed between viewports', before, JSON.parse(JSON.stringify(viewports.map(viewport => viewport.hooks))));
            }
            guard--;
        } while (delayed && guard > 0);
    }
    static delayHook(earlierViewport, laterViewport, hook) {
        const check = `.${hook}`;
        const earlierViewportHooks = earlierViewport instanceof TransitionViewport ? earlierViewport.hooks : earlierViewport;
        const laterViewportHooks = laterViewport instanceof TransitionViewport ? laterViewport.hooks : laterViewport;
        let index = TransitionViewport.findLastIndex(earlierViewportHooks, item => item !== void 0 && item.endsWith(check));
        if (index === -1) {
            return false;
        }
        const earlierTick = TransitionViewport.getTick(earlierViewportHooks, index);
        index = laterViewportHooks.findIndex(item => item && item.endsWith(check));
        if (index === -1) {
            return false;
        }
        const laterTick = TransitionViewport.getTick(laterViewportHooks, index);
        if (earlierTick > laterTick) {
            // TODO: Might want to find previous blank first
            const insert = new Array(earlierTick - laterTick + 1).fill('');
            laterViewportHooks.splice(index, 0, ...insert);
            return true;
        }
        return false;
    }
    constructor(transition, isTop) {
        this.transition = transition;
        this.isTop = isTop;
        this.hooks = [];
        this.canUnload = true;
        this.canLoad = true;
        this.unloading = true;
        this.loading = true;
        this.deactivate = true;
        if (transition.from.isEmpty) {
            this.canUnload = false;
            this.unloading = false;
            this.deactivate = false;
        }
        if (transition.to.isEmpty) {
            this.canLoad = false;
            this.loading = false;
        }
    }
    get from() {
        return this.transition.from;
    }
    get to() {
        return this.transition.to;
    }
    get isAdd() {
        return !this.to.isEmpty;
    }
    get isRemove() {
        return !this.from.isEmpty;
    }
    // Get and remove the hooks so far, but keep the final blanks/ticks
    retrieveHooks() {
        let lastNonBlank = this.hooks.length - 1;
        while (this.hooks[lastNonBlank] === '' && lastNonBlank >= 0) {
            lastNonBlank--;
        }
        lastNonBlank = lastNonBlank < 0 ? this.hooks.length : lastNonBlank + 1;
        return this.hooks.splice(0, lastNonBlank);
    }
    // public setRoutingHooks(deferUntil: DeferralJuncture, swapStrategy: SwapStrategy, componentKind: 'all-sync' | 'all-async', phase: string, hook, transitions) {
    //   const hooks = getInitialViewports(transitions);
    //   switch (hook) {
    //     case 'canUnload':
    //       for (let i = transitions.length - 1; i >= 0; i--) {
    //         const { from } = transitions[i];
    //         const j = transitions.length - 1 - i;
    //         if (!from.isEmpty) {
    //           hooks[j].hooks.push(...getPrepended(phase, from.name, ...from.getTimed(hook)));
    //         }
    //       }
    //       break;
    //     case 'unloading':
    //       if (deferUntil === 'load-hooks') {
    //         for (let i = transitions.length - 1; i >= 0; i--) {
    //           const { from } = transitions[i];
    //           const j = transitions.length - 1 - i;
    //           if (!from.isEmpty) {
    //             hooks[j].hooks.push(...getPrepended(phase, from.name, ...from.getTimed(hook)));
    //           }
    //         }
    //       }
    //       break;
    //     case 'canLoad':
    //       {
    //         const len = deferUntil === 'guard-hooks' || deferUntil === 'load-hooks' ? transitions.length : 1;
    //         for (let i = 0; i < len; i++) {
    //           const { to } = transitions[i];
    //           if (!to.isEmpty) {
    //             hooks[0].hooks.push(...getPrepended(phase, to.name, ...to.getTimed(hook)));
    //           }
    //         }
    //       }
    //       break;
    //     case 'loading':
    //       {
    //         const len = deferUntil === 'load-hooks' ? transitions.length : 1;
    //         for (let i = 0; i < len; i++) {
    //           const { to } = transitions[i];
    //           if (!to.isEmpty) {
    //             hooks[0].hooks.push(...getPrepended(phase, to.name, ...to.getTimed(hook)));
    //           }
    //         }
    //       }
    //       break;
    //   }
    //   return hooks;
    // }
    // Set the appropriate routing hooks either during the routing step or the lifecycle step
    setRoutingHooks(deferUntil, phase, routingStep, topViewport, removeViewports) {
        // canUnload is always known and where it starts so it's always added
        if (routingStep && this.canUnload) {
            if (this.isTop) {
                // TransitionViewport.setRemoveHooks(deferUntil, phase, 'canUnload', false, topViewport, removeViewports);
                TransitionViewport.getRemoveHooks(deferUntil, phase, 'canUnload', topViewport, removeViewports).forEach(hooks => this.hooks.push(...hooks));
            }
            this.canUnload = false;
        }
        if (!routingStep || deferUntil === 'guard-hooks' || deferUntil === 'load-hooks' && this.canLoad) {
            this.setRoutingHook(phase, 'canLoad');
            if (deferUntil === 'guard-hooks' || deferUntil === 'load-hooks') {
                this.hooks.push('');
            }
            this.canLoad = false;
        }
        if (!routingStep || deferUntil === 'load-hooks' && this.unloading) {
            //   if (deferUntil === 'guard-hooks') {
            //     this.setRoutingHook(phase, 'unloading');
            //     this.hooks.push('');
            // } else {
            if (this.isTop) {
                // TransitionViewport.setRemoveHooks(deferUntil, phase, 'unloading', false, topViewport, removeViewports);
                TransitionViewport.getRemoveHooks(deferUntil, phase, 'unloading', topViewport, removeViewports).forEach(hooks => this.hooks.push(...hooks));
            }
            // }
            this.unloading = false;
        }
        if (!routingStep || deferUntil === 'load-hooks' && this.loading) {
            this.setRoutingHook(phase, 'loading');
            if (deferUntil === 'load-hooks') {
                this.hooks.push('');
            }
            this.loading = false;
        }
    }
    // Set the remaining routing hooks and the lifecycle hooks
    setLifecycleHooks(deferUntil, swapStrategy, phase, topViewport, removeViewports) {
        const { from, to } = this.transition;
        // Set the remaining routing hooks
        this.setRoutingHooks(deferUntil, phase, false, topViewport, removeViewports);
        switch (swapStrategy) {
            case 'parallel-remove-first':
                {
                    const hooks = [];
                    if (!from.isEmpty && this.isTop) {
                        // hooks.push(...TransitionViewport.getRemoveHooks(deferUntil, phase, 'deactivate', topViewport, removeViewports));
                        hooks.push(...TransitionViewport.getDeactivateHooks(phase, topViewport, removeViewports));
                    }
                    if (!to.isEmpty) {
                        hooks.push(TransitionViewport.getPrepended(phase, to.name, ...to.getTimed(...TransitionViewport.addHooks)));
                    }
                    this.hooks.push(...TransitionViewport.getInterweaved(...hooks));
                }
                break;
            case 'sequential-add-first':
                // this.hooks.push(...getInterweaved(
                //   to ? getPrepended(phase, to.name, ...to.getTimed(...addHooks)) : [],
                //   from ? getPrepended(phase, from.name, ...from.getTimed(...removeHooks)) : [],
                // ));
                if (!to.isEmpty) {
                    this.hooks.push(...TransitionViewport.getPrepended(phase, to.name, ...to.getTimed(...TransitionViewport.addHooks)));
                }
                // if (!from.isEmpty) { this.hooks.push(...TransitionViewport.getPrepended(phase, from.name, ...from.getTimed(...TransitionViewport.removeHooks))); }
                if (!from.isEmpty && this.isTop) {
                    // TransitionViewport.getRemoveHooks(deferUntil, phase, 'deactivate', topViewport, removeViewports).forEach(hooks => this.hooks.push(...hooks));
                    TransitionViewport.getDeactivateHooks(phase, topViewport, removeViewports).forEach(hooks => this.hooks.push(...hooks));
                }
                break;
            case 'sequential-remove-first':
                // if (!from.isEmpty) { this.hooks.push(...TransitionViewport.getPrepended(phase, from.name, ...from.getTimed(...TransitionViewport.removeHooks))); }
                if (!from.isEmpty && this.isTop) {
                    // TransitionViewport.getRemoveHooks(deferUntil, phase, 'deactivate', topViewport, removeViewports).forEach(hooks => this.hooks.push(...hooks));
                    TransitionViewport.getDeactivateHooks(phase, topViewport, removeViewports).forEach(hooks => this.hooks.push(...hooks));
                }
                if (!to.isEmpty) {
                    this.hooks.push(...TransitionViewport.getPrepended(phase, to.name, ...to.getTimed(...TransitionViewport.addHooks)));
                }
                break;
        }
    }
    setRoutingHook(phase, hook, onlyDelay = false) {
        if (this[hook]) {
            const component = hook === 'canUnload' || hook === 'unloading' ? this.from : this.to;
            const hooks = TransitionViewport.getPrepended(phase, component.name, ...component.getTimed(hook));
            if (onlyDelay) {
                this.hooks.push('', ...hooks.slice(1));
            }
            else {
                this.hooks.push(...hooks);
            }
            this[hook] = false;
            return hooks;
        }
        return [];
    }
    setDeactivateHook(phase, onlyDelay = false) {
        if (this.deactivate) {
            const { from } = this;
            const hooks = TransitionViewport.getPrepended(phase, from.name, ...from.getTimed(...TransitionViewport.removeHooks));
            if (onlyDelay) {
                this.hooks.push(...(new Array(hooks.length).fill('')));
            }
            else {
                this.hooks.push(...hooks);
            }
            this.deactivate = false;
            return hooks;
        }
        return [];
    }
    static getRemoveHooks(deferUntil, phase, hook, topViewport, removeViewports) {
        const viewportHooks = [];
        if (topViewport === void 0) {
            return [];
        }
        for (const viewport of removeViewports) {
            if (viewport === void 0) {
                continue;
            }
            let prevLen;
            // If it's the top viewport, it'll get hooks added so note original length...
            if (viewport.isTop) {
                prevLen = viewport.hooks.length;
            }
            viewportHooks.push(hook === 'deactivate'
                ? viewport.setDeactivateHook(phase, !viewport.isTop)
                : viewport.setRoutingHook(phase, hook, !viewport.isTop));
            // ...and remove the added hooks
            if (viewport.isTop) {
                viewport.hooks.splice(prevLen);
            }
        }
        // The deactivate hooks are syncing on slowest hook
        // if (hook === 'deactivate') {
        // }
        if ((hook === 'canUnload' && deferUntil === 'guard-hooks') || deferUntil === 'load-hooks') {
            viewportHooks.push(['']);
        }
        return viewportHooks;
    }
    static getDeactivateHooks(phase, topViewport, removeViewports) {
        const deactivateHooks = [...TransitionViewport.removeHooks];
        const dispose = deactivateHooks.pop();
        const viewportHooks = [];
        if (topViewport === void 0) {
            return [];
        }
        for (const hook of deactivateHooks) {
            const maxTiming = Math.max(...removeViewports.map(viewport => viewport.from.getTiming(hook)));
            for (const viewport of removeViewports) {
                const { from } = viewport;
                viewportHooks.push(...TransitionViewport.getPrepended(phase, from.name, hook));
            }
            viewportHooks.push(...Array(removeViewports.length + ((maxTiming + 1) * removeViewports.length)).fill(''));
        }
        for (let i = removeViewports.length - 1; i >= 0; i--) {
            const { from } = removeViewports[i];
            viewportHooks.push(...TransitionViewport.getPrepended(phase, from.name, dispose));
        }
        return [viewportHooks];
    }
    static ensureConfiguredHookOrder(deferUntil, viewports, removeViewports, addViewports) {
        let delayed = false;
        delayed = TransitionViewport.delayHooks(viewports, 'canUnload', 'canLoad') || delayed;
        delayed = TransitionViewport.delayHooks(viewports, 'canUnload', 'unloading') || delayed;
        delayed = TransitionViewport.delayHooks(viewports, 'canUnload', 'loading') || delayed;
        // for (let i = 0; i <= removeViewports.length - 2; i++) {
        //   if (delayHooks(removeViewports, `${removeViewports[i].from.name}.canUnload`, `${removeViewports[i + 1].from.name}.canUnload`)) {
        //     delayed = true;
        //     // console.log('delaying canUnload', removeViewports[i].from.name, removeViewports);
        //   }
        // }
        if (deferUntil === 'guard-hooks' || deferUntil === 'load-hooks') {
            delayed = TransitionViewport.delayHooks(viewports, 'canLoad', 'unloading') || delayed;
            delayed = TransitionViewport.delayHooks(viewports, 'canLoad', 'loading') || delayed;
            for (let i = 0; i <= addViewports.length - 2; i++) {
                delayed = TransitionViewport.delayHook(addViewports[i], addViewports[i + 1], 'canLoad') || delayed;
            }
        }
        if (deferUntil === 'load-hooks') {
            delayed = TransitionViewport.delayHooks(viewports, 'unloading', 'loading') || delayed;
            // for (let i = 0; i <= removeViewports.length - 2; i++) {
            //   if (delayHooks(removeViewports, `${removeViewports[i].from.name}.unloading`, `${removeViewports[i + 1].from.name}.unloading`)) {
            //     // console.log('delaying unload', removeViewports[i].from.name, removeViewports);
            //   }
            // }
            for (let i = 0; i <= addViewports.length - 2; i++) {
                delayed = TransitionViewport.delayHook(addViewports[i], addViewports[i + 1], 'loading') || delayed;
            }
            for (let i = 0; i <= addViewports.length - 2; i++) {
                delayed = TransitionViewport.delayHook(addViewports[i], addViewports[i + 1], 'binding') || delayed;
            }
        }
        return delayed;
    }
    static ensureViewportHookOrder(removeViewports, addViewports) {
        const minLength = Math.min(removeViewports.length, addViewports.length);
        let delayed = false;
        // Start at 1 and -2 since first viewport is (if applicable) both add and remove and don't need processing
        for (let i = 1, j = removeViewports.length - 2; i < minLength; i++, j--) {
            delayed = TransitionViewport.delayHooks([removeViewports[j], addViewports[i]], 'canUnload', 'canLoad') || delayed;
            delayed = TransitionViewport.delayHooks([removeViewports[j], addViewports[i]], 'canLoad', 'unloading') || delayed;
            delayed = TransitionViewport.delayHooks([removeViewports[j], addViewports[i]], 'unloading', 'loading') || delayed;
        }
        return delayed;
    }
    static delayHooks(viewports, check, delay) {
        check = `.${check}`;
        delay = `.${delay}`;
        let delayed = false;
        const viewportHooks = viewports[0] instanceof TransitionViewport
            ? viewports.filter(viewport => viewport !== void 0).map(viewport => viewport.hooks)
            : viewports;
        let highestTick = -Infinity;
        for (const hooks of viewportHooks) {
            const index = TransitionViewport.findLastIndex(hooks, item => item !== void 0 && item.endsWith(check));
            if (index === -1) {
                continue;
            }
            const tick = TransitionViewport.getTick(hooks, index);
            if (tick > highestTick) {
                highestTick = tick;
            }
        }
        if (highestTick === -Infinity) {
            return;
        }
        for (const hooks of viewportHooks) {
            const index = hooks.findIndex(item => item && item.endsWith(delay));
            if (index === -1) {
                continue;
            }
            const tick = TransitionViewport.getTick(hooks, index);
            if (highestTick >= tick) {
                // TODO: Might want to find previous blank first
                const insert = new Array(highestTick - tick + 1).fill('');
                hooks.splice(index, 0, ...insert);
                delayed = true;
            }
        }
        return delayed;
    }
    static findLastIndex(arr, check) {
        const reverse = [...arr];
        reverse.reverse();
        const index = reverse.findIndex(check);
        return index >= 0 ? reverse.length - index - 1 : -1;
    }
    static getTick(arr, index) {
        let tick = 0;
        for (let i = 0; i < index - 1; i++) {
            tick++;
            while (arr[i] && arr[i + 1] && i < index - 1) {
                i++;
            }
        }
        return tick;
    }
}
TransitionViewport.routingHooks = ['canUnload', 'canLoad', 'unloading', 'loading'];
TransitionViewport.addHooks = ['binding', 'bound', 'attaching', 'attached'];
TransitionViewport.removeHooks = ['detaching', 'unbinding', 'dispose'];
//# sourceMappingURL=transition-viewport.js.map