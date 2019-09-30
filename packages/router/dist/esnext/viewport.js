import { Reporter } from '@aurelia/kernel';
import { ViewportContent } from './viewport-content';
import { ViewportInstruction } from './viewport-instruction';
export class Viewport {
    constructor(router, name, element, context, owningScope, scope, options = {}) {
        this.router = router;
        this.name = name;
        this.element = element;
        this.context = context;
        this.owningScope = owningScope;
        this.scope = scope;
        this.options = options;
        this.nextContent = null;
        this.enabled = true;
        this.clear = false;
        this.elementResolve = null;
        this.previousViewportState = null;
        this.cache = [];
        this.content = new ViewportContent();
    }
    setNextContent(content, instruction) {
        let parameters;
        this.clear = false;
        if (typeof content === 'string') {
            if (content === this.router.instructionResolver.clearViewportInstruction) {
                this.clear = true;
            }
            else {
                const viewportInstruction = this.router.instructionResolver.parseViewportInstruction(content);
                content = viewportInstruction.componentName ? viewportInstruction.componentName : content; // TODO: fix this!
                parameters = viewportInstruction.parametersString;
            }
        }
        // Can have a (resolved) type or a string (to be resolved later)
        this.nextContent = new ViewportContent(!this.clear ? content : null, parameters, instruction, this.context);
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
        // ReentryBehavior 'refresh' takes precedence
        if (!this.content.equalComponent(this.nextContent) ||
            instruction.navigation.refresh ||
            this.content.reentryBehavior() === "refresh" /* refresh */) {
            return true;
        }
        // Explicitly don't allow navigation back to the same component again
        if (this.content.reentryBehavior() === "disallow" /* disallow */) {
            return false;
        }
        // ReentryBehavior is now 'enter' or 'default'
        if (!this.content.equalParameters(this.nextContent) ||
            this.content.reentryBehavior() === "enter" /* enter */) {
            this.content.reentry = true;
            this.nextContent.content = this.content.content;
            this.nextContent.componentInstance = this.content.componentInstance;
            this.nextContent.contentStatus = this.content.contentStatus;
            this.nextContent.reentry = this.content.reentry;
            return true;
        }
        return false;
    }
    setElement(element, context, options) {
        // First added viewport with element is always scope viewport (except for root scope)
        if (this.scope && this.scope.parent && !this.scope.viewport) {
            this.scope.viewport = this;
        }
        if (this.scope && !this.scope.element) {
            this.scope.element = element;
        }
        if (this.element !== element) {
            // TODO: Restore this state on navigation cancel
            this.previousViewportState = { ...this };
            this.clearState();
            this.element = element;
            if (options && options.usedBy) {
                this.options.usedBy = options.usedBy;
            }
            if (options && options.default) {
                this.options.default = options.default;
            }
            if (options && options.noLink) {
                this.options.noLink = options.noLink;
            }
            if (options && options.noHistory) {
                this.options.noHistory = options.noHistory;
            }
            if (options && options.stateful) {
                this.options.stateful = options.stateful;
            }
            if (this.elementResolve) {
                this.elementResolve();
            }
        }
        // TODO: Might not need this? Figure it out
        // if (context) {
        //   context['viewportName'] = this.name;
        // }
        if (this.context !== context) {
            this.context = context;
        }
        if (!this.content.componentInstance && (!this.nextContent || !this.nextContent.componentInstance) && this.options.default) {
            this.router.addProcessingViewport(this.options.default, this, false);
        }
    }
    remove(element, context) {
        if (this.element === element && this.context === context) {
            if (this.content.componentInstance) {
                this.content.freeContent(this.element, (this.nextContent ? this.nextContent.instruction : null), this.options.stateful).catch(error => { throw error; });
            }
            return true;
        }
        return false;
    }
    async canLeave() {
        return this.content.canLeave(this.nextContent ? this.nextContent.instruction : null);
    }
    async canEnter() {
        if (this.clear) {
            return true;
        }
        if (!this.nextContent.content) {
            return false;
        }
        await this.waitForElement();
        this.nextContent.createComponent(this.context);
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
        await this.nextContent.loadComponent(this.context, this.element);
        this.nextContent.initializeComponent();
        return true;
    }
    async loadContent() {
        Reporter.write(10000, 'Viewport loadContent', this.name);
        // No need to wait for next component activation
        if (this.content.componentInstance && !this.nextContent.componentInstance) {
            await this.content.leave(this.nextContent.instruction);
            this.content.removeComponent(this.element, this.options.stateful);
            this.content.terminateComponent(this.options.stateful);
            this.content.unloadComponent();
            this.content.destroyComponent();
        }
        if (this.nextContent.componentInstance) {
            this.nextContent.addComponent(this.element);
            // Only when next component activation is done
            if (this.content.componentInstance) {
                await this.content.leave(this.nextContent.instruction);
                if (!this.content.reentry) {
                    this.content.removeComponent(this.element, this.options.stateful);
                    this.content.terminateComponent(this.options.stateful);
                    this.content.unloadComponent();
                    this.content.destroyComponent();
                }
            }
            this.content = this.nextContent;
            this.content.reentry = false;
        }
        if (this.clear) {
            this.content = new ViewportContent(null, void 0, this.nextContent.instruction);
        }
        this.nextContent = null;
        return true;
    }
    finalizeContentChange() {
        this.previousViewportState = null;
    }
    async abortContentChange() {
        await this.nextContent.freeContent(this.element, this.nextContent.instruction, this.options.stateful);
        if (this.previousViewportState) {
            Object.assign(this, this.previousViewportState);
        }
    }
    description(full = false) {
        if (this.content.content) {
            const component = this.content.toComponentName();
            if (full || this.options.forceDescription) {
                return this.router.instructionResolver.stringifyViewportInstruction(new ViewportInstruction(component, this, this.content.parameters, this.scope !== null));
            }
            const found = this.owningScope.findViewports([new ViewportInstruction(component)]);
            if (!found || !found.viewportInstructions || !found.viewportInstructions.length) {
                return this.router.instructionResolver.stringifyViewportInstruction(new ViewportInstruction(component, this, this.content.parameters, this.scope !== null));
            }
            return this.router.instructionResolver.stringifyViewportInstruction(new ViewportInstruction(component, void 0, this.content.parameters, this.scope !== null));
        }
        return '';
    }
    scopedDescription(full = false) {
        const descriptions = [this.owningScope.scopeContext(full), this.description(full)];
        return this.router.instructionResolver.stringifyScopedViewportInstructions(descriptions.filter((value) => value && value.length));
    }
    // TODO: Deal with non-string components
    wantComponent(component) {
        let usedBy = this.options.usedBy || [];
        if (typeof usedBy === 'string') {
            usedBy = usedBy.split(',');
        }
        return usedBy.indexOf(component) >= 0;
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
        if (usedBy.indexOf(component) >= 0) {
            return true;
        }
        if (usedBy.filter((value) => value.indexOf('*') >= 0).length) {
            return true;
        }
        return false;
    }
    binding(flags) {
        if (this.content.componentInstance) {
            this.content.initializeComponent();
        }
    }
    attaching(flags) {
        Reporter.write(10000, 'ATTACHING viewport', this.name, this.content, this.nextContent);
        this.enabled = true;
        if (this.content.componentInstance) {
            this.content.addComponent(this.element);
        }
    }
    detaching(flags) {
        Reporter.write(10000, 'DETACHING viewport', this.name);
        if (this.content.componentInstance) {
            this.content.removeComponent(this.element, this.options.stateful);
        }
        this.enabled = false;
    }
    unbinding(flags) {
        if (this.content.componentInstance) {
            this.content.terminateComponent(this.options.stateful);
        }
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