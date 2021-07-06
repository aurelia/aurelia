// No-fallthrough disabled due to large numbers of false positives
/* eslint-disable no-fallthrough */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ILogger, onResolve } from '../../../kernel/dist/native-modules/index.js';
import { Controller } from '../../../runtime-html/dist/native-modules/index.js';
import { processResidue, getDynamicChildren } from './route-tree.js';
import { Batch, mergeDistinct } from './util.js';
export class ViewportRequest {
    constructor(viewportName, componentName, resolution, append) {
        this.viewportName = viewportName;
        this.componentName = componentName;
        this.resolution = resolution;
        this.append = append;
    }
    static create(input) {
        return new ViewportRequest(input.viewportName, input.componentName, input.resolution, input.append);
    }
    toString() {
        return `VR(viewport:'${this.viewportName}',component:'${this.componentName}',resolution:'${this.resolution}',append:${this.append})`;
    }
}
const viewportAgentLookup = new WeakMap();
export class ViewportAgent {
    constructor(viewport, hostController, ctx) {
        this.viewport = viewport;
        this.hostController = hostController;
        this.ctx = ctx;
        this.isActive = false;
        this.curCA = null;
        this.nextCA = null;
        this.state = 8256 /* bothAreEmpty */;
        this.$resolution = 'dynamic';
        this.$plan = 'replace';
        this.currNode = null;
        this.nextNode = null;
        this.currTransition = null;
        this.prevTransition = null;
        this.logger = ctx.container.get(ILogger).scopeTo(`ViewportAgent<${ctx.friendlyPath}>`);
        this.logger.trace(`constructor()`);
    }
    get $state() { return $state(this.state); }
    get currState() { return this.state & 16256 /* curr */; }
    set currState(state) { this.state = (this.state & 127 /* next */) | state; }
    get nextState() { return this.state & 127 /* next */; }
    set nextState(state) { this.state = (this.state & 16256 /* curr */) | state; }
    static for(viewport, ctx) {
        let viewportAgent = viewportAgentLookup.get(viewport);
        if (viewportAgent === void 0) {
            const controller = Controller.getCachedOrThrow(viewport);
            viewportAgentLookup.set(viewport, viewportAgent = new ViewportAgent(viewport, controller, ctx));
        }
        return viewportAgent;
    }
    activateFromViewport(initiator, parent, flags) {
        const tr = this.currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this.isActive = true;
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
                switch (this.currState) {
                    case 8192 /* currIsEmpty */:
                        this.logger.trace(`activateFromViewport() - nothing to activate at %s`, this);
                        return;
                    case 4096 /* currIsActive */:
                        this.logger.trace(`activateFromViewport() - activating existing componentAgent at %s`, this);
                        return this.curCA.activate(initiator, parent, flags);
                    default:
                        this.unexpectedState('activateFromViewport 1');
                }
            case 2 /* nextLoadDone */: {
                if (this.currTransition === null) {
                    throw new Error(`Unexpected viewport activation outside of a transition context at ${this}`);
                }
                if (this.$resolution !== 'static') {
                    throw new Error(`Unexpected viewport activation at ${this}`);
                }
                this.logger.trace(`activateFromViewport() - running ordinary activate at %s`, this);
                const b = Batch.start(b1 => { this.activate(initiator, this.currTransition, b1); });
                const p = new Promise(resolve => { b.continueWith(() => { resolve(); }); });
                return b.start().done ? void 0 : p;
            }
            default:
                this.unexpectedState('activateFromViewport 2');
        }
    }
    deactivateFromViewport(initiator, parent, flags) {
        const tr = this.currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this.isActive = false;
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
                this.logger.trace(`deactivateFromViewport() - nothing to deactivate at %s`, this);
                return;
            case 4096 /* currIsActive */:
                this.logger.trace(`deactivateFromViewport() - deactivating existing componentAgent at %s`, this);
                return this.curCA.deactivate(initiator, parent, flags);
            case 128 /* currDeactivate */:
                // This will happen with bottom-up deactivation because the child is already deactivated, the parent
                // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
                // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
                this.logger.trace(`deactivateFromViewport() - already deactivating at %s`, this);
                return;
            default: {
                if (this.currTransition === null) {
                    throw new Error(`Unexpected viewport deactivation outside of a transition context at ${this}`);
                }
                this.logger.trace(`deactivateFromViewport() - running ordinary deactivate at %s`, this);
                const b = Batch.start(b1 => { this.deactivate(initiator, this.currTransition, b1); });
                const p = new Promise(resolve => { b.continueWith(() => { resolve(); }); });
                return b.start().done ? void 0 : p;
            }
        }
    }
    handles(req) {
        if (!this.isAvailable(req.resolution)) {
            return false;
        }
        if (req.append && this.currState === 4096 /* currIsActive */) {
            this.logger.trace(`handles(req:%s) -> false (append mode, viewport already has content %s)`, req, this.curCA);
            return false;
        }
        if (req.viewportName.length > 0 && this.viewport.name !== req.viewportName) {
            this.logger.trace(`handles(req:%s) -> false (names don't match)`, req);
            return false;
        }
        if (this.viewport.usedBy.length > 0 && !this.viewport.usedBy.split(',').includes(req.componentName)) {
            this.logger.trace(`handles(req:%s) -> false (componentName not included in usedBy)`, req);
            return false;
        }
        this.logger.trace(`handles(req:%s) -> true`, req);
        return true;
    }
    isAvailable(resolution) {
        if (resolution === 'dynamic' && !this.isActive) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (viewport is not active and we're in dynamic resolution resolution)`, resolution);
            return false;
        }
        if (this.nextState !== 64 /* nextIsEmpty */) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (update already scheduled for %s)`, resolution, this.nextNode);
            return false;
        }
        return true;
    }
    canUnload(tr, b) {
        if (this.currTransition === null) {
            this.currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b.push();
        // run canUnload bottom-up
        Batch.start(b1 => {
            this.logger.trace(`canUnload() - invoking on children at %s`, this);
            for (const node of this.currNode.children) {
                node.context.vpa.canUnload(tr, b1);
            }
        }).continueWith(b1 => {
            switch (this.currState) {
                case 4096 /* currIsActive */:
                    this.logger.trace(`canUnload() - invoking on existing component at %s`, this);
                    switch (this.$plan) {
                        case 'none':
                            this.currState = 1024 /* currCanUnloadDone */;
                            return;
                        case 'invoke-lifecycles':
                        case 'replace':
                            this.currState = 2048 /* currCanUnload */;
                            b1.push();
                            Batch.start(b2 => {
                                this.logger.trace(`canUnload() - finished invoking on children, now invoking on own component at %s`, this);
                                this.curCA.canUnload(tr, this.nextNode, b2);
                            }).continueWith(() => {
                                this.logger.trace(`canUnload() - finished at %s`, this);
                                this.currState = 1024 /* currCanUnloadDone */;
                                b1.pop();
                            }).start();
                            return;
                    }
                case 8192 /* currIsEmpty */:
                    this.logger.trace(`canUnload() - nothing to unload at %s`, this);
                    return;
                default:
                    tr.handleError(new Error(`Unexpected state at canUnload of ${this}`));
            }
        }).continueWith(() => {
            b.pop();
        }).start();
    }
    canLoad(tr, b) {
        if (this.currTransition === null) {
            this.currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b.push();
        // run canLoad top-down
        Batch.start(b1 => {
            switch (this.nextState) {
                case 32 /* nextIsScheduled */:
                    this.logger.trace(`canLoad() - invoking on new component at %s`, this);
                    this.nextState = 16 /* nextCanLoad */;
                    switch (this.$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this.curCA.canLoad(tr, this.nextNode, b1);
                        case 'replace':
                            this.nextCA = this.nextNode.context.createComponentAgent(this.hostController, this.nextNode);
                            return this.nextCA.canLoad(tr, this.nextNode, b1);
                    }
                case 64 /* nextIsEmpty */:
                    this.logger.trace(`canLoad() - nothing to load at %s`, this);
                    return;
                default:
                    this.unexpectedState('canLoad');
            }
        }).continueWith(b1 => {
            const next = this.nextNode;
            switch (this.$plan) {
                case 'none':
                case 'invoke-lifecycles':
                    this.logger.trace(`canLoad(next:%s) - plan set to '%s', compiling residue`, next, this.$plan);
                    // These plans can only occur if there is already a current component active in this viewport,
                    // and it is the same component as `next`.
                    // This means the RouteContext of `next` was created during a previous transition and might contain
                    // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
                    // first pass of activation, instead of lazily in a later pass after `processResidue`.
                    // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
                    // their target viewports have the appropriate updates scheduled.
                    b1.push();
                    void onResolve(processResidue(next), () => {
                        b1.pop();
                    });
                    return;
                case 'replace':
                    // In the case of 'replace', always process this node and its subtree as if it's a new one
                    switch (this.$resolution) {
                        case 'dynamic':
                            // Residue compilation will happen at `ViewportAgent#processResidue`
                            this.logger.trace(`canLoad(next:%s) - (resolution: 'dynamic'), delaying residue compilation until activate`, next, this.$plan);
                            return;
                        case 'static':
                            this.logger.trace(`canLoad(next:%s) - (resolution: '${this.$resolution}'), creating nextCA and compiling residue`, next, this.$plan);
                            b1.push();
                            void onResolve(processResidue(next), () => {
                                b1.pop();
                            });
                            return;
                    }
            }
        }).continueWith(b1 => {
            switch (this.nextState) {
                case 16 /* nextCanLoad */:
                    this.logger.trace(`canLoad() - finished own component, now invoking on children at %s`, this);
                    this.nextState = 8 /* nextCanLoadDone */;
                    for (const node of this.nextNode.children) {
                        node.context.vpa.canLoad(tr, b1);
                    }
                    return;
                case 64 /* nextIsEmpty */:
                    return;
                default:
                    this.unexpectedState('canLoad');
            }
        }).continueWith(() => {
            this.logger.trace(`canLoad() - finished at %s`, this);
            b.pop();
        }).start();
    }
    unload(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        // run unload bottom-up
        Batch.start(b1 => {
            this.logger.trace(`unload() - invoking on children at %s`, this);
            for (const node of this.currNode.children) {
                node.context.vpa.unload(tr, b1);
            }
        }).continueWith(b1 => {
            switch (this.currState) {
                case 1024 /* currCanUnloadDone */:
                    this.logger.trace(`unload() - invoking on existing component at %s`, this);
                    switch (this.$plan) {
                        case 'none':
                            this.currState = 256 /* currUnloadDone */;
                            return;
                        case 'invoke-lifecycles':
                        case 'replace':
                            this.currState = 512 /* currUnload */;
                            b1.push();
                            Batch.start(b2 => {
                                this.logger.trace(`unload() - finished invoking on children, now invoking on own component at %s`, this);
                                this.curCA.unload(tr, this.nextNode, b2);
                            }).continueWith(() => {
                                this.logger.trace(`unload() - finished at %s`, this);
                                this.currState = 256 /* currUnloadDone */;
                                b1.pop();
                            }).start();
                            return;
                    }
                case 8192 /* currIsEmpty */:
                    this.logger.trace(`unload() - nothing to unload at %s`, this);
                    for (const node of this.currNode.children) {
                        node.context.vpa.unload(tr, b);
                    }
                    return;
                default:
                    this.unexpectedState('unload');
            }
        }).continueWith(() => {
            b.pop();
        }).start();
    }
    load(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        // run load top-down
        Batch.start(b1 => {
            switch (this.nextState) {
                case 8 /* nextCanLoadDone */: {
                    this.logger.trace(`load() - invoking on new component at %s`, this);
                    this.nextState = 4 /* nextLoad */;
                    switch (this.$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this.curCA.load(tr, this.nextNode, b1);
                        case 'replace':
                            return this.nextCA.load(tr, this.nextNode, b1);
                    }
                }
                case 64 /* nextIsEmpty */:
                    this.logger.trace(`load() - nothing to load at %s`, this);
                    return;
                default:
                    this.unexpectedState('load');
            }
        }).continueWith(b1 => {
            switch (this.nextState) {
                case 4 /* nextLoad */:
                    this.logger.trace(`load() - finished own component, now invoking on children at %s`, this);
                    this.nextState = 2 /* nextLoadDone */;
                    for (const node of this.nextNode.children) {
                        node.context.vpa.load(tr, b1);
                    }
                    return;
                case 64 /* nextIsEmpty */:
                    return;
                default:
                    this.unexpectedState('load');
            }
        }).continueWith(() => {
            this.logger.trace(`load() - finished at %s`, this);
            b.pop();
        }).start();
    }
    deactivate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        switch (this.currState) {
            case 256 /* currUnloadDone */:
                this.logger.trace(`deactivate() - invoking on existing component at %s`, this);
                this.currState = 128 /* currDeactivate */;
                switch (this.$plan) {
                    case 'none':
                    case 'invoke-lifecycles':
                        b.pop();
                        return;
                    case 'replace': {
                        const controller = this.hostController;
                        const deactivateFlags = this.viewport.stateful ? 0 /* none */ : 32 /* dispose */;
                        tr.run(() => {
                            return this.curCA.deactivate(initiator, controller, deactivateFlags);
                        }, () => {
                            b.pop();
                        });
                    }
                }
                return;
            case 8192 /* currIsEmpty */:
                this.logger.trace(`deactivate() - nothing to deactivate at %s`, this);
                b.pop();
                return;
            case 128 /* currDeactivate */:
                this.logger.trace(`deactivate() - already deactivating at %s`, this);
                b.pop();
                return;
            default:
                this.unexpectedState('deactivate');
        }
    }
    activate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        if (this.nextState === 32 /* nextIsScheduled */ &&
            this.$resolution === 'dynamic') {
            this.logger.trace(`activate() - invoking canLoad(), load() and activate() on new component due to resolution 'dynamic' at %s`, this);
            // This is the default v2 mode "lazy loading" situation
            Batch.start(b1 => {
                this.canLoad(tr, b1);
            }).continueWith(b1 => {
                this.load(tr, b1);
            }).continueWith(b1 => {
                this.activate(initiator, tr, b1);
            }).continueWith(() => {
                b.pop();
            }).start();
            return;
        }
        switch (this.nextState) {
            case 2 /* nextLoadDone */:
                this.logger.trace(`activate() - invoking on existing component at %s`, this);
                this.nextState = 1 /* nextActivate */;
                // run activate top-down
                Batch.start(b1 => {
                    switch (this.$plan) {
                        case 'none':
                        case 'invoke-lifecycles':
                            return;
                        case 'replace': {
                            const controller = this.hostController;
                            const activateFlags = 0 /* none */;
                            tr.run(() => {
                                b1.push();
                                return this.nextCA.activate(initiator, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }
                    }
                }).continueWith(b1 => {
                    this.processDynamicChildren(tr, b1);
                }).continueWith(() => {
                    b.pop();
                }).start();
                return;
            case 64 /* nextIsEmpty */:
                this.logger.trace(`activate() - nothing to activate at %s`, this);
                b.pop();
                return;
            default:
                this.unexpectedState('activate');
        }
    }
    swap(tr, b) {
        if (this.currState === 8192 /* currIsEmpty */) {
            this.logger.trace(`swap() - running activate on next instead, because there is nothing to deactivate at %s`, this);
            this.activate(null, tr, b);
            return;
        }
        if (this.nextState === 64 /* nextIsEmpty */) {
            this.logger.trace(`swap() - running deactivate on current instead, because there is nothing to activate at %s`, this);
            this.deactivate(null, tr, b);
            return;
        }
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        if (!(this.currState === 256 /* currUnloadDone */ &&
            this.nextState === 2 /* nextLoadDone */)) {
            this.unexpectedState('swap');
        }
        this.currState = 128 /* currDeactivate */;
        this.nextState = 1 /* nextActivate */;
        switch (this.$plan) {
            case 'none':
            case 'invoke-lifecycles': {
                this.logger.trace(`swap() - skipping this level and swapping children instead at %s`, this);
                const nodes = mergeDistinct(this.nextNode.children, this.currNode.children);
                for (const node of nodes) {
                    node.context.vpa.swap(tr, b);
                }
                return;
            }
            case 'replace': {
                this.logger.trace(`swap() - running normally at %s`, this);
                const controller = this.hostController;
                const curCA = this.curCA;
                const nextCA = this.nextCA;
                const deactivateFlags = this.viewport.stateful ? 0 /* none */ : 32 /* dispose */;
                const activateFlags = 0 /* none */;
                b.push();
                switch (tr.options.swapStrategy) {
                    case 'sequential-add-first':
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            tr.run(() => {
                                return curCA.deactivate(null, controller, deactivateFlags);
                            }, () => {
                                b.pop();
                            });
                        }).start();
                        return;
                    case 'sequential-remove-first':
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return curCA.deactivate(null, controller, deactivateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            b.pop();
                        }).start();
                        return;
                    case 'parallel-remove-first':
                        tr.run(() => {
                            b.push();
                            return curCA.deactivate(null, controller, deactivateFlags);
                        }, () => {
                            b.pop();
                        });
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            b.pop();
                        }).start();
                        return;
                }
            }
        }
    }
    processDynamicChildren(tr, b) {
        this.logger.trace(`processDynamicChildren() - %s`, this);
        const next = this.nextNode;
        tr.run(() => {
            b.push();
            return getDynamicChildren(next);
        }, newChildren => {
            Batch.start(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.canLoad(tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.load(tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.activate(null, tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(() => {
                b.pop();
            }).start();
        });
    }
    scheduleUpdate(options, next) {
        var _a, _b;
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
                this.nextNode = next;
                this.nextState = 32 /* nextIsScheduled */;
                this.$resolution = options.resolutionMode;
                break;
            default:
                this.unexpectedState('scheduleUpdate 1');
        }
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
            case 4096 /* currIsActive */:
            case 1024 /* currCanUnloadDone */:
                break;
            default:
                this.unexpectedState('scheduleUpdate 2');
        }
        const cur = (_b = (_a = this.curCA) === null || _a === void 0 ? void 0 : _a.routeNode) !== null && _b !== void 0 ? _b : null;
        if (cur === null || cur.component !== next.component) {
            // Component changed (or is cleared), so set to 'replace'
            this.$plan = 'replace';
        }
        else {
            // Component is the same, so determine plan based on config and/or convention
            const plan = next.context.definition.config.transitionPlan;
            if (typeof plan === 'function') {
                this.$plan = plan(cur, next);
            }
            else {
                this.$plan = plan;
            }
        }
        this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s'`, next, this.$plan);
    }
    cancelUpdate() {
        if (this.currNode !== null) {
            this.currNode.children.forEach(function (node) {
                node.context.vpa.cancelUpdate();
            });
        }
        if (this.nextNode !== null) {
            this.nextNode.children.forEach(function (node) {
                node.context.vpa.cancelUpdate();
            });
        }
        this.logger.trace(`cancelUpdate(nextNode:%s)`, this.nextNode);
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
            case 4096 /* currIsActive */:
                break;
            case 2048 /* currCanUnload */:
            case 1024 /* currCanUnloadDone */:
                this.currState = 4096 /* currIsActive */;
                break;
            case 512 /* currUnload */:
            case 128 /* currDeactivate */:
                // TODO: should schedule an 'undo' action
                break;
        }
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
            case 32 /* nextIsScheduled */:
            case 16 /* nextCanLoad */:
            case 8 /* nextCanLoadDone */:
                this.nextNode = null;
                this.nextState = 64 /* nextIsEmpty */;
                break;
            case 4 /* nextLoad */:
            case 1 /* nextActivate */:
                // TODO: should schedule an 'undo' action
                break;
        }
    }
    endTransition() {
        if (this.currNode !== null) {
            this.currNode.children.forEach(function (node) {
                node.context.vpa.endTransition();
            });
        }
        if (this.nextNode !== null) {
            this.nextNode.children.forEach(function (node) {
                node.context.vpa.endTransition();
            });
        }
        if (this.currTransition !== null) {
            ensureTransitionHasNotErrored(this.currTransition);
            switch (this.nextState) {
                case 64 /* nextIsEmpty */:
                    switch (this.currState) {
                        case 128 /* currDeactivate */:
                            this.logger.trace(`endTransition() - setting currState to State.nextIsEmpty at %s`, this);
                            this.currState = 8192 /* currIsEmpty */;
                            this.curCA = null;
                            break;
                        default:
                            this.unexpectedState('endTransition 1');
                    }
                    break;
                case 1 /* nextActivate */:
                    switch (this.currState) {
                        case 8192 /* currIsEmpty */:
                        case 128 /* currDeactivate */:
                            switch (this.$plan) {
                                case 'none':
                                case 'invoke-lifecycles':
                                    this.logger.trace(`endTransition() - setting currState to State.currIsActive at %s`, this);
                                    this.currState = 4096 /* currIsActive */;
                                    break;
                                case 'replace':
                                    this.logger.trace(`endTransition() - setting currState to State.currIsActive and reassigning curCA at %s`, this);
                                    this.currState = 4096 /* currIsActive */;
                                    this.curCA = this.nextCA;
                                    break;
                            }
                            this.currNode = this.nextNode;
                            break;
                        default:
                            this.unexpectedState('endTransition 2');
                    }
                    break;
                default:
                    this.unexpectedState('endTransition 3');
            }
            this.$plan = 'replace';
            this.nextState = 64 /* nextIsEmpty */;
            this.nextNode = null;
            this.nextCA = null;
            this.prevTransition = this.currTransition;
            this.currTransition = null;
        }
    }
    toString() {
        return `VPA(state:${this.$state},plan:'${this.$plan}',resolution:'${this.$resolution}',n:${this.nextNode},c:${this.currNode},viewport:${this.viewport})`;
    }
    dispose() {
        var _a;
        if (this.viewport.stateful /* TODO: incorporate statefulHistoryLength / router opts as well */) {
            this.logger.trace(`dispose() - not disposing stateful viewport at %s`, this);
        }
        else {
            this.logger.trace(`dispose() - disposing %s`, this);
            (_a = this.curCA) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    }
    unexpectedState(label) {
        throw new Error(`Unexpected state at ${label} of ${this}`);
    }
}
function ensureGuardsResultIsTrue(vpa, tr) {
    if (tr.guardsResult !== true) {
        throw new Error(`Unexpected guardsResult ${tr.guardsResult} at ${vpa}`);
    }
}
function ensureTransitionHasNotErrored(tr) {
    if (tr.error !== void 0) {
        throw tr.error;
    }
}
var State;
(function (State) {
    State[State["curr"] = 16256] = "curr";
    State[State["currIsEmpty"] = 8192] = "currIsEmpty";
    State[State["currIsActive"] = 4096] = "currIsActive";
    State[State["currCanUnload"] = 2048] = "currCanUnload";
    State[State["currCanUnloadDone"] = 1024] = "currCanUnloadDone";
    State[State["currUnload"] = 512] = "currUnload";
    State[State["currUnloadDone"] = 256] = "currUnloadDone";
    State[State["currDeactivate"] = 128] = "currDeactivate";
    State[State["next"] = 127] = "next";
    State[State["nextIsEmpty"] = 64] = "nextIsEmpty";
    State[State["nextIsScheduled"] = 32] = "nextIsScheduled";
    State[State["nextCanLoad"] = 16] = "nextCanLoad";
    State[State["nextCanLoadDone"] = 8] = "nextCanLoadDone";
    State[State["nextLoad"] = 4] = "nextLoad";
    State[State["nextLoadDone"] = 2] = "nextLoadDone";
    State[State["nextActivate"] = 1] = "nextActivate";
    State[State["bothAreEmpty"] = 8256] = "bothAreEmpty";
})(State || (State = {}));
// Stringifying uses arrays and does not have a negligible cost, so cache the results to not let trace logging
// in and of its own slow things down too much.
const $stateCache = new Map();
function $state(state) {
    let str = $stateCache.get(state);
    if (str === void 0) {
        $stateCache.set(state, str = stringifyState(state));
    }
    return str;
}
function stringifyState(state) {
    const flags = [];
    if ((state & 8192 /* currIsEmpty */) === 8192 /* currIsEmpty */) {
        flags.push('currIsEmpty');
    }
    if ((state & 4096 /* currIsActive */) === 4096 /* currIsActive */) {
        flags.push('currIsActive');
    }
    if ((state & 2048 /* currCanUnload */) === 2048 /* currCanUnload */) {
        flags.push('currCanUnload');
    }
    if ((state & 1024 /* currCanUnloadDone */) === 1024 /* currCanUnloadDone */) {
        flags.push('currCanUnloadDone');
    }
    if ((state & 512 /* currUnload */) === 512 /* currUnload */) {
        flags.push('currUnload');
    }
    if ((state & 256 /* currUnloadDone */) === 256 /* currUnloadDone */) {
        flags.push('currUnloadDone');
    }
    if ((state & 128 /* currDeactivate */) === 128 /* currDeactivate */) {
        flags.push('currDeactivate');
    }
    if ((state & 64 /* nextIsEmpty */) === 64 /* nextIsEmpty */) {
        flags.push('nextIsEmpty');
    }
    if ((state & 32 /* nextIsScheduled */) === 32 /* nextIsScheduled */) {
        flags.push('nextIsScheduled');
    }
    if ((state & 16 /* nextCanLoad */) === 16 /* nextCanLoad */) {
        flags.push('nextCanLoad');
    }
    if ((state & 8 /* nextCanLoadDone */) === 8 /* nextCanLoadDone */) {
        flags.push('nextCanLoadDone');
    }
    if ((state & 4 /* nextLoad */) === 4 /* nextLoad */) {
        flags.push('nextLoad');
    }
    if ((state & 2 /* nextLoadDone */) === 2 /* nextLoadDone */) {
        flags.push('nextLoadDone');
    }
    if ((state & 1 /* nextActivate */) === 1 /* nextActivate */) {
        flags.push('nextActivate');
    }
    return flags.join('|');
}
//# sourceMappingURL=viewport-agent.js.map