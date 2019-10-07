import { Reporter } from '@aurelia/kernel';
import { arrayRemove } from './utils';
import { ViewportContent } from './viewport-content';
import { ViewportInstruction } from './viewport-instruction';
export class Viewport {
    constructor(router, name, element, context, owningScope, scope, options = {}) {
        this.router = router;
        this.name = name;
        this.element = element;
        this.context = context;
        this.owningScope = owningScope;
        this.options = options;
        this.scope = null;
        this.nextContent = null;
        this.enabled = true;
        this.forceRemove = false;
        this.parent = null;
        this.children = [];
        this.clear = false;
        this.elementResolve = null;
        this.previousViewportState = null;
        this.cache = [];
        this.historyCache = [];
        this.scope = scope ? this : null;
        this.content = new ViewportContent();
    }
    get doForceRemove() {
        let viewport = this;
        let forceRemove = viewport.forceRemove;
        while (!forceRemove && viewport.parent !== null) {
            viewport = viewport.parent;
            forceRemove = viewport.forceRemove;
        }
        return forceRemove;
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
                viewportInstruction = new ViewportInstruction(content);
            }
        }
        viewportInstruction.setViewport(this);
        this.clear = this.router.instructionResolver.isClearViewportInstruction(viewportInstruction);
        // Can have a (resolved) type or a string (to be resolved later)
        this.nextContent = new ViewportContent(!this.clear ? viewportInstruction : void 0, instruction, this.context);
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
        // If we get the same _instance_, don't do anything (happens with cached and history)
        if (this.nextContent.componentInstance !== null && this.content.componentInstance === this.nextContent.componentInstance) {
            this.nextContent = null;
            return false;
        }
        // ReentryBehavior 'refresh' takes precedence
        if (!this.content.equalComponent(this.nextContent) ||
            instruction.navigation.refresh ||
            this.content.reentryBehavior() === "refresh" /* refresh */) {
            return true;
        }
        // Explicitly don't allow navigation back to the same component again
        if (this.content.reentryBehavior() === "disallow" /* disallow */) {
            this.nextContent = null;
            return false;
        }
        // ReentryBehavior is now 'enter' or 'default'
        if (!this.content.equalParameters(this.nextContent) ||
            this.content.reentryBehavior() === "enter" /* enter */) {
            this.content.reentry = true;
            this.nextContent.content.setComponent(this.content.componentInstance);
            this.nextContent.contentStatus = this.content.contentStatus;
            this.nextContent.reentry = this.content.reentry;
            return true;
        }
        this.nextContent = null;
        return false;
    }
    setElement(element, context, options) {
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
        // if (context) {
        //   context['viewportName'] = this.name;
        // }
        if (this.context !== context) {
            this.context = context;
        }
        if (!this.content.componentInstance && (!this.nextContent || !this.nextContent.componentInstance) && this.options.default) {
            const instructions = this.router.instructionResolver.parseViewportInstructions(this.options.default);
            for (const instruction of instructions) {
                instruction.setViewport(this);
            }
            this.router.goto(instructions, { append: true }).catch(error => { throw error; });
        }
    }
    async remove(element, context) {
        if (this.element === element && this.context === context) {
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
        const results = await Promise.all(this.children.map((child) => child.canLeave()));
        if (results.some(result => result === false)) {
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
        await this.nextContent.loadComponent(this.context, this.element, this);
        this.nextContent.initializeComponent();
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
    clearTaggedNodes() {
        if ((this.content || null) !== null) {
            this.content.clearTaggedNodes();
        }
        if (this.nextContent) {
            this.nextContent.clearTaggedNodes();
        }
    }
    finalizeContentChange() {
        this.previousViewportState = null;
    }
    async abortContentChange() {
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
    binding(flags) {
        if (this.content.componentInstance) {
            this.content.initializeComponent();
        }
    }
    async attaching(flags) {
        Reporter.write(10000, 'ATTACHING viewport', this.name, this.content, this.nextContent);
        this.enabled = true;
        if (this.content.componentInstance) {
            // Only acts if not already entered
            await this.content.enter(this.content.instruction);
            this.content.addComponent(this.element);
        }
    }
    async detaching(flags) {
        Reporter.write(10000, 'DETACHING viewport', this.name);
        if (this.content.componentInstance) {
            // Only acts if not already left
            await this.content.leave(this.content.instruction);
            this.content.removeComponent(this.element, this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful);
        }
        this.enabled = false;
    }
    async unbinding(flags) {
        if (this.content.componentInstance) {
            await this.content.terminateComponent(this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful);
        }
    }
    addChild(viewport) {
        if (!this.children.some(vp => vp === viewport)) {
            this.children.push(viewport);
            viewport.parent = this;
        }
    }
    removeChild(viewport) {
        const index = this.children.indexOf(viewport);
        if (index >= 0) {
            this.children.splice(index, 1);
            viewport.parent = null;
        }
    }
    getEnabledViewports() {
        return this.children.filter((viewport) => viewport.enabled).reduce((viewports, viewport) => {
            viewports[viewport.name] = viewport;
            return viewports;
        }, {});
    }
    findViewports(instructions, alreadyFound, disregardViewports = false) {
        const foundViewports = [];
        const remainingInstructions = [];
        // Get a shallow copy of all available viewports
        const availableViewports = { ...this.getEnabledViewports() };
        for (const instruction of alreadyFound.filter(found => found.scope === this)) {
            availableViewports[instruction.viewportName] = null;
        }
        const viewportInstructions = instructions.slice();
        // The viewport is already known
        if (!disregardViewports) {
            for (let i = 0; i < viewportInstructions.length; i++) {
                const instruction = viewportInstructions[i];
                if (instruction.viewport) {
                    const remaining = this.foundViewport(instruction, instruction.viewport, disregardViewports);
                    foundViewports.push(instruction);
                    remainingInstructions.push(...remaining);
                    availableViewports[instruction.viewport.name] = null;
                    viewportInstructions.splice(i--, 1);
                }
            }
        }
        // Configured viewport is ruling
        for (let i = 0; i < viewportInstructions.length; i++) {
            const instruction = viewportInstructions[i];
            instruction.needsViewportDescribed = true;
            for (const name in availableViewports) {
                const viewport = availableViewports[name];
                // TODO: Also check if (resolved) component wants a specific viewport
                if (viewport && viewport.wantComponent(instruction.componentName)) {
                    const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
                    foundViewports.push(instruction);
                    remainingInstructions.push(...remaining);
                    availableViewports[name] = null;
                    viewportInstructions.splice(i--, 1);
                    break;
                }
            }
        }
        // Next in line is specified viewport (but not if we're disregarding viewports)
        if (!disregardViewports) {
            for (let i = 0; i < viewportInstructions.length; i++) {
                const instruction = viewportInstructions[i];
                const name = instruction.viewportName;
                if (!name || !name.length) {
                    continue;
                }
                const newScope = instruction.ownsScope;
                if (!this.getEnabledViewports()[name]) {
                    this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
                    availableViewports[name] = this.getEnabledViewports()[name];
                }
                const viewport = availableViewports[name];
                if (viewport && viewport.acceptComponent(instruction.componentName)) {
                    const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
                    foundViewports.push(instruction);
                    remainingInstructions.push(...remaining);
                    availableViewports[name] = null;
                    viewportInstructions.splice(i--, 1);
                }
            }
        }
        // Finally, only one accepting viewport left?
        for (let i = 0; i < viewportInstructions.length; i++) {
            const instruction = viewportInstructions[i];
            const remainingViewports = [];
            for (const name in availableViewports) {
                const viewport = availableViewports[name];
                if (viewport && viewport.acceptComponent(instruction.componentName)) {
                    remainingViewports.push(viewport);
                }
            }
            if (remainingViewports.length === 1) {
                const viewport = remainingViewports.shift();
                const remaining = this.foundViewport(instruction, viewport, disregardViewports, true);
                foundViewports.push(instruction);
                remainingInstructions.push(...remaining);
                availableViewports[viewport.name] = null;
                viewportInstructions.splice(i--, 1);
            }
        }
        // If we're ignoring viewports, we now match them anyway
        if (disregardViewports) {
            for (let i = 0; i < viewportInstructions.length; i++) {
                const instruction = viewportInstructions[i];
                let viewport = instruction.viewport;
                if (!viewport) {
                    const name = instruction.viewportName;
                    if (!name || !name.length) {
                        continue;
                    }
                    const newScope = instruction.ownsScope;
                    if (!this.getEnabledViewports()[name]) {
                        this.addViewport(name, null, null, { scope: newScope, forceDescription: true });
                        availableViewports[name] = this.getEnabledViewports()[name];
                    }
                    viewport = availableViewports[name];
                }
                if (viewport && viewport.acceptComponent(instruction.componentName)) {
                    const remaining = this.foundViewport(instruction, viewport, disregardViewports);
                    foundViewports.push(instruction);
                    remainingInstructions.push(...remaining);
                    availableViewports[viewport.name] = null;
                    viewportInstructions.splice(i--, 1);
                }
            }
        }
        return {
            foundViewports,
            remainingInstructions,
        };
    }
    foundViewport(instruction, viewport, withoutViewports, doesntNeedViewportDescribed = false) {
        instruction.setViewport(viewport);
        if (doesntNeedViewportDescribed) {
            instruction.needsViewportDescribed = false;
        }
        const remaining = (instruction.nextScopeInstructions || []).slice();
        for (const rem of remaining) {
            if (rem.scope === null) {
                rem.scope = viewport.scope || viewport.owningScope;
            }
        }
        return remaining;
    }
    addViewport(name, element, context, options = {}) {
        let viewport = this.getEnabledViewports()[name];
        // Each au-viewport element has its own Viewport
        if (element && viewport && viewport.element !== null && viewport.element !== element) {
            viewport.enabled = false;
            viewport = this.children.find(child => child.name === name && child.element === element) || null;
            if (viewport) {
                viewport.enabled = true;
            }
        }
        if (!viewport) {
            viewport = new Viewport(this.router, name, null, null, this.scope || this.owningScope, !!options.scope, options);
            this.addChild(viewport);
        }
        // TODO: Either explain why || instead of && here (might only need one) or change it to && if that should turn out to not be relevant
        if (element || context) {
            viewport.setElement(element, context, options);
        }
        return viewport;
    }
    removeViewport(viewport, element, context) {
        if ((!element && !context) || viewport.remove(element, context)) {
            this.removeChild(viewport);
            return true;
        }
        return false;
    }
    allViewports(includeDisabled = false) {
        const viewports = this.children.filter((viewport) => viewport.enabled || includeDisabled);
        for (const scope of this.children) {
            viewports.push(...scope.allViewports(includeDisabled));
        }
        return viewports;
    }
    reparentViewportInstructions() {
        const enabledViewports = this.children.filter(viewport => viewport.enabled
            && viewport.content.content
            && viewport.content.content.componentName);
        if (!enabledViewports.length) {
            return null;
        }
        for (const viewport of enabledViewports) {
            if (viewport.content.content !== void 0 && viewport.content.content !== null) {
                const childInstructions = viewport.reparentViewportInstructions();
                viewport.content.content.nextScopeInstructions = childInstructions !== null && childInstructions.length > 0 ? childInstructions : null;
            }
        }
        return enabledViewports.map(viewport => viewport.content.content);
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