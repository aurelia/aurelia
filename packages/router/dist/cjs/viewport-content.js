"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportContent = exports.ContentStatus = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const parser_js_1 = require("./parser.js");
const viewport_instruction_js_1 = require("./viewport-instruction.js");
const navigation_js_1 = require("./navigation.js");
const runner_js_1 = require("./runner.js");
const awaitable_map_js_1 = require("./awaitable-map.js");
/**
 * @internal - Shouldn't be used directly
 */
var ContentStatus;
(function (ContentStatus) {
    ContentStatus[ContentStatus["none"] = 0] = "none";
    ContentStatus[ContentStatus["created"] = 1] = "created";
    ContentStatus[ContentStatus["activated"] = 3] = "activated";
})(ContentStatus = exports.ContentStatus || (exports.ContentStatus = {}));
/**
 * @internal - Shouldn't be used directly
 */
class ViewportContent {
    constructor(
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    // public content: ViewportInstruction = new ViewportInstruction(''),
    content = viewport_instruction_js_1.ViewportInstruction.create(null, ''), instruction = new navigation_js_1.Navigation({
        instruction: '',
        fullStateInstruction: '',
    }), connectedCE = null) {
        this.content = content;
        this.instruction = instruction;
        // public contentStatus: ContentStatus = ContentStatus.none;
        this.contentStates = new awaitable_map_js_1.AwaitableMap();
        // public contentStates: Map<ContentState, undefined> = new Map();
        this.loaded = false;
        this.fromCache = false;
        this.fromHistory = false;
        this.reentry = false;
        // If we've got a container, we're good to resolve type
        if (!this.content.isComponentType() && (connectedCE?.container ?? null) !== null) {
            this.content.componentType = this.toComponentType(connectedCE.container);
        }
    }
    get componentInstance() {
        return this.content.componentInstance;
    }
    get viewport() {
        return this.content.viewport;
    }
    equalComponent(other) {
        return this.content.sameComponent(other.content);
    }
    equalParameters(other) {
        return this.content.sameComponent(other.content, true) &&
            // TODO: Review whether query is relevant
            this.instruction.query === other.instruction.query;
    }
    reentryBehavior() {
        return (this.content.componentInstance !== null &&
            'reentryBehavior' in this.content.componentInstance &&
            this.content.componentInstance.reentryBehavior !== void 0)
            ? this.content.componentInstance.reentryBehavior
            : "default" /* default */;
    }
    isCacheEqual(other) {
        return this.content.sameComponent(other.content, true);
    }
    contentController(connectedCE) {
        return runtime_html_1.Controller.forCustomElement(null, connectedCE.container, this.content.componentInstance, connectedCE.element, null, void 0);
    }
    createComponent(connectedCE, fallback) {
        // if (this.contentStatus !== ContentStatus.none) {
        if (this.contentStates.has('created')) {
            return;
        }
        // Don't load cached content or instantiated history content
        if (!this.fromCache && !this.fromHistory) {
            try {
                this.content.componentInstance = this.toComponentInstance(connectedCE.container);
            }
            catch (e) {
                if (fallback !== void 0) {
                    this.content.setParameters({ id: this.content.componentName });
                    this.content.setComponent(fallback);
                    try {
                        this.content.componentInstance = this.toComponentInstance(connectedCE.container);
                    }
                    catch (ee) {
                        throw e;
                    }
                }
                else {
                    throw e;
                }
            }
        }
        this.contentStates.set('created', void 0);
        // this.contentStatus = ContentStatus.created;
        // if (this.contentStatus !== ContentStatus.created || !this.loaded || !this.content.componentInstance) {
        // if (this.contentStatus !== ContentStatus.created || this.loaded || !this.content.componentInstance) {
        if (this.contentStates.has('loaded') || !this.content.componentInstance) {
            return;
        }
        // this.contentStatus = ContentStatus.loaded;
        // Don't load cached content or instantiated history content
        if (!this.fromCache || !this.fromHistory) {
            const controller = this.contentController(connectedCE);
            controller.parent = connectedCE.controller; // CustomElement.for(connectedCE.element)!;
        }
    }
    // public destroyComponent(): void {
    //   // TODO: We might want to do something here eventually, who knows?
    //   // if (this.contentStatus !== ContentStatus.created) {
    //   if (!this.contentStates.has('created')) {
    //     return;
    //   }
    //   // Don't destroy components when stateful
    //   // this.contentStatus = ContentStatus.none;
    //   this.contentStates.delete('created');
    // }
    canLoad(viewport, previousInstruction) {
        if (!this.contentStates.has('created') || (this.contentStates.has('guarded') && !this.reentry)) {
            return true;
        }
        this.contentStates.set('guarded', void 0);
        if (!this.content.componentInstance) {
            return false;
        }
        if (!this.content.componentInstance.canLoad) {
            return true;
        }
        const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
        this.instruction.parameters = this.content.toSpecifiedParameters(typeParameters);
        const merged = { ...parser_js_1.parseQuery(this.instruction.query), ...this.instruction.parameters };
        const result = this.content.componentInstance.canLoad(merged, this.instruction, previousInstruction);
        if (typeof result === 'boolean') {
            return result;
        }
        if (typeof result === 'string') {
            return [viewport.router.createViewportInstruction(result, viewport)];
        }
        return result;
    }
    canUnload(nextInstruction) {
        if (!this.content.componentInstance || !this.content.componentInstance.canUnload) {
            return true;
        }
        if (!this.contentStates.has('loaded')) {
            return true;
        }
        return this.content.componentInstance.canUnload(nextInstruction, this.instruction);
    }
    // public async canUnload(nextInstruction: Navigation | null): Promise<boolean> {
    //   if (!this.content.componentInstance || !this.content.componentInstance.canUnload) {
    //     return true;
    //   }
    //   const result = this.content.componentInstance.canUnload(nextInstruction, this.instruction);
    //   if (typeof result === 'boolean') {
    //     return result;
    //   }
    //   return result;
    // }
    load(previousInstruction) {
        // if (!this.reentry && (this.contentStatus !== ContentStatus.created || this.loaded)) {
        // if (!this.reentry && this.loaded) {
        // if (!this.contentStates.has('created') || (this.contentStates.has('loaded') && !this.reentry)) {
        //   return;
        // }
        // this.reentry = false;
        return runner_js_1.Runner.run(() => this.contentStates.await('guarded'), () => {
            if (!this.contentStates.has('created') || (this.contentStates.has('loaded') && !this.reentry)) {
                return;
            }
            this.reentry = false;
            // this.loaded = true;
            // console.log('loaded', this.content.componentName);
            this.contentStates.set('loaded', void 0);
            if (this.content.componentInstance && this.content.componentInstance.load) {
                const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
                this.instruction.parameters = this.content.toSpecifiedParameters(typeParameters);
                const merged = { ...parser_js_1.parseQuery(this.instruction.query), ...this.instruction.parameters };
                return this.content.componentInstance.load(merged, this.instruction, previousInstruction);
            }
        });
    }
    unload(nextInstruction) {
        // if (!this.loaded) {
        if (!this.contentStates.has('loaded')) {
            return;
        }
        // this.loaded = false;
        // console.log('loaded', this.content.componentName, 'deleted');
        this.contentStates.delete('loaded');
        if (this.content.componentInstance && this.content.componentInstance.unload) {
            return this.content.componentInstance.unload(nextInstruction, this.instruction);
        }
    }
    // public unloadComponent(cache: ViewportContent[], stateful: boolean = false): void {
    //   // TODO: We might want to do something here eventually, who knows?
    //   // if (this.contentStatus !== ContentStatus.activated) {
    //   if (!this.contentStates.has('created')) {
    //     return;
    //   }
    //   // Don't unload components when stateful
    //   // TODO: We're missing stuff here
    //   if (!stateful) {
    //     // this.contentStatus = ContentStatus.created;
    //     this.contentStates.delete('created');
    //   } else {
    //     cache.push(this);
    //   }
    // }
    activateComponent(initiator, parent, flags, connectedCE, parentActivated) {
        // if (this.contentStates.has('activated') || !this.contentStates.has('created')) {
        // if (this.contentStates.has('activated')) {
        //   return;
        // }
        // this.contentStates.set('activated', void 0);
        // // if (parentActivated) { // Parent is already part of an activation
        // //   return ;
        // // }
        // const contentController = this.contentController(connectedCE);
        return runner_js_1.Runner.run(() => this.contentStates.await('loaded'), () => {
            if (this.contentStates.has('activated')) {
                return;
            }
            this.contentStates.set('activated', void 0);
            // if (parentActivated) { // Parent is already part of an activation
            //   return ;
            // }
            const contentController = this.contentController(connectedCE);
            return contentController.activate(initiator ?? contentController, null /* TODO: take back: parent! */, flags);
        }, () => {
            if (this.fromCache || this.fromHistory) {
                const elements = Array.from(connectedCE.element.getElementsByTagName('*'));
                for (const el of elements) {
                    const attr = el.getAttribute('au-element-scroll');
                    if (attr) {
                        const [top, left] = attr.split(',');
                        el.removeAttribute('au-element-scroll');
                        el.scrollTo(+left, +top);
                    }
                }
            }
        });
    }
    // public async activateComponent(initiator: IHydratedController | null, parent: ICustomElementController<ICustomElementViewModel> | null, flags: LifecycleFlags, connectedCE: IConnectedCustomElement): Promise<void> {
    //   // if (this.contentStatus !== ContentStatus.created) {
    //   if (!this.contentStates.has('created')) {
    //     return;
    //   }
    //   // this.contentStatus = ContentStatus.activated;
    //   this.contentStates.add('activated');
    //   const contentController = this.contentController(connectedCE);
    //   await contentController.activate(initiator ?? contentController, parent!, flags);
    //   if (this.fromCache || this.fromHistory) {
    //     const elements = Array.from(connectedCE.element.getElementsByTagName('*'));
    //     for (const el of elements) {
    //       const attr = el.getAttribute('au-element-scroll');
    //       if (attr) {
    //         const [top, left] = attr.split(',');
    //         el.removeAttribute('au-element-scroll');
    //         el.scrollTo(+left, +top);
    //       }
    //     }
    //   }
    // }
    deactivateComponent(initiator, parent, flags, connectedCE, stateful = false) {
        // if (this.contentStatus !== ContentStatus.activated) {
        if (!this.contentStates.has('activated')) {
            return;
        }
        // this.contentStatus = ContentStatus.created;
        this.contentStates.delete('activated');
        if (stateful && connectedCE.element !== null) {
            // const contentController = this.content.componentInstance!.$controller!;
            const elements = Array.from(connectedCE.element.getElementsByTagName('*'));
            for (const el of elements) {
                if (el.scrollTop > 0 || el.scrollLeft) {
                    el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
                }
            }
        }
        const contentController = this.contentController(connectedCE);
        return runner_js_1.Runner.run(() => contentController.deactivate(initiator ?? contentController, parent, flags));
    }
    disposeComponent(connectedCE, cache, stateful = false) {
        if (!this.contentStates.has('created')) {
            return;
        }
        // Don't unload components when stateful
        // TODO: We're missing stuff here
        if (!stateful) {
            this.contentStates.delete('created');
            const contentController = this.contentController(connectedCE);
            return contentController.dispose();
        }
        else {
            cache.push(this);
        }
    }
    freeContent(connectedCE, nextInstruction, cache, stateful = false) {
        // switch (this.contentStatus) {
        //   case ContentStatus.activated:
        //     await this.unload(nextInstruction);
        //     await this.deactivateComponent(null, connectedCE!.controller, LifecycleFlags.none, connectedCE!, stateful);
        //     this.unloadComponent(cache, stateful); // TODO: Hook up to new dispose
        //   case ContentStatus.created:
        //     this.destroyComponent();
        // }
        // TODO: Fix execution order on these
        // These are all safe to run
        return runner_js_1.Runner.run(() => this.unload(nextInstruction), () => this.deactivateComponent(null, connectedCE.controller, 0 /* none */, connectedCE, stateful), 
        // () => this.unloadComponent(cache, stateful), // TODO: Hook up to new dispose
        // () => this.destroyComponent(),
        () => this.disposeComponent(connectedCE, cache, stateful));
    }
    toComponentName() {
        return this.content.componentName;
    }
    toComponentType(container) {
        if (this.content.isEmpty()) {
            return null;
        }
        return this.content.toComponentType(container);
    }
    toComponentInstance(container) {
        if (this.content.isEmpty()) {
            return null;
        }
        return this.content.toComponentInstance(container);
    }
}
exports.ViewportContent = ViewportContent;
//# sourceMappingURL=viewport-content.js.map