import { Reporter } from '@aurelia/kernel';
import { CustomElement } from '@aurelia/runtime';
import { arrayRemove } from './utils';
import { ViewportContent } from './viewport-content';
import { ViewportInstruction } from './viewport-instruction';
import { Scope } from './scope';
export class Viewport {
    constructor(router, name, element, container, owningScope, scope, options = {}) {
        this.router = router;
        this.name = name;
        this.element = element;
        this.container = container;
        this.options = options;
        this.nextContent = null;
        this.forceRemove = false;
        this.path = null;
        this.clear = false;
        this.elementResolve = null;
        this.previousViewportState = null;
        this.cache = [];
        this.historyCache = [];
        this.content = new ViewportContent();
        this.connectedScope = new Scope(router, scope, owningScope, this);
    }
    get scope() {
        return this.connectedScope.scope;
    }
    get owningScope() {
        return this.connectedScope.owningScope;
    }
    get enabled() {
        return this.connectedScope.enabled;
    }
    set enabled(enabled) {
        this.connectedScope.enabled = enabled;
    }
    get isViewport() {
        return true;
    }
    get isViewportScope() {
        return false;
    }
    get isEmpty() {
        return this.content.componentInstance === null;
    }
    get doForceRemove() {
        let scope = this.connectedScope;
        while (scope !== null) {
            if (scope.viewport !== null && scope.viewport.forceRemove) {
                return true;
            }
            scope = scope.parent;
        }
        return false;
    }
    setNextContent(content, instruction) {
        let viewportInstruction;
        if (content instanceof ViewportInstruction) {
            viewportInstruction = content;
        }
        else {
            if (typeof content === 'string') {
                viewportInstruction = this.router.instructionResolver.parseViewportInstruction(content);
            }
            else {
                viewportInstruction = this.router.createViewportInstruction(content);
            }
        }
        viewportInstruction.setViewport(this);
        this.clear = this.router.instructionResolver.isClearViewportInstruction(viewportInstruction);
        // Can have a (resolved) type or a string (to be resolved later)
        this.nextContent = new ViewportContent(!this.clear ? viewportInstruction : void 0, instruction, this.container);
        this.nextContent.fromHistory = this.nextContent.componentInstance && instruction.navigation
            ? !!instruction.navigation.back || !!instruction.navigation.forward
            : false;
        if (this.options.stateful) {
            // TODO: Add a parameter here to decide required equality
            const cached = this.cache.find((item) => this.nextContent.isCacheEqual(item));
            if (cached) {
                this.nextContent = cached;
                this.nextContent.fromCache = true;
            }
            else {
                this.cache.push(this.nextContent);
            }
        }
        // Children that will be replaced (unless added again) by next content. Will
        // be re-enabled on cancel
        this.connectedScope.clearReplacedChildren();
        // If we get the same _instance_, don't do anything (happens with cached and history)
        if (this.nextContent.componentInstance !== null && this.content.componentInstance === this.nextContent.componentInstance) {
            this.nextContent = null;
            return false;
        }
        // ReentryBehavior 'refresh' takes precedence
        if (!this.content.equalComponent(this.nextContent) ||
            instruction.navigation.refresh ||
            this.content.reentryBehavior() === "refresh" /* refresh */) {
            this.connectedScope.disableReplacedChildren();
            return true;
        }
        // Explicitly don't allow navigation back to the same component again
        if (this.content.reentryBehavior() === "disallow" /* disallow */) {
            this.nextContent = null;
            return false;
        }
        // Explicitly re-enter same component again
        if (this.content.reentryBehavior() === "enter" /* enter */) {
            this.content.reentry = true;
            this.nextContent.content.setComponent(this.content.componentInstance);
            this.nextContent.contentStatus = this.content.contentStatus;
            this.nextContent.reentry = this.content.reentry;
            return true;
        }
        // ReentryBehavior is now 'default'
        // Requires updated parameters if viewport stateful
        if (this.options.stateful &&
            this.content.equalParameters(this.nextContent)) {
            this.nextContent = null;
            return false;
        }
        // Default is to trigger a refresh (without a check of parameters)
        this.connectedScope.disableReplacedChildren();
        return true;
    }
    setElement(element, container, options) {
        options = options || {};
        if (this.element !== element) {
            // TODO: Restore this state on navigation cancel
            this.previousViewportState = { ...this };
            this.clearState();
            this.element = element;
            if (options.usedBy) {
                this.options.usedBy = options.usedBy;
            }
            if (options.default) {
                this.options.default = options.default;
            }
            if (options.fallback) {
                this.options.fallback = options.fallback;
            }
            if (options.noLink) {
                this.options.noLink = options.noLink;
            }
            if (options.noHistory) {
                this.options.noHistory = options.noHistory;
            }
            if (options.stateful) {
                this.options.stateful = options.stateful;
            }
            if (this.elementResolve) {
                this.elementResolve();
            }
        }
        // TODO: Might not need this? Figure it out
        // if (container) {
        //   container['viewportName'] = this.name;
        // }
        if (this.container !== container) {
            this.container = container;
        }
        if (!this.content.componentInstance && (!this.nextContent || !this.nextContent.componentInstance) && this.options.default) {
            const instructions = this.router.instructionResolver.parseViewportInstructions(this.options.default);
            for (const instruction of instructions) {
                // Set to name to be delayed one turn
                instruction.setViewport(this.name);
                instruction.scope = this.owningScope;
                instruction.default = true;
            }
            this.router.goto(instructions, { append: true }).catch(error => { throw error; });
        }
    }
    async remove(element, container) {
        if (this.element === element && this.container === container) {
            if (this.content.componentInstance) {
                await this.content.freeContent(this.element, (this.nextContent ? this.nextContent.instruction : null), this.historyCache, this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful); // .catch(error => { throw error; });
            }
            if (this.doForceRemove) {
                await Promise.all(this.historyCache.map(content => content.freeContent(null, null, this.historyCache, false)));
                this.historyCache = [];
            }
            return true;
        }
        return false;
    }
    async canLeave() {
        const canLeaveChildren = await this.connectedScope.canLeave();
        if (!canLeaveChildren) {
            return false;
        }
        return this.content.canLeave(this.nextContent ? this.nextContent.instruction : null);
    }
    async canEnter() {
        if (this.clear) {
            return true;
        }
        if ((this.nextContent.content || null) === null) {
            return false;
        }
        await this.waitForElement();
        this.nextContent.createComponent(this.container, this.options.fallback);
        await this.nextContent.loadComponent(this.container, this.element, this);
        return this.nextContent.canEnter(this, this.content.instruction);
    }
    async enter() {
        Reporter.write(10000, 'Viewport enter', this.name);
        if (this.clear) {
            return true;
        }
        if (!this.nextContent || !this.nextContent.componentInstance) {
            return false;
        }
        await this.nextContent.enter(this.content.instruction);
        // await this.nextContent.loadComponent(this.container as IContainer, this.element as Element, this);
        this.nextContent.initializeComponent(CustomElement.for(this.element));
        return true;
    }
    async loadContent() {
        Reporter.write(10000, 'Viewport loadContent', this.name);
        // No need to wait for next component activation
        if (this.content.componentInstance && !this.nextContent.componentInstance) {
            await this.content.leave(this.nextContent.instruction);
            await this.unloadContent();
        }
        if (this.nextContent.componentInstance) {
            if (this.content.componentInstance !== this.nextContent.componentInstance) {
                this.nextContent.addComponent(this.element);
            }
            else {
                this.connectedScope.reenableReplacedChildren();
            }
            // Only when next component activation is done
            if (this.content.componentInstance) {
                await this.content.leave(this.nextContent.instruction);
                if (!this.content.reentry && this.content.componentInstance !== this.nextContent.componentInstance) {
                    await this.unloadContent();
                }
            }
            this.content = this.nextContent;
            this.content.reentry = false;
        }
        if (this.clear) {
            this.content = new ViewportContent(void 0, this.nextContent.instruction);
        }
        this.nextContent = null;
        return true;
    }
    finalizeContentChange() {
        this.previousViewportState = null;
        this.connectedScope.clearReplacedChildren();
    }
    async abortContentChange() {
        this.connectedScope.reenableReplacedChildren();
        await this.nextContent.freeContent(this.element, this.nextContent.instruction, this.historyCache, this.router.statefulHistory || this.options.stateful);
        if (this.previousViewportState) {
            Object.assign(this, this.previousViewportState);
        }
    }
    // TODO: Deal with non-string components
    wantComponent(component) {
        let usedBy = this.options.usedBy || [];
        if (typeof usedBy === 'string') {
            usedBy = usedBy.split(',');
        }
        return usedBy.includes(component);
    }
    // TODO: Deal with non-string components
    acceptComponent(component) {
        if (component === '-' || component === null) {
            return true;
        }
        let usedBy = this.options.usedBy;
        if (!usedBy || !usedBy.length) {
            return true;
        }
        if (typeof usedBy === 'string') {
            usedBy = usedBy.split(',');
        }
        if (usedBy.includes(component)) {
            return true;
        }
        if (usedBy.filter((value) => value.includes('*')).length) {
            return true;
        }
        return false;
    }
    beforeBind(flags) {
        if (this.content.componentInstance) {
            this.content.initializeComponent(CustomElement.for(this.element));
        }
    }
    async beforeAttach(flags) {
        this.enabled = true;
        if (this.content.componentInstance) {
            // Only acts if not already entered
            await this.content.enter(this.content.instruction);
            this.content.addComponent(this.element);
        }
    }
    async beforeDetach(flags) {
        if (this.content.componentInstance) {
            // Only acts if not already left
            await this.content.leave(this.content.instruction);
            this.content.removeComponent(this.element, this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful);
        }
        this.enabled = false;
    }
    async beforeUnbind(flags) {
        if (this.content.componentInstance) {
            await this.content.terminateComponent(this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful);
        }
    }
    async freeContent(component) {
        const content = this.historyCache.find(cached => cached.componentInstance === component);
        if (content !== void 0) {
            this.forceRemove = true;
            await content.freeContent(null, null, this.historyCache, false);
            this.forceRemove = false;
            arrayRemove(this.historyCache, (cached => cached === content));
        }
    }
    getRoutes() {
        let componentType = this.nextContent !== null
            && this.nextContent.content !== null
            ? this.nextContent.content.componentType
            : this.content.content.componentType;
        // TODO: This is going away once Metadata is in!
        if (componentType === null || componentType === void 0) {
            const controller = CustomElement.for(this.element);
            componentType = controller.context.componentType;
        }
        if (componentType === null || componentType === void 0) {
            return null;
        }
        const routes = componentType.routes;
        return Array.isArray(routes) ? routes : null;
    }
    async unloadContent() {
        this.content.removeComponent(this.element, this.router.statefulHistory || this.options.stateful);
        await this.content.terminateComponent(this.router.statefulHistory || this.options.stateful);
        this.content.unloadComponent(this.historyCache, this.router.statefulHistory || this.options.stateful);
        this.content.destroyComponent();
    }
    clearState() {
        this.options = {};
        this.content = new ViewportContent();
        this.cache = [];
    }
    async waitForElement() {
        if (this.element) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.elementResolve = resolve;
        });
    }
}
//# sourceMappingURL=viewport.js.map