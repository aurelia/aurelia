import { IContainer, Reporter } from '@aurelia/kernel';
import { Controller, CustomElement } from '@aurelia/runtime';
import { mergeParameters } from './parser';
import { ViewportInstruction } from './viewport-instruction';
export var ContentStatus;
(function (ContentStatus) {
    ContentStatus[ContentStatus["none"] = 0] = "none";
    ContentStatus[ContentStatus["created"] = 1] = "created";
    ContentStatus[ContentStatus["loaded"] = 2] = "loaded";
    ContentStatus[ContentStatus["initialized"] = 3] = "initialized";
    ContentStatus[ContentStatus["added"] = 4] = "added";
})(ContentStatus || (ContentStatus = {}));
export class ViewportContent {
    constructor(
    // Can (and wants) be a (resolved) type or a string (to be resolved later)
    content = null, parameters = '', instruction = {
        instruction: '',
        fullStateInstruction: '',
    }, context = null) {
        this.content = content;
        this.parameters = parameters;
        this.instruction = instruction;
        this.componentInstance = null;
        this.contentStatus = 0 /* none */;
        this.entered = false;
        this.fromCache = false;
        this.reentry = false;
        // If we've got a container, we're good to resolve type
        if (this.content !== null && typeof this.content === 'string' && context !== null) {
            this.content = this.toComponentType(context);
        }
    }
    equalComponent(other) {
        return (typeof other.content === 'string' && this.toComponentName() === other.content) ||
            (typeof other.content !== 'string' && this.content === other.content);
    }
    equalParameters(other) {
        // TODO: Review this
        return this.parameters === other.parameters &&
            this.instruction.query === other.instruction.query;
    }
    reentryBehavior() {
        return (this.componentInstance &&
            'reentryBehavior' in this.componentInstance &&
            this.componentInstance.reentryBehavior)
            ? this.componentInstance.reentryBehavior
            : "default" /* default */;
    }
    isCacheEqual(other) {
        return ((typeof other.content === 'string' && this.toComponentName() === other.content) ||
            (typeof other.content !== 'string' && this.content === other.content)) &&
            this.parameters === other.parameters;
    }
    createComponent(context) {
        if (this.contentStatus !== 0 /* none */) {
            return;
        }
        // Don't load cached content
        if (!this.fromCache) {
            this.componentInstance = this.toComponentInstance(context);
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
        if (!this.componentInstance) {
            return Promise.resolve(false);
        }
        if (!this.componentInstance.canEnter) {
            return Promise.resolve(true);
        }
        const contentType = this.componentInstance !== null ? this.componentInstance.constructor : this.content;
        const merged = mergeParameters(this.parameters, this.instruction.query, contentType.parameters);
        this.instruction.parameters = merged.namedParameters;
        this.instruction.parameterList = merged.parameterList;
        const result = this.componentInstance.canEnter(merged.merged, this.instruction, previousInstruction);
        Reporter.write(10000, 'viewport canEnter', result);
        if (typeof result === 'boolean') {
            return Promise.resolve(result);
        }
        if (typeof result === 'string') {
            return Promise.resolve([new ViewportInstruction(result, viewport)]);
        }
        return result;
    }
    canLeave(nextInstruction) {
        if (!this.componentInstance || !this.componentInstance.canLeave) {
            return Promise.resolve(true);
        }
        const result = this.componentInstance.canLeave(nextInstruction, this.instruction);
        Reporter.write(10000, 'viewport canLeave', result);
        if (typeof result === 'boolean') {
            return Promise.resolve(result);
        }
        return result;
    }
    async enter(previousInstruction) {
        if (!this.reentry && (this.contentStatus !== 1 /* created */ || this.entered)) {
            return;
        }
        if (this.componentInstance && this.componentInstance.enter) {
            const contentType = this.componentInstance !== null ? this.componentInstance.constructor : this.content;
            const merged = mergeParameters(this.parameters, this.instruction.query, contentType.parameters);
            this.instruction.parameters = merged.namedParameters;
            this.instruction.parameterList = merged.parameterList;
            await this.componentInstance.enter(merged.merged, this.instruction, previousInstruction);
        }
        this.entered = true;
    }
    async leave(nextInstruction) {
        if (this.contentStatus !== 4 /* added */ || !this.entered) {
            return;
        }
        if (this.componentInstance && this.componentInstance.leave) {
            await this.componentInstance.leave(nextInstruction, this.instruction);
        }
        this.entered = false;
    }
    loadComponent(context, element) {
        if (this.contentStatus !== 1 /* created */ || !this.entered || !this.componentInstance) {
            return Promise.resolve();
        }
        // Don't load cached content
        if (!this.fromCache) {
            const host = element;
            const container = context;
            Controller.forCustomElement(this.componentInstance, container, host);
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
            this.componentInstance.$controller.bind(1024 /* fromStartTask */ | 4096 /* fromBind */);
        }
        this.contentStatus = 3 /* initialized */;
    }
    terminateComponent(stateful = false) {
        if (this.contentStatus !== 3 /* initialized */) {
            return;
        }
        // Don't terminate cached content
        if (!stateful) {
            this.componentInstance.$controller.unbind(2048 /* fromStopTask */ | 8192 /* fromUnbind */);
            this.contentStatus = 2 /* loaded */;
        }
    }
    addComponent(element) {
        if (this.contentStatus !== 3 /* initialized */) {
            return;
        }
        this.componentInstance.$controller.attach(1024 /* fromStartTask */);
        if (this.fromCache) {
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
        if (stateful) {
            const elements = Array.from(element.getElementsByTagName('*'));
            for (const el of elements) {
                if (el.scrollTop > 0 || el.scrollLeft) {
                    el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
                }
            }
        }
        this.componentInstance.$controller.detach(2048 /* fromStopTask */);
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
    toComponentName() {
        if (this.content === null) {
            return null;
        }
        else if (typeof this.content === 'string') {
            return this.content;
        }
        else {
            return this.content.description.name;
        }
    }
    toComponentType(context) {
        if (this.content === null) {
            return null;
        }
        else if (typeof this.content !== 'string') {
            return this.content;
        }
        else {
            const container = context.get(IContainer);
            if (container) {
                const resolver = container.getResolver(CustomElement.keyFrom(this.content));
                if (resolver && resolver.getFactory) {
                    const factory = resolver.getFactory(container);
                    if (factory) {
                        return factory.Type;
                    }
                }
            }
            return null;
        }
    }
    toComponentInstance(context) {
        if (this.content === null) {
            return null;
        }
        // TODO: Remove once "local registration is fixed"
        const component = this.toComponentName();
        if (component) {
            const container = context.get(IContainer);
            if (container) {
                if (typeof component !== 'string') {
                    return container.get(component);
                }
                else {
                    return container.get(CustomElement.keyFrom(component));
                }
            }
        }
        return null;
    }
}
//# sourceMappingURL=viewport-content.js.map