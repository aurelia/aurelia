(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "./parser", "./viewport-instruction"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const parser_1 = require("./parser");
    const viewport_instruction_1 = require("./viewport-instruction");
    var ContentStatus;
    (function (ContentStatus) {
        ContentStatus[ContentStatus["none"] = 0] = "none";
        ContentStatus[ContentStatus["created"] = 1] = "created";
        ContentStatus[ContentStatus["loaded"] = 2] = "loaded";
        ContentStatus[ContentStatus["initialized"] = 3] = "initialized";
        ContentStatus[ContentStatus["added"] = 4] = "added";
    })(ContentStatus = exports.ContentStatus || (exports.ContentStatus = {}));
    class ViewportContent {
        constructor(
        // Can (and wants) be a (resolved) type or a string (to be resolved later)
        content = new viewport_instruction_1.ViewportInstruction(''), instruction = {
            instruction: '',
            fullStateInstruction: '',
        }, container = null) {
            this.content = content;
            this.instruction = instruction;
            this.contentStatus = 0 /* none */;
            this.entered = false;
            this.fromCache = false;
            this.fromHistory = false;
            this.reentry = false;
            // If we've got a container, we're good to resolve type
            if (!this.content.isComponentType() && container !== null) {
                this.content.componentType = this.toComponentType(container);
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
        createComponent(container, fallback) {
            if (this.contentStatus !== 0 /* none */) {
                return;
            }
            // Don't load cached content or instantiated history content
            if (!this.fromCache && !this.fromHistory) {
                try {
                    this.content.componentInstance = this.toComponentInstance(container);
                }
                catch (e) {
                    if (fallback !== void 0) {
                        this.content.setParameters({ id: this.content.componentName });
                        this.content.setComponent(fallback);
                        try {
                            this.content.componentInstance = this.toComponentInstance(container);
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
            this.contentStatus = 1 /* created */;
        }
        destroyComponent() {
            // TODO: We might want to do something here eventually, who knows?
            if (this.contentStatus !== 1 /* created */) {
                return;
            }
            // Don't destroy components when stateful
            this.contentStatus = 0 /* none */;
        }
        async canEnter(viewport, previousInstruction) {
            if (!this.content.componentInstance) {
                return false;
            }
            if (!this.content.componentInstance.canEnter) {
                return true;
            }
            const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
            this.instruction.parameters = this.content.toSpecifiedParameters(typeParameters);
            const merged = { ...parser_1.parseQuery(this.instruction.query), ...this.instruction.parameters };
            const result = this.content.componentInstance.canEnter(merged, this.instruction, previousInstruction);
            kernel_1.Reporter.write(10000, 'viewport canEnter', result);
            if (typeof result === 'boolean') {
                return result;
            }
            if (typeof result === 'string') {
                return [viewport.router.createViewportInstruction(result, viewport)];
            }
            return result;
        }
        async canLeave(nextInstruction) {
            if (!this.content.componentInstance || !this.content.componentInstance.canLeave) {
                return true;
            }
            const result = this.content.componentInstance.canLeave(nextInstruction, this.instruction);
            kernel_1.Reporter.write(10000, 'viewport canLeave', result);
            if (typeof result === 'boolean') {
                return result;
            }
            return result;
        }
        async enter(previousInstruction) {
            // if (!this.reentry && (this.contentStatus !== ContentStatus.created || this.entered)) {
            if (!this.reentry && (this.contentStatus !== 2 /* loaded */ || this.entered)) {
                return;
            }
            if (this.content.componentInstance && this.content.componentInstance.enter) {
                const typeParameters = this.content.componentType ? this.content.componentType.parameters : null;
                this.instruction.parameters = this.content.toSpecifiedParameters(typeParameters);
                const merged = { ...parser_1.parseQuery(this.instruction.query), ...this.instruction.parameters };
                await this.content.componentInstance.enter(merged, this.instruction, previousInstruction);
            }
            this.entered = true;
        }
        async leave(nextInstruction) {
            if (this.contentStatus !== 4 /* added */ || !this.entered) {
                return;
            }
            if (this.content.componentInstance && this.content.componentInstance.leave) {
                await this.content.componentInstance.leave(nextInstruction, this.instruction);
            }
            this.entered = false;
        }
        // eslint-disable-next-line @typescript-eslint/require-await
        async loadComponent(container, element, viewport) {
            // if (this.contentStatus !== ContentStatus.created || !this.entered || !this.content.componentInstance) {
            if (this.contentStatus !== 1 /* created */ || this.entered || !this.content.componentInstance) {
                return;
            }
            // Don't load cached content or instantiated history content
            if (!this.fromCache || !this.fromHistory) {
                const host = element;
                const controller = runtime_1.Controller.forCustomElement(this.content.componentInstance, container.get(runtime_1.ILifecycle), host, container, void 0, void 0);
                controller.parent = runtime_1.CustomElement.for(element);
            }
            this.contentStatus = 2 /* loaded */;
        }
        unloadComponent(cache, stateful = false) {
            // TODO: We might want to do something here eventually, who knows?
            if (this.contentStatus !== 2 /* loaded */) {
                return;
            }
            // Don't unload components when stateful
            if (!stateful) {
                this.contentStatus = 1 /* created */;
            }
            else {
                cache.push(this);
            }
        }
        initializeComponent(parent) {
            if (this.contentStatus !== 2 /* loaded */) {
                return;
            }
            // Don't initialize cached content or instantiated history content
            // if (!this.fromCache || !this.fromHistory) {
            // ((this.content.componentInstance as IRouteableComponent).$controller as IController).parent = parent;
            this.content.componentInstance.$controller.bind(1024 /* fromStartTask */ | 4096 /* fromBind */);
            // }
            this.contentStatus = 3 /* initialized */;
        }
        async terminateComponent(stateful = false) {
            if (this.contentStatus !== 3 /* initialized */) {
                return;
            }
            // Don't terminate cached content
            // if (!stateful) {
            await this.content.componentInstance.$controller.unbind(2048 /* fromStopTask */ | 8192 /* fromUnbind */).wait();
            // ((this.content.componentInstance as IRouteableComponent).$controller as IController).parent = void 0;
            // }
            this.contentStatus = 2 /* loaded */;
        }
        addComponent(element) {
            if (this.contentStatus !== 3 /* initialized */) {
                return;
            }
            this.content.componentInstance.$controller.attach(1024 /* fromStartTask */);
            if (this.fromCache || this.fromHistory) {
                const elements = Array.from(element.getElementsByTagName('*'));
                for (const el of elements) {
                    const attr = el.getAttribute('au-element-scroll');
                    if (attr) {
                        const [top, left] = attr.split(',');
                        el.removeAttribute('au-element-scroll');
                        el.scrollTo(+left, +top);
                    }
                }
            }
            this.contentStatus = 4 /* added */;
        }
        removeComponent(element, stateful = false) {
            if (this.contentStatus !== 4 /* added */ || this.entered) {
                return;
            }
            if (stateful && element !== null) {
                const elements = Array.from(element.getElementsByTagName('*'));
                for (const el of elements) {
                    if (el.scrollTop > 0 || el.scrollLeft) {
                        el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
                    }
                }
            }
            this.content.componentInstance.$controller.detach(2048 /* fromStopTask */);
            this.contentStatus = 3 /* initialized */;
        }
        async freeContent(element, nextInstruction, cache, stateful = false) {
            switch (this.contentStatus) {
                case 4 /* added */:
                    await this.leave(nextInstruction);
                    this.removeComponent(element, stateful);
                case 3 /* initialized */:
                    await this.terminateComponent(stateful);
                case 2 /* loaded */:
                    this.unloadComponent(cache, stateful);
                case 1 /* created */:
                    this.destroyComponent();
            }
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
});
//# sourceMappingURL=viewport-content.js.map