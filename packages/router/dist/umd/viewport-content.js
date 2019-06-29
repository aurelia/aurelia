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
    var ReentryBehavior;
    (function (ReentryBehavior) {
        ReentryBehavior["default"] = "default";
        ReentryBehavior["disallow"] = "disallow";
        ReentryBehavior["enter"] = "enter";
        ReentryBehavior["refresh"] = "refresh";
    })(ReentryBehavior = exports.ReentryBehavior || (exports.ReentryBehavior = {}));
    class ViewportContent {
        constructor(content = null, parameters = null, instruction = null, context = null) {
            // Can be a (resolved) type or a string (to be resolved later)
            this.content = content;
            this.parameters = parameters;
            this.instruction = instruction;
            this.component = null;
            this.contentStatus = 0 /* none */;
            this.entered = false;
            this.fromCache = false;
            this.reentry = false;
            // If we've got a container, we're good to resolve type
            if (this.content !== null && typeof this.content === 'string' && context !== null) {
                this.content = this.componentType(context);
            }
        }
        equalComponent(other) {
            return (typeof other.content === 'string' && this.componentName() === other.content) ||
                (typeof other.content !== 'string' && this.content === other.content);
        }
        equalParameters(other) {
            // TODO: Review this
            return this.parameters === other.parameters &&
                this.instruction.query === other.instruction.query;
        }
        reentryBehavior() {
            return 'reentryBehavior' in this.component ? this.component.reentryBehavior : "default" /* default */;
        }
        isCacheEqual(other) {
            return ((typeof other.content === 'string' && this.componentName() === other.content) ||
                (typeof other.content !== 'string' && this.content === other.content)) &&
                this.parameters === other.parameters;
        }
        createComponent(context) {
            if (this.contentStatus !== 0 /* none */) {
                return;
            }
            // Don't load cached content
            if (!this.fromCache) {
                this.component = this.componentInstance(context);
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
        canEnter(viewport, previousInstruction) {
            if (!this.component) {
                return Promise.resolve(false);
            }
            if (!this.component.canEnter) {
                return Promise.resolve(true);
            }
            const merged = parser_1.mergeParameters(this.parameters, this.instruction.query, this.content.parameters);
            this.instruction.parameters = merged.namedParameters;
            this.instruction.parameterList = merged.parameterList;
            const result = this.component.canEnter(merged.merged, this.instruction, previousInstruction);
            kernel_1.Reporter.write(10000, 'viewport canEnter', result);
            if (typeof result === 'boolean') {
                return Promise.resolve(result);
            }
            if (typeof result === 'string') {
                return Promise.resolve([new viewport_instruction_1.ViewportInstruction(result, viewport)]);
            }
            return result;
        }
        canLeave(nextInstruction) {
            if (!this.component || !this.component.canLeave) {
                return Promise.resolve(true);
            }
            const result = this.component.canLeave(this.instruction, nextInstruction);
            kernel_1.Reporter.write(10000, 'viewport canLeave', result);
            if (typeof result === 'boolean') {
                return Promise.resolve(result);
            }
            return result;
        }
        async enter(previousInstruction) {
            if (!this.reentry && (this.contentStatus !== 1 /* created */ || this.entered)) {
                return;
            }
            if (this.component.enter) {
                const merged = parser_1.mergeParameters(this.parameters, this.instruction.query, this.content.parameters);
                this.instruction.parameters = merged.namedParameters;
                this.instruction.parameterList = merged.parameterList;
                await this.component.enter(merged.merged, this.instruction, previousInstruction);
            }
            this.entered = true;
        }
        async leave(nextInstruction) {
            if (this.contentStatus !== 4 /* added */ || !this.entered) {
                return;
            }
            if (this.component.leave) {
                await this.component.leave(this.instruction, nextInstruction);
            }
            this.entered = false;
        }
        loadComponent(context, element) {
            if (this.contentStatus !== 1 /* created */ || !this.entered) {
                return;
            }
            // Don't load cached content
            if (!this.fromCache) {
                const host = element;
                const container = context;
                runtime_1.Controller.forCustomElement(this.component, container, host);
            }
            this.contentStatus = 2 /* loaded */;
            return Promise.resolve();
        }
        unloadComponent() {
            // TODO: We might want to do something here eventually, who knows?
            if (this.contentStatus !== 2 /* loaded */) {
                return;
            }
            // Don't unload components when stateful
            this.contentStatus = 1 /* created */;
        }
        initializeComponent() {
            if (this.contentStatus !== 2 /* loaded */) {
                return;
            }
            // Don't initialize cached content
            if (!this.fromCache) {
                this.component.$controller.bind(1024 /* fromStartTask */ | 4096 /* fromBind */, null);
            }
            this.contentStatus = 3 /* initialized */;
        }
        terminateComponent(stateful = false) {
            if (this.contentStatus !== 3 /* initialized */) {
                return;
            }
            // Don't terminate cached content
            if (!stateful) {
                this.component.$controller.unbind(2048 /* fromStopTask */ | 8192 /* fromUnbind */);
                this.contentStatus = 2 /* loaded */;
            }
        }
        addComponent(element) {
            if (this.contentStatus !== 3 /* initialized */) {
                return;
            }
            this.component.$controller.attach(1024 /* fromStartTask */);
            if (this.fromCache) {
                const elements = Array.from(element.getElementsByTagName('*'));
                for (const el of elements) {
                    if (el.hasAttribute('au-element-scroll')) {
                        const [top, left] = el.getAttribute('au-element-scroll').split(',');
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
            if (stateful) {
                const elements = Array.from(element.getElementsByTagName('*'));
                for (const el of elements) {
                    if (el.scrollTop > 0 || el.scrollLeft) {
                        el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
                    }
                }
            }
            this.component.$controller.detach(2048 /* fromStopTask */);
            this.contentStatus = 3 /* initialized */;
        }
        async freeContent(element, nextInstruction, stateful = false) {
            switch (this.contentStatus) {
                case 4 /* added */:
                    await this.leave(nextInstruction);
                    this.removeComponent(element, stateful);
                case 3 /* initialized */:
                    this.terminateComponent(stateful);
                case 2 /* loaded */:
                    this.unloadComponent();
                case 1 /* created */:
                    this.destroyComponent();
            }
        }
        componentName() {
            if (this.content === null) {
                return null;
            }
            else if (typeof this.content === 'string') {
                return this.content;
            }
            else {
                return (this.content).description.name;
            }
        }
        componentType(context) {
            if (this.content === null) {
                return null;
            }
            else if (typeof this.content !== 'string') {
                return this.content;
            }
            else {
                const container = context.get(kernel_1.IContainer);
                const resolver = container.getResolver(runtime_1.CustomElement.keyFrom(this.content));
                if (resolver !== null) {
                    return resolver.getFactory(container).Type;
                }
                return null;
            }
        }
        componentInstance(context) {
            if (this.content === null) {
                return null;
            }
            // TODO: Remove once "local registration is fixed"
            const component = this.componentName();
            const container = context.get(kernel_1.IContainer);
            if (typeof component !== 'string') {
                return container.get(component);
            }
            else {
                return container.get(runtime_1.CustomElement.keyFrom(component));
            }
        }
    }
    exports.ViewportContent = ViewportContent;
});
//# sourceMappingURL=viewport-content.js.map