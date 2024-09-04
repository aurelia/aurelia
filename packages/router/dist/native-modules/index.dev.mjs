import { onResolve, getResourceKeyFor, resolve, IEventAggregator, IContainer, Protocol, DI, ILogger, Registration } from '../../../kernel/dist/native-modules/index.mjs';
import { CustomElement, isCustomElementViewModel, Controller, IPlatform, IWindow, IHistory, ILocation, IAppRoot, CustomAttribute, BindingMode, INode, IController, AppTask } from '../../../runtime-html/dist/native-modules/index.mjs';
import { Metadata } from '../../../metadata/dist/native-modules/index.mjs';
import { RouteRecognizer as RouteRecognizer$1, ConfigurableRoute as ConfigurableRoute$1, RecognizedRoute as RecognizedRoute$1, Endpoint as Endpoint$2 } from '../../../route-recognizer/dist/native-modules/index.mjs';
import { IInstruction } from '../../../template-compiler/dist/native-modules/index.mjs';

let Endpoint$1 = class Endpoint {
    constructor(router, 
    /**
     * The endpoint name
     */
    name, 
    /**
     * The custom element connected to this endpoint
     */
    connectedCE, options = {}) {
        this.router = router;
        this.name = name;
        this.connectedCE = connectedCE;
        this.options = options;
        /**
         * The contents of the endpoint. New contents are pushed to this, making
         * the last one the active one.
         */
        this.contents = [];
        /**
         * The action (to be) performed by the transition
         */
        this.transitionAction = '';
        /**
         * The configured route path to this endpoint
         */
        this.path = null;
    }
    /**
     * The current content of the endpoint
     */
    getContent() {
        return this.contents[0];
    }
    /**
     * The next, to be transitioned in, content of the endpoint
     */
    getNextContent() {
        return this.contents.length > 1 ? this.contents[this.contents.length - 1] : null;
    }
    /**
     * The content of the endpoint from a specific time (index)
     */
    getTimeContent(_timestamp = Infinity) {
        return this.getContent();
    }
    /**
     * The content for a specific navigation (or coordinator)
     */
    getNavigationContent(navigation) {
        if (navigation instanceof NavigationCoordinator) {
            navigation = navigation.navigation;
        }
        if (navigation instanceof Navigation) {
            return this.contents.find(content => content.navigation === navigation) ?? null;
        }
        return null;
    }
    /**
     * The active content, next or current.
     */
    get activeContent() {
        return this.getNextContent() ?? this.getContent();
    }
    /**
     * The routing scope that's currently, based on content, connected
     * to the endpoint. This is always the actually connected scope.
     */
    get connectedScope() {
        return this.activeContent?.connectedScope;
    }
    /**
     * The current, based on content, routing scope for the endpoint.
     * The scope used when finding next scope endpoints and configured routes.
     */
    get scope() {
        return this.connectedScope.scope;
    }
    /**
     * The routing scope that currently, based on content, owns the viewport.
     */
    get owningScope() {
        return this.connectedScope.owningScope;
    }
    /**
     * The connected custom element's controller.
     */
    get connectedController() {
        return this.connectedCE?.$controller ?? null;
    }
    /**
     * Whether the endpoint is a Viewport.
     */
    get isViewport() {
        return this instanceof Viewport;
    }
    /**
     * Whether the endpoint is a ViewportScope.
     */
    get isViewportScope() {
        return this instanceof ViewportScope;
    }
    /**
     * Whether the endpoint is empty. Overloaded with proper check
     * by Viewport and ViewportScope.
     */
    get isEmpty() {
        return false;
    }
    /**
     * For debug purposes.
     */
    get pathname() {
        return this.connectedScope.pathname;
    }
    /**
     * For debug purposes.
     */
    toString() {
        throw new Error(`Method 'toString' needs to be implemented in all endpoints!`);
    }
    /**
     * Set the next content for the endpoint. Returns the action that the endpoint
     * will take when the navigation coordinator starts the transition.
     *
     * @param _instruction - The routing instruction describing the next content
     * @param _navigation - The navigation that requests the content change
     */
    setNextContent(_instruction, _navigation) {
        throw new Error(`Method 'setNextContent' needs to be implemented in all endpoints!`);
    }
    /**
     * Connect an endpoint CustomElement to this endpoint, applying options
     * while doing so.
     *
     * @param _connectedCE - The custom element to connect
     * @param _options - The options to apply
     */
    setConnectedCE(_connectedCE, _options) {
        throw new Error(`Method 'setConnectedCE' needs to be implemented in all endpoints!`);
    }
    /**
     * Transition from current content to the next.
     *
     * @param _coordinator - The coordinator of the navigation
     */
    transition(_coordinator) {
        throw new Error(`Method 'transition' needs to be implemented in all endpoints!`);
    }
    /**
     * Finalize the change of content by making the next content the current
     * content. The previously current content is deleted.
     */
    finalizeContentChange(_coordinator, _step) {
        throw new Error(`Method 'finalizeContentChange' needs to be implemented in all endpoints!`);
    }
    /**
     * Abort the change of content. The next content is freed/discarded.
     *
     * @param _step - The previous step in this transition Run
     */
    cancelContentChange(_coordinator, _noExitStep = null) {
        throw new Error(`Method 'cancelContentChange' needs to be implemented in all endpoints!`);
    }
    /**
     * Get any configured routes in the relevant content's component type.
     */
    getRoutes() {
        throw new Error(`Method 'getRoutes' needs to be implemented in all endpoints!`);
    }
    /**
     * Get the title for the content.
     *
     * @param navigation - The navigation that requests the content change
     */
    getTitle(_navigation) {
        throw new Error(`Method 'getTitle' needs to be implemented in all endpoints!`);
    }
    /**
     * Remove the endpoint, deleting its contents.
     *
     * @param _step - The previous step in this transition Run
     * @param _connectedCE - The custom element that's being removed
     */
    removeEndpoint(_step, _connectedCE) {
        this.contents.forEach(content => content.delete());
        return true;
    }
    /**
     * Check if the next content can be unloaded.
     *
     * @param step - The previous step in this transition Run
     */
    canUnload(_coordinator, _step) {
        return true;
    }
    /**
     * Check if the next content can be loaded.
     *
     * @param step - The previous step in this transition Run
     */
    canLoad(_coordinator, _step) {
        return true;
    }
    /**
     * Unload the next content.
     *
     * @param step - The previous step in this transition Run
     */
    unload(_coordinator, _step) {
        return;
    }
    /**
     * Load the next content.
     *
     * @param step - The previous step in this transition Run
     */
    load(_coordinator, _step) {
        return;
    }
};

/**
 * The endpoint content encapsulates the content of an endpoint.
 *
 * Endpoint contents are used to represent the full endpoint state
 * and can be used for caching.
 */
class EndpointContent {
    constructor(router, 
    /**
     * The endpoint the endpoint content belongs to
     */
    endpoint, 
    /**
     * The routing scope the endpoint content belongs to/is owned by
     */
    owningScope, 
    /**
     * Whether the endpoint has its own routing scope, containing
     * endpoints it owns
     */
    hasScope, 
    /**
     * The routing instruction that has created the content
     */
    instruction = RoutingInstruction.create(''), 
    /**
     * The navigation that created the endpoint content
     */
    navigation = Navigation.create({
        instruction: '',
        fullStateInstruction: '',
    })) {
        this.router = router;
        this.endpoint = endpoint;
        this.instruction = instruction;
        this.navigation = navigation;
        /**
         * Whether the content has completed its navigation
         */
        this.completed = false;
        this.connectedScope = new RoutingScope(router, hasScope, owningScope, this);
        // Skip if no root scope (meaning we ARE the root scope!)
        if (this.router.rootScope !== null) {
            (this.endpoint.connectedScope?.parent ?? this.router.rootScope.scope).addChild(this.connectedScope);
        }
    }
    /**
     * Whether the endpoint content is the active one within its endpoint
     */
    get isActive() {
        return this.endpoint.activeContent === this;
    }
    /**
     * Delete the endpoint content and its routing scope
     */
    delete() {
        this.connectedScope.parent?.removeChild(this.connectedScope);
    }
}

/**
 * Used when founding route/instructions
 *
 * @internal
 */
class FoundRoute {
    constructor(match = null, matching = '', instructions = [], remaining = '', 
    // public remaining: string | null = null,
    params = {}) {
        this.match = match;
        this.matching = matching;
        this.instructions = instructions;
        this.remaining = remaining;
        this.params = params;
    }
    get foundConfiguration() {
        return this.match !== null;
    }
    get foundInstructions() {
        return this.instructions.some(instruction => !instruction.component.none);
    }
    get hasRemaining() {
        return this.instructions.some(instruction => instruction.hasNextScopeInstructions);
    }
}

class InstructionParser {
    static parse(seps, instructions, grouped, topScope) {
        if (!instructions) {
            return { instructions: [], remaining: '' };
        }
        if (instructions.startsWith(seps.sibling) && !InstructionParser.isAdd(seps, instructions)) {
            throw new Error(`Instruction parser error: Unnecessary siblings separator ${seps.sibling} in beginning of instruction part "${instructions}".`);
        }
        const routingInstructions = [];
        let guard = 1000;
        while (instructions.length && guard) {
            guard--;
            if (instructions.startsWith(seps.scope)) {
                if (routingInstructions.length === 0) {
                    throw new Error(`Instruction parser error: Children without parent in instruction part "(${instructions}" is not allowed.`);
                }
                topScope = false;
                instructions = instructions.slice(seps.scope.length);
                const groupStart = instructions.startsWith(seps.groupStart);
                if (groupStart) {
                    instructions = instructions.slice(seps.groupStart.length);
                    grouped = true;
                }
                const { instructions: found, remaining } = InstructionParser.parse(seps, instructions, groupStart, false);
                routingInstructions[routingInstructions.length - 1].nextScopeInstructions = found;
                instructions = remaining;
            }
            else if (instructions.startsWith(seps.groupStart)) {
                instructions = instructions.slice(seps.groupStart.length);
                const { instructions: found, remaining } = InstructionParser.parse(seps, instructions, true, topScope);
                routingInstructions.push(...found);
                instructions = remaining;
            }
            else if (instructions.startsWith(seps.groupEnd)) {
                if (grouped) {
                    instructions = instructions.slice(seps.groupEnd.length);
                }
                let i = 0;
                const ii = instructions.length;
                for (; i < ii; i++) {
                    if (instructions.slice(i, i + seps.sibling.length) === seps.sibling) {
                        return { instructions: routingInstructions, remaining: instructions };
                    }
                    if (instructions.slice(i, i + seps.groupEnd.length) !== seps.groupEnd) {
                        if (routingInstructions.length > 1) {
                            throw new Error(`Instruction parser error: Children below scope ${seps.groupStart}${seps.groupEnd} in instruction part "(${instructions}" is not allowed.`);
                        }
                        else {
                            instructions = instructions.slice(i);
                            break;
                        }
                    }
                }
                if (i >= ii) {
                    return { instructions: routingInstructions, remaining: instructions };
                }
            }
            else if (instructions.startsWith(seps.sibling) && !InstructionParser.isAdd(seps, instructions)) {
                if (!grouped) {
                    return { instructions: routingInstructions, remaining: instructions };
                }
                instructions = instructions.slice(seps.sibling.length);
            }
            else {
                const { instruction: routingInstruction, remaining } = InstructionParser.parseOne(seps, instructions);
                routingInstructions.push(routingInstruction);
                instructions = remaining;
            }
        }
        return { instructions: routingInstructions, remaining: instructions };
    }
    static isAdd(seps, instruction) {
        return (instruction === seps.add || instruction.startsWith(`${seps.add}${seps.viewport}`));
    }
    static parseOne(seps, instruction) {
        const tokens = [seps.parameters, seps.viewport, seps.noScope, seps.groupEnd, seps.scope, seps.sibling];
        let component = void 0;
        let parametersString = void 0;
        let viewport = void 0;
        let scope = true;
        let token;
        let pos;
        const unparsed = instruction;
        const specials = [seps.add, seps.clear];
        for (const special of specials) {
            if (instruction === special) {
                component = instruction;
                instruction = '';
                tokens.shift(); // parameters
                tokens.shift(); // viewport
                token = seps.viewport;
                break;
            }
        }
        if (component === void 0) {
            for (const special of specials) {
                if (instruction.startsWith(`${special}${seps.viewport}`)) {
                    component = special;
                    instruction = instruction.slice(`${special}${seps.viewport}`.length);
                    tokens.shift(); // parameters
                    tokens.shift(); // viewport
                    token = seps.viewport;
                    break;
                }
            }
        }
        if (component === void 0) {
            ({ token, pos } = InstructionParser.findNextToken(instruction, tokens));
            component = pos !== -1 ? instruction.slice(0, pos) : instruction;
            instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
            tokens.shift(); // parameters
            if (token === seps.parameters) {
                ({ token, pos } = InstructionParser.findNextToken(instruction, [seps.parametersEnd]));
                parametersString = instruction.slice(0, pos);
                instruction = instruction.slice(pos + token.length);
                ({ token } = InstructionParser.findNextToken(instruction, tokens));
                instruction = instruction.slice(token.length);
            }
            tokens.shift(); // viewport
        }
        if (token === seps.viewport) {
            ({ token, pos } = InstructionParser.findNextToken(instruction, tokens));
            viewport = pos !== -1 ? instruction.slice(0, pos) : instruction;
            instruction = pos !== -1 ? instruction.slice(pos + token.length) : '';
        }
        tokens.shift(); // noScope
        if (token === seps.noScope) {
            scope = false;
        }
        // Restore token that belongs to next instruction
        if (token === seps.groupEnd || token === seps.scope || token === seps.sibling) {
            instruction = `${token}${instruction}`;
        }
        if ((component ?? '') === '') {
            throw new Error(`Instruction parser error: No component specified in instruction part "${instruction}".`);
        }
        const routingInstruction = RoutingInstruction.create(component, viewport, parametersString, scope);
        routingInstruction.unparsed = unparsed;
        return { instruction: routingInstruction, remaining: instruction };
    }
    static findNextToken(instruction, tokens) {
        const matches = {};
        // Tokens can have length > 1
        for (const token of tokens) {
            const tokenPos = instruction.indexOf(token);
            if (tokenPos > -1) {
                matches[token] = instruction.indexOf(token);
            }
        }
        const pos = Math.min(...Object.values(matches));
        for (const token in matches) {
            if (matches[token] === pos) {
                return { token, pos };
            }
        }
        return { token: '', pos: -1 };
    }
}

/**
 * The router's title configuration
 */
class TitleOptions {
    constructor(
    /**
     * The full application title. Can use placeholders `${componentTitles}`
     * and `${appTitleSeparator} for joined component titles and a separator
     * between the component titles and the application name.
     * Default: '${componentTitles}\${appTitleSeparator}Aurelia'
     */
    // eslint-disable-next-line no-useless-escape
    appTitle = '${componentTitles}\${appTitleSeparator}Aurelia', 
    /**
     * The separator between the joined component titles and application name.
     * Default: ' | '
     */
    appTitleSeparator = ' | ', 
    /**
     * In what order component titles are joined into `${componentTitles}`.
     * Default: 'top-down'
     */
    componentTitleOrder = 'top-down', 
    /**
     * The separator between the component titles. Default: ' > '
     */
    componentTitleSeparator = ' > ', 
    /**
     * Whether components' names should be used sa titles for components
     * that doesn't specify a title. Default: true
     */
    useComponentNames = true, 
    /**
     * Prefixes that are removed from components' names before they are
     * used as titles. Default: 'app-'
     */
    componentPrefix = 'app-', 
    /**
     * Function that is called for each component/route title. The
     * returned value is used instead as title. Default: undefined
     */
    transformTitle) {
        this.appTitle = appTitle;
        this.appTitleSeparator = appTitleSeparator;
        this.componentTitleOrder = componentTitleOrder;
        this.componentTitleSeparator = componentTitleSeparator;
        this.useComponentNames = useComponentNames;
        this.componentPrefix = componentPrefix;
        this.transformTitle = transformTitle;
    }
    static create(input = {}) {
        input = typeof input === 'string' ? { appTitle: input } : input;
        return new TitleOptions(input.appTitle, input.appTitleSeparator, input.componentTitleOrder, input.componentTitleSeparator, input.useComponentNames, input.componentPrefix, input.transformTitle);
    }
    static for(context) {
        return RouterOptions.for(context).title;
    }
    apply(input = {}) {
        input = typeof input === 'string' ? { appTitle: input } : input;
        this.appTitle = input.appTitle ?? this.appTitle;
        this.appTitleSeparator = input.appTitleSeparator ?? this.appTitleSeparator;
        this.componentTitleOrder = input.componentTitleOrder ?? this.componentTitleOrder;
        this.componentTitleSeparator = input.componentTitleSeparator ?? this.componentTitleSeparator;
        this.useComponentNames = input.useComponentNames ?? this.useComponentNames;
        this.componentPrefix = input.componentPrefix ?? this.componentPrefix;
        this.transformTitle = 'transformTitle' in input ? input.transformTitle : this.transformTitle;
    }
}
/**
 * The separators used in the direct routing syntax
 */
class Separators {
    constructor(
    /**
     * The character(s) that denotes the start of viewport name
     */
    viewport = '@', // ':',
    /**
     * The character(s) that separates siblings
     */
    sibling = '+', // '/',
    /**
     * The character(s) that denotes the start of a new scope
     */
    scope = '/', // '+',
    /**
     * The character(s) to indicate the start of a grou
     */
    groupStart = '(', // ''
    /**
     * The character(s) to indicate the end of a group
     */
    groupEnd = ')', // ''
    /**
     * The character(s) to indicate that the viewport doesn't have
     * a routing scope
     */
    noScope = '!', 
    /**
     * The character(s) that denotes the start of component parameters
     */
    parameters = '(', // '='
    /**
     * The character(s) that denotes the end of component parameters
     */
    parametersEnd = ')', // ''
    /**
     * The character(s) that separates component parameters
     */
    parameterSeparator = ',', // '&'
    /**
     * The character(s) that separates a component parameter's key and value
     */
    parameterKeySeparator = '=', 
    /**
     * The character(s) that denotes that the instructions are additive/not
     * full viewport state
     */
    add = '+', 
    /**
     * The character(s) that denotes that a viewport or routing scope should
     * be cleared/emptied
     */
    clear = '-', 
    /**
     * The character(s) that denotes the start of a component method (not yet
     * implemented)
     */
    action = '.') {
        this.viewport = viewport;
        this.sibling = sibling;
        this.scope = scope;
        this.groupStart = groupStart;
        this.groupEnd = groupEnd;
        this.noScope = noScope;
        this.parameters = parameters;
        this.parametersEnd = parametersEnd;
        this.parameterSeparator = parameterSeparator;
        this.parameterKeySeparator = parameterKeySeparator;
        this.add = add;
        this.clear = clear;
        this.action = action;
    }
    static create(input = {}) {
        return new Separators(input.viewport, input.sibling, input.scope, input.groupStart, input.groupEnd, input.noScope, input.parameters, input.parametersEnd, input.parameterSeparator, input.parameterKeySeparator, input.add, input.clear, input.action);
    }
    static for(context) {
        return RouterOptions.for(context).separators;
    }
    apply(input = {}) {
        this.viewport = input.viewport ?? this.viewport;
        this.sibling = input.sibling ?? this.sibling;
        this.scope = input.scope ?? this.scope;
        this.groupStart = input.groupStart ?? this.groupStart;
        this.groupEnd = input.groupEnd ?? this.groupEnd;
        this.noScope = input.noScope ?? this.noScope;
        this.parameters = input.parameters ?? this.parameters;
        this.parametersEnd = input.parametersEnd ?? this.parametersEnd;
        this.parameterSeparator = input.parameterSeparator ?? this.parameterSeparator;
        this.parameterKeySeparator = input.parameterKeySeparator ?? this.parameterKeySeparator;
        this.add = input.add ?? this.add;
        this.clear = input.clear ?? this.clear;
        this.action = input.action ?? this.action;
    }
}
/**
 * The indicators used to mark different states
 */
class Indicators {
    constructor(
    /**
     * The name of the class indicating that the load link is active
     */
    loadActive = 'active', 
    /**
     * The name of the class indicating that the viewport is navigating.
     * The different types of navigation -- first, new, back, forward and
     * refresh -- will be added as well with this class as prefix, for
     * example 'navigating-back'.
     */
    viewportNavigating = 'navigating') {
        this.loadActive = loadActive;
        this.viewportNavigating = viewportNavigating;
    }
    static create(input = {}) {
        return new Indicators(input.loadActive, input.viewportNavigating);
    }
    static for(context) {
        return RouterOptions.for(context).indicators;
    }
    apply(input = {}) {
        this.loadActive = input.loadActive ?? this.loadActive;
        this.viewportNavigating = input.viewportNavigating ?? this.viewportNavigating;
    }
}
class RouterOptions {
    constructor(
    /**
     * The separators used in the direct routing syntax
     */
    separators = Separators.create(), 
    /**
     * The indicators used to mark different states
     */
    indicators = Indicators.create(), 
    /**
     * Whether the fragment should be used for the url/path
     */
    useUrlFragmentHash = true, 
    /**
     * The base path (base element href) for the app. If set to
     * - a string that string is used as base path,
     * - null the value is read from base element's href attribute (default).
     * The base path is removed or added to the Location url as
     * needed.
     */
    basePath = null, 
    /**
     * Whether the `href` html attribute can be used like the `load` custom attribute
     */
    useHref = true, 
    /**
     * The amount of navigation history entries that are stateful. Default: 0
     */
    statefulHistoryLength = 0, 
    /**
     * Whether direct routing should be used. Default: true
     */
    useDirectRouting = true, 
    /**
     * Whether configured routes should be used. Default: true
     */
    useConfiguredRoutes = true, 
    /**
     * Whether a load instruction by default is a complete state navigation,
     * for all viewports, or a partial state navigation that is only specifying
     * the change of the new state of specified viewports. Default: false
     */
    completeStateNavigations = false, 
    /**
     * The router's title configuration
     */
    title = TitleOptions.create(), 
    /**
     * The navigation states that are synced meaning that sibling viewports
     * will wait for all other siblings to reach the navigation state before
     * continuing with the next steps in the transition. For example, the
     * `guardedUnload` sync state means that no sibling will continue with
     * the `canLoad` hook before all siblings have completed the `canUnload`
     * hooks. To get v1 routing hook behavior, where all routing hooks are
     * synced,`guardedLoad`, `unload` and `load` should be added to default.
     * Default: `guardedUnload`, `swapped`, `completed`
     */
    navigationSyncStates = ['guardedUnload', 'swapped', 'completed'], 
    /**
     * How contents are swapped in a viewport when transitioning. Default: `attach-next-detach-current`
     */
    swapOrder = 'attach-next-detach-current', 
    /**
     * The component to be loaded if a specified can't be loaded.
     * The unloadable component is passed as a parameter to the fallback.
     */
    fallback = '', 
    /**
     * Whether the fallback action is to load the fallback component in
     * place of the unloadable component and continue with any child
     * instructions or if the fallback is to be called and the processing
     * of the children to be aborted.
     */
    fallbackAction = 'abort') {
        this.separators = separators;
        this.indicators = indicators;
        this.useUrlFragmentHash = useUrlFragmentHash;
        this.basePath = basePath;
        this.useHref = useHref;
        this.statefulHistoryLength = statefulHistoryLength;
        this.useDirectRouting = useDirectRouting;
        this.useConfiguredRoutes = useConfiguredRoutes;
        this.completeStateNavigations = completeStateNavigations;
        this.title = title;
        this.navigationSyncStates = navigationSyncStates;
        this.swapOrder = swapOrder;
        this.fallback = fallback;
        this.fallbackAction = fallbackAction;
        /**
         * Any routing hooks that were set during registration with
         * RouterConfiguration.customize are temporarily stored here
         * so that they can be set once properly instantiated.
         */
        this.registrationHooks = [];
    }
    static create(input = {}) {
        return new RouterOptions(Separators.create(input.separators), Indicators.create(input.indicators), input.useUrlFragmentHash, input.basePath, input.useHref, input.statefulHistoryLength, input.useDirectRouting, input.useConfiguredRoutes, input.completeStateNavigations, TitleOptions.create(input.title), input.navigationSyncStates, input.swapOrder, input.fallback, input.fallbackAction);
    }
    static for(context) {
        if (context instanceof RouterConfiguration) {
            return context.options;
        }
        if (context instanceof Router) {
            context = context.configuration;
        }
        else {
            context = context.get(IRouterConfiguration);
        }
        return context.options;
    }
    /**
     * Apply router options.
     *
     * @param options - The options to apply
     */
    apply(options) {
        options = options ?? {};
        this.separators.apply(options.separators);
        this.indicators.apply(options.indicators);
        this.useUrlFragmentHash = options.useUrlFragmentHash ?? this.useUrlFragmentHash;
        this.basePath = options.basePath ?? this.basePath;
        this.useHref = options.useHref ?? this.useHref;
        this.statefulHistoryLength = options.statefulHistoryLength ?? this.statefulHistoryLength;
        this.useDirectRouting = options.useDirectRouting ?? this.useDirectRouting;
        this.useConfiguredRoutes = options.useConfiguredRoutes ?? this.useConfiguredRoutes;
        this.completeStateNavigations = options.completeStateNavigations ?? this.completeStateNavigations;
        this.title.apply(options.title);
        this.navigationSyncStates = options.navigationSyncStates ?? this.navigationSyncStates;
        this.swapOrder = options.swapOrder ?? this.swapOrder;
        this.fallback = options.fallback ?? this.fallback;
        this.fallbackAction = options.fallbackAction ?? this.fallbackAction;
        // TODO: Fix RoutingHooks!
        if (Array.isArray(options.hooks)) {
            if (this.routerConfiguration !== void 0) {
                options.hooks.forEach(hook => this.routerConfiguration.addHook(hook.hook, hook.options));
            }
            else {
                this.registrationHooks = options.hooks;
            }
        }
    }
    setRouterConfiguration(routerConfiguration) {
        this.routerConfiguration = routerConfiguration;
        // Set previously configured routing hooks
        // TODO: Fix RoutingHooks!
        this.registrationHooks.forEach(hook => this.routerConfiguration.addHook(hook.hook, hook.options));
        this.registrationHooks.length = 0;
    }
}

class InstructionParameters {
    constructor() {
        this.parametersString = null;
        this.parametersRecord = null;
        this.parametersList = null;
        this.parametersType = 'none';
    }
    get none() {
        return this.parametersType === 'none';
    }
    // Static methods
    static create(componentParameters) {
        const parameters = new InstructionParameters();
        parameters.set(componentParameters);
        return parameters;
    }
    // TODO: Deal with separators in data and complex types
    static parse(context, parameters, uriComponent = false) {
        if (parameters == null || parameters.length === 0) {
            return [];
        }
        const seps = Separators.for(context);
        const parameterSeparator = seps.parameterSeparator;
        const parameterKeySeparator = seps.parameterKeySeparator;
        if (typeof parameters === 'string') {
            const list = [];
            const params = parameters.split(parameterSeparator);
            for (const param of params) {
                let key;
                let value;
                [key, value] = param.split(parameterKeySeparator);
                if (value === void 0) {
                    value = uriComponent ? decodeURIComponent(key) : key;
                    key = void 0;
                }
                else if (uriComponent) {
                    key = decodeURIComponent(key);
                    value = decodeURIComponent(value);
                }
                list.push({ key, value });
            }
            return list;
        }
        if (Array.isArray(parameters)) {
            return parameters.map(param => ({ key: void 0, value: param }));
        }
        const keys = Object.keys(parameters);
        keys.sort();
        return keys.map(key => ({ key, value: parameters[key] }));
    }
    get typedParameters() {
        switch (this.parametersType) {
            case 'string':
                return this.parametersString;
            case 'array':
                return this.parametersList;
            case 'object':
                return this.parametersRecord;
            default:
                return null;
        }
    }
    // TODO: Deal with separators in data and complex types
    static stringify(context, parameters, uriComponent = false) {
        if (!Array.isArray(parameters) || parameters.length === 0) {
            return '';
        }
        const seps = Separators.for(context);
        return parameters
            .map(param => {
            const key = param.key !== void 0 && uriComponent ? encodeURIComponent(param.key) : param.key;
            const value = uriComponent ? encodeURIComponent(param.value) : param.value;
            return key !== void 0 && key !== value ? key + seps.parameterKeySeparator + value : value;
        })
            .join(seps.parameterSeparator);
    }
    /**
     * Whether a record of instruction parameters contains another record of
     * instruction parameters.
     *
     * @param parametersToSearch - Parameters that should contain (superset)
     * @param parametersToFind - Parameters that should be contained (subset)
     */
    static contains(parametersToSearch, parametersToFind) {
        // All parameters to find need to exist in parameters to search
        return Object.keys(parametersToFind).every(key => parametersToFind[key] === parametersToSearch[key]);
    }
    // Instance methods
    parameters(context) {
        return InstructionParameters.parse(context, this.typedParameters);
    }
    set(parameters) {
        this.parametersString = null;
        this.parametersList = null;
        this.parametersRecord = null;
        if (parameters == null || parameters === '') {
            this.parametersType = 'none';
            parameters = null;
        }
        else if (typeof parameters === 'string') {
            this.parametersType = 'string';
            this.parametersString = parameters;
        }
        else if (Array.isArray(parameters)) {
            this.parametersType = 'array';
            this.parametersList = parameters;
        }
        else {
            this.parametersType = 'object';
            this.parametersRecord = parameters;
        }
    }
    get(context, name) {
        if (name === void 0) {
            // TODO: Turn this into a parameters object instead
            return this.parameters(context);
        }
        const params = this.parameters(context).filter(p => p.key === name).map(p => p.value);
        if (params.length === 0) {
            return;
        }
        return params.length === 1 ? params[0] : params;
    }
    // This only works with objects added to objects!
    addParameters(parameters) {
        if (this.parametersType === 'none') {
            return this.set(parameters);
        }
        if (this.parametersType !== 'object') {
            throw new Error('Can\'t add object parameters to existing non-object parameters!');
        }
        this.set({ ...this.parametersRecord, ...parameters });
    }
    toSpecifiedParameters(context, specifications) {
        specifications = specifications ?? [];
        const parameters = this.parameters(context);
        const specified = {};
        for (const spec of specifications) {
            // First get named if it exists
            let index = parameters.findIndex(param => param.key === spec);
            if (index >= 0) {
                const [parameter] = parameters.splice(index, 1);
                specified[spec] = parameter.value;
            }
            else {
                // Otherwise get first unnamed
                index = parameters.findIndex(param => param.key === void 0);
                if (index >= 0) {
                    const [parameter] = parameters.splice(index, 1);
                    specified[spec] = parameter.value;
                }
            }
        }
        // Add all remaining named
        for (const parameter of parameters.filter(param => param.key !== void 0)) {
            specified[parameter.key] = parameter.value;
        }
        let index = specifications.length;
        // Add all remaining unnamed...
        for (const parameter of parameters.filter(param => param.key === void 0)) {
            // ..with an index
            specified[index++] = parameter.value;
        }
        return specified;
    }
    toSortedParameters(context, specifications) {
        specifications = specifications || [];
        const parameters = this.parameters(context);
        const sorted = [];
        for (const spec of specifications) {
            // First get named if it exists
            let index = parameters.findIndex(param => param.key === spec);
            if (index >= 0) {
                const parameter = { ...parameters.splice(index, 1)[0] };
                parameter.key = void 0;
                sorted.push(parameter);
            }
            else {
                // Otherwise get first unnamed
                index = parameters.findIndex(param => param.key === void 0);
                if (index >= 0) {
                    const parameter = { ...parameters.splice(index, 1)[0] };
                    sorted.push(parameter);
                }
                else {
                    // Or an empty
                    sorted.push({ value: void 0 });
                }
            }
        }
        // Add all remaining named
        const params = parameters.filter(param => param.key !== void 0);
        params.sort((a, b) => (a.key || '') < (b.key || '') ? 1 : (b.key || '') < (a.key || '') ? -1 : 0);
        sorted.push(...params);
        // Add all remaining unnamed...
        sorted.push(...parameters.filter(param => param.key === void 0));
        return sorted;
    }
    // TODO: Somewhere we need to check for format such as spaces etc
    same(context, other, componentType) {
        const typeParameters = componentType !== null ? componentType.parameters : [];
        const mine = this.toSpecifiedParameters(context, typeParameters);
        const others = other.toSpecifiedParameters(context, typeParameters);
        return Object.keys(mine).every(key => mine[key] === others[key])
            && Object.keys(others).every(key => others[key] === mine[key]);
    }
}

class InstructionComponent {
    constructor() {
        /**
         * The name of the component.
         */
        this.name = null;
        /**
         * The (custom element) type of the component.
         */
        this.type = null;
        /**
         * The (custom element) instance of the component.
         */
        this.instance = null;
        /**
         * A promise that will resolve into a component name, type,
         * instance or definition.
         */
        this.promise = null;
        /**
         * A function that should result in a component name, type,
         * instance, definition or promise to any of these at the time
         * of route invocation.
         */
        this.func = null;
    }
    /**
     * Create a new instruction component.
     *
     * @param component - The component
     */
    static create(componentAppelation) {
        const component = new InstructionComponent();
        component.set(componentAppelation);
        return component;
    }
    static isName(component) {
        return typeof component === 'string';
    }
    static isDefinition(component) {
        return CustomElement.isType(component.Type);
    }
    static isType(component) {
        return CustomElement.isType(component);
    }
    static isInstance(component) {
        return isCustomElementViewModel(component);
    }
    static isAppelation(component) {
        return InstructionComponent.isName(component)
            || InstructionComponent.isType(component)
            || InstructionComponent.isInstance(component);
    }
    static getName(component) {
        if (InstructionComponent.isName(component)) {
            return component;
        }
        else if (InstructionComponent.isType(component)) {
            return CustomElement.getDefinition(component).name;
        }
        else {
            return InstructionComponent.getName(component.constructor);
        }
    }
    static getType(component) {
        if (InstructionComponent.isName(component)) {
            return null;
        }
        else if (InstructionComponent.isType(component)) {
            return component;
        }
        else {
            return component.constructor;
        }
    }
    static getInstance(component) {
        if (InstructionComponent.isName(component) || InstructionComponent.isType(component)) {
            return null;
        }
        else {
            return component;
        }
    }
    // Instance methods
    set(component) {
        let name = null;
        let type = null;
        let instance = null;
        let promise = null;
        let func = null;
        if (component instanceof Promise) {
            promise = component;
        }
        else if (InstructionComponent.isName(component)) {
            name = InstructionComponent.getName(component);
        }
        else if (InstructionComponent.isType(component)) {
            name = this.getNewName(component);
            type = InstructionComponent.getType(component);
        }
        else if (InstructionComponent.isInstance(component)) {
            name = this.getNewName(InstructionComponent.getType(component));
            type = InstructionComponent.getType(component);
            instance = InstructionComponent.getInstance(component);
        }
        else if (typeof component === 'function') {
            func = component;
        }
        this.name = name;
        this.type = type;
        this.instance = instance;
        this.promise = promise;
        this.func = func;
    }
    resolve(instruction) {
        if (this.func !== null) {
            this.set(this.func(instruction));
        }
        if (!(this.promise instanceof Promise)) {
            return;
        }
        return this.promise.then((component) => {
            // TODO(alpha): Fix the issues with import/module here
            if (InstructionComponent.isAppelation(component)) {
                this.set(component);
                return;
            }
            if (component.default != null) {
                this.set(component.default);
                return;
            }
            const keys = Object.keys(component).filter(key => !key.startsWith('__'));
            if (keys.length === 0) {
                throw new Error(`Failed to load component Type from resolved Promise since no export was specified.`);
            }
            if (keys.length > 1) {
                throw new Error(`Failed to load component Type from resolved Promise since no 'default' export was specified when having multiple exports.`);
            }
            const key = keys[0];
            // TODO(alpha): Fix type here
            // eslint-disable-next-line
            this.set(component[key]);
        });
    }
    get none() {
        return !this.isName() && !this.isType() && !this.isInstance() && !this.isFunction() && !this.isPromise();
    }
    isName() {
        return this.name != null && this.name !== '' && !this.isType() && !this.isInstance();
    }
    isType() {
        return this.type !== null && !this.isInstance();
    }
    isInstance() {
        return this.instance !== null;
    }
    isPromise() {
        return this.promise !== null;
    }
    isFunction() {
        return this.func !== null;
    }
    toType(container, instruction) {
        // TODO: Allow instantiation from a promise here, by awaiting resolve (?)
        void this.resolve(instruction);
        if (this.type !== null) {
            return this.type;
        }
        if (this.name !== null
            && typeof this.name === 'string') {
            if (container === null) {
                throw new Error(`No container available when trying to resolve component '${this.name}'!`);
            }
            if (container.has(CustomElement.keyFrom(this.name), true)) {
                const resolver = container.getResolver(CustomElement.keyFrom(this.name));
                if (resolver !== null && resolver.getFactory !== void 0) {
                    const factory = resolver.getFactory(container);
                    if (factory) {
                        return factory.Type;
                    }
                }
            }
        }
        return null;
    }
    /**
     * Returns the component instance of this instruction.
     *
     * Throws instantiation error if there was an error during instantiation.
     */
    toInstance(parentContainer, parentController, parentElement, instruction) {
        return onResolve(this.resolve(instruction), () => {
            if (this.instance !== null) {
                return this.instance;
            }
            if (parentContainer == null) {
                return null;
            }
            return this._createInstance(parentContainer, parentController, parentElement, instruction);
        });
    }
    same(other, compareType = false) {
        return compareType ? this.type === other.type : this.name === other.name;
    }
    getNewName(type) {
        if (this.name === null) {
            return InstructionComponent.getName(type);
        }
        return this.name;
    }
    /** @internal */
    /**
     * Creates the component instance for this instruction.
     *
     * Throws instantiation error if there was an error during instantiation.
     */
    _createInstance(parentContainer, parentController, parentElement, instruction) {
        const container = parentContainer.createChild();
        const Type = this.isType()
            ? this.type
            : container.getResolver(CustomElement.keyFrom(this.name)).getFactory(container).Type;
        const instance = container.invoke(Type);
        // TODO: Investigate this!
        // const instance: IRouteableComponent = this.isType()
        //   ? container.invoke(this.type!)
        //   : container.get(routerComponentResolver(this.name!));
        // TODO: Implement non-traversing lookup (below) based on router configuration
        // let instance;
        // if (this.isType()) {
        //   instance = ownContainer.invoke(this.type!);
        // } else {
        //   const def = CustomElement.find(ownContainer, this.name!);
        //   if (def != null) {
        //     instance = ownContainer.invoke(def.Type);
        //   }
        // }
        if (instance == null) {
            {
                // eslint-disable-next-line no-console
                console.warn('Failed to create instance when trying to resolve component', this.name, this.type, '=>', instance);
            }
            throw new Error(`Failed to create instance when trying to resolve component '${this.name}'!`);
        }
        const controller = Controller.$el(container, instance, parentElement, null);
        // TODO: Investigate if this is really necessary
        controller.parent = parentController;
        return instance;
    }
}
// TODO: Investigate this (should possibly be added back)
// function routerComponentResolver(name: string): IResolver<IRouteableComponent> {
//   const key = CustomElement.keyFrom(name);
//   return {
//     $isResolver: true,
//     resolve(_, requestor) {
//       // const container = requestor.get(IHydrationContext).parent!.controller.container;
//       if (requestor.has(key, false)) {
//         return requestor.get(key);
//       }
//       if (requestor.root.has(key, false)) {
//         return requestor.root.get(key);
//       }
//       // it's not always correct to consider this resolution as a traversal
//       // since sometimes it could be the work of trying a fallback configuration as component
//       // todo: cleanup the paths so that it's clearer when a fallback is being tried vs when an actual component name configuration
//       //
//       // console.warn(`Detected resource traversal behavior. A custom element "${name}" is neither`
//       //   + ` registered locally nor globally. This is not a supported behavior and will be removed in a future release`);
//       return requestor.get(key);
//     }
//   };
// }

/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
/**
 * Shouldn't be used directly
 *
 * @internal
 */
function arrayRemove(arr, func) {
    const removed = [];
    let arrIndex = arr.findIndex(func);
    while (arrIndex >= 0) {
        removed.push(arr.splice(arrIndex, 1)[0]);
        arrIndex = arr.findIndex(func);
    }
    return removed;
}
/**
 * @internal
 */
function arrayAddUnique(arr, values) {
    if (!Array.isArray(values)) {
        values = [values];
    }
    for (const value of values) {
        if (!arr.includes(value)) {
            arr.push(value);
        }
    }
    return arr;
}
/**
 * @internal
 */
function arrayUnique(arr, includeNullish = false) {
    return arr.filter((item, i, arrAgain) => (includeNullish || item != null) && arrAgain.indexOf(item) === i);
}

/**
 * The OpenPromise provides an open API to a promise.
 */
class OpenPromise {
    constructor(description = '') {
        this.description = description;
        /**
         * Whether the promise is still pending (not settled)
         */
        this.isPending = true;
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            OpenPromise.promises.push(this);
        });
    }
    /**
     * Resolve the (open) promise.
     *
     * @param value - The value to resolve with
     */
    resolve(value) {
        this._resolve(value);
        this.isPending = false;
        OpenPromise.promises = OpenPromise.promises.filter((promise) => promise !== this);
    }
    /**
     * Reject the (open) promise.
     *
     * @param reason - The reason the promise is rejected
     */
    reject(reason) {
        this._reject(reason);
        this.isPending = false;
        OpenPromise.promises = OpenPromise.promises.filter((promise) => promise !== this);
    }
}
OpenPromise.promises = [];

/**
 * Class for running a sequence of steps with values,
 * functions and promises. Stays sync if possible.
 *
 * Usage:
 *
 * ```ts
 * const promise = Runner.run(null,
 *   'one',
 *   step => `${step.previousValue}, two`,
 *   step => createPromise(step.previousValue), // creates a promise that resolves to `${value}, three`
 * );
 *
 * // Run can be cancelled with Runner.cancel(promise);
 *
 * const stepsRunner = Runner.runner(promise);
 * const result = await promise;
 * if (stepsRunner?.isResolved) { // Make sure promise wasn't rejected
 *   // result === 'one, two, three'
 * }
 * ```
 */
class Runner {
    constructor() {
        this.isDone = false;
        this.isCancelled = false;
        this.isResolved = false;
        this.isRejected = false;
        this.isAsync = false;
    }
    /**
     * Runs a set of steps and retuns the last value
     *
     * Steps are processed in sequence and can be either a
     *
     * - value - which is then propagated as input into the next step
     * - function - which is executed in time. The result is replacing the step which is then reprocessed
     * - promise - which is awaited
     *
     * ```ts
     * result = await Runner.run(null,
     *   'one',
     *   step => `${step.previousValue}, two`,
     *   step => createPromise(step.previousValue), // creates a promise that resolves to `${value}, three`
     * ); // result === 'one, two, three'
     * ```
     *
     * Returns the result as a promise or a value.
     *
     * If first parameter is an existing Step, the additional steps will be added to run after it. In this
     * case, the return value will be the first new step and not the result (since it doesn't exist yet).
     */
    static run(predecessor, ...steps) {
        if (steps.length === 0) {
            return void 0;
        }
        let newRoot = false;
        // No predecessor, so create a new root and add steps as children to it
        if (predecessor === null || typeof predecessor === 'string') {
            predecessor = new Step(predecessor);
            newRoot = true;
        }
        // First new step
        const start = new Step(steps.shift());
        // If the predecessor is new root or parallel the start needs to be a child of the predecessor
        Runner.connect(predecessor, start, (predecessor?.runParallel ?? false) || newRoot);
        if (steps.length > 0) {
            Runner.add(start, false, ...steps);
        }
        // If we've added a new root, run and return the result
        if (newRoot) {
            Runner.process(predecessor);
            if (predecessor.result instanceof Promise) {
                this.runners.set(predecessor.result, predecessor);
            }
            return predecessor.result;
        }
        return start;
    }
    /**
     * Runs a set of steps and retuns a list with their results
     *
     * Steps are processed in parallel and can be either a
     *
     * - value - which is then propagated as input into the next step
     * - function - which is executed in time. The result is replacing the step which is then reprocessed
     * - promise - which is awaited
     *
     * ```ts
     * result = await Runner.runParallel(null,
     *   'one',
     *   step => `${step.previousValue}, two`,
     *   step => createPromise(step.previousValue), // creates a promise that resolves to `${value}, three`
     * ); // result === ['one', 'one, two', 'one, two, three']
     * ```
     *
     * Returns the result as a promise or a list of values.
     *
     * If first parameter is an existing Step, the additional steps will be added to run after it. In this
     * case, the return value will be the first new step and not the result (since it doesn't exist yet).
     */
    static runParallel(parent, ...steps) {
        if ((steps?.length ?? 0) === 0) {
            return [];
        }
        let newRoot = false;
        // No parent, so parallel from a new root
        if (parent === null) {
            parent = new Step();
            newRoot = true;
        }
        else { // Need to inject a step under the parent to put the parallel steps under
            parent = Runner.connect(parent, new Step(), true);
        }
        Runner.add(parent, true, ...steps);
        if (newRoot) {
            Runner.process(parent);
        }
        if (parent.result instanceof Promise) {
            this.runners.set(parent.result, parent);
        }
        return newRoot ? (parent.result ?? []) : parent;
    }
    /**
     * Gets the starting step for a promise returned by Runner.run
     *
     * The step can be used to check status and outcome of
     * the run as well as cancel it
     *
     */
    static step(value) {
        if (value instanceof Promise) {
            return Runner.runners.get(value);
        }
    }
    /**
     * Cancels the remaining steps for a step or promise returned by Runner.run
     *
     * Once a starting step has been cancelled, it's no longer possible
     * to retrieve it from the promise
     *
     */
    static cancel(value) {
        const step = Runner.step(value);
        if (step !== void 0) {
            step.cancel();
        }
    }
    static add(predecessorOrParent, parallel, ...steps) {
        let step = new Step(steps.shift(), parallel);
        // Connect to predecessor or parent if there is one
        if (predecessorOrParent !== null) {
            // Connect first step either after or below depending on parallel
            step = Runner.connect(predecessorOrParent, step, parallel);
        }
        const start = step;
        while (steps.length > 0) {
            // Connect subsequent steps after
            step = Runner.connect(step, new Step(steps.shift(), parallel), false);
        }
        return start;
    }
    static connect(predecessorOrParent, step, asChild) {
        if (!asChild) {
            // Can have a pre-existing next
            const next = predecessorOrParent.next;
            predecessorOrParent.next = step;
            step.previous = predecessorOrParent;
            step.next = next;
            if (next !== null) {
                next.previous = step;
                next.parent = null;
            }
        }
        else {
            // Shouldn't really have a pre-existing child, but just to be sure
            const child = predecessorOrParent.child;
            predecessorOrParent.child = step;
            step.parent = predecessorOrParent;
            step.next = child;
            if (child !== null) {
                child.parent = null;
                child.previous = step;
            }
        }
        return step;
    }
    // Always set and resolve root OpenPromise as soon as there's a promise somewhere
    // Subsequent calls work on the origin promise(s)
    // root is the top root of the connected steps
    // step.promise holds promise that resolves
    // step.value holds value that's resolved
    static process(step) {
        const root = step.root;
        while (step !== null && !step.isDoing && !step.isDone) {
            root.current = step;
            if (step.isParallelParent) {
                step.isDone = true;
                let child = step.child;
                while (child !== null) {
                    Runner.process(child);
                    child = child.next;
                }
            }
            else {
                step.isDoing = true;
                step.value = step.step;
                // Iteratively resolve Functions (until value or Promise)
                // Called method can stop iteration by setting isDone on the step
                while (step.value instanceof Function && !step.isCancelled && !step.isExited && !step.isDone) {
                    step.value = (step.value)(step);
                }
                if (!step.isCancelled) {
                    // If we've got a Promise, run the remaining
                    if (step.value instanceof Promise) {
                        // Store promise since propagateResult can change it for OpenPromise
                        const promise = step.value;
                        Runner.ensurePromise(root);
                        // TODO: Possibly also ensure promise in origin
                        (($step, $promise) => {
                            $promise.then(result => {
                                $step.value = result;
                                // Only if there's a "public" promise to resolve
                                Runner.settlePromise($step);
                                $step.isDone = true;
                                $step.isDoing = false;
                                const next = $step.nextToDo();
                                if (next !== null && !$step.isExited) {
                                    Runner.process(next);
                                }
                                else {
                                    if ($step.root.doneAll || $step.isExited) {
                                        Runner.settlePromise($step.root);
                                    }
                                }
                            }).catch(err => { throw err; });
                        })(step, promise);
                    }
                    else {
                        step.isDone = true;
                        step.isDoing = false;
                        if (!step.isExited) {
                            step = step.nextToDo();
                        }
                        else {
                            step = null;
                        }
                    }
                }
            }
        }
        // Keep this, good for debugging unresolved steps
        // Runner.roots[root.id] = root.doneAll ? true : root.step;
        // console.log(root.doneAll, root.report, Runner.roots);
        // console.log(root.doneAll, root.report);
        if (root.isCancelled) {
            Runner.settlePromise(root, 'reject');
        }
        else if (root.doneAll || root.isExited) {
            Runner.settlePromise(root);
        }
    }
    static ensurePromise(step) {
        if (step.finally === null) {
            step.finally = new OpenPromise(`Runner: ${step.name}, ${step.previousValue}, ${step.value}, ${step.root.report}`);
            step.promise = step.finally.promise;
            return true;
        }
        return false;
    }
    static settlePromise(step, outcome = 'resolve') {
        if (step.finally?.isPending ?? false) {
            step.promise = null;
            // TODO: Should it also iteratively resolve functions and promises?
            switch (outcome) {
                case 'resolve':
                    step.finally?.resolve(step.result);
                    break;
                case 'reject':
                    step.finally?.reject(step.result);
                    break;
            }
        }
    }
}
Runner.runners = new WeakMap();
Runner.roots = {};
class Step {
    constructor(step = void 0, runParallel = false) {
        this.step = step;
        this.runParallel = runParallel;
        this.promise = null;
        this.previous = null;
        this.next = null;
        this.parent = null;
        this.child = null;
        this.current = null;
        this.finally = null;
        this.isDoing = false;
        this.isDone = false;
        this.isCancelled = false;
        this.isExited = false;
        this.exited = null;
        this.id = '-1';
        this.id = `${Step.id++}`;
        if (typeof step === 'string') {
            this.id += ` ${step}`;
        }
    }
    get isParallelParent() {
        return this.child?.runParallel ?? false;
    }
    get result() {
        // TODO: Possibly check done and create a promise if necessary
        // If we've got a promise, we're not done so return the promise
        if (this.promise !== null) {
            return this.promise;
        }
        // Parents (including root) return the results of their children
        if (this.child !== null) {
            // If it's a parallel parent, return all child results...
            if (this.isParallelParent) {
                const results = [];
                let child = this.child;
                while (child !== null) {
                    results.push(child.result);
                    child = child.next;
                }
                return results;
            }
            else { // ...otherwise return the one that exited/the last one.
                return this === this.root && this.exited !== null ? this.exited.result : this.child?.tail?.result;
            }
        }
        // If none of the above, return the value
        let value = this.value;
        while (value instanceof Step) {
            value = value.result;
        }
        return value;
    }
    get asValue() {
        // TODO: This should check done and create a promise if necessary
        return this.result;
    }
    get previousValue() {
        return this.runParallel
            ? this.head.parent?.parent?.previous?.result
            : this.previous?.result;
    }
    get name() {
        let name = `${this.id}`;
        if (this.runParallel) {
            name = `:${name}`;
        }
        if (this.value instanceof Promise || this.promise instanceof Promise) {
            name = `${name}*`;
        }
        if (this.finally !== null) {
            name = `${name}*`;
        }
        if (this.child !== null) {
            name = `${name}>`;
        }
        if (this.isDone) {
            name = `(${name})`;
        }
        return name;
    }
    get root() {
        let root = this.head;
        while (root.parent !== null) {
            root = root.parent.head;
        }
        return root;
    }
    get head() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let step = this;
        while (step.previous !== null) {
            step = step.previous;
        }
        return step;
    }
    get tail() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let step = this;
        while (step.next !== null) {
            step = step.next;
        }
        return step;
    }
    get done() {
        if (!this.isDone) {
            return false;
        }
        let step = this.child;
        while (step !== null) {
            if (!step.done) {
                return false;
            }
            step = step.next;
        }
        return true;
    }
    get doneAll() {
        if (!this.isDone
            || ((this.child !== null) && !this.child.doneAll)
            || ((this.next !== null) && !this.next.doneAll)) {
            return false;
        }
        return true;
    }
    cancel(all = true) {
        if (all) {
            return this.root.cancel(false);
        }
        if (this.isCancelled) {
            return false;
        }
        this.isCancelled = true;
        this.child?.cancel(false);
        this.next?.cancel(false);
        return true;
    }
    exit(all = true) {
        if (all) {
            this.root.exited = this;
            return this.root.exit(false);
        }
        if (this.isExited) {
            return false;
        }
        this.isExited = true;
        this.child?.exit(false);
        this.next?.exit(false);
        return true;
    }
    nextToDo() {
        // First step into if possible
        if (this.child !== null && !this.child.isDoing && !this.child.isDone) {
            return this.child;
        }
        // Parallels can only continue if they are the last one finished
        if (this.runParallel && !this.head.parent.done) {
            return null;
        }
        return this.nextOrUp();
    }
    nextOrUp() {
        // Take next if possible
        let next = this.next;
        while (next !== null) {
            if (!next.isDoing && !next.isDone) {
                return next;
            }
            next = next.next;
        }
        // Need to back out/up
        const parent = this.head.parent ?? null;
        if (parent === null || !parent.done) {
            return null;
        }
        // And try again from parent
        return parent.nextOrUp();
    }
    // Method is purely for debugging
    get path() {
        return `${this.head.parent?.path ?? ''}/${this.name}`;
    }
    // Method is purely for debugging
    get tree() {
        let result = '';
        let step = this.head;
        let parent = step.parent;
        let path = '';
        while (parent !== null) {
            path = `${parent.path}${path}`;
            parent = parent.head.parent;
        }
        do {
            result += `${path}/${step.name}\n`;
            if (step === this) {
                break;
            }
            step = step.next;
        } while (step !== null);
        return result;
    }
    // Method is purely for debugging
    get report() {
        let result = `${this.path}\n`;
        result += this.child?.report ?? '';
        result += this.next?.report ?? '';
        return result;
    }
}
Step.id = 0;

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-template */
/** @internal */
const createMappedError = (code, ...details) => new Error(`AUR${String(code).padStart(4, '0')}: ${getMessageByCode(code, ...details)}`)
    ;

const errorsMap = {
    [99 /* ErrorNames.method_not_implemented */]: 'Method {{0}} not implemented',
    [2000 /* ErrorNames.router_started */]: `Router.start() called while the it has already been started.`,
    [2001 /* ErrorNames.router_not_started */]: 'Router.stop() has been called while it has not been started',
    [2002 /* ErrorNames.router_remove_endpoint_failure */]: "Router failed to remove endpoint: {{0}}",
    [2003 /* ErrorNames.router_check_activate_string_error */]: `Parameter instructions to checkActivate can not be a string ('{{0}}')!`,
    [2004 /* ErrorNames.router_failed_appending_routing_instructions */]: 'Router failed to append routing instructions to coordinator',
    [2005 /* ErrorNames.router_failed_finding_viewport_when_updating_viewer_path */]: 'Router failed to find viewport when updating viewer paths.',
    [2006 /* ErrorNames.router_infinite_instruction */]: `{{0}} remaining instructions after 100 iterations; there is likely an infinite loop.`,
    [2007 /* ErrorNames.browser_viewer_store_already_started */]: 'Browser navigation has already been started',
    [2008 /* ErrorNames.browser_viewer_store_not_started */]: 'Browser navigation has not been started',
    [2009 /* ErrorNames.browser_viewer_store_state_serialization_failed */]: `Failed to "{{0}}" state, probably due to unserializable data and/or parameters:` +
        `\nSerialization error: {{1}}` +
        `\nOriginal error: {originalError}`,
    [2010 /* ErrorNames.navigator_already_started */]: 'Navigator has already been started',
    [2011 /* ErrorNames.navigator_not_started */]: 'Navigator has not been started',
    [2012 /* ErrorNames.route_no_component_as_config */]: `Invalid route configuration: A component ` +
        `can't be specified in a component route configuration.`,
    [2013 /* ErrorNames.route_no_both_component_and_instructions */]: `Invalid route configuration: The 'component' and 'instructions' properties ` +
        `can't be specified in a component route configuration.`,
    [2014 /* ErrorNames.route_nullish_config */]: `Invalid route configuration: expected an object but got null/undefined.`,
    [2015 /* ErrorNames.route_instructions_existed */]: `Invalid route configuration: the 'instructions' property can't be used together with ` +
        `the 'component', 'viewport', 'parameters' or 'children' properties.`,
    [2016 /* ErrorNames.route_invalid_config */]: `Invalid route configuration: either 'redirectTo' or 'instructions' need to be specified.`,
    [2017 /* ErrorNames.endpoint_instantiation_error */]: `There was an error durating the instantiation of "{{0}}".`
        + ` "{{0}}" did not match any configured route or registered component name`
        + ` - did you forget to add the component "{{0}}" to the dependencies or to register it as a global dependency?\n`
        + `{{1:innerError}}`,
    [2018 /* ErrorNames.element_name_not_found */]: `Cannot find an element with the name "{{0}}", did you register it via "dependencies" option or <import> with convention?.\n`,
    [2019 /* ErrorNames.router_error_3 */]: `-- placeholder --`,
    [2020 /* ErrorNames.router_error_4 */]: `-- placeholder --`,
    [2021 /* ErrorNames.router_error_5 */]: `-- placeholder --`,
    [2022 /* ErrorNames.router_error_6 */]: `-- placeholder --`,
    [2023 /* ErrorNames.router_error_7 */]: `-- placeholder --`,
    [2024 /* ErrorNames.router_error_8 */]: `-- placeholder --`,
    [2025 /* ErrorNames.router_error_9 */]: `-- placeholder --`,
    [2026 /* ErrorNames.router_error_10 */]: `-- placeholder --`,
};
const getMessageByCode = (name, ...details) => {
    let cooked = errorsMap[name];
    for (let i = 0; i < details.length; ++i) {
        const regex = new RegExp(`{{${i}(:.*)?}}`, 'g');
        let matches = regex.exec(cooked);
        while (matches != null) {
            const method = matches[1]?.slice(1);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let value = details[i];
            if (value != null) {
                switch (method) {
                    case 'nodeName':
                        value = value.nodeName.toLowerCase();
                        break;
                    case 'name':
                        value = value.name;
                        break;
                    case 'typeof':
                        value = typeof value;
                        break;
                    case 'ctor':
                        value = value.constructor.name;
                        break;
                    case 'toString':
                        value = Object.prototype.toString.call(value);
                        break;
                    case 'join(!=)':
                        value = value.join('!=');
                        break;
                    case 'element':
                        value = value === '*' ? 'all elements' : `<${value} />`;
                        break;
                    case 'innerError':
                        value = `\nDetails:\n${value}\n${(value instanceof Error) && value.cause != null ? `${String(value.cause)}\n` : ''}`;
                        break;
                    default: {
                        // property access
                        if (method?.startsWith('.')) {
                            const paths = method.slice(1).split('.');
                            for (let j = 0; j < paths.length && value != null; ++j) {
                                value = value[paths[j]];
                            }
                        }
                    }
                }
            }
            cooked = cooked.slice(0, matches.index) + String(value) + cooked.slice(regex.lastIndex);
            matches = regex.exec(cooked);
        }
    }
    return cooked;
};

class Route {
    constructor(
    /**
     * The path to match against the url.
     */
    path, 
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    id, 
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    redirectTo, 
    /**
     * The instructions that should be loaded when this route is matched.
     */
    instructions, 
    /**
     * Whether the `path` should be case sensitive.
     */
    caseSensitive, 
    /**
     * Title string or function to be used when setting title for the route.
     */
    // TODO(jurgen): Specify type!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title, 
    /**
     * The reload behavior of the components in the route, as in how they behave
     * when the route is loaded again.
     *
     * TODO(alpha): Add support for function in value
     */
    reloadBehavior, 
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    data) {
        this.path = path;
        this.id = id;
        this.redirectTo = redirectTo;
        this.instructions = instructions;
        this.caseSensitive = caseSensitive;
        this.title = title;
        this.reloadBehavior = reloadBehavior;
        this.data = data;
    }
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    static configure(configOrPath, Type) {
        const config = Route.create(configOrPath, Type);
        Metadata.define(config, Type, Route.resourceKey);
        return Type;
    }
    /**
     * Get the `Route` configured with the specified type or null if there's nothing configured.
     */
    static getConfiguration(Type) {
        const config = Metadata.get(Route.resourceKey, Type) ?? {};
        if (Array.isArray(Type.parameters)) {
            config.parameters = Type.parameters;
        }
        if ('title' in Type) {
            config.title = Type.title;
        }
        return config instanceof Route ? config : Route.create(config, Type);
    }
    /**
     * Create a valid Route or throw if it can't.
     *
     * @param configOrType - Configuration or type the route is created from.
     * @param Type - If specified, the Route is routing to Type, regardless of what config says, as with `@route` decorator.
     */
    static create(configOrType, Type = null) {
        // If a fixed type is specified, component is fixed to that type and
        // configOrType is set to a config with that.
        // This also clones the route (not deep)
        if (Type !== null) {
            configOrType = Route.transferTypeToComponent(configOrType, Type);
        }
        // Another component queries our route configuration
        if (CustomElement.isType(configOrType)) {
            configOrType = Route.getConfiguration(configOrType);
        }
        else if (Type === null) { // We need to clone the route (not deep)
            configOrType = { ...configOrType };
        }
        const config = Route.transferIndividualIntoInstructions(configOrType);
        Route.validateRouteConfiguration(config);
        let pathId = config.path;
        if (Array.isArray(pathId)) {
            pathId = pathId.join(',');
        }
        return new Route(config.path ?? '', config.id ?? pathId ?? null, config.redirectTo ?? null, config.instructions ?? null, config.caseSensitive ?? false, config.title ?? null, config.reloadBehavior ?? null, config.data ?? null);
    }
    /**
     * Transfers the (only allowed) Type for the Route to the `component` property, creating
     * a new configuration if necessary.
     *
     * It also validates that that the `component` and `instructions` are not used.
     */
    static transferTypeToComponent(configOrType, Type) {
        if (CustomElement.isType(configOrType)) {
            throw createMappedError(2012 /* ErrorNames.route_no_component_as_config */);
        }
        // Clone it so that original route isn't affected
        // NOTE that it's not a deep clone (yet)
        const config = { ...configOrType };
        if ('component' in config || 'instructions' in config) {
            throw createMappedError(2013 /* ErrorNames.route_no_both_component_and_instructions */);
        }
        if (!('redirectTo' in config)) {
            config.component = Type;
        }
        if (!('path' in config) && !('redirectTo' in config)) {
            config.path = CustomElement.getDefinition(Type).name;
        }
        return config;
    }
    /**
     * Transfers individual load instruction properties into the `instructions` property.
     *
     * It also validates that not both individual load instruction parts and the `instructions`
     * is used.
     */
    static transferIndividualIntoInstructions(config) {
        if (config == null) {
            throw createMappedError(2014 /* ErrorNames.route_nullish_config */);
        }
        if (config.component != null
            || config.viewport != null
            || config.parameters != null
            || config.children != null) {
            if (config.instructions != null) {
                throw createMappedError(2015 /* ErrorNames.route_instructions_existed */);
            }
            config.instructions = [{
                    component: config.component,
                    viewport: config.viewport,
                    parameters: config.parameters,
                    children: config.children,
                }];
        }
        return config;
    }
    /**
     * Validate a `Route`.
     */
    static validateRouteConfiguration(config) {
        if (config.redirectTo === null && config.instructions === null) {
            throw createMappedError(2016 /* ErrorNames.route_invalid_config */);
        }
        // TODO: Add validations for remaining properties and each index of 'instructions'
    }
}
/**
 * The metadata resource key for a configured route.
 */
Route.resourceKey = getResourceKeyFor('route');

const Routes = {
    name: /*@__PURE__*/ getResourceKeyFor('routes'),
    /**
     * Returns `true` if the specified type has any static routes configuration (either via static properties or a &#64;route decorator)
     */
    isConfigured(Type) {
        return Metadata.has(Routes.name, Type) || 'routes' in Type;
    },
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    configure(configurationsOrTypes, Type) {
        const configurations = configurationsOrTypes.map(configOrType => Route.create(configOrType));
        Metadata.define(configurations, Type, Routes.name);
        return Type;
    },
    /**
     * Get the `RouteConfiguration`s associated with the specified type.
     */
    getConfiguration(Type) {
        const type = Type;
        const routes = [];
        const metadata = Metadata.get(Routes.name, Type);
        // TODO: Check if they are indeed to be concatenated (and what that means
        // for match order) or if one should replace the other
        if (Array.isArray(metadata)) {
            routes.push(...metadata);
        }
        if (Array.isArray(type.routes)) {
            routes.push(...type.routes);
        }
        return routes.map(route => route instanceof Route ? route : Route.create(route));
    },
};
function routes(configurationsOrTypes) {
    return function (target, context) {
        context.addInitializer(function () {
            Routes.configure(configurationsOrTypes, this);
        });
        return target;
    };
}

/**
 * The viewport scope content represents the content of a viewport scope
 * and whether it's active or not.
 *
 * During a transition, a viewport scope has two viewport scope contents,
 * the current and the next, which is turned back into one when the
 * transition is either finalized or aborted.
 *
 * Viewport scope contents are used to represent the full state and can
 * be used for caching
 */
class ViewportScopeContent extends EndpointContent {
}

class ViewportScope extends Endpoint$1 {
    constructor(router, name, connectedCE, owningScope, scope, rootComponentType = null, // temporary. Metadata will probably eliminate it
    options = {
        catches: [],
        source: null,
    }) {
        super(router, name, connectedCE);
        this.rootComponentType = rootComponentType;
        this.options = options;
        this.instruction = null;
        this.available = true;
        this.sourceItem = null;
        this.sourceItemIndex = -1;
        this.remove = false;
        this.add = false;
        this.contents.push(new ViewportScopeContent(router, this, owningScope, scope));
        if (this.catches.length > 0) {
            this.instruction = RoutingInstruction.create(this.catches[0], this.name);
        }
    }
    get isEmpty() {
        return this.instruction === null;
    }
    get passThroughScope() {
        return this.rootComponentType === null && this.catches.length === 0;
    }
    get siblings() {
        const parent = this.connectedScope.parent;
        if (parent === null) {
            return [this];
        }
        return parent.enabledChildren
            .filter(child => child.isViewportScope && child.endpoint.name === this.name)
            .map(child => child.endpoint);
    }
    get source() {
        return this.options.source ?? null;
    }
    get catches() {
        let catches = this.options.catches ?? [];
        if (typeof catches === 'string') {
            catches = catches.split(',');
        }
        return catches;
    }
    get default() {
        if (this.catches.length > 0) {
            return this.catches[0];
        }
    }
    toString() {
        const contentName = this.instruction?.component.name ?? '';
        const nextContentName = this.getNextContent()?.instruction.component.name ?? '';
        return `vs:${this.name}[${contentName}->${nextContentName}]`;
    }
    setNextContent(instruction, navigation) {
        instruction.endpoint.set(this);
        this.remove = instruction.isClear(this.router) || instruction.isClearAll(this.router);
        this.add = instruction.isAdd(this.router) && Array.isArray(this.source);
        if (this.add) {
            instruction.component.name = null;
        }
        if (this.default !== void 0 && instruction.component.name === null) {
            instruction.component.name = this.default;
        }
        this.contents.push(new ViewportScopeContent(this.router, this, this.owningScope, this.scope.hasScope, instruction, navigation));
        return 'swap';
    }
    transition(coordinator) {
        Runner.run('viewport-scope.transition', (step) => coordinator.setEndpointStep(this, step.root), () => coordinator.addEndpointState(this, 'guardedUnload'), () => coordinator.addEndpointState(this, 'guardedLoad'), () => coordinator.addEndpointState(this, 'guarded'), () => coordinator.addEndpointState(this, 'loaded'), () => coordinator.addEndpointState(this, 'unloaded'), () => coordinator.addEndpointState(this, 'routed'), () => coordinator.addEndpointState(this, 'swapped'), () => coordinator.addEndpointState(this, 'completed'));
    }
    finalizeContentChange(coordinator, _step) {
        const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
        let nextContent = this.contents[nextContentIndex];
        if (this.remove) {
            const emptyContent = new ViewportScopeContent(this.router, this, this.owningScope, this.scope.hasScope);
            this.contents.splice(nextContentIndex, 1, emptyContent);
            nextContent.delete();
            nextContent = emptyContent;
        }
        nextContent.completed = true;
        let removeable = 0;
        for (let i = 0, ii = nextContentIndex; i < ii; i++) {
            if (!(this.contents[0].navigation.completed ?? false)) {
                break;
            }
            removeable++;
        }
        this.contents.splice(0, removeable);
        if (this.remove && Array.isArray(this.source)) {
            this.removeSourceItem();
        }
    }
    cancelContentChange(coordinator, noExitStep = null) {
        // First cancel content change in all children
        [...new Set(this.scope.children.map(scope => scope.endpoint))].forEach(child => child.cancelContentChange(coordinator, noExitStep));
        const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
        if (nextContentIndex < 0) {
            return;
        }
        this.contents.splice(nextContentIndex, 1);
        if (this.add) {
            const index = this.source.indexOf(this.sourceItem);
            this.source.splice(index, 1);
            this.sourceItem = null;
        }
    }
    acceptSegment(segment) {
        if (segment === null && segment === void 0 || segment.length === 0) {
            return true;
        }
        if (segment === RoutingInstruction.clear(this.router)
            || segment === RoutingInstruction.add(this.router)
            || segment === this.name) {
            return true;
        }
        if (this.catches.length === 0) {
            return true;
        }
        if (this.catches.includes(segment)) {
            return true;
        }
        if (this.catches.filter((value) => value.includes('*')).length) {
            return true;
        }
        return false;
    }
    binding() {
        const source = this.source || [];
        if (source.length > 0 && this.sourceItem === null) {
            this.sourceItem = this.getAvailableSourceItem();
        }
    }
    unbinding() {
        if (this.sourceItem !== null && this.source !== null) {
            arrayRemove(this.source, (item) => item === this.sourceItem);
        }
        this.sourceItem = null;
    }
    getAvailableSourceItem() {
        if (this.source === null) {
            return null;
        }
        const siblings = this.siblings;
        for (const item of this.source) {
            if (siblings.every(sibling => sibling.sourceItem !== item)) {
                return item;
            }
        }
        return null;
    }
    addSourceItem() {
        const item = {};
        this.source.push(item);
        return item;
    }
    removeSourceItem() {
        this.sourceItemIndex = this.source.indexOf(this.sourceItem);
        if (this.sourceItemIndex >= 0) {
            this.source.splice(this.sourceItemIndex, 1);
        }
    }
    getRoutes() {
        const routes = [];
        if (this.rootComponentType !== null) {
            // TODO: Fix it so that this isn't necessary!
            const Type = this.rootComponentType.constructor === this.rootComponentType.constructor.constructor
                ? this.rootComponentType
                : this.rootComponentType.constructor;
            routes.push(...(Routes.getConfiguration(Type) ?? []));
        }
        return routes;
    }
}

/**
 * The stored navigation holds the part of a navigation that's stored
 * in history. Note that the data might not be json serializable and
 * therefore might not be able to be stored as-is.
 */
class StoredNavigation {
    constructor(entry = {
        instruction: '',
        fullStateInstruction: '',
    }) {
        this.instruction = entry.instruction;
        this.fullStateInstruction = entry.fullStateInstruction;
        this.scope = entry.scope;
        this.index = entry.index;
        this.firstEntry = entry.firstEntry;
        this.path = entry.path;
        this.title = entry.title;
        this.query = entry.query;
        this.fragment = entry.fragment;
        this.parameters = entry.parameters;
        this.data = entry.data;
    }
    toStoredNavigation() {
        return {
            instruction: this.instruction,
            fullStateInstruction: this.fullStateInstruction,
            scope: this.scope,
            index: this.index,
            firstEntry: this.firstEntry,
            path: this.path,
            title: this.title,
            query: this.query,
            fragment: this.fragment,
            parameters: this.parameters,
            data: this.data,
        };
    }
}
class NavigationFlags {
    constructor() {
        this.first = false;
        this.new = false;
        this.refresh = false;
        this.forward = false;
        this.back = false;
        this.replace = false;
    }
}
/**
 * The navigation
 */
class Navigation extends StoredNavigation {
    constructor(entry = {
        instruction: '',
        fullStateInstruction: '',
    }) {
        super(entry);
        /**
         * The navigation in a historical context (back, forward, etc)
         */
        this.navigation = new NavigationFlags();
        /**
         * Whether this is a repeating navigation, in other words the same navigation run again
         */
        this.repeating = false;
        /**
         * The previous navigation
         */
        this.previous = null;
        /**
         * Whether the navigation originates from a browser action (back, forward)
         */
        this.fromBrowser = false;
        /**
         * The origin of the navigation, a view model or element
         */
        this.origin = null;
        /**
         * Whether this navigation is fully replacing a previous one
         */
        this.replacing = false;
        /**
         * Whether this navigation is a refresh/reload with the same parameters
         */
        this.refreshing = false;
        /**
         * Whether this navigation is untracked and shouldn't be added to history
         */
        this.untracked = false;
        /**
         * The process of the navigation, to be resolved or rejected
         */
        this.process = null;
        /**
         * Whether the navigation is completed
         */
        this.completed = true;
        this.fromBrowser = entry.fromBrowser ?? this.fromBrowser;
        this.origin = entry.origin ?? this.origin;
        this.replacing = entry.replacing ?? this.replacing;
        this.refreshing = entry.refreshing ?? this.refreshing;
        this.untracked = entry.untracked ?? this.untracked;
        this.historyMovement = entry.historyMovement ?? this.historyMovement;
        this.process = null;
        this.timestamp = Date.now();
    }
    get useFullStateInstruction() {
        return (this.navigation.back ?? false) ||
            (this.navigation.forward ?? false) ||
            (this.navigation.refresh ?? false);
    }
    static create(entry = {
        instruction: '',
        fullStateInstruction: '',
    }) {
        return new Navigation(entry);
    }
}

/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
class AwaitableMap {
    constructor() {
        this.map = new Map();
    }
    set(key, value) {
        const openPromise = this.map.get(key);
        if (openPromise instanceof OpenPromise) {
            openPromise.resolve(value);
            // openPromise.isPending = false;
        }
        this.map.set(key, value);
    }
    delete(key) {
        const current = this.map.get(key);
        if (current instanceof OpenPromise) {
            current.reject();
            // current.isPending = false;
        }
        this.map.delete(key);
    }
    await(key) {
        if (!this.map.has(key)) {
            const openPromise = new OpenPromise(`AwaitableMap: ${key}`);
            this.map.set(key, openPromise);
            return openPromise.promise;
        }
        const current = this.map.get(key);
        if (current instanceof OpenPromise) {
            return current.promise;
        }
        return current;
    }
    has(key) {
        return this.map.has(key) && !(this.map.get(key) instanceof OpenPromise);
    }
    clone() {
        const clone = new AwaitableMap();
        clone.map = new Map(this.map);
        return clone;
    }
}

/**
 * @internal
 */
class ViewportContent extends EndpointContent {
    constructor(router, 
    /**
     * The viewport the viewport content belongs to
     */
    viewport, 
    /**
     * The routing scope the viewport content belongs to/is owned by
     */
    owningScope, 
    /**
     * Whether the viewport has its own routing scope, containing
     * endpoints it owns
     */
    hasScope, 
    /**
     * The routing instruction that created the viewport content
     */
    instruction = RoutingInstruction.create(''), 
    /**
     * The navigation that created the viewport content
     */
    navigation = Navigation.create({
        instruction: '',
        fullStateInstruction: '',
    }), 
    /**
     * The connected viewport custom element
     */
    connectedCE = null) {
        super(router, viewport, owningScope, hasScope, instruction, navigation);
        this.router = router;
        this.instruction = instruction;
        this.navigation = navigation;
        /**
         * The current content states
         */
        this.contentStates = new AwaitableMap();
        /**
         * Whether the viewport content is from the endpoint cache
         */
        this.fromCache = false;
        /**
         * Whether the viewport content is from the history cache
         */
        this.fromHistory = false;
        /**
         * Whether content is currently being reloaded
         */
        this.reload = false;
        /**
         * Resolved when content is activated (and can be deactivated)
         */
        this.activatedResolve = null;
        // If we've got a container, we're good to resolve type
        if (!this.instruction.component.isType() && connectedCE?.container != null) {
            this.instruction.component.type = this.toComponentType(connectedCE.container);
        }
    }
    /**
     * The viewport content's component instance
     */
    get componentInstance() {
        return this.instruction.component.instance;
    }
    /**
     * The viewport content's reload behavior, as in how it behaves
     * when the content is loaded again.
     */
    get reloadBehavior() {
        if (this.instruction.route instanceof FoundRoute
            && this.instruction.route.match?.reloadBehavior !== null) {
            return this.instruction.route.match?.reloadBehavior;
        }
        return (this.instruction.component.instance !== null &&
            'reloadBehavior' in this.instruction.component.instance &&
            this.instruction.component.instance.reloadBehavior !== void 0)
            ? this.instruction.component.instance.reloadBehavior
            : 'default';
    }
    /**
     * Get the controller of the component in the viewport content.
     */
    get controller() {
        return this.instruction.component.instance?.$controller;
    }
    /**
     * Whether the viewport content's component is equal to that of
     * another viewport content.
     *
     * @param other - The viewport content to compare with
     */
    equalComponent(other) {
        return this.instruction.sameComponent(this.router, other.instruction);
    }
    /**
     * Whether the viewport content's parameters is equal to that of
     * another viewport content.
     *
     * @param other - The viewport content to compare with
     */
    equalParameters(other) {
        return this.instruction.sameComponent(this.router, other.instruction, true) &&
            // TODO: Review whether query is enough or if parameters need
            // to be checked as well depending on when query is updated.
            // Should probably be able to compare parameters vs query as well.
            (this.navigation.query ?? '') === (other.navigation.query ?? '');
    }
    /**
     * Whether the viewport content is equal from a caching perspective to
     * that of another viewport content.
     *
     * @param other - The viewport content to compare with
     */
    isCacheEqual(other) {
        return this.instruction.sameComponent(this.router, other.instruction, true);
    }
    /**
     * Get the controller of the component in the viewport content.
     *
     * @param connectedCE - The custom element connected to the viewport
     */
    contentController(connectedCE) {
        return Controller.$el(connectedCE.container.createChild(), this.instruction.component.instance, connectedCE.element, null);
    }
    /**
     * Create the component for the viewport content (based on the instruction)
     *
     * @param connectedCE - The custom element connected to the viewport
     * @param fallback - A (possible) fallback component to create if the
     * instruction component can't be created. The name of the failing
     * component is passed as parameter `id` to the fallback component
     * @param fallbackAction - Whether the children of an unloadable component
     * will be processed under the fallback component or if the child
     * instructions will be aborted.
     */
    createComponent(coordinator, connectedCE, fallback, fallbackAction) {
        // Can be called at multiple times, only process the first
        if (this.contentStates.has('created')) {
            return;
        }
        // Don't load cached content or instantiated history content
        if (!this.fromCache && !this.fromHistory) {
            try {
                return onResolve(this.toComponentInstance(connectedCE.container, connectedCE.controller, connectedCE.element), (component) => {
                    this.instruction.component.set(component);
                    this.contentStates.set('created', void 0);
                });
            }
            catch (e) {
                this._assertInstantiationError(e);
                // If there's a fallback component...
                if ((fallback ?? '') !== '') {
                    if (fallbackAction === 'process-children') {
                        // ...set the failed component as the first parameter (0)...
                        this.instruction.parameters.set([this.instruction.component.name]);
                    }
                    else { // 'abort'
                        // ...set the unparsed string of the failed component as the first parameter (0)...
                        this.instruction.parameters.set([this.instruction.unparsed ?? this.instruction.component.name]);
                        // ...if the instruction has children...
                        if (this.instruction.hasNextScopeInstructions) {
                            // ...remove the children from the coordinator
                            coordinator.removeInstructions(this.instruction.nextScopeInstructions);
                            // ...and prevent processing of the child instructions.
                            this.instruction.nextScopeInstructions = null;
                        }
                    }
                    // ...fallback is the new component...
                    this.instruction.component.set(fallback);
                    // ...and try again.
                    try {
                        return onResolve(this.toComponentInstance(connectedCE.container, connectedCE.controller, connectedCE.element), (fallbackComponent) => {
                            this.instruction.component.set(fallbackComponent);
                            this.contentStates.set('created', void 0);
                        });
                    }
                    catch (ee) {
                        this._assertInstantiationError(ee);
                        throw createMappedError(2017 /* ErrorNames.endpoint_instantiation_error */, this.instruction.component.name, ee);
                    }
                }
                else {
                    throw createMappedError(2017 /* ErrorNames.endpoint_instantiation_error */, this.instruction.component.name);
                }
            }
        }
        this.contentStates.set('created', void 0);
    }
    /**
     * Check if the viewport content's component can be loaded.
     */
    canLoad() {
        // Since canLoad is called from more than one place multiple calls can happen (and is fine)
        if (!this.contentStates.has('created') || (this.contentStates.has('checkedLoad') && !this.reload)) {
            // If we got here, an earlier check has already stated it can be loaded
            return true;
        }
        const instance = this.instruction.component.instance;
        if (instance == null) {
            return true;
        }
        this.contentStates.set('checkedLoad', void 0);
        // Propagate parent parameters
        // TODO: Do we really want this?
        const parentParameters = this.endpoint
            .parentViewport?.getTimeContent(this.navigation.timestamp)?.instruction?.typeParameters(this.router);
        const parameters = this.instruction.typeParameters(this.router);
        const merged = { ...this.navigation.parameters, ...parentParameters, ...parameters };
        const hooks = this._getLifecycleHooks(instance, 'canLoad')
            .map(hook => ((innerStep) => {
            if (innerStep?.previousValue != null && innerStep.previousValue !== true) {
                innerStep.exit(); // To prevent more calls down the pipeline
                return innerStep.previousValue ?? false;
            }
            // TODO: If requested, pass previous value into hook
            return hook(instance, merged, this.instruction, this.navigation);
        }));
        if (instance.canLoad != null) {
            hooks.push((innerStep) => {
                if ((innerStep?.previousValue ?? true) === false) {
                    return false;
                }
                // TODO: If requested, pass previous value into hook
                return instance.canLoad(merged, this.instruction, this.navigation);
            });
        }
        if (hooks.length === 0) {
            return true;
        }
        if (hooks.length === 1) {
            return hooks[0](null);
        }
        return Runner.run('canLoad', ...hooks);
    }
    /**
     * Check if the viewport content's component can be unloaded.
     *
     * @param navigation - The navigation that causes the content change
     */
    canUnload(navigation) {
        // Since canUnload is called recursively multiple calls can happen (and is fine)
        if (this.contentStates.has('checkedUnload') && !this.reload) {
            // If we got here, an earlier check has already stated it can be unloaded
            return true;
        }
        this.contentStates.set('checkedUnload', void 0);
        // If content hasn't loaded a component, we're done
        if (!this.contentStates.has('loaded')) {
            return true;
        }
        const instance = this.instruction.component.instance;
        // If it's an unload without a navigation, such as custom element simply
        // being removed, create an empty navigation for canUnload hook
        if (navigation === null) {
            navigation = Navigation.create({
                instruction: '',
                fullStateInstruction: '',
                previous: this.navigation,
            });
        }
        const hooks = this._getLifecycleHooks(instance, 'canUnload').map(hook => ((innerStep) => {
            if ((innerStep?.previousValue ?? true) === false) {
                return false;
            }
            return hook(instance, this.instruction, navigation);
        }));
        if (instance.canUnload != null) {
            hooks.push((innerStep) => {
                if ((innerStep?.previousValue ?? true) === false) {
                    return false;
                }
                // TODO: If requested, pass previous value into hook
                return instance.canUnload?.(this.instruction, navigation);
            });
        }
        if (hooks.length === 0) {
            return true;
        }
        if (hooks.length === 1) {
            return hooks[0](null);
        }
        return Runner.run('canUnload', ...hooks);
    }
    /**
     * Load the viewport content's content.
     *
     * @param step - The previous step in this transition Run
     */
    load(step) {
        return Runner.run(step, () => this.contentStates.await('checkedLoad'), () => {
            // Since load is called from more than one place multiple calls can happen (and is fine)
            if (!this.contentStates.has('created') || (this.contentStates.has('loaded') && !this.reload)) {
                // If we got here, it's already loaded
                return;
            }
            this.reload = false;
            this.contentStates.set('loaded', void 0);
            const instance = this.instruction.component.instance;
            // Propagate parent parameters
            // TODO: Do we really want this?
            const parentParameters = this.endpoint
                .parentViewport?.getTimeContent(this.navigation.timestamp)?.instruction?.typeParameters(this.router);
            const parameters = this.instruction.typeParameters(this.router);
            const merged = { ...this.navigation.parameters, ...parentParameters, ...parameters };
            const hooks = this._getLifecycleHooks(instance, 'loading').map(hook => () => hook(instance, merged, this.instruction, this.navigation));
            hooks.push(...this._getLifecycleHooks(instance, 'load').map(hook => () => {
                // eslint-disable-next-line no-console
                console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
                return hook(instance, merged, this.instruction, this.navigation);
            }));
            if (hooks.length !== 0) {
                // Add hook in component
                if (typeof instance.loading === 'function') {
                    hooks.push(() => instance.loading(merged, this.instruction, this.navigation));
                }
                if (hasVmHook(instance, 'load')) {
                    // eslint-disable-next-line no-console
                    console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
                    hooks.push(() => instance.load(merged, this.instruction, this.navigation));
                }
                return Runner.run('load', ...hooks);
            }
            // Skip if there's no hook in component
            if (hasVmHook(instance, 'loading')) {
                return instance.loading(merged, this.instruction, this.navigation);
            }
            // Skip if there's no hook in component
            if (hasVmHook(instance, 'load')) {
                // eslint-disable-next-line no-console
                console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
                return instance.load(merged, this.instruction, this.navigation);
            }
        });
    }
    /**
     * Unload the viewport content's content.
     *
     * @param navigation - The navigation that causes the content change
     */
    unload(navigation) {
        // Since load is called from more than one place multiple calls can happen (and is fine)
        if (!this.contentStates.has('loaded')) {
            // If we got here, it's already unloaded (or wasn't loaded in the first place)
            return;
        }
        this.contentStates.delete('loaded');
        const instance = this.instruction.component.instance;
        if (navigation === null) {
            navigation = Navigation.create({
                instruction: '',
                fullStateInstruction: '',
                previous: this.navigation,
            });
        }
        const hooks = this._getLifecycleHooks(instance, 'unloading').map(hook => () => hook(instance, this.instruction, navigation));
        hooks.push(...this._getLifecycleHooks(instance, 'unload').map(hook => () => {
            // eslint-disable-next-line no-console
            console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
            return hook(instance, this.instruction, navigation);
        }));
        if (hooks.length !== 0) {
            // Add hook in component
            if (hasVmHook(instance, 'unloading')) {
                hooks.push(() => instance.unloading(this.instruction, navigation));
            }
            if (hasVmHook(instance, 'unload')) {
                // eslint-disable-next-line no-console
                console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
                hooks.push(() => instance.unload(this.instruction, navigation));
            }
            return Runner.run('unload', ...hooks);
        }
        // Skip if there's no hook in component
        if (hasVmHook(instance, 'unloading')) {
            return instance.unloading(this.instruction, navigation);
        }
        if (hasVmHook(instance, 'unload')) {
            // eslint-disable-next-line no-console
            console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
            return instance.unload(this.instruction, navigation);
        }
    }
    /**
     * Activate (bind and attach) the content's component.
     *
     * @param step - The previous step in this transition Run
     * @param initiator - The controller initiating the activation
     * @param parent - The parent controller for the content's component controller
     * @param flags - The lifecycle flags
     * @param connectedCE - The viewport's connectd custom element
     * @param boundCallback - A callback that's called when the content's component has been bound
     * @param attachPromise - A promise that th content's component controller will await before attaching
     */
    activateComponent(step, initiator, parent, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connectedCE, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    boundCallback, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attachPromise) {
        return Runner.run(step, () => this.contentStates.await('loaded'), () => this.waitForParent(parent), // TODO: It might be possible to refactor this away
        () => {
            if (this.contentStates.has('activating') || this.contentStates.has('activated')) {
                return;
            }
            this.contentStates.set('activating', void 0);
            return this.controller?.activate(initiator ?? this.controller, parent, void 0 /* , boundCallback, this.instruction.topInstruction ? attachPromise : void 0 */);
        }, () => {
            this.contentStates.set('activated', void 0);
        });
    }
    /**
     * Deactivate (detach and unbind) the content's component.
     *
     * @param step - The previous step in this transition Run
     * @param initiator - The controller initiating the activation
     * @param parent - The parent controller for the content's component controller
     * @param flags - The lifecycle flags
     * @param connectedCE - The viewport's connectd custom element
     * @param stateful - Whether the content's component is stateful and shouldn't be disposed
     */
    deactivateComponent(step, initiator, parent, connectedCE, stateful = false) {
        if (!this.contentStates.has('activated') && !this.contentStates.has('activating')) {
            return;
        }
        return Runner.run(step, 
        // TODO: Revisit once it's possible to abort within lifecycle hooks
        // () => {
        //   if (!this.contentStates.has('activated')) {
        //     const elements = Array.from(connectedCE.element.children);
        //     for (const el of elements) {
        //       (el as HTMLElement).style.display = 'none';
        //     }
        //     return this.contentStates.await('activated');
        //   }
        // },
        // () => this.waitForActivated(this.controller, connectedCE),
        () => {
            if (stateful && connectedCE.element !== null) {
                const elements = Array.from(connectedCE.element.getElementsByTagName('*'));
                for (const el of elements) {
                    if (el.scrollTop > 0 || el.scrollLeft) {
                        el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
                    }
                }
            }
            this.contentStates.delete('activated');
            this.contentStates.delete('activating');
            return this.controller?.deactivate(initiator ?? this.controller, parent);
        });
    }
    /**
     * Dispose the content's component.
     *
     * @param connectedCE - The viewport's connectd custom element
     * @param cache - The cache to push the viewport content to if stateful
     * @param stateful - Whether the content's component is stateful and shouldn't be disposed
     */
    disposeComponent(connectedCE, cache, stateful = false) {
        if (!this.contentStates.has('created') || this.instruction.component.instance == null) {
            return;
        }
        // Don't unload components when stateful
        // TODO: We're missing stuff here
        if (!stateful) {
            this.contentStates.delete('created');
            return this.controller?.dispose();
        }
        else {
            cache.push(this);
        }
    }
    /**
     * Free the content's content.
     *
     * @param step - The previous step in this transition Run
     * @param connectedCE - The viewport's connectd custom element
     * @param navigation - The navigation causing the content to be freed
     * @param cache - The cache to push the viewport content to if stateful
     * @param stateful - Whether the content's component is stateful and shouldn't be disposed
     */
    freeContent(step, connectedCE, navigation, cache, stateful = false) {
        return Runner.run(step, () => this.unload(navigation), (innerStep) => this.deactivateComponent(innerStep, null, connectedCE.controller, connectedCE, stateful), () => this.disposeComponent(connectedCE, cache, stateful));
    }
    /**
     * Get the content's component name (if any).
     */
    toComponentName() {
        return this.instruction.component.name;
    }
    /**
     * Get the content's component type (if any).
     */
    toComponentType(container) {
        if (this.instruction.component.none) {
            return null;
        }
        return this.instruction.component.toType(container, this.instruction);
    }
    /**
     * Get the content's component instance (if any).
     */
    toComponentInstance(parentContainer, parentController, parentElement) {
        if (this.instruction.component.none) {
            return null;
        }
        return this.instruction.component.toInstance(parentContainer, parentController, parentElement, this.instruction);
    }
    /**
     * Wait for the viewport's parent to be active.
     *
     * @param parent - The parent controller to the viewport's controller
     */
    waitForParent(parent) {
        if (parent === null) {
            return;
        }
        if (!parent.isActive) {
            return new Promise((resolve) => {
                this.endpoint.activeResolve = resolve;
            });
        }
    }
    /**
     * Assert that the error is an instantiation error. If it's not, throw
     * the error. If it is, log a warning in development mode.
     *
     * @param e - The error to assert
     */
    _assertInstantiationError(e) {
        if (!e.message.startsWith('AUR0009:')) {
            throw e;
        }
        {
            const componentName = this.instruction.component.name;
            // eslint-disable-next-line no-console
            console.warn(createMappedError(2017 /* ErrorNames.endpoint_instantiation_error */, componentName, e));
        }
    }
    _getLifecycleHooks(instance, name) {
        const hooks = instance.$controller.lifecycleHooks[name] ?? [];
        return hooks.map(hook => (hook.instance[name]).bind(hook.instance));
    }
}
function hasVmHook(instance, lifecycle) {
    return typeof instance[lifecycle] === 'function';
}

class ViewportOptions {
    constructor(
    /**
     * Whether the viewport has its own scope (owns other endpoints)
     */
    scope = true, 
    /**
     * A list of components that is using the viewport. These components
     * can only be loaded into this viewport and this viewport can't
     * load any other components.
     */
    usedBy = [], 
    /**
     * The default component that's loaded if the viewport is created
     * without having a component specified (in that navigation).
     */
    // eslint-disable-next-line default-param-last
    _default = '', 
    /**
     * The component loaded if the viewport can't load the specified
     * component. The component is passed as a parameter to the fallback.
     */
    fallback = '', 
    /**
     * Whether the fallback action is to load the fallback component in
     * place of the unloadable component and continue with any child
     * instructions or if the fallback is to be called and the processing
     * of the children to be aborted.
     */
    fallbackAction = '', 
    /**
     * The viewport doesn't add its content to the Location URL.
     */
    noLink = false, 
    /**
     * The viewport doesn't add a title to the browser window title.
     */
    noTitle = false, 
    /**
     * The viewport's content is stateful.
     */
    stateful = false, 
    /**
     * The viewport is always added to the routing instruction.
     */
    forceDescription = false, 
    /**
     * The transitions in the endpoint shouldn't be added to the navigation history
     */
    noHistory = false) {
        this.scope = scope;
        this.usedBy = usedBy;
        this.fallback = fallback;
        this.fallbackAction = fallbackAction;
        this.noLink = noLink;
        this.noTitle = noTitle;
        this.stateful = stateful;
        this.forceDescription = forceDescription;
        this.noHistory = noHistory;
        /**
         * The default component that's loaded if the viewport is created
         * without having a component specified (in that navigation).
         * (Declared here because of name conflict.)
         */
        this.default = undefined;
        this.default = _default;
    }
    static create(options) {
        const created = new ViewportOptions();
        if (options !== void 0) {
            created.apply(options);
        }
        return created;
    }
    apply(options) {
        this.scope = options.scope ?? this.scope;
        this.usedBy = (typeof options.usedBy === 'string'
            ? options.usedBy.split(',').filter(str => str.length > 0)
            : options.usedBy)
            ?? this.usedBy;
        this.default = options.default ?? this.default;
        this.fallback = options.fallback ?? this.fallback;
        this.fallbackAction = options.fallbackAction ?? this.fallbackAction;
        this.noLink = options.noLink ?? this.noLink;
        this.noTitle = options.noTitle ?? this.noTitle;
        this.stateful = options.stateful ?? this.stateful;
        this.forceDescription = options.forceDescription ?? this.forceDescription;
        this.noHistory = options.noHistory ?? this.noHistory;
    }
}

/**
 * The viewport is an endpoint that encapsulates an au-viewport custom element
 * instance. It always has at least one viewport content -- the current and also
 * the next when the viewport is in a transition -- even though the viewport
 * content can be empty.
 *
 * If a routing instruction is matched to a viewport during a navigation, the
 * router will ask the viewport if the navigation is approved (based on the state
 * of the current content, next content authorization and so on) and if it is,
 * instruct the navigation coordinator to start the viewport's transition when
 * appropriate. The viewport will then orchestrate, with coordination help from
 * the navigation coordinator, the transition between the current content and
 * the next, including calling relevant routing and lifecycle hooks.
 *
 * In addition to the above, the viewport also serves as the router's interface
 * to the loaded content/component and its configuration such as title and
 * configured routes.
 */
class Viewport extends Endpoint$1 {
    constructor(router, 
    /**
     * The name of the viewport
     */
    name, 
    /**
     * The connected ViewportCustomElement (if any)
     */
    connectedCE, 
    /**
     * The routing scope the viewport belongs to/is owned by
     */
    owningScope, 
    /**
     * Whether the viewport has its own routing scope, containing
     * endpoints it owns
     */
    hasScope, 
    /**
     * The viewport options.
     */
    options) {
        super(router, name, connectedCE);
        /**
         * The contents of the viewport. New contents are pushed to this, making
         * the last one the active one. It always holds at least one content, so
         * that there's always a current content.
         */
        this.contents = [];
        /**
         * Whether the viewport content should be cleared and removed,
         * regardless of statefulness (and hooks).
         */
        this.forceRemove = false;
        /**
         * The viewport options.
         */
        this.options = new ViewportOptions();
        /**
         * If set by viewport content, it's resolved when viewport has
         * been actived/started binding.
         */
        this.activeResolve = null;
        /**
         * If set, it's resolved when viewport custom element has been
         * connected to the viewport endpoint/router.
         */
        this.connectionResolve = null;
        /**
         * Whether the viewport is being cleared in the transaction.
         */
        this.clear = false;
        /**
         * The coordinators that have transitions on the viewport.
         * Wheneve a new coordinator is pushed, any previous are
         * considered inactive and skips actual transition activities.
         */
        this.coordinators = [];
        /**
         * Stores the current state before navigation starts so that it can be restored
         * if navigation is cancelled/interrupted.
         * TODO(post-alpha): Look into using viewport content fully for this
         */
        this.previousViewportState = null;
        /**
         * The viewport content cache used for statefulness.
         */
        this.cache = [];
        /**
         * The viewport content cache used for history statefulness.
         */
        this.historyCache = [];
        this.contents.push(new ViewportContent(router, this, owningScope, hasScope));
        this.contents[0].completed = true;
        if (options !== void 0) {
            this.options.apply(options);
        }
    }
    /**
     * The current content of the endpoint
     */
    getContent() {
        // If there's only one content, it's always content
        if (this.contents.length === 1) {
            return this.contents[0];
        }
        let content;
        // Go through all contents looking for last completed
        for (let i = 0, ii = this.contents.length; i < ii; i++) {
            if (this.contents[i].completed ?? false) {
                content = this.contents[i];
            }
            else {
                break;
            }
        }
        return content;
    }
    /**
     * The next, to be transitioned in, content of the endpoint
     */
    getNextContent() {
        // If there's only one content, it's always content
        if (this.contents.length === 1) {
            return null;
        }
        const lastCompleted = this.contents.indexOf(this.getContent());
        return this.contents.length > lastCompleted ? this.contents[lastCompleted + 1] : null;
    }
    /**
     * The content of the viewport at a specific timestamp.
     *
     * @param timestamp - The timestamp
     */
    getTimeContent(timestamp) {
        let content = null;
        // Go through all contents looking for last completed
        for (let i = 0, ii = this.contents.length; i < ii; i++) {
            if (this.contents[i].navigation.timestamp > timestamp) {
                break;
            }
            content = this.contents[i];
        }
        return content;
    }
    /**
     * The content for a specific navigation (or coordinator)
     */
    getNavigationContent(navigation) {
        return super.getNavigationContent(navigation);
    }
    /**
     * The parent viewport.
     */
    get parentViewport() {
        let scope = this.connectedScope;
        while (scope?.parent != null) {
            scope = scope.parent;
            if (scope.endpoint.isViewport) {
                return scope.endpoint;
            }
        }
        return null;
    }
    /**
     * Whether the viewport (content) is empty.
     */
    get isEmpty() {
        return this.getContent().componentInstance === null;
    }
    /**
     * Whether the viewport content should be cleared and removed,
     * regardless of statefulness (and hooks). If a parent should
     * be removed, the viewport should as well.
     */
    get doForceRemove() {
        let scope = this.connectedScope;
        while (scope !== null) {
            if (scope.isViewport && scope.endpoint.forceRemove) {
                return true;
            }
            scope = scope.parent;
        }
        return false;
    }
    /**
     * Whether a coordinator handles the active navigation.
     *
     * @param coordinator - The coordinator to check
     */
    isActiveNavigation(coordinator) {
        return this.coordinators[this.coordinators.length - 1] === coordinator;
    }
    /**
     * For debug purposes.
     */
    toString() {
        const contentName = this.getContent()?.instruction.component.name ?? '';
        const nextContentName = this.getNextContent()?.instruction.component.name ?? '';
        return `v:${this.name}[${contentName}->${nextContentName}]`;
    }
    /**
     * Set the next content for the viewport. Returns the action that the viewport
     * will take when the navigation coordinator starts the transition. Note that a
     * swap isn't guaranteed, current component configuration can result in a skipped
     * transition.
     *
     * @param instruction - The routing instruction describing the next content
     * @param navigation - The navigation that requests the content change
     */
    setNextContent(instruction, navigation) {
        instruction.endpoint.set(this);
        this.clear = instruction.isClear(this.router);
        const content = this.getContent();
        // Can have a (resolved) type or a string (to be resolved later)
        const nextContent = new ViewportContent(this.router, this, this.owningScope, this.scope.hasScope, !this.clear ? instruction : void 0, navigation, this.connectedCE ?? null);
        this.contents.push(nextContent);
        nextContent.fromHistory = nextContent.componentInstance !== null && navigation.navigation != null
            ? !!navigation.navigation.back || !!navigation.navigation.forward
            : false;
        if (this.options.stateful) {
            // TODO: Add a parameter here to decide required equality
            const cached = this.cache.find((item) => nextContent.isCacheEqual(item));
            if (cached !== void 0) {
                this.contents.splice(this.contents.indexOf(nextContent), 1, cached);
                nextContent.fromCache = true;
            }
            else {
                this.cache.push(nextContent);
            }
        }
        // If we get the same _instance_, don't do anything (happens with cached and history)
        if (nextContent.componentInstance !== null && content.componentInstance === nextContent.componentInstance) {
            nextContent.delete();
            this.contents.splice(this.contents.indexOf(nextContent), 1);
            return this.transitionAction = 'skip';
        }
        if (!content.equalComponent(nextContent) ||
            navigation.navigation.refresh || // Navigation 'refresh' performed
            content.reloadBehavior === 'refresh' // ReloadBehavior 'refresh' takes precedence
        ) {
            return this.transitionAction = 'swap';
        }
        // If we got here, component is the same name/type
        // Explicitly don't allow navigation back to the same component again
        if (content.reloadBehavior === 'disallow') {
            nextContent.delete();
            this.contents.splice(this.contents.indexOf(nextContent), 1);
            return this.transitionAction = 'skip';
        }
        // Explicitly re-load same component again
        // TODO(alpha): NEED TO CHECK THIS TOWARDS activeContent REGARDING scope
        if (content.reloadBehavior === 'reload') {
            content.reload = true;
            nextContent.instruction.component.set(content.componentInstance);
            nextContent.contentStates = content.contentStates.clone();
            nextContent.reload = content.reload;
            return this.transitionAction = 'reload';
        }
        // ReloadBehavior is now 'default'
        // Requires updated parameters if viewport stateful
        if (this.options.stateful && content.equalParameters(nextContent)) {
            nextContent.delete();
            this.contents.splice(this.contents.indexOf(nextContent), 1);
            return this.transitionAction = 'skip';
        }
        if (!content.equalParameters(nextContent)) {
            // TODO: Fix a config option for this
            // eslint-disable-next-line no-constant-condition
            { // Perform a full swap
                return this.transitionAction = 'swap';
            }
        }
        // Default is to do nothing
        nextContent.delete();
        this.contents.splice(this.contents.indexOf(nextContent), 1);
        return this.transitionAction = 'skip';
    }
    /**
     * Connect a ViewportCustomElement to this viewport endpoint, applying options
     * while doing so.
     *
     * @param connectedCE - The custom element to connect
     * @param options - The options to apply
     */
    setConnectedCE(connectedCE, options) {
        options = options ?? {};
        if (this.connectedCE !== connectedCE) {
            // TODO: Restore this state on navigation cancel
            this.previousViewportState = { ...this };
            this.clearState();
            this.connectedCE = connectedCE;
            this.options.apply(options);
            this.connectionResolve?.();
        }
        const parentDefaultRoute = (this.scope.parent?.endpoint.getRoutes() ?? [])
            .filter(route => (Array.isArray(route.path) ? route.path : [route.path]).includes(''))
            .length > 0;
        if (this.getContent().componentInstance === null
            && this.getNextContent()?.componentInstance == null
            && (this.options.default || parentDefaultRoute)) {
            const instructions = RoutingInstruction.parse(this.router, this.options.default ?? '');
            if (instructions.length === 0 && parentDefaultRoute) {
                const foundRoute = this.scope.parent?.findInstructions([RoutingInstruction.create('')], false, this.router.configuration.options.useConfiguredRoutes);
                if (foundRoute?.foundConfiguration) {
                    instructions.push(...foundRoute.instructions);
                }
            }
            for (const instruction of instructions) {
                // Set to name to be delayed one turn (refactor: not sure why, so changed it)
                instruction.endpoint.set(this);
                instruction.scope = this.owningScope;
                instruction.default = true;
            }
            this.router.load(instructions, { append: true }).catch(error => { throw error; });
        }
    }
    // TODO(alpha): Look into this!
    remove(step, connectedCE) {
        // TODO: Review this: should it go from promise to value somewhere?
        if (this.connectedCE === connectedCE) {
            return Runner.run(step, (innerStep) => {
                if (this.getContent().componentInstance !== null) {
                    return this.getContent().freeContent(innerStep, this.connectedCE, (this.getNextContent()?.navigation ?? null), this.historyCache, this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful); // .catch(error => { throw error; });
                }
            }, (innerStep) => {
                if (this.doForceRemove) {
                    const removes = [];
                    for (const content of this.historyCache) {
                        removes.push((innerInnerStep) => content.freeContent(innerInnerStep, null, null, this.historyCache, false));
                    }
                    removes.push(() => { this.historyCache = []; });
                    return Runner.run(innerStep, ...removes);
                }
                return true;
            });
        }
        return false;
    }
    /**
     * Transition from current content to the next.
     *
     * @param coordinator - The coordinator of the navigation
     */
    async transition(coordinator) {
        const navigatingPrefix = this.router.configuration.options.indicators.viewportNavigating;
        this.coordinators.push(coordinator);
        // If this isn't the first coordinator, a navigation is already in process...
        while (this.coordinators[0] !== coordinator) {
            // ...so first wait for it to finish.
            await this.coordinators[0].waitForSyncState('completed');
        }
        // Get the parent viewport...
        let actingParentViewport = this.parentViewport;
        // ...but not if it's not acting (reloading or swapping)
        if (actingParentViewport !== null
            && actingParentViewport.transitionAction !== 'reload'
            && actingParentViewport.transitionAction !== 'swap') {
            actingParentViewport = null;
        }
        // If actingParentViewport has a value, that viewport's routing
        // hooks needs to be awaited before starting this viewport's
        // corresponding routing hook.
        // First create a list with the steps that should run in the order
        // they should run and then, at the end, run them. Each hook step
        // registers its completeness with the navigation coordinator, which
        // keeps track of entity/endpoint transition states and restrictions
        // as well as pausing continuation if needed.
        // The transition guard hooks, canUnload and canLoad, both of which
        // can cancel the entire navigation
        const guardSteps = [
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    return this.canUnload(coordinator, step);
                }
            },
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    if ((step.previousValue ?? true) === false) { // canUnloadResult: boolean
                        // step.cancel();
                        coordinator.cancel();
                    }
                }
            },
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    return RoutingInstruction.resolve([this.getNavigationContent(coordinator).instruction]);
                }
            },
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    if (this.router.isRestrictedNavigation) { // Create the component early if restricted navigation
                        const routerOptions = this.router.configuration.options;
                        return this.getNavigationContent(coordinator).createComponent(coordinator, this.connectedCE, this.options.fallback || routerOptions.fallback, this.options.fallbackAction || routerOptions.fallbackAction);
                    }
                }
            },
            () => coordinator.addEndpointState(this, 'guardedUnload'),
            () => coordinator.waitForSyncState('guardedUnload', this), // Awaits all `canUnload` hooks
            () => actingParentViewport !== null ? coordinator.waitForEndpointState(actingParentViewport, 'guardedLoad') : void 0, // Awaits parent `canLoad`
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    return this.canLoad(coordinator, step);
                }
            },
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    let canLoadResult = (step.previousValue ?? true);
                    if (typeof canLoadResult === 'boolean') { // canLoadResult: boolean | LoadInstruction | LoadInstruction[],
                        if (!canLoadResult) {
                            step.cancel();
                            coordinator.cancel();
                            const instruction = this.getNavigationContent(coordinator).instruction;
                            coordinator.removeInstructions(instruction.dynasty);
                            instruction.nextScopeInstructions = null;
                            return;
                        }
                    }
                    else { // Denied and (probably) redirected
                        const instruction = this.getNavigationContent(coordinator).instruction;
                        coordinator.removeInstructions(instruction.dynasty);
                        instruction.nextScopeInstructions = null;
                        if (typeof canLoadResult === 'string') {
                            const scope = this.scope;
                            const options = this.router.configuration.options;
                            let instructions = RoutingInstruction.parse(this.router, canLoadResult);
                            const foundRoute = scope.parent?.findInstructions(instructions, options.useDirectRouting, options.useConfiguredRoutes);
                            if (foundRoute?.foundConfiguration || foundRoute?.foundInstructions) {
                                instructions = foundRoute.instructions;
                            }
                            for (const instruction of instructions) {
                                instruction.endpoint.set(this);
                                instruction.scope = scope.owningScope;
                            }
                            canLoadResult = instructions;
                        }
                        return Runner.run(step, () => {
                            void this.router.load(canLoadResult, { append: coordinator });
                        }, (innerStep) => this.cancelContentChange(coordinator, innerStep), () => RoutingInstruction.resolve(canLoadResult), (innerStep) => {
                            return innerStep.exit();
                        });
                    }
                }
                coordinator.addEndpointState(this, 'guardedLoad');
                coordinator.addEndpointState(this, 'guarded');
            },
        ];
        // The transition routing hooks, unloading and loading
        const routingSteps = [
            () => coordinator.waitForSyncState('guarded', this),
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    return this.unload(coordinator, step);
                }
            },
            () => coordinator.addEndpointState(this, 'unloaded'),
            () => coordinator.waitForSyncState('unloaded', this),
            () => actingParentViewport !== null ? coordinator.waitForEndpointState(actingParentViewport, 'loaded') : void 0,
            (step) => {
                if (this.isActiveNavigation(coordinator)) {
                    return this.load(coordinator, step);
                }
            },
            () => coordinator.addEndpointState(this, 'loaded'),
            () => coordinator.addEndpointState(this, 'routed'),
        ];
        // The lifecycle hooks, with order and parallelism based on configuration
        const lifecycleSteps = [
            () => coordinator.waitForSyncState('routed', this),
            () => coordinator.waitForEndpointState(this, 'routed'),
        ];
        const swapOrder = this.router.configuration.options.swapOrder;
        switch (swapOrder) {
            case 'detach-current-attach-next':
                lifecycleSteps.push((step) => { if (this.isActiveNavigation(coordinator)) {
                    return this.removeContent(step, coordinator);
                } }, (step) => { if (this.isActiveNavigation(coordinator)) {
                    return this.addContent(step, coordinator);
                } });
                break;
            case 'attach-next-detach-current':
                lifecycleSteps.push((step) => { if (this.isActiveNavigation(coordinator)) {
                    return this.addContent(step, coordinator);
                } }, (step) => { if (this.isActiveNavigation(coordinator)) {
                    return this.removeContent(step, coordinator);
                } });
                break;
            case 'detach-attach-simultaneously':
                lifecycleSteps.push((step) => Runner.runParallel(step, (innerStep) => { if (this.isActiveNavigation(coordinator)) {
                    return this.removeContent(innerStep, coordinator);
                } }, (innerStep) => { if (this.isActiveNavigation(coordinator)) {
                    return this.addContent(innerStep, coordinator);
                } }));
                break;
            case 'attach-detach-simultaneously':
                lifecycleSteps.push((step) => Runner.runParallel(step, (innerStep) => { if (this.isActiveNavigation(coordinator)) {
                    return this.addContent(innerStep, coordinator);
                } }, (innerStep) => { if (this.isActiveNavigation(coordinator)) {
                    return this.removeContent(innerStep, coordinator);
                } }));
                break;
        }
        lifecycleSteps.push(() => coordinator.addEndpointState(this, 'swapped'));
        // Set activity indicator (class) on the connected custom element
        this.connectedCE?.setActivity?.(navigatingPrefix, true);
        this.connectedCE?.setActivity?.(coordinator.navigation.navigation, true);
        // Run the steps and do the transition
        const result = Runner.run('transition', (step) => coordinator.setEndpointStep(this, step.root), ...guardSteps, ...routingSteps, ...lifecycleSteps, () => coordinator.addEndpointState(this, 'completed'), () => coordinator.waitForSyncState('bound'), () => {
            this.connectedCE?.setActivity?.(navigatingPrefix, false);
            this.connectedCE?.setActivity?.(coordinator.navigation.navigation, false);
        });
        if (result instanceof Promise) {
            result.catch(_err => { });
        }
    }
    /**
     * Check if the current content can be unloaded.
     *
     * @param step - The previous step in this transition Run
     */
    canUnload(coordinator, step) {
        return Runner.run(step, (innerStep) => {
            return this.getContent().connectedScope.canUnload(coordinator, innerStep);
        }, (innerStep) => {
            if ((innerStep.previousValue ?? true) === false) { // canUnloadChildren
                return false;
            }
            return this.getContent().canUnload(coordinator.navigation);
        });
    }
    /**
     * Check if the next content can be loaded.
     *
     * @param step - The previous step in this transition Run
     */
    canLoad(coordinator, step) {
        if (this.clear) {
            return true;
        }
        return Runner.run(step, () => this.waitForConnected(), () => {
            const routerOptions = this.router.configuration.options;
            const navigationContent = this.getNavigationContent(coordinator);
            return navigationContent.createComponent(coordinator, this.connectedCE, this.options.fallback || routerOptions.fallback, this.options.fallbackAction || routerOptions.fallbackAction);
        }, () => this.getNavigationContent(coordinator).canLoad());
    }
    /**
     * Load the next content.
     *
     * @param step - The previous step in this transition Run
     */
    load(coordinator, step) {
        if (this.clear) {
            return;
        }
        return this.getNavigationContent(coordinator).load(step);
    }
    /**
     * Add (activate) the next content.
     *
     * @param step - The previous step in this transition Run
     * @param coordinator - The navigation coordinator
     */
    addContent(step, coordinator) {
        return this.activate(step, null, this.connectedController, coordinator);
    }
    /**
     * Remove (deactivate) the current content.
     *
     * @param step - The previous step in this transition Run
     * @param coordinator - The navigation coordinator
     */
    removeContent(step, coordinator) {
        if (this.isEmpty) {
            return;
        }
        const manualDispose = this.router.statefulHistory || (this.options.stateful ?? false);
        return Runner.run(step, 
        // TODO: This also needs to be added when coordinator isn't active (and
        // this method isn't called)
        () => coordinator.addEndpointState(this, 'bound'), () => coordinator.waitForSyncState('bound'), (innerStep) => this.deactivate(innerStep, null, this.connectedController), () => manualDispose ? this.dispose() : void 0);
    }
    /**
     * Activate the next content component, running `load` first. (But it only
     * runs if it's not already run.) Called both when transitioning and when
     * the custom element triggers it.
     *
     * @param step - The previous step in this transition Run
     * @param initiator - The controller that initiates the activate
     * @param parent - The parent controller
     * @param flags - The lifecycle flags for `activate`
     * @param coordinator - The navigation coordinator
     */
    activate(step, initiator, parent, coordinator) {
        if (this.activeContent.componentInstance !== null) {
            return Runner.run(step, () => this.activeContent.canLoad(), // Only acts if not already checked
            (innerStep) => this.activeContent.load(innerStep), // Only acts if not already loaded
            (innerStep) => this.activeContent.activateComponent(innerStep, initiator, parent, this.connectedCE, 
            // TODO: This also needs to be added when coordinator isn't active (and
            // this method isn't called)
            () => coordinator?.addEndpointState(this, 'bound'), coordinator?.waitForSyncState('bound')));
        }
    }
    /**
     * Deactivate the current content component. Called both when
     * transitioning and when the custom element triggers it.
     *
     * @param initiator - The controller that initiates the deactivate
     * @param parent - The parent controller
     * @param flags - The lifecycle flags for `deactivate`
     */
    deactivate(step, initiator, parent) {
        const content = this.getContent();
        if (content?.componentInstance != null &&
            !content.reload &&
            content.componentInstance !== this.getNextContent()?.componentInstance) {
            return content.deactivateComponent(step, initiator, parent, this.connectedCE, this.router.statefulHistory || this.options.stateful);
        }
    }
    /**
     * Unload the current content.
     *
     * @param step - The previous step in this transition Run
     */
    unload(coordinator, step) {
        return Runner.run(step, (unloadStep) => this.getContent().connectedScope.unload(coordinator, unloadStep), () => this.getContent().componentInstance != null ? this.getContent().unload(coordinator.navigation ?? null) : void 0);
    }
    /**
     * Dispose the current content.
     */
    dispose() {
        if (this.getContent().componentInstance !== null &&
            !this.getContent().reload &&
            this.getContent().componentInstance !== this.getNextContent()?.componentInstance) {
            this.getContent().disposeComponent(this.connectedCE, this.historyCache, this.router.statefulHistory || this.options.stateful);
        }
    }
    /**
     * Finalize the change of content by making the next content the current
     * content. The previously current content is deleted.
     */
    finalizeContentChange(coordinator, step) {
        const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
        let nextContent = this.contents[nextContentIndex];
        const previousContent = this.contents[nextContentIndex - 1];
        // const previousContents = this.contents.slice(0, nextContentIndex);
        if (this.clear) {
            const emptyContent = new ViewportContent(this.router, this, this.owningScope, this.scope.hasScope, void 0, nextContent.navigation);
            this.contents.splice(nextContentIndex, 1, emptyContent);
            nextContent.delete();
            nextContent = emptyContent;
        }
        else {
            nextContent.reload = false;
        }
        previousContent.delete();
        // TODO: Fix this so that multiple removes work!
        // const freeSteps = [];
        // for (const previousContent of previousContents) {
        //   freeSteps.push(
        //     (innerStep: Step<void>) => {
        //       // return previousContent.freeContent(
        //       //   innerStep,
        //       //   this.connectedCE,
        //       //   previousContent.navigation,
        //       //   this.historyCache,
        //       //   this.router.statefulHistory || this.options.stateful)
        //     },
        //     () => previousContent.delete(),
        //   );
        // }
        // return Runner.run(step,
        //   ...freeSteps,
        //   () => {
        // if (nextContent !== null) {
        nextContent.completed = true;
        // }
        this.transitionAction = '';
        nextContent.contentStates.delete('checkedUnload');
        nextContent.contentStates.delete('checkedLoad');
        this.previousViewportState = null;
        const navigatingPrefix = this.router.configuration.options.indicators.viewportNavigating;
        this.connectedCE?.setActivity?.(navigatingPrefix, false);
        this.connectedCE?.setActivity?.(coordinator.navigation.navigation, false);
        let removeable = 0;
        for (let i = 0, ii = nextContentIndex; i < ii; i++) {
            if (!(this.contents[0].navigation.completed ?? false)) {
                break;
            }
            removeable++;
        }
        this.contents.splice(0, removeable);
        arrayRemove(this.coordinators, (coord => coord === coordinator));
        //   }
        // ) as Step<void>;
    }
    /**
     * Cancel the change of content. The next content is freed/discarded.
     *
     * @param step - The previous step in this transition Run
     */
    cancelContentChange(coordinator, noExitStep = null) {
        // First cancel content change in all children
        [...new Set(this.scope.children.map(scope => scope.endpoint))].forEach(child => child.cancelContentChange(coordinator, noExitStep));
        const nextContentIndex = this.contents.findIndex(content => content.navigation === coordinator.navigation);
        if (nextContentIndex < 0) {
            return;
        }
        const step = coordinator.getEndpointStep(this)?.current ?? null;
        const nextContent = this.contents[nextContentIndex];
        const previousContent = this.contents[nextContentIndex - 1];
        nextContent.instruction.cancelled = true;
        return Runner.run(step, (innerStep) => {
            return nextContent.freeContent(innerStep, this.connectedCE, nextContent.navigation, this.historyCache, this.router.statefulHistory || this.options.stateful);
        }, () => {
            if (this.previousViewportState) {
                Object.assign(this, this.previousViewportState);
            }
            nextContent?.delete();
            if (nextContent !== null) {
                this.contents.splice(this.contents.indexOf(nextContent), 1);
            }
            this.transitionAction = '';
            previousContent?.contentStates.delete('checkedUnload');
            previousContent?.contentStates.delete('checkedLoad');
            const navigatingPrefix = this.router.configuration.options.indicators.viewportNavigating;
            this.connectedCE?.setActivity?.(navigatingPrefix, false);
            this.connectedCE?.setActivity?.(coordinator.navigation.navigation, false);
            coordinator.removeEndpoint(this);
            arrayRemove(this.coordinators, (coord => coord === coordinator));
        }, () => {
            if (step !== noExitStep) {
                return step?.exit();
            }
        });
    }
    /**
     * Whether the viewport wants a specific component. Used when
     * matching routing instructions to viewports.
     *
     * @param component - The component to check
     *
     * TODO: Deal with non-string components
     */
    wantComponent(component) {
        return this.options.usedBy.includes(component);
    }
    /**
     * Whether the viewport accepts a specific component. Used when
     * matching routing instructions to viewports.
     *
     * @param component - The component to check
     *
     * TODO: Deal with non-string components
     */
    acceptComponent(component) {
        if (component === '-' || component === null) {
            return true;
        }
        const usedBy = this.options.usedBy;
        if (usedBy.length === 0) {
            return true;
        }
        if (usedBy.includes(component)) {
            return true;
        }
        if (usedBy.filter((value) => value.includes('*')).length) {
            return true;
        }
        return false;
    }
    /**
     * Free/discard a history cached content containing a specific component.
     *
     * @param step - The previous step in this transition Run
     * @param component - The component to look for
     *
     * TODO: Deal with multiple contents containing the component
     */
    freeContent(step, component) {
        const content = this.historyCache.find(cached => cached.componentInstance === component);
        if (content !== void 0) {
            return Runner.run(step, (innerStep) => {
                this.forceRemove = true;
                return content.freeContent(innerStep, null, null, this.historyCache, false);
            }, () => {
                this.forceRemove = false;
                arrayRemove(this.historyCache, (cached => cached === content));
            });
        }
    }
    /**
     * Get any configured routes in the relevant content's component type.
     */
    getRoutes() {
        const routes = [];
        let componentType = this.getComponentType();
        if (componentType != null) {
            componentType = componentType.constructor === componentType.constructor.constructor
                ? componentType
                : componentType.constructor;
            routes.push(...(Routes.getConfiguration(componentType) ?? []));
        }
        return routes;
    }
    /**
     * Get the title for the content.
     *
     * @param navigation - The navigation that requests the content change
     */
    getTitle(navigation) {
        if (this.options.noTitle) {
            return '';
        }
        const componentType = this.getComponentType();
        if (componentType === null) {
            return '';
        }
        let title = '';
        const typeTitle = componentType.title;
        if (typeTitle !== void 0) {
            if (typeof typeTitle === 'string') {
                title = typeTitle;
            }
            else {
                const component = this.getComponentInstance();
                title = typeTitle.call(component, component, navigation);
            }
        }
        else if (this.router.configuration.options.title.useComponentNames) {
            let name = this.getContentInstruction().component.name ?? '';
            // TODO(alpha): Allow list of component prefixes
            const prefix = (this.router.configuration.options.title.componentPrefix ?? '');
            if (name.startsWith(prefix)) {
                name = name.slice(prefix.length);
            }
            name = name.replace('-', ' ');
            title = name.slice(0, 1).toLocaleUpperCase() + name.slice(1);
        }
        return title;
    }
    /**
     * Get component type of the relevant, current or next, content.
     */
    getComponentType() {
        let componentType = this.getContentInstruction().component.type ?? null;
        if (componentType === null) {
            const controller = CustomElement.for(this.connectedCE.element);
            componentType = controller.container
                .componentType;
        }
        return componentType ?? null;
    }
    /**
     * Get component instance of the relevant, current or next, content.
     */
    getComponentInstance() {
        return this.getContentInstruction().component.instance ?? null;
    }
    /**
     * Get routing instruction of the relevant, current or next, content.
     */
    getContentInstruction() {
        return this.getNextContent()?.instruction ?? this.getContent().instruction ?? null;
    }
    /**
     * Clear the viewport state.
     *
     * TODO: Investigate the need.
     */
    clearState() {
        this.options = ViewportOptions.create();
        const owningScope = this.owningScope;
        const hasScope = this.scope.hasScope;
        this.getContent().delete();
        this.contents.shift();
        if (this.contents.length < 1) {
            throw new Error('no content!');
        }
        this.contents.push(new ViewportContent(this.router, this, owningScope, hasScope));
        this.cache = [];
    }
    /**
     * If necessary, get a promise to await until a custom element connects.
     */
    waitForConnected() {
        if (this.connectedCE === null) {
            return new Promise((resolve) => {
                this.connectionResolve = resolve;
            });
        }
    }
}

class InstructionEndpoint {
    constructor() {
        this.name = null;
        this.instance = null;
        this.scope = null;
    }
    get none() {
        return this.name === null && this.instance === null;
    }
    get endpointType() {
        if (this.instance instanceof Viewport) {
            return 'Viewport';
        }
        if (this.instance instanceof ViewportScope) {
            return 'ViewportScope';
        }
        return null;
    }
    static create(endpointHandle) {
        const endpoint = new InstructionEndpoint();
        endpoint.set(endpointHandle);
        return endpoint;
    }
    static isName(endpoint) {
        return typeof endpoint === 'string';
    }
    static isInstance(endpoint) {
        return endpoint instanceof Endpoint$1;
    }
    static getName(endpoint) {
        if (InstructionEndpoint.isName(endpoint)) {
            return endpoint;
        }
        else {
            return endpoint ? (endpoint).name : null;
        }
    }
    static getInstance(endpoint) {
        if (InstructionEndpoint.isName(endpoint)) {
            return null;
        }
        else {
            return endpoint;
        }
    }
    set(endpoint) {
        if (endpoint === undefined || endpoint === '') {
            endpoint = null;
        }
        if (typeof endpoint === 'string') {
            this.name = endpoint;
            this.instance = null;
        }
        else {
            this.instance = endpoint;
            if (endpoint !== null) {
                this.name = endpoint.name;
                this.scope = endpoint.owningScope;
            }
        }
    }
    toInstance(router) {
        if (this.instance !== null) {
            return this.instance;
        }
        return router.getEndpoint(this.endpointType, this.name);
    }
    same(other, compareScope) {
        if (this.instance !== null && other.instance !== null) {
            return this.instance === other.instance;
        }
        return (this.endpointType !== null &&
            other.endpointType !== null &&
            this.endpointType === other.endpointType) &&
            (!compareScope || this.scope === other.scope) &&
            (this.instance !== null ? this.instance.name : this.name) ===
                (other.instance !== null ? other.instance.name : other.name);
    }
}

const RoutingInstructionStringifyOptionsDefaults = {
    excludeEndpoint: false,
    endpointContext: false,
    fullState: false,
};
/**
 * The routing instructions are the core of the router's navigations. All
 * navigation instructions to the router are translated to a set of
 * routing instructions. The routing instructions are resolved "non-early"
 * to support dynamic, local resolutions.
 *
 * Routing instructions are used to represent the full navigation state
 * and is serialized when storing and restoring the navigation state. (But
 * not full component state with component instance state. ViewportContent
 * is used for that.)
 */
class RoutingInstruction {
    constructor(component, endpoint, parameters) {
        /**
         * Whether the routing instruction owns its scope.
         */
        this.ownsScope = true;
        /**
         * The routing instructions in the next scope ("children").
         */
        this.nextScopeInstructions = null;
        /**
         * The scope the the routing instruction belongs to.
         */
        this.scope = null;
        /**
         * The scope modifier of the routing instruction.
         */
        this.scopeModifier = '';
        /**
         * Whether the routing instruction can be resolved within the scope without having
         * endpoint specified. Used when creating string instructions/links/url.
         */
        this.needsEndpointDescribed = false;
        /**
         * The configured route, if any, that the routing instruction is part of.
         */
        this.route = null;
        /**
         * The instruction is the start/first instruction of a configured route.
         */
        this.routeStart = false;
        /**
         * Whether the routing instruction is the result of a (viewport) default (meaning it
         * has lower priority when processing instructions).
         */
        this.default = false;
        /**
         * Whether the routing instruction is the top instruction in its routing instruction
         * hierarchy. Used when syncing swap of all (top) instructions.
         */
        this.topInstruction = false;
        /**
         * The string, if any, that was used to parse the instruction. Includes anything
         * in the string after the actual part for the instruction itself.
         */
        this.unparsed = null;
        /**
         * Whether the routing instruction has been cancelled (aborted) for some reason
         */
        this.cancelled = false;
        this.component = InstructionComponent.create(component);
        this.endpoint = InstructionEndpoint.create(endpoint);
        this.parameters = InstructionParameters.create(parameters);
    }
    /**
     * Create a new routing instruction.
     *
     * @param component - The component (appelation) part of the instruction. Can be a promise
     * @param endpoint - The endpoint (handle) part of the instruction
     * @param parameters - The parameters part of the instruction
     * @param ownScope - Whether the routing instruction owns its scope
     * @param nextScopeInstructions - The routing instructions in the next scope ("children")
     */
    static create(component, endpoint, parameters, ownsScope = true, nextScopeInstructions = null) {
        const instruction = new RoutingInstruction(component, endpoint, parameters);
        instruction.ownsScope = ownsScope;
        instruction.nextScopeInstructions = nextScopeInstructions;
        return instruction;
    }
    /**
     * Create a clear endpoint routing instruction.
     *
     * @param endpoint - The endpoint to create the clear instruction for
     */
    static createClear(context, endpoint) {
        const instruction = RoutingInstruction.create(RoutingInstruction.clear(context), endpoint);
        // Clear instructions should have the scope of the endpoint
        instruction.scope = endpoint.scope;
        return instruction;
    }
    /**
     * Get routing instructions based on load instructions.
     *
     * @param context - The context (used for syntax) within to parse the instructions
     * @param loadInstructions - The load instructions to get the routing
     * instructions from.
     */
    static from(context, loadInstructions) {
        if (!Array.isArray(loadInstructions)) {
            loadInstructions = [loadInstructions];
        }
        const instructions = [];
        for (const instruction of loadInstructions) {
            if (typeof instruction === 'string') {
                instructions.push(...RoutingInstruction.parse(context, instruction));
            }
            else if (instruction instanceof RoutingInstruction) {
                instructions.push(instruction);
            }
            else if (instruction instanceof Promise) {
                instructions.push(RoutingInstruction.create(instruction));
            }
            else if (InstructionComponent.isAppelation(instruction)) {
                instructions.push(RoutingInstruction.create(instruction));
            }
            else if (InstructionComponent.isDefinition(instruction)) {
                instructions.push(RoutingInstruction.create(instruction.Type));
            }
            else if ('component' in instruction || 'id' in instruction) {
                const viewportComponent = instruction;
                const newInstruction = RoutingInstruction.create(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters);
                newInstruction.route = instruction.id ?? null;
                if (viewportComponent.children !== void 0 && viewportComponent.children !== null) {
                    newInstruction.nextScopeInstructions = RoutingInstruction.from(context, viewportComponent.children);
                }
                instructions.push(newInstruction);
            }
            else if (typeof instruction === 'object' && instruction !== null) {
                const type = CustomElement.define(instruction);
                instructions.push(RoutingInstruction.create(type));
            }
            else {
                instructions.push(RoutingInstruction.create(instruction));
            }
        }
        return instructions;
    }
    /**
     * The routing instruction component that represents "clear".
     */
    static clear(context) {
        return Separators.for(context).clear;
    }
    /**
     * The routing instruction component that represents "add".
     */
    static add(context) {
        return Separators.for(context).add;
    }
    /**
     * Parse an instruction string into a list of routing instructions.
     *
     * @param context - The context (used for syntax) within to parse the instructions
     * @param instructions - The instruction string to parse
     */
    static parse(context, instructions) {
        const seps = Separators.for(context);
        let scopeModifier = '';
        // Scope modifier is a start with .. or / and any combination thereof
        const match = /^[./]+/.exec(instructions);
        // If it starts with a scope modifier...
        if (Array.isArray(match) && match.length > 0) {
            // ...save and...
            scopeModifier = match[0];
            // ...extract it.
            instructions = instructions.slice(scopeModifier.length);
        }
        // Parse the instructions...
        const parsedInstructions = InstructionParser.parse(seps, instructions, true, true).instructions;
        for (const instruction of parsedInstructions) {
            // ...and set the scope modifier on each of them.
            instruction.scopeModifier = scopeModifier;
        }
        return parsedInstructions;
    }
    /**
     * Stringify a list of routing instructions, recursively down next scope/child instructions.
     *
     * @param context - The context (used for syntax) within to stringify the instructions
     * @param instructions - The instructions to stringify
     * @param options - The options for stringifying the instructions
     * @param endpointContext - Whether to include endpoint context in the string. [Deprecated] Use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }
     */
    static stringify(context, instructions, options = {}, endpointContext = false) {
        if (typeof options === 'boolean') {
            // eslint-disable-next-line no-console
            console.warn(`[Deprecated] Boolean passed to RoutingInstruction.stringify. Please use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }`);
            options = { excludeEndpoint: options, endpointContext };
        }
        options = { ...RoutingInstructionStringifyOptionsDefaults, ...options };
        return typeof (instructions) === 'string'
            ? instructions
            : instructions
                .map(instruction => instruction.stringify(context, options))
                .filter(instruction => instruction.length > 0)
                .join(Separators.for(context).sibling);
    }
    /**
     * Resolve a list of routing instructions, returning a promise that should be awaited if needed.
     *
     * @param instructions - The instructions to resolve
     */
    static resolve(instructions) {
        const resolvePromises = instructions
            .filter(instr => instr.isUnresolved)
            .map(instr => instr.resolve())
            .filter(result => result instanceof Promise);
        if (resolvePromises.length > 0) {
            return Promise.all(resolvePromises);
        }
    }
    /**
     * Whether the instructions, on any level, contains siblings
     *
     * @param instructions - The instructions to check
     */
    static containsSiblings(context, instructions) {
        if (instructions === null) {
            return false;
        }
        if (instructions
            .filter(instruction => !instruction.isClear(context) && !instruction.isClearAll(context))
            .length > 1) {
            return true;
        }
        return instructions.some(instruction => RoutingInstruction.containsSiblings(context, instruction.nextScopeInstructions));
    }
    /**
     * Get all routing instructions, recursively down next scope/child instructions, as
     * a "flat" list.
     *
     * @param instructions - The instructions to flatten
     */
    static flat(instructions) {
        const flat = [];
        for (const instruction of instructions) {
            flat.push(instruction);
            if (instruction.hasNextScopeInstructions) {
                flat.push(...RoutingInstruction.flat(instruction.nextScopeInstructions));
            }
        }
        return flat;
    }
    /**
     * Clone a list of routing instructions.
     *
     * @param instructions - The instructions to clone
     * @param keepInstances - Whether actual instances should be transfered
     * @param scopeModifier - Whether the scope modifier should be transfered
     */
    static clone(instructions, keepInstances = false, scopeModifier = false) {
        return instructions.map(instruction => instruction.clone(keepInstances, scopeModifier));
    }
    /**
     * Whether a list of routing instructions contains another list of routing
     * instructions. If deep, all next scope instructions needs to be contained
     * in containing next scope instructions as well.
     *
     * @param context - The context (used for parameter syntax) to compare within
     * @param instructionsToSearch - Instructions that should contain (superset)
     * @param instructionsToFind - Instructions that should be contained (subset)
     * @param deep - Whether next scope instructions also need to be contained (recursively)
     */
    static contains(context, instructionsToSearch, instructionsToFind, deep) {
        // All instructions to find need to exist in instructions to search
        return instructionsToFind.every(find => find.isIn(context, instructionsToSearch, deep));
    }
    /**
     * The endpoint of the routing instruction if it's a viewport OR if
     * it can't be decided (no instance, just a name).
     */
    get viewport() {
        return this.endpoint.instance instanceof Viewport ||
            this.endpoint.endpointType === null
            ? this.endpoint
            : null;
    }
    /**
     * The endpoint of the routing instruction if it's a viewport scope OR if
     * it can't be decided (no instance, just a name).
     */
    get viewportScope() {
        return this.endpoint.instance instanceof ViewportScope ||
            this.endpoint.endpointType === null
            ? this.endpoint
            : null;
    }
    /**
     * The previous instruction for the specific endpoint. This can only evaluate
     * to a value when the instruction has an assigned endpoint. This is a
     * convenience property in the API.
     */
    get previous() {
        return this.endpoint.instance?.getContent()?.instruction;
    }
    /**
     * Whether the routing instruction is an "add" instruction.
     */
    isAdd(context) {
        return this.component.name === Separators.for(context).add;
    }
    /**
     * Whether the routing instruction is a "clear" instruction.
     */
    isClear(context) {
        return this.component.name === Separators.for(context).clear;
    }
    /**
     * Whether the routing instruction is an "add all" instruction.
     */
    isAddAll(context) {
        return this.isAdd(context) && ((this.endpoint.name?.length ?? 0) === 0);
    }
    /**
     * Whether the routing instruction is an "clear all" instruction.
     */
    isClearAll(context) {
        return this.isClear(context) && ((this.endpoint.name?.length ?? 0) === 0);
    }
    /**
     * Whether the routing instruction has next scope/"children" instructions.
     */
    get hasNextScopeInstructions() {
        return (this.nextScopeInstructions?.length ?? 0) > 0;
    }
    /**
     * Get the dynasty of the routing instruction. The dynasty is the instruction
     * itself and all its descendants (next scope instructions iteratively).
     */
    get dynasty() {
        const dynasty = [this];
        if (this.hasNextScopeInstructions) {
            dynasty.push(...this.nextScopeInstructions.map(instruction => instruction.dynasty).flat());
        }
        return dynasty;
    }
    /**
     * Whether the routing instruction is unresolved.
     */
    get isUnresolved() {
        return this.component.isFunction() || this.component.isPromise();
    }
    /**
     * Resolve the routing instruction.
     */
    resolve() {
        return this.component.resolve(this);
    }
    /**
     * Get the instruction parameters with type specification applied.
     */
    typeParameters(context) {
        return this.parameters.toSpecifiedParameters(context, this.component.type?.parameters ?? []);
    }
    /**
     * Compare the routing instruction's route with the route of another routing
     * instruction.
     *
     * @param other - The routing instruction to compare to
     */
    sameRoute(other) {
        const thisRoute = this.route?.match;
        const otherRoute = other.route?.match;
        if (thisRoute == null || otherRoute == null) {
            return false;
        }
        if (typeof thisRoute === 'string' || typeof otherRoute === 'string') {
            return thisRoute === otherRoute;
        }
        return thisRoute.id === otherRoute.id;
    }
    /**
     * Compare the routing instruction's component with the component of another routing
     * instruction. Compares on name unless `compareType` is `true`.
     *
     * @param context - The context (used for parameter syntax) to compare within
     * @param other - The routing instruction to compare to
     * @param compareParameters - Whether parameters should also be compared
     * @param compareType - Whether comparision should be made on type only (and not name)
     */
    sameComponent(context, other, compareParameters = false, compareType = false) {
        if (compareParameters && !this.sameParameters(context, other, compareType)) {
            return false;
        }
        return this.component.same(other.component, compareType);
    }
    /**
     * Compare the routing instruction's endpoint with the endpoint of another routing
     * instruction. Compares on endpoint instance if possible, otherwise name.
     *
     * @param other - The routing instruction to compare to
     * @param compareScope - Whether comparision should be made on scope as well (and not
     * only instance/name)
     */
    sameEndpoint(other, compareScope) {
        return this.endpoint.same(other.endpoint, compareScope);
    }
    /**
     * Compare the routing instruction's parameters with the parameters of another routing
     * instruction. Compares on actual values.
     *
     * @param other - The routing instruction to compare to
     * @param compareType - Whether comparision should be made on type as well
     */
    sameParameters(context, other, compareType = false) {
        // TODO: Somewhere we need to check for format such as spaces etc
        if (!this.component.same(other.component, compareType)) {
            return false;
        }
        return this.parameters.same(context, other.parameters, this.component.type);
    }
    /**
     * Stringify the routing instruction, recursively down next scope/child instructions.
     *
     * @param context - The context (used for syntax) within to stringify the instructions
     * @param options - The options for stringifying the instructions
     * @param endpointContext - Whether to include endpoint context in the string.
     * [Deprecated] Use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }
     * @param shallow - Whether to stringify next scope instructions
     */
    stringify(context, options = {}, endpointContextOrShallow = false, shallow = false) {
        if (typeof options === 'boolean') {
            // eslint-disable-next-line no-console
            console.warn(`[Deprecated] Boolean passed to RoutingInstruction.stringify. Please use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }`);
            options = { excludeEndpoint: options, endpointContext: endpointContextOrShallow };
        }
        else {
            shallow = endpointContextOrShallow;
        }
        options = { ...RoutingInstructionStringifyOptionsDefaults, ...options };
        const seps = Separators.for(context);
        let excludeCurrentEndpoint = options.excludeEndpoint;
        let excludeCurrentComponent = false;
        // If viewport context is specified...
        if (options.endpointContext) {
            const viewport = this.viewport?.instance ?? null;
            // (...it's still skipped if no link option is set on viewport)
            if (viewport?.options.noLink ?? false) {
                return '';
            }
            // ...viewport can still be excluded if it's not necessary...
            if (!this.needsEndpointDescribed &&
                (!(viewport?.options.forceDescription ?? false) // ...and not forced...
                    || (this.viewportScope?.instance != null)) // ...or it has a viewport scope
            ) {
                excludeCurrentEndpoint = true;
            }
            // ...or if it's the fallback component...
            if (viewport?.options.fallback === this.component.name) {
                excludeCurrentComponent = true;
            }
            // ...or the default component /* without next scope instructions/children */.
            if (viewport?.options.default === this.component.name /* && !this.hasNextScopeInstructions */) {
                excludeCurrentComponent = true;
            }
        }
        const nextInstructions = this.nextScopeInstructions;
        // Start with the scope modifier (if any)
        let stringified = this.scopeModifier;
        // It's a configured route that's already added as part of a configuration, so skip to next scope!
        if (this.route instanceof FoundRoute && !this.routeStart) {
            return !shallow && Array.isArray(nextInstructions)
                ? RoutingInstruction.stringify(context, nextInstructions, options)
                : '';
        }
        const path = this.stringifyShallow(context, excludeCurrentEndpoint, excludeCurrentComponent, options.fullState);
        stringified += path.endsWith(seps.scope) ? path.slice(0, -seps.scope.length) : path;
        // If any next scope/child instructions...
        if (!shallow && Array.isArray(nextInstructions) && nextInstructions.length > 0) {
            // ...get them as string...
            const nextStringified = RoutingInstruction.stringify(context, nextInstructions, options);
            if (nextStringified.length > 0) {
                // ...and add with scope separator and...
                stringified += seps.scope;
                // ...check if scope grouping separators are needed:
                stringified += nextInstructions.length === 1 // TODO: This should really also check that the instructions have value
                    // only one child, add as-is
                    ? nextStringified
                    // more than one child, add within scope (between () )
                    : `${seps.groupStart}${nextStringified}${seps.groupEnd}`;
            }
        }
        return stringified;
    }
    /**
     * Clone the routing instruction.
     *
     * @param keepInstances - Whether actual instances should be transfered
     * @param scopeModifier - Whether the scope modifier should be transfered
     * @param shallow - Whether it should be a shallow clone only
     */
    clone(keepInstances = false, scopeModifier = false, shallow = false) {
        // Create a clone without instances...
        const clone = RoutingInstruction.create(this.component.func ?? this.component.promise ?? this.component.type ?? this.component.name, this.endpoint.name, this.parameters.typedParameters ?? void 0);
        // ...and then set them if they should be transfered.
        if (keepInstances) {
            clone.component.set(this.component.instance ?? this.component.type ?? this.component.name);
            clone.endpoint.set(this.endpoint.instance ?? this.endpoint.name);
        }
        // And transfer the component name afterwards to make sure aliases are kept
        clone.component.name = this.component.name;
        clone.needsEndpointDescribed = this.needsEndpointDescribed;
        clone.route = this.route;
        clone.routeStart = this.routeStart;
        clone.default = this.default;
        // Only transfer scope modifier if specified
        if (scopeModifier) {
            clone.scopeModifier = this.scopeModifier;
        }
        clone.scope = keepInstances ? this.scope : null;
        // Clone all next scope/child instructions
        if (this.hasNextScopeInstructions && !shallow) {
            clone.nextScopeInstructions = RoutingInstruction.clone(this.nextScopeInstructions, keepInstances, scopeModifier);
        }
        return clone;
    }
    /**
     * Whether the routing instruction is in a list of routing instructions. If
     * deep, all next scope instructions needs to be contained in containing
     * next scope instructions as well.
     *
     * @param context - The context (used for parameter syntax) to compare within
     * @param searchIn - Instructions that should contain (superset)
     * @param deep - Whether next scope instructions also need to be contained (recursively)
     */
    isIn(context, searchIn, deep) {
        // Get all instructions with matching component.
        const matching = searchIn.filter(instruction => {
            // Match either routes...
            if (this.route != null || instruction.route != null) {
                if (!instruction.sameRoute(this)) {
                    return false;
                }
            }
            else {
                // ... or components
                if (!instruction.sameComponent(context, this)) {
                    return false;
                }
            }
            // Use own type if we have it, the other's type if not
            const instructionType = instruction.component.type ?? this.component.type;
            const thisType = this.component.type ?? instruction.component.type;
            const instructionParameters = instruction.parameters.toSpecifiedParameters(context, instructionType?.parameters);
            const thisParameters = this.parameters.toSpecifiedParameters(context, thisType?.parameters);
            if (!InstructionParameters.contains(instructionParameters, thisParameters)) {
                return false;
            }
            return (this.endpoint.none || instruction.sameEndpoint(this, false));
        });
        // If no one matches, it's a failure.
        if (matching.length === 0) {
            return false;
        }
        // If no deep match or no next scope instructions...
        if (!deep || !this.hasNextScopeInstructions) {
            // ...it's a successful match.
            return true;
        }
        // Match the next scope instructions to the next scope instructions of each
        // of the matching instructions and if at least one match (recursively)...
        if (matching.some(matched => RoutingInstruction.contains(context, matched.nextScopeInstructions ?? [], this.nextScopeInstructions, deep))) {
            // ...it's a success...
            return true;
        }
        // ...otherwise it's a failure to match.
        return false;
    }
    /**
     * Get the title for the routing instruction.
     *
     * @param navigation - The navigation that requests the content change
     */
    getTitle(navigation) {
        // If it's a configured route...
        if (this.route instanceof FoundRoute) {
            // ...get the configured route title.
            const routeTitle = this.route.match?.title;
            // If there's a configured title, use it. Otherwise fallback to
            // titles based on endpoint's component.
            if (routeTitle != null) {
                // Only add the title (once) if it's the first instruction
                if (this.routeStart) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    return typeof routeTitle === 'string' ? routeTitle : routeTitle(this, navigation);
                }
                else {
                    return '';
                }
            }
        }
        return this.endpoint.instance.getTitle(navigation);
    }
    toJSON() {
        return {
            component: this.component.name ?? undefined,
            viewport: this.endpoint.name ?? undefined,
            parameters: this.parameters.parametersRecord ?? undefined,
            children: this.hasNextScopeInstructions
                ? this.nextScopeInstructions
                : undefined,
        };
    }
    /**
     * Stringify the routing instruction shallowly, NOT recursively down next scope/child instructions.
     *
     * @param context - The context (used for syntax) within to stringify the instructions
     * @param excludeEndpoint - Whether to exclude endpoint names in the string
     * @param excludeComponent - Whether to exclude component names in the string
     */
    stringifyShallow(context, excludeEndpoint = false, excludeComponent = false, fullState = false) {
        if (!fullState && this.route != null) {
            const path = this.route instanceof FoundRoute ? this.route.matching : this.route;
            return path
                .split('/')
                .map(part => part.startsWith(':')
                ? this.parameters.get(context, part.slice(1))
                : part)
                .join('/');
        }
        const seps = Separators.for(context);
        // Start with component (unless excluded)
        let instructionString = !excludeComponent || fullState ? this.component.name ?? '' : '';
        // Get parameters specification (names, sort order) from component type
        // TODO(alpha): Use Metadata!
        const specification = this.component.type ? this.component.type.parameters : null;
        // Get parameters according to specification
        const parameters = InstructionParameters.stringify(context, this.parameters.toSortedParameters(context, specification));
        if (parameters.length > 0) {
            // Add to component or use standalone
            instructionString += !excludeComponent || fullState
                ? `${seps.parameters}${parameters}${seps.parametersEnd}`
                : parameters;
        }
        // Add endpoint name (unless excluded)
        if (this.endpoint.name != null && (!excludeEndpoint || fullState)) {
            instructionString += `${seps.viewport}${this.endpoint.name}`;
        }
        // And add no (owned) scope indicator
        if (!this.ownsScope) {
            instructionString += seps.noScope;
        }
        return instructionString || '';
    }
}

class NavigatorNavigateEvent {
    constructor(eventName, navigation) {
        this.eventName = eventName;
        this.navigation = navigation;
    }
    static create(navigation) {
        return new NavigatorNavigateEvent(NavigatorNavigateEvent.eventName, navigation);
    }
}
NavigatorNavigateEvent.eventName = 'au:router:navigation-navigate';
/**
 * @internal
 */
class Navigator {
    constructor() {
        /**
         * The index of the last _finished_ navigation.
         */
        this.lastNavigationIndex = -1;
        /**
         * All navigations, historical and current/last
         */
        this.navigations = [];
        /**
         * Navigator options
         */
        this.options = {
            /**
             * How many historical navigations that should be kept stateful,
             * default 0 means none.
             */
            statefulHistoryLength: 0,
        };
        /**
         * Whether the navigator is started
         */
        this.isActive = false;
        /**
         * An uninitialized navigation that's used before the
         * navigator is started and before first navigation is made
         */
        this.uninitializedNavigation = Navigation.create({
            instruction: 'NAVIGATOR UNINITIALIZED',
            fullStateInstruction: '',
            index: 0,
            completed: true,
        });
        this.ea = resolve(IEventAggregator);
        this.container = resolve(IContainer);
    }
    start(options) {
        if (this.isActive) {
            throw createMappedError(2010 /* ErrorNames.navigator_already_started */);
        }
        this.isActive = true;
        this.options = { ...options };
    }
    stop() {
        if (!this.isActive) {
            throw createMappedError(2011 /* ErrorNames.navigator_not_started */);
        }
        this.isActive = false;
    }
    /**
     * Perform a navigation. The navigation is enriched with historical
     * navigation data and passed to the router.
     *
     * @param navigation - The navigation to perform
     */
    navigate(navigation) {
        if (!(navigation instanceof Navigation)) {
            navigation = Navigation.create(navigation);
        }
        const navigationFlags = new NavigationFlags();
        // If no proper last navigation, no navigation has been processed this session, meaning
        // that this one is either a first navigation or a refresh (repeat navigation).
        if (this.lastNavigationIndex === -1) {
            // Load the navigation state from the store (mutating `navigations` and
            // `lastNavigationIndex`) and then set appropriate flags...
            this.loadState();
            if (this.lastNavigationIndex !== -1) {
                navigationFlags.refresh = true;
            }
            else {
                navigationFlags.first = true;
                navigationFlags.new = true;
                // ...and create the first navigation.
                // TODO: Should this really be created here? Shouldn't it be in the viewer?
                this.lastNavigationIndex = 0;
                this.navigations = [Navigation.create({
                        index: 0,
                        instruction: '',
                        fullStateInstruction: '',
                        // path: this.options.viewer.getPath(true),
                        // fromBrowser: null,
                    })];
            }
        }
        // If navigation has an index and isn't replacing or refreshing, it's a historical
        // navigation...
        if (navigation.index !== void 0 && !(navigation.replacing ?? false) && !(navigation.refreshing ?? false)) {
            // ...set the movement size...
            navigation.historyMovement = navigation.index - Math.max(this.lastNavigationIndex, 0);
            // ...and set the navigation instruction.
            navigation.instruction = this.navigations[navigation.index] != null ? this.navigations[navigation.index].fullStateInstruction : navigation.fullStateInstruction;
            // Set appropriate navigation flags.
            navigation.replacing = true;
            if (navigation.historyMovement > 0) {
                navigationFlags.forward = true;
            }
            else if (navigation.historyMovement < 0) {
                navigationFlags.back = true;
            }
        }
        else if ((navigation.refreshing ?? false) || navigationFlags.refresh) { // If the navigation is a refresh...
            // ...just reuse the navigation.
            // navigation.index = this.lastNavigationIndex;
            navigation = this.navigations[this.lastNavigationIndex];
            navigation.replacing = true;
            navigation.refreshing = true;
        }
        else if (navigation.replacing ?? false) { // If the navigation is replacing...
            // ...set appropriate flags...
            navigationFlags.replace = true;
            navigationFlags.new = true;
            // ...and reuse last index.
            navigation.index = this.lastNavigationIndex;
        }
        else { // If the navigation is a new navigation...
            // ...set navigation flag...
            navigationFlags.new = true;
            // ...and create a new index.
            navigation.index = this.lastNavigationIndex + 1;
            this.navigations[navigation.index] = navigation;
        }
        // Set the appropriate flags.
        navigation.navigation = navigationFlags;
        // Set the previous navigation.
        navigation.previous = this.navigations[Math.max(this.lastNavigationIndex, 0)];
        // Create a process with an awaitable promise.
        navigation.process = new OpenPromise(`navigation: ${navigation.path}`);
        // Set the last navigated index to the navigation index
        this.lastNavigationIndex = navigation.index;
        this.notifySubscribers(navigation);
        return navigation.process.promise;
    }
    /**
     * Finalize a navigation and make it the last navigation.
     *
     * @param navigation - The navigation to finalize
     */
    async finalize(navigation, isLast) {
        // If this navigation shouldn't be added to history...
        if (navigation.untracked ?? false) {
            // ...and it's a navigation from the browser (back, forward, url)...
            if ((navigation.fromBrowser ?? false) && this.options.store != null) {
                // ...pop it from browser's history and...
                await this.options.store.popNavigatorState();
            }
            // ...restore the previous last navigation (and no need to save).
        }
        else if (navigation.replacing ?? false) { // If this isn't creating a new navigation...
            if ((navigation.historyMovement ?? 0) === 0) { // ...and it's not a navigation in the history...
                // ...use last navigation index.
                this.navigations[navigation.previous.index] = navigation;
            }
            await this.saveState(navigation.index, false);
        }
        else { // New navigation
            const index = navigation.index;
            // Discard anything after the new navigation so that it becomes the last.
            if (isLast) {
                this.navigations = this.navigations.slice(0, index);
            }
            this.navigations[index] = navigation;
            // Need to make sure components in discarded routing instructions are
            // disposed if stateful history is used...
            if ((this.options.statefulHistoryLength ?? 0) > 0) {
                // ...but not the ones that should be preserved, so keep...
                const indexPreserve = this.navigations.length - (this.options.statefulHistoryLength ?? 0);
                // ...the last ones as is.
                for (const navig of this.navigations.slice(index)) {
                    // Only non-string instructions has components to dispose.
                    if (typeof navig.instruction !== 'string' || typeof navig.fullStateInstruction !== 'string') {
                        // Use serialize to dispose routing instruction components
                        // since the end result is the same. Pass the navigations
                        // that should be preserved so that components in them aren't
                        // disposed if they also exist in discarded routing instructions.
                        await this.serializeNavigation(navig, this.navigations.slice(indexPreserve, index));
                    }
                }
            }
            // If it's a navigation from the browser (back, forward, url) we replace the state
            await this.saveState(navigation.index, !(navigation.fromBrowser ?? false));
        }
    }
    /**
     * Cancel a navigation and move to last finalized navigation.
     *
     * @param navigation - The navigation to cancel
     */
    async cancel(navigation) {
        if (this.options.store != null) {
            // If it's a new navigation...
            if (navigation.navigation?.new) {
                // ...from the browser (url)...
                if (navigation.fromBrowser ?? false) {
                    // ...pop it from the browser's History.
                    await this.options.store.popNavigatorState();
                }
                // Undo the history movement back to previous last navigation
            }
            else if ((navigation.historyMovement ?? 0) !== 0) {
                await this.options.store.go(-navigation.historyMovement, true);
            }
        }
    }
    /**
     * Go to an earlier or later navigation in navigation history.
     *
     * @param movement - Amount of steps to move, positive or negative
     */
    async go(movement) {
        let newIndex = this.lastNavigationIndex + movement;
        // Stop going past last navigation
        newIndex = Math.min(newIndex, this.navigations.length - 1);
        // Move the store's history (but suppress the event so it's
        // a noop as far as the router is concerned)
        await this.options.store.go(movement, true);
        // Get the appropriate navigation...
        const navigation = this.navigations[newIndex];
        // ...and enqueue it again.
        return this.navigate(navigation);
    }
    /**
     * Get the stored navigator state (json okay) as well as the last
     * navigation and all historical navigations from the store.
     */
    getState() {
        // Get the stored state and...
        const state = this.options.store != null ? { ...this.options.store.state } : {};
        // ...separate the historical navigations...
        const navigations = (state?.navigations ?? []);
        // ...and the last state.
        const navigationIndex = state?.navigationIndex ?? -1;
        return { navigations, navigationIndex };
    }
    /**
     * Load the state stored in the store into the navigator's last and
     * historical states.
     */
    loadState() {
        // Get the stored navigations (json)...
        const { navigations, navigationIndex } = this.getState();
        // ...and create the historical Navigations...
        this.navigations = navigations.map(navigation => Navigation.create(navigation));
        // ...and the last navigation index.
        this.lastNavigationIndex = navigationIndex;
    }
    /**
     * Save the last state to history and save the history to the store,
     * converting to json when necessary.
     *
     * @param index - The index of the last navigation
     * @param push - Whether the last state should be pushed as a new entry
     * in the history or replace the last position.
     */
    async saveState(index, push) {
        // Make sure all navigations are clean of non-persisting data
        for (let i = 0; i < this.navigations.length; i++) {
            this.navigations[i] = Navigation.create(this.navigations[i].toStoredNavigation());
        }
        // If preserving history, serialize navigations that aren't preserved:
        // Should preserve...
        if ((this.options.statefulHistoryLength ?? 0) > 0) {
            // ...from 'index' and to the end.
            const index = this.navigations.length - (this.options.statefulHistoryLength ?? 0);
            // Work from beginning to the index that should be preserved...
            for (let i = 0; i < index; i++) {
                const navigation = this.navigations[i];
                // ...and serialize the navigation if necessary. (Serializing will free
                // components that are no longer used.)
                if (typeof navigation.instruction !== 'string' || typeof navigation.fullStateInstruction !== 'string') {
                    await this.serializeNavigation(navigation, this.navigations.slice(index));
                }
            }
        }
        // If there's a store...
        if (this.options.store == null) {
            return Promise.resolve();
        }
        // ...prepare the state...
        const state = {
            navigations: (this.navigations ?? []).map((navigation) => this.toStoreableNavigation(navigation)),
            navigationIndex: index,
        };
        // ...and save it in the right place.
        if (push) {
            return this.options?.store?.pushNavigatorState(state);
        }
        else {
            return this.options.store.replaceNavigatorState(state);
        }
    }
    /**
     * Refresh (reload) the last navigation.
     */
    async refresh() {
        // Don't refresh if there's been no navigation before
        if (this.lastNavigationIndex === -1) {
            return Promise.reject();
        }
        const navigation = this.navigations[this.lastNavigationIndex];
        // Set navigation flags...
        navigation.replacing = true;
        navigation.refreshing = true;
        // ...and enqueue the navigation again.
        return this.navigate(navigation);
    }
    /**
     * Notifies subscribers that a navigation has been dequeued for processing.
     *
     * @param navigation - The Navigation to process
     */
    notifySubscribers(navigation) {
        this.ea.publish(NavigatorNavigateEvent.eventName, NavigatorNavigateEvent.create(navigation));
    }
    /**
     * Make a Navigation storeable/json safe.
     *
     * @param navigation - The navigation to make storeable
     */
    toStoreableNavigation(navigation) {
        // Get a navigation with only the properties that are stored
        const storeable = navigation instanceof Navigation ? navigation.toStoredNavigation() : navigation;
        // Make sure instruction is a string
        storeable.instruction = RoutingInstruction.stringify(this.container, storeable.instruction);
        // Make sure full state instruction is a string
        storeable.fullStateInstruction = RoutingInstruction.stringify(this.container, storeable.fullStateInstruction, { endpointContext: true, fullState: true });
        // Only string scopes can be stored
        if (typeof storeable.scope !== 'string') {
            storeable.scope = null;
        }
        // TODO: Filter out non-json compatible data and parameters!
        return storeable;
    }
    /**
     * Serialize a navigation to string(s), freeing/disposing all components in it.
     * (Only components that doesn't exist in a preserved navigation will be disposed.)
     *
     * @param navigation - The navigation to serialize
     * @param preservedNavigations - Navigations that should be preserved, meaning
     * that any component used in them should not be disposed
     */
    async serializeNavigation(navigation, preservedNavigations) {
        let excludeComponents = [];
        // Components in preserved navigations should not be serialized/freed
        for (const preservedNavigation of preservedNavigations) {
            // Get components from instruction...
            if (typeof preservedNavigation.instruction !== 'string') {
                excludeComponents.push(...RoutingInstruction.flat(preservedNavigation.instruction)
                    .filter(instruction => instruction.endpoint.instance !== null) // Both endpoint instance and...
                    .map(instruction => instruction.component.instance)); // ...component instance should be set
            }
            // ...and full state instruction
            if (typeof preservedNavigation.fullStateInstruction !== 'string') {
                excludeComponents.push(...RoutingInstruction.flat(preservedNavigation.fullStateInstruction)
                    .filter(instruction => instruction.endpoint.instance !== null) // Both endpoint instance and...
                    .map(instruction => instruction.component.instance)); // ...component instance should be set
            }
        }
        // Make excluded components unique
        excludeComponents = arrayUnique(excludeComponents);
        let instructions = [];
        // The instructions, one or two, with possible components to free
        if (typeof navigation.fullStateInstruction !== 'string') {
            // Save the instruction
            instructions.push(...navigation.fullStateInstruction);
            navigation.fullStateInstruction = RoutingInstruction.stringify(this.container, navigation.fullStateInstruction, { endpointContext: true, fullState: true });
        }
        if (typeof navigation.instruction !== 'string') {
            // Save the instruction
            instructions.push(...navigation.instruction);
            navigation.instruction = RoutingInstruction.stringify(this.container, navigation.instruction);
        }
        // Process only the instructions with instances and make them unique
        instructions = instructions.filter((instruction, i, arr) => instruction.component.instance != null
            && arr.indexOf(instruction) === i);
        // Already freed components (updated when component is freed)
        const alreadyDone = [];
        for (const instruction of instructions) {
            // Free (and dispose) instruction components except excluded and already done
            await this.freeInstructionComponents(instruction, excludeComponents, alreadyDone);
        }
    }
    /**
     * Free (and dispose) components in a routing instruction unless the components
     * should be excluded (due to also being in non-freed instructions) or have already
     * been freed/disposed.
     *
     * @param instruction - Routing instruction to free components in
     * @param excludeComponents - Components to exclude
     * @param alreadyDone - Components that's already been freed/disposed
     */
    freeInstructionComponents(instruction, excludeComponents, alreadyDone) {
        const component = instruction.component.instance;
        const viewport = instruction.viewport?.instance ?? null;
        // Both viewport and component instance should be set in order to free/dispose
        if (component === null || viewport === null || alreadyDone.some(done => done === component)) {
            return;
        }
        if (!excludeComponents.some(exclude => exclude === component)) {
            return Runner.run('freeInstructionComponents', (step) => viewport.freeContent(step, component), () => {
                alreadyDone.push(component);
            });
        }
        // If there are any next scope/child instructions...
        if (instruction.hasNextScopeInstructions) {
            for (const nextInstruction of instruction.nextScopeInstructions) {
                // ...try freeing/disposing them as well.
                return this.freeInstructionComponents(nextInstruction, excludeComponents, alreadyDone);
            }
        }
    }
}

const RouteRecognizer = RouteRecognizer$1;
const ConfigurableRoute = ConfigurableRoute$1;
const RecognizedRoute = RecognizedRoute$1;
const Endpoint = Endpoint$2;

/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
/**
 * @internal - Helper class
 */
class Collection extends Array {
    constructor() {
        super(...arguments);
        this.currentIndex = -1;
    }
    next() {
        if (this.length > this.currentIndex + 1) {
            return this[++this.currentIndex];
        }
        else {
            this.currentIndex = -1;
            return null;
        }
    }
    removeCurrent() {
        this.splice(this.currentIndex--, 1);
    }
    remove(instruction) {
        arrayRemove(this, value => value === instruction);
    }
}

class EndpointMatcher {
    // TODO: In addition to check whether the viewport is configured for components, check if
    // the components are configured for viewports.
    // TODO: When matching/checking on component and viewport, match on ComponentAppelation
    // and ViewportHandle.
    /**
     * Finds endpoints, viewports and viewport scopes, that matches routing instructions' criteria.
     * See comment at the top of the file for more details.
     *
     * @param instructions - The routing instructions to find matches for
     * @param routingScope - The routing scope where to find the matching endpoints
     * @param alreadyMatched - Already matched routing instructions whose endpoints are no longer available
     * @param disregardViewports - Ignore already existing matchin endpoints on the routing instructions
     */
    // Note: This can't change state other than the instructions!
    static matchEndpoints(routingScope, instructions, alreadyMatched, disregardViewports = false) {
        const matchedInstructions = [];
        // Get all the routing scopes owned by this scope
        // TODO: Investigate if Infinity needs to be a timestamp
        const ownedScopes = routingScope.getOwnedRoutingScopes(Infinity);
        // Get a shallow copy of all available endpoints
        const endpoints = ownedScopes.map(scope => scope.endpoint);
        const availableEndpoints = endpoints
            .filter(endpoint => endpoint !== null
            && !alreadyMatched.some(found => endpoint === found.endpoint.instance && !found.cancelled && !found.isClear(routingScope.router)));
        const routingInstructions = new Collection(...instructions.slice());
        let instruction = null;
        // First, match instructions with already known viewport scopes...
        // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
        // and sets viewport/viewport scope and scope in actual RoutingInstruction
        // Pass in `false` to `doesntNeedViewportDescribed` even though it doesn't really apply for ViewportScope
        EndpointMatcher.matchKnownEndpoints(routingScope.router, 'ViewportScope', routingInstructions, availableEndpoints, matchedInstructions, false);
        // ...and instructions with already known viewports (unless we're disregarding already known viewports when matching).
        if (!disregardViewports) {
            // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
            // and sets viewport/viewport scope and scope in actual RoutingInstruction
            // Pass in `false` to `doesntNeedViewportDescribed` since we can't know for sure whether viewport is necessary or not
            EndpointMatcher.matchKnownEndpoints(routingScope.router, 'Viewport', routingInstructions, availableEndpoints, matchedInstructions, false);
        }
        // Then match viewport scopes that accepts the component (name) as segment.
        // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
        // and sets viewport scope and scope in actual RoutingInstruction
        EndpointMatcher.matchViewportScopeSegment(routingScope.router, routingScope, routingInstructions, availableEndpoints, matchedInstructions);
        // All instructions not yet matched need viewport described in some way unless
        // specifically specified as not needing it (parameter to `foundEndpoint`)
        while ((instruction = routingInstructions.next()) !== null) {
            instruction.needsEndpointDescribed = true;
        }
        // Match viewports with configuration (for example `used-by` attribute) that matches instruction components.
        // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
        // and sets viewport scope and scope in actual RoutingInstruction
        EndpointMatcher.matchViewportConfiguration(routingInstructions, availableEndpoints, matchedInstructions);
        // Next in line is specified viewport (but not if we're disregarding viewports)
        if (!disregardViewports) {
            // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
            // and sets viewport scope and scope in actual RoutingInstruction.
            // Pass in `false` to `doesntNeedViewportDescribed` since we can't know for sure whether viewport is necessary or not
            EndpointMatcher.matchSpecifiedViewport(routingInstructions, availableEndpoints, matchedInstructions, false);
        }
        // Finally, only one available and accepting viewport remaining?
        // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
        // and sets viewport scope and scope in actual RoutingInstruction
        EndpointMatcher.matchLastViewport(routingInstructions, availableEndpoints, matchedInstructions);
        // If we're ignoring viewports, we now match them anyway
        if (disregardViewports) {
            // Removes entries from routingInstructions collection and availableEndpoints, adds entries to matchedInstructions
            // and sets viewport scope and scope in actual RoutingInstruction.
            // Pass in `false` to `doesntNeedViewportDescribed` since we do need the viewport if we got here
            EndpointMatcher.matchSpecifiedViewport(routingInstructions, availableEndpoints, matchedInstructions, false);
        }
        return {
            matchedInstructions,
            remainingInstructions: [...routingInstructions],
        };
    }
    static matchKnownEndpoints(router, type, routingInstructions, availableEndpoints, matchedInstructions, doesntNeedViewportDescribed = false) {
        let instruction;
        while ((instruction = routingInstructions.next()) !== null) {
            if (
            // The endpoint is already known and it's not an add instruction...
            instruction.endpoint.instance !== null && !instruction.isAdd(router) &&
                // ...(and of the type we're currently checking)...
                instruction.endpoint.endpointType === type) {
                // ...match the endpoint, updating the instruction!, and set the scope
                // for the next scope instructions ("children") to the endpoint's scope...
                EndpointMatcher.matchEndpoint(instruction, instruction.endpoint.instance, doesntNeedViewportDescribed);
                // ...add the matched instruction as a matched instruction...
                matchedInstructions.push(instruction);
                // ...remove the endpoint as available...
                arrayRemove(availableEndpoints, available => available === instruction.endpoint.instance);
                // ...and finally delete the routing instructions to prevent further processing of it.
                routingInstructions.removeCurrent();
            }
        }
    }
    static matchViewportScopeSegment(router, routingScope, routingInstructions, availableEndpoints, matchedInstructions) {
        let instruction;
        while ((instruction = routingInstructions.next()) !== null) {
            for (let endpoint of availableEndpoints) {
                if (!(endpoint instanceof ViewportScope)) {
                    continue;
                }
                // Check if viewport scope accepts (wants) the path/route segment
                if (endpoint.acceptSegment(instruction.component.name)) {
                    // If the viewport scope is a list of viewport scopes...
                    if (Array.isArray(endpoint.source)) { // TODO(alpha): Remove this functionality temporarily for alpha
                        // ...see if there's any already existing list entry that's available...
                        let available = availableEndpoints.find(available => available instanceof ViewportScope && available.name === endpoint.name);
                        // ...otherwise create one (adding it to the list) and...
                        if (available === void 0 || instruction.isAdd(router)) {
                            const item = endpoint.addSourceItem();
                            available = routingScope.getOwnedScopes()
                                .filter(scope => scope.isViewportScope)
                                .map(scope => scope.endpoint)
                                .find(viewportScope => viewportScope.sourceItem === item);
                        }
                        // ...use the available one as endpoint.
                        endpoint = available;
                    }
                    // Match the instruction with the endpoint and add its next scope instructions ("children")
                    // to be processed in the call to `matchEndpoints` for the next scope.
                    // Parameter `doesntNeedViewportDescribed` is set to false since described
                    // viewports isn applicable on viewport scopes.
                    EndpointMatcher.matchEndpoint(instruction, endpoint, false);
                    // Add the matched instruction to the result
                    matchedInstructions.push(instruction);
                    // Remove the endpoint from available endpoints
                    arrayRemove(availableEndpoints, available => available === instruction.endpoint.instance);
                    // Remove the matched instruction from the currently processed instruction
                    routingInstructions.removeCurrent();
                    break;
                }
            }
        }
    }
    static matchViewportConfiguration(routingInstructions, availableEndpoints, matchedInstructions) {
        let instruction;
        while ((instruction = routingInstructions.next()) !== null) {
            for (const endpoint of availableEndpoints) {
                if (!(endpoint instanceof Viewport)) {
                    continue;
                }
                // Check if a viewport has "ownership"/is the only target of a component
                if (endpoint?.wantComponent(instruction.component.name)) {
                    // Match the instruction with the endpoint and add its next scope instructions ("children")
                    // to be processed in the call to `matchEndpoints` for the next scope.
                    // Parameter `doesntNeedViewportDescribed` is set to true since it's the
                    // configuration on the viewport that matches the instruction.
                    EndpointMatcher.matchEndpoint(instruction, endpoint, true);
                    // Add the matched instruction to the result
                    matchedInstructions.push(instruction);
                    // Remove the endpoint from available endpoints
                    arrayRemove(availableEndpoints, available => available === instruction.endpoint.instance);
                    // Remove the matched instruction from the currently processed instruction
                    routingInstructions.removeCurrent();
                    break;
                }
            }
        }
    }
    static matchSpecifiedViewport(routingInstructions, availableEndpoints, matchedInstructions, disregardViewports) {
        let instruction;
        while ((instruction = routingInstructions.next()) !== null) {
            let viewport = instruction.endpoint.instance;
            // If instruction don't have a viewport instance...
            if (viewport == null) {
                const name = instruction.endpoint.name;
                // ...but a viewport name...
                if ((name?.length ?? 0) === 0) {
                    continue;
                }
                // TODO(alpha): No longer pre-creating viewports here. Evaluate!
                // const newScope = instruction.ownsScope;
                // ...look through all available endpoints...
                for (const endpoint of availableEndpoints) {
                    if (!(endpoint instanceof Viewport)) {
                        continue;
                    }
                    // ...and use the one with the matching name.
                    if (name === endpoint.name) {
                        viewport = endpoint;
                        break;
                    }
                    // TODO(alpha): No longer pre-creating viewports here. Evaluate!
                    // routingScope.addViewport(name!, null, { scope: newScope, forceDescription: true });
                    // availableViewports[name!] = routingScope.getEnabledViewports(ownedScopes)[name!];
                }
            }
            // Check if the matching viewport accepts this component.
            if (viewport?.acceptComponent(instruction.component.name)) {
                // Match the instruction with the endpoint and add its next scope instructions ("children")
                // to be processed in the call to `matchEndpoints` for the next scope.
                // Parameter `doesntNeedViewportDescribed` is set to `disregardViewports` since the time of
                // invocation and whether viewport is part of that decides if it's needed.
                EndpointMatcher.matchEndpoint(instruction, viewport, disregardViewports);
                // Add the matched instruction to the result
                matchedInstructions.push(instruction);
                // Remove the endpoint from available endpoints
                arrayRemove(availableEndpoints, available => available === instruction.endpoint.instance);
                // Remove the matched instruction from the currently processed instruction
                routingInstructions.removeCurrent();
            }
        }
    }
    static matchLastViewport(routingInstructions, availableEndpoints, matchedInstructions) {
        let instruction;
        while ((instruction = routingInstructions.next()) !== null) {
            // All remaining available viewports...
            const availableViewports = [];
            for (const endpoint of availableEndpoints) {
                if (!(endpoint instanceof Viewport)) {
                    continue;
                }
                // ...that accepts the instruction.
                if (endpoint.acceptComponent(instruction.component.name)) {
                    availableViewports.push(endpoint);
                }
            }
            if (availableViewports.length === 1) {
                const viewport = availableViewports[0];
                // Match the instruction with the endpoint and add its next scope instructions ("children")
                // to be processed in the call to `matchEndpoints` for the next scope.
                // Parameter `doesntNeedViewportDescribed` is set to `true` since the viewport is the only
                // available option.
                EndpointMatcher.matchEndpoint(instruction, viewport, true);
                // Add the matched instruction to the result
                matchedInstructions.push(instruction);
                // Remove the endpoint from available endpoints
                arrayRemove(availableEndpoints, available => available === instruction.endpoint.instance);
                // Remove the matched instruction from the currently processed instruction
                routingInstructions.removeCurrent();
            }
        }
    }
    static matchEndpoint(instruction, endpoint, doesntNeedViewportDescribed) {
        instruction.endpoint.set(endpoint);
        if (doesntNeedViewportDescribed) {
            instruction.needsEndpointDescribed = false;
        }
        // Get all the next scope instructions...
        if (instruction.hasNextScopeInstructions) {
            instruction.nextScopeInstructions.forEach(next => {
                if (next.scope === null) {
                    // ...and set the endpoint's routing scope as their scope
                    next.scope = endpoint instanceof Viewport ? endpoint.scope : endpoint.scope.scope;
                }
            });
        }
    }
}

/**
 * The router uses routing scopes to organize all endpoints (viewports and viewport
 * scopes) into two hierarchical structures. Each routing scope belongs to a parent/child
 * hierarchy, that follows the DOM and is used when routing scopes are added and removed,
 * and an owner/owning hierarchy that's used when finding endpoints. Every routing scope
 * has a routing scope that owns it (except the root) and can in turn have several
 * routing scopes that it owns. A routing scope always has a connected endpoint content
 * and an endpoint content always has a connected routing scope.
 *
 * Every navigtion/load instruction that the router processes is first tied to a
 * routing scope, either a specified scope or the root scope. That routing scope is
 * then asked to
 * 1a) find routes (and their routing instructions) in the load instruction based on
 * the endpoint and its content (configured routes), and/or
 * 1b) find (direct) routing instructions in the load instruction.
 *
 * After that, the routing scope is used to
 * 2) match each of its routing instructions to an endpoint (viewport or viewport scope), and
 * 3) set the scope of the instruction to the next routing scopes ("children") and pass
 * the instructions on for matching in their new routing scopes.
 *
 * Once (component) transitions start in endpoints, the routing scopes assist by
 * 4) propagating routing hooks vertically through the hierarchy and disabling and
 * enabling endpoint contents and their routing data (routes) during transitions.
 *
 * Finally, when a navigation is complete, the routing scopes helps
 * 5) structure all existing routing instructions into a description of the complete
 * state of all the current endpoints and their contents.
 *
 * The hierarchy of the owner/owning routing scopes often follows the parent/child DOM
 * hierarchy, but it's not a necessity; it's possible to have routing scopes that doesn't
 * create their own "owning capable scope", and thus placing all their "children" under the
 * same "parent" as themselves or for a routing scope to hoist itself up or down in the
 * hierarchy and, for example, place itself as a "child" to a DOM sibling endpoint.
 * (Scope self-hoisting will not be available for early-on alpha.)
 */
class RoutingScope {
    constructor(router, 
    /**
     * Whether the routing scope has a scope and can own other scopes
     */
    hasScope, 
    /**
     * The routing scope that owns this routing scope (owner/owning hierarchy)
     */
    owningScope, 
    /**
     * The endpoint content the routing scope is connected to
     */
    endpointContent) {
        this.id = ++RoutingScope.lastId;
        /**
         * The parent of the routing scope (parent/child hierarchy)
         */
        this.parent = null;
        /**
         * The children of the routing scope (parent/child hierarchy)
         */
        this.children = [];
        this.router = router;
        this.hasScope = hasScope;
        this.owningScope = owningScope ?? this;
        this.endpointContent = endpointContent;
    }
    static for(origin, instruction) {
        if (origin == null) {
            return { scope: null, instruction };
        }
        if (origin instanceof RoutingScope || origin instanceof Viewport || origin instanceof ViewportScope) {
            return { scope: origin.scope, instruction };
        }
        // return this.getClosestScope(origin) || this.rootScope!.scope;
        let container;
        // res is a private prop of IContainer impl
        // TODO: should use a different way to detect if something is a container
        // or move this to the bottom if this else-if
        if ('res' in origin) {
            container = origin;
        }
        else {
            if ('container' in origin) {
                container = origin.container;
            }
            else if ('$controller' in origin) {
                container = origin.$controller.container;
            }
            else {
                const controller = CustomElement.for(origin, { searchParents: true });
                container = controller?.container;
            }
        }
        if (container == null) {
            {
                // eslint-disable-next-line no-console
                console.warn("RoutingScope failed to find a container for provided origin", origin);
            }
            return { scope: null, instruction };
        }
        const closestEndpoint = (container.has(Router.closestEndpointKey, true)
            ? container.get(Router.closestEndpointKey)
            : null);
        let scope = closestEndpoint?.scope ?? null;
        if (scope === null || instruction === undefined) {
            const safeInstruction = instruction ?? '';
            return { scope, instruction: safeInstruction.startsWith('/') ? safeInstruction.slice(1) : instruction };
        }
        // Instruction specifies from root scope
        if (instruction.startsWith('/')) {
            return { scope: null, instruction: instruction.slice(1) };
        }
        // Instruction specifies scope traversals
        while (instruction.startsWith('.')) {
            // The same as no scope modification
            if (instruction.startsWith('./')) {
                instruction = instruction.slice(2);
            }
            else if (instruction.startsWith('../')) { // Traverse upwards
                scope = scope.parent ?? scope;
                instruction = instruction.slice(3);
            }
            else { // Bad traverse instruction
                break;
            }
        }
        // Testing without this since it seems to be removed
        // if (scope?.path != null) {
        //   instruction = `${scope.path}/${instruction}`;
        //   scope = null; // scope.root;
        // }
        return { scope, instruction };
    }
    /**
     * The routing scope children to this scope are added to. If this routing
     * scope has scope, this scope property equals this scope itself. If it
     * doesn't have scope this property equals the owning scope. Using this
     * ensures that routing scopes that don't have a their own scope aren't
     * part of the owner/owning hierarchy.
     */
    get scope() {
        return this.hasScope ? this : this.owningScope.scope;
    }
    get endpoint() {
        return this.endpointContent.endpoint;
    }
    get isViewport() {
        return this.endpoint instanceof Viewport;
    }
    get isViewportScope() {
        return this.endpoint instanceof ViewportScope;
    }
    get type() {
        return this.isViewport ? 'Viewport' : 'ViewportScope';
    }
    get enabled() {
        return this.endpointContent.isActive;
    }
    get passThroughScope() {
        return this.isViewportScope && this.endpoint.passThroughScope;
    }
    get pathname() {
        return `${this.owningScope !== this ? this.owningScope.pathname : ''}/${this.endpoint.name}`;
    }
    get path() {
        const parentPath = this.parent?.path ?? '';
        const path = this.routingInstruction?.stringify(this.router, { endpointContext: true }, true) ?? '';
        const sep = this.routingInstruction ? Separators.for(this.router).scope : '';
        return `${parentPath}${path}${sep}`;
    }
    toString(recurse = false) {
        return `${this.owningScope !== this ? this.owningScope.toString() : ''}/${!this.enabled ? '(' : ''}${this.endpoint.toString()}#${this.id}${!this.enabled ? ')' : ''}` +
            `${recurse ? `\n` + this.children.map(child => child.toString(true)).join('') : ''}`;
    }
    toStringOwning(recurse = false) {
        return `${this.owningScope !== this ? this.owningScope.toString() : ''}/${!this.enabled ? '(' : ''}${this.endpoint.toString()}#${this.id}${!this.enabled ? ')' : ''}` +
            `${recurse ? `\n` + this.ownedScopes.map(child => child.toStringOwning(true)).join('') : ''}`;
    }
    get enabledChildren() {
        return this.children.filter(scope => scope.enabled);
    }
    get hoistedChildren() {
        const scopes = this.enabledChildren;
        while (scopes.some(scope => scope.passThroughScope)) {
            for (const scope of scopes.slice()) {
                if (scope.passThroughScope) {
                    const index = scopes.indexOf(scope);
                    scopes.splice(index, 1, ...scope.enabledChildren);
                }
            }
        }
        return scopes;
    }
    get ownedScopes() {
        return this.getOwnedScopes();
    }
    get routingInstruction() {
        if (this.endpoint.isViewportScope) {
            return this.endpoint.instruction;
        }
        if (this.isViewport) {
            return this.endpoint.activeContent.instruction;
        }
        return null;
    }
    getOwnedScopes(includeDisabled = false) {
        const scopes = this.allScopes(includeDisabled).filter(scope => scope.owningScope === this);
        // Hoist children to pass through scopes
        for (const scope of scopes.slice()) {
            if (scope.passThroughScope) {
                const index = scopes.indexOf(scope);
                scopes.splice(index, 1, ...scope.getOwnedScopes());
            }
        }
        return scopes;
    }
    findInstructions(instructions, useDirectRouting, useConfiguredRoutes) {
        const router = this.router;
        let route = new FoundRoute();
        if (useConfiguredRoutes && !RoutingInstruction.containsSiblings(router, instructions)) {
            let clearInstructions = instructions.filter(instruction => instruction.isClear(router) || instruction.isClearAll(router));
            const nonClearInstructions = instructions.filter(instruction => !instruction.isClear(router) && !instruction.isClearAll(router));
            // As long as the sibling constraint (above) is in, this will only be at most one instruction
            if (nonClearInstructions.length > 0) {
                for (const instruction of nonClearInstructions) {
                    const idOrPath = typeof instruction.route === 'string'
                        ? instruction.route
                        : instruction.unparsed ?? RoutingInstruction.stringify(router, [instruction]);
                    const foundRoute = this.findMatchingRoute(idOrPath, instruction.parameters.parametersRecord ?? {});
                    if (foundRoute.foundConfiguration) {
                        route = foundRoute;
                        route.instructions = [...clearInstructions, ...route.instructions];
                        clearInstructions = [];
                    }
                    else if (useDirectRouting) {
                        route.instructions = [...clearInstructions, ...route.instructions, instruction];
                        clearInstructions = [];
                        route.remaining = RoutingInstruction.stringify(router, instruction.nextScopeInstructions ?? []);
                    }
                    else {
                        throw new Error(`No route found for: ${RoutingInstruction.stringify(router, instructions)}!`);
                    }
                }
            }
            else {
                route.instructions = [...clearInstructions];
            }
        }
        else if (useDirectRouting) {
            route.instructions.push(...instructions);
        }
        else {
            throw new Error(`No way to process sibling viewport routes with direct routing disabled: ${RoutingInstruction.stringify(router, instructions)}!`);
        }
        // Remove empty instructions so that default can be used
        route.instructions = route.instructions.filter(instr => instr.component.name !== '');
        for (const instruction of route.instructions) {
            if (instruction.scope === null) {
                instruction.scope = this;
            }
        }
        return route;
    }
    // Note: This can't change state other than the instructions!
    /**
     * Match the instructions to available endpoints within, and with the help of, their scope.
     *
     * @param instructions - The instructions to matched
     * @param alreadyFound - The already found matches
     * @param disregardViewports - Whether viewports should be ignored when matching
     */
    matchEndpoints(instructions, alreadyFound, disregardViewports = false) {
        const allMatchedInstructions = [];
        const scopeInstructions = instructions.filter(instruction => (instruction.scope ?? this) === this);
        const allRemainingInstructions = instructions.filter(instruction => (instruction.scope ?? this) !== this);
        const { matchedInstructions, remainingInstructions } = EndpointMatcher.matchEndpoints(this, scopeInstructions, alreadyFound, disregardViewports);
        allMatchedInstructions.push(...matchedInstructions);
        allRemainingInstructions.push(...remainingInstructions);
        return { matchedInstructions: allMatchedInstructions, remainingInstructions: allRemainingInstructions };
    }
    addEndpoint(type, name, connectedCE, options = {}) {
        let endpoint = this.getOwnedScopes()
            .find(scope => scope.type === type &&
            scope.endpoint.name === name)?.endpoint ?? null;
        // Each endpoint element has its own Endpoint
        if (connectedCE != null && endpoint?.connectedCE != null && endpoint.connectedCE !== connectedCE) {
            endpoint = this.getOwnedScopes(true)
                .find(scope => scope.type === type &&
                scope.endpoint.name === name &&
                scope.endpoint.connectedCE === connectedCE)?.endpoint
                ?? null;
        }
        if (endpoint == null) {
            endpoint = type === 'Viewport'
                ? new Viewport(this.router, name, connectedCE, this.scope, !!options.scope, options)
                : new ViewportScope(this.router, name, connectedCE, this.scope, true, null, options);
            this.addChild(endpoint.connectedScope);
        }
        if (connectedCE != null) {
            endpoint.setConnectedCE(connectedCE, options);
        }
        return endpoint;
    }
    removeEndpoint(step, endpoint, connectedCE) {
        if (((connectedCE ?? null) !== null) || endpoint.removeEndpoint(step, connectedCE)) {
            this.removeChild(endpoint.connectedScope);
            return true;
        }
        return false;
    }
    addChild(scope) {
        if (!this.children.some(vp => vp === scope)) {
            if (scope.parent !== null) {
                scope.parent.removeChild(scope);
            }
            this.children.push(scope);
            scope.parent = this;
        }
    }
    removeChild(scope) {
        const index = this.children.indexOf(scope);
        if (index >= 0) {
            this.children.splice(index, 1);
            scope.parent = null;
        }
    }
    allScopes(includeDisabled = false) {
        const scopes = includeDisabled ? this.children.slice() : this.enabledChildren;
        for (const scope of scopes.slice()) {
            scopes.push(...scope.allScopes(includeDisabled));
        }
        return scopes;
    }
    reparentRoutingInstructions() {
        const scopes = this.hoistedChildren
            .filter(scope => scope.routingInstruction !== null && scope.routingInstruction.component.name);
        if (!scopes.length) {
            return null;
        }
        for (const scope of scopes) {
            const childInstructions = scope.reparentRoutingInstructions();
            scope.routingInstruction.nextScopeInstructions =
                childInstructions !== null && childInstructions.length > 0 ? childInstructions : null;
        }
        return scopes.map(scope => scope.routingInstruction);
    }
    getChildren(timestamp) {
        const contents = this.children
            .map(scope => scope.endpoint.getTimeContent(timestamp))
            .filter(content => content !== null);
        return contents.map(content => content.connectedScope);
    }
    getAllRoutingScopes(timestamp) {
        const scopes = this.getChildren(timestamp);
        for (const scope of scopes.slice()) {
            scopes.push(...scope.getAllRoutingScopes(timestamp));
        }
        return scopes;
    }
    getOwnedRoutingScopes(timestamp) {
        const scopes = this.getAllRoutingScopes(timestamp)
            .filter(scope => scope.owningScope === this);
        // Hoist children to pass through scopes
        for (const scope of scopes.slice()) {
            if (scope.passThroughScope) {
                const passThrough = scopes.indexOf(scope);
                scopes.splice(passThrough, 1, ...scope.getOwnedRoutingScopes(timestamp));
            }
        }
        return arrayUnique(scopes);
    }
    getRoutingInstructions(timestamp) {
        const contents = arrayUnique(this.getOwnedRoutingScopes(timestamp) // hoistedChildren
            .map(scope => scope.endpoint))
            .map(endpoint => endpoint.getTimeContent(timestamp))
            .filter(content => content !== null);
        const instructions = [];
        for (const content of contents) {
            const instruction = content.instruction.clone(true, false, false);
            if ((instruction.component.name ?? '') !== '') {
                instruction.nextScopeInstructions = content.connectedScope.getRoutingInstructions(timestamp);
                instructions.push(instruction);
            }
        }
        return instructions;
    }
    canUnload(coordinator, step) {
        return Runner.run(step, (stepParallel) => {
            return Runner.runParallel(stepParallel, ...this.children.map(child => child.endpoint !== null
                ? (childStep) => child.endpoint.canUnload(coordinator, childStep)
                : (childStep) => child.canUnload(coordinator, childStep)));
        }, (step) => step.previousValue.every(result => result ?? true));
    }
    unload(coordinator, step) {
        return Runner.runParallel(step, ...this.children.map(child => child.endpoint !== null
            ? (childStep) => child.endpoint.unload(coordinator, childStep)
            : (childStep) => child.unload(coordinator, childStep)));
    }
    matchScope(instructions, deep = false) {
        const matching = [];
        for (const instruction of instructions) {
            if (instruction.scope === this) {
                matching.push(instruction);
            }
            else if (deep && instruction.hasNextScopeInstructions) {
                matching.push(...this.matchScope(instruction.nextScopeInstructions, deep));
            }
        }
        return matching;
    }
    findMatchingRoute(path, parameters) {
        let found = new FoundRoute();
        if (this.isViewportScope && !this.passThroughScope) {
            found = this.findMatchingRouteInRoutes(path, this.endpoint.getRoutes(), parameters);
        }
        else if (this.isViewport) {
            found = this.findMatchingRouteInRoutes(path, this.endpoint.getRoutes(), parameters);
        }
        else {
            for (const child of this.enabledChildren) {
                found = child.findMatchingRoute(path, parameters);
                if (found.foundConfiguration) {
                    break;
                }
            }
        }
        if (found.foundConfiguration) {
            return found;
        }
        if (this.parent != null) {
            return this.parent.findMatchingRoute(path, parameters);
        }
        return found;
    }
    findMatchingRouteInRoutes(path, routes, parameters) {
        const found = new FoundRoute();
        if (routes.length === 0) {
            return found;
        }
        routes = routes.map(route => this.ensureProperRoute(route));
        const cRoutes = [];
        for (const route of routes) {
            const paths = (Array.isArray(route.path) ? route.path : [route.path]);
            for (const path of paths) {
                cRoutes.push({
                    ...route,
                    path,
                    handler: route,
                });
                if (path !== '') {
                    cRoutes.push({
                        ...route,
                        path: `${path}/*remainingPath`,
                        handler: route,
                    });
                }
            }
        }
        if (path.startsWith('/') || path.startsWith('+')) {
            path = path.slice(1);
        }
        const idRoute = routes.find(route => route.id === path);
        let result = { params: {}, endpoint: {} };
        if (idRoute != null) {
            result.endpoint = { route: { handler: idRoute } };
            path = Array.isArray(idRoute.path) ? idRoute.path[0] : idRoute.path;
            const segments = path.split('/').map(segment => {
                if (segment.startsWith(':')) {
                    const name = segment.slice(1).replace(/\?$/, '');
                    const param = parameters[name];
                    result.params[name] = param;
                    return param;
                }
                else {
                    return segment;
                }
            });
            path = segments.join('/');
        }
        else {
            const recognizer = new RouteRecognizer();
            recognizer.add(cRoutes);
            result = recognizer.recognize(path);
        }
        if (result != null) {
            found.match = result.endpoint.route.handler;
            found.matching = path;
            const $params = { ...result.params };
            if ($params.remainingPath != null) {
                found.remaining = $params.remainingPath;
                Reflect.deleteProperty($params, 'remainingPath');
                found.matching = found.matching.slice(0, found.matching.indexOf(found.remaining));
            }
            found.params = $params;
            if (found.match?.redirectTo != null) {
                let redirectedTo = found.match?.redirectTo;
                if ((found.remaining ?? '').length > 0) {
                    redirectedTo += `/${found.remaining}`;
                }
                return this.findMatchingRouteInRoutes(redirectedTo, routes, parameters);
            }
        }
        if (found.foundConfiguration) {
            // clone it so config doesn't get modified
            found.instructions = RoutingInstruction.clone(found.match.instructions, false, true);
            const instructions = found.instructions.slice();
            while (instructions.length > 0) {
                const instruction = instructions.shift();
                instruction.parameters.addParameters(found.params);
                instruction.route = found;
                if (instruction.hasNextScopeInstructions) {
                    instructions.unshift(...instruction.nextScopeInstructions);
                }
            }
            if (found.instructions.length > 0) {
                found.instructions[0].routeStart = true;
            }
            const remaining = RoutingInstruction.parse(this.router, found.remaining);
            if (remaining.length > 0) {
                let lastInstruction = found.instructions[0];
                while (lastInstruction.hasNextScopeInstructions) {
                    lastInstruction = lastInstruction.nextScopeInstructions[0];
                }
                lastInstruction.nextScopeInstructions = remaining;
            }
        }
        return found;
    }
    ensureProperRoute(route) {
        if (route.id === void 0) {
            route.id = Array.isArray(route.path) ? route.path.join(',') : route.path;
        }
        if (route.instructions === void 0) {
            route.instructions = [{
                    component: route.component,
                    viewport: route.viewport,
                    parameters: route.parameters,
                    children: route.children,
                }];
        }
        if (route.redirectTo === null) {
            route.instructions = RoutingInstruction.from(this.router, route.instructions);
        }
        return route;
    }
}
/** @internal */
RoutingScope.lastId = 0;

/**
 * @internal - Shouldn't be used directly
 */
class QueueTask {
    constructor(taskQueue, item, cost = 0) {
        this.taskQueue = taskQueue;
        this.item = item;
        this.cost = cost;
        this.done = false;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = () => {
                this.taskQueue.resolve(this, resolve);
            };
            this.reject = (reason) => {
                this.taskQueue.reject(this, reject, reason);
            };
        });
    }
    async execute() {
        if ('execute' in this.item) {
            await this.item.execute(this);
        }
        else {
            await this.item(this);
        }
    }
    wait() {
        return this.promise;
    }
}
/**
 * A first-in-first-out task queue that only processes the next queued item
 * when the current one has been resolved or rejected. If a callback function
 * is specified, it receives the queued items as tasks one at a time. If no
 * callback is specified, the tasks themselves are either executed (if a
 * function) or the execute method in them are run. The executed function
 * should resolve or reject the task when processing is done.
 * Enqueued items' tasks can be awaited. Enqueued items can specify an
 * (arbitrary) execution cost and the queue can be set up (started) to
 * only process a specific amount of execution cost per RAF/tick.
 *
 * @internal - Shouldn't be used directly.
 */
class TaskQueue {
    get isActive() {
        return this.task !== null;
    }
    constructor(callback) {
        this.callback = callback;
        this.pending = [];
        this.processing = null;
        this.allowedExecutionCostWithinTick = null;
        this.currentExecutionCostInCurrentTick = 0;
        this.platform = null;
        this.task = null;
        this.dequeue = (delta) => {
            if (this.processing !== null) {
                return;
            }
            if (delta !== undefined) {
                this.currentExecutionCostInCurrentTick = 0;
            }
            if (this.pending.length === 0) {
                return;
            }
            if (this.allowedExecutionCostWithinTick !== null && delta === undefined && this.currentExecutionCostInCurrentTick + (this.pending[0].cost || 0) > this.allowedExecutionCostWithinTick) {
                return;
            }
            this.processing = this.pending.shift() || null;
            if (this.processing) {
                this.currentExecutionCostInCurrentTick += this.processing.cost ?? 0;
                if (this.callback !== void 0) {
                    this.callback(this.processing);
                }
                else {
                    // Don't need to await this since next task won't be dequeued until
                    // executed function is resolved
                    this.processing.execute().catch(error => { throw error; });
                }
            }
        };
    }
    get length() {
        return this.pending.length;
    }
    start(options) {
        this.platform = options.platform;
        this.allowedExecutionCostWithinTick = options.allowedExecutionCostWithinTick;
        this.task = this.platform.domQueue.queueTask(this.dequeue, { persistent: true });
    }
    stop() {
        this.task.cancel();
        this.task = null;
        this.allowedExecutionCostWithinTick = null;
        this.clear();
    }
    enqueue(itemOrItems, costOrCosts) {
        const list = Array.isArray(itemOrItems);
        const items = (list ? itemOrItems : [itemOrItems]);
        const costs = items
            .map((value, index) => !Array.isArray(costOrCosts) ? costOrCosts : costOrCosts[index])
            .map((value) => value !== undefined ? value : 1);
        const tasks = [];
        for (const item of items) {
            tasks.push(item instanceof QueueTask
                ? item
                : this.createQueueTask(item, costs.shift())); // TODO: Get cancellable in as well
        }
        this.pending.push(...tasks);
        this.dequeue();
        return list ? tasks : tasks[0];
    }
    createQueueTask(item, cost) {
        return new QueueTask(this, item, cost);
    }
    clear() {
        this.pending.length = 0;
    }
    /**
     * @internal
     */
    resolve(_task, resolve) {
        resolve();
        this.processing = null;
        this.dequeue();
    }
    /**
     * @internal
     */
    reject(_task, reject, reason) {
        reject(reason);
        this.processing = null;
        this.dequeue();
    }
}

/**
 * Viewer and store layers on top of the browser. The viewer part is for getting
 * and setting a state (location) indicator and the store part is for storing
 * and retrieving historical states (locations). In the browser, the Location
 * is the viewer and the History API provides the store.
 *
 * All mutating actions towards the viewer and store are added as awaitable tasks
 * in a queue.
 *
 * Events are fired when the current state (location) changes, either through
 * direct change (manually altering the Location) or movement to a historical
 * state.
 *
 * All interaction with the browser's Location and History is performed through
 * these layers.
 *
 * @internal
 */
class BrowserViewerStore {
    constructor() {
        /**
         * Limit the number of executed actions within the same RAF (due to browser limitation).
         */
        this.allowedExecutionCostWithinTick = 2;
        /**
         * State changes that have been triggered but not yet processed.
         */
        this.pendingCalls = new TaskQueue();
        /**
         * Whether the BrowserViewerStore is started or not.
         */
        this.isActive = false;
        this.options = {
            useUrlFragmentHash: true,
        };
        /**
         * A "forwarded state" that's used to decide whether the browser's popstate
         * event should fire a change state event or not. Used by 'go' method and
         * its 'suppressEvent' option.
         */
        this.forwardedState = { eventTask: null, suppressPopstate: false };
        this.platform = resolve(IPlatform);
        this.window = resolve(IWindow);
        this.history = resolve(IHistory);
        this.location = resolve(ILocation);
        this.ea = resolve(IEventAggregator);
    }
    start(options) {
        if (this.isActive) {
            throw createMappedError(2007 /* ErrorNames.browser_viewer_store_already_started */);
        }
        this.isActive = true;
        if (options.useUrlFragmentHash != void 0) {
            this.options.useUrlFragmentHash = options.useUrlFragmentHash;
        }
        this.pendingCalls.start({ platform: this.platform, allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick });
        this.window.addEventListener('popstate', this);
    }
    stop() {
        if (!this.isActive) {
            throw createMappedError(2008 /* ErrorNames.browser_viewer_store_not_started */);
        }
        this.window.removeEventListener('popstate', this);
        this.pendingCalls.stop();
        this.options = { useUrlFragmentHash: true };
        this.isActive = false;
    }
    get length() {
        return this.history.length;
    }
    /**
     * The stored state for the current state/location.
     */
    get state() {
        return this.history.state;
    }
    /**
     * Get the viewer's (browser Location) current state/location (URL).
     */
    get viewerState() {
        const { pathname, search, hash } = this.location;
        const instruction = (this.options.useUrlFragmentHash ?? false)
            ? hash.slice(1)
            : `${pathname}${search}`;
        const fragment = (this.options.useUrlFragmentHash ?? false)
            ? (hash.slice(1).includes('#') ? hash.slice(hash.slice(1).indexOf('#', 1)) : '')
            : hash.slice(1);
        return new NavigatorViewerState(pathname, search.slice(1), fragment, instruction);
    }
    /**
     * Enqueue an awaitable 'go' task that navigates delta amount of steps
     * back or forward in the states history.
     *
     * @param delta - The amount of steps, positive or negative, to move in the states history
     * @param suppressEvent - If true, no state change event is fired when the go task is executed
     */
    async go(delta, suppressEvent = false) {
        const doneTask = this.pendingCalls.createQueueTask((task) => task.resolve(), 1);
        this.pendingCalls.enqueue([
            (task) => {
                const eventTask = doneTask;
                const suppressPopstate = suppressEvent;
                // Set the "forwarded state" that decides whether the browser's popstate event
                // should fire a change state event or not
                this.forwardState({ eventTask, suppressPopstate });
                task.resolve();
            },
            (task) => {
                const history = this.history;
                const steps = delta;
                history.go(steps);
                task.resolve();
            },
        ], [0, 1]);
        return doneTask.wait();
    }
    /**
     * Enqueue an awaitable 'push state' task that pushes a state after the current
     * historical state. Any pre-existing historical states after the current are
     * discarded before the push.
     *
     * @param state - The state to push
     */
    async pushNavigatorState(state) {
        const { title, path } = state.navigations[state.navigationIndex];
        const fragment = this.options.useUrlFragmentHash ? '#/' : '';
        return this.pendingCalls.enqueue((task) => {
            const history = this.history;
            const data = state;
            const titleOrEmpty = title || '';
            const url = `${fragment}${path}`;
            try {
                history.pushState(data, titleOrEmpty, url);
                this.setTitle(titleOrEmpty);
            }
            catch (err) {
                const clean = this.tryCleanState(data, 'push', err);
                history.pushState(clean, titleOrEmpty, url);
                this.setTitle(titleOrEmpty);
            }
            task.resolve();
        }, 1).wait();
    }
    /**
     * Enqueue an awaitable 'replace state' task that replace the current historical
     * state with the provided  state.
     *
     * @param state - The state to replace with
     */
    async replaceNavigatorState(state, title, path) {
        // const { title, path } = state.currentEntry;
        const lastNavigation = state.navigations[state.navigationIndex];
        title ??= lastNavigation.title;
        path ??= lastNavigation.path;
        const fragment = this.options.useUrlFragmentHash ? '#/' : '';
        return this.pendingCalls.enqueue((task) => {
            const history = this.history;
            const data = state;
            const titleOrEmpty = title || '';
            const url = `${fragment}${path}`;
            try {
                history.replaceState(data, titleOrEmpty, url);
                this.setTitle(titleOrEmpty);
            }
            catch (err) {
                const clean = this.tryCleanState(data, 'replace', err);
                history.replaceState(clean, titleOrEmpty, url);
                this.setTitle(titleOrEmpty);
            }
            task.resolve();
        }, 1).wait();
    }
    /**
     * Enqueue an awaitable 'pop state' task that pops the last of the historical states.
     */
    async popNavigatorState() {
        const doneTask = this.pendingCalls.createQueueTask((task) => task.resolve(), 1);
        this.pendingCalls.enqueue(async (task) => {
            const eventTask = doneTask;
            await this.popState(eventTask);
            task.resolve();
        }, 1);
        return doneTask.wait();
    }
    setTitle(title) {
        this.window.document.title = title;
    }
    /**
     * Handle the browsers PopStateEvent
     *
     * @param event - The browser's PopStateEvent
     */
    handleEvent(e) {
        this.handlePopStateEvent(e);
    }
    /**
     * Enqueue an awaitable 'pop state' task when the viewer's state (browser's
     * Location) changes.
     *
     * @param event - The browser's PopStateEvent
     */
    handlePopStateEvent(event) {
        const { eventTask, suppressPopstate } = this.forwardedState;
        this.forwardedState = { eventTask: null, suppressPopstate: false };
        this.pendingCalls.enqueue(async (task) => {
            if (!suppressPopstate) {
                this.notifySubscribers(event);
            }
            if (eventTask !== null) {
                await eventTask.execute();
            }
            task.resolve();
        }, 1);
    }
    /**
     * Notifies subscribers that the state has changed
     *
     * @param ev - The browser's popstate event
     */
    notifySubscribers(ev) {
        this.ea.publish(NavigatorStateChangeEvent.eventName, NavigatorStateChangeEvent.create(this.viewerState, ev, this.history.state));
    }
    /**
     * Pop the last historical state by re-pushing the second to last
     * historical state (since browser History doesn't have a popState).
     *
     * @param doneTask - Task to execute once pop is done
     */
    async popState(doneTask) {
        await this.go(-1, true);
        const state = this.history.state;
        // TODO: Fix browser forward bug after pop on first entry
        const lastNavigation = state?.navigations?.[state?.navigationIndex ?? 0];
        if (lastNavigation != null && !lastNavigation.firstEntry) {
            await this.go(-1, true);
            await this.pushNavigatorState(state);
        }
        await doneTask.execute();
    }
    /**
     * Set the "forwarded state" that decides whether the browser's popstate event
     * should fire a change state event or not.
     *
     * @param state - The forwarded state
     */
    forwardState(state) {
        this.forwardedState = state;
    }
    /**
     * Tries to clean up the state for pushing or replacing to browser History.
     *
     * @param data - The state to attempt to clean
     * @param type - The type of action, push or replace, that failed
     * @param originalError - The origial error when trying to push or replace
     */
    tryCleanState(data, type, originalError) {
        try {
            return JSON.parse(JSON.stringify(data));
        }
        catch (err) {
            throw createMappedError(2009 /* ErrorNames.browser_viewer_store_state_serialization_failed */, type, err, originalError);
        }
    }
}
/**
 * The state used when communicating with the navigator viewer.
 */
/**
 * @internal
 */
class NavigatorViewerState {
    constructor(
    /**
     * The URL (Location) path
     */
    path, 
    /**
     * The URL (Location) query
     */
    query, 
    /**
     * The URL (Location) hash
     */
    hash, 
    /**
     * The navigation instruction
     */
    instruction) {
        this.path = path;
        this.query = query;
        this.hash = hash;
        this.instruction = instruction;
    }
}
class NavigatorStateChangeEvent {
    constructor(eventName, viewerState, event, state) {
        this.eventName = eventName;
        this.viewerState = viewerState;
        this.event = event;
        this.state = state;
    }
    static create(viewerState, ev, navigatorState) {
        return new NavigatorStateChangeEvent(NavigatorStateChangeEvent.eventName, viewerState, ev, navigatorState);
    }
}
NavigatorStateChangeEvent.eventName = 'au:router:navigation-state-change';

/**
 * The entity used to keep track of the endpoint and its states.
 */
class Entity {
    constructor(
    /**
     * The endpoint for the entity
     */
    endpoint) {
        this.endpoint = endpoint;
        /**
         * Whether the entity's transition has started.
         */
        this.running = false;
        /**
         * The navigation states the entity has reached.
         */
        this.states = new Map();
        /**
         * The navigation states the entity has checked (and therefore reached).
         */
        this.checkedStates = [];
        /**
         * The navigation state the entity is currently syncing/waiting on.
         */
        this.syncingState = null;
        /**
         * The (open) promise to resolve when the entity has reached its sync state.
         */
        this.syncPromise = null;
        /**
         * The Runner step that's controlling the transition in the entity.
         */
        this.step = null;
    }
    /**
     * Whether the entity has reached a specific state.
     *
     * @param state - The state to check
     */
    hasReachedState(state) {
        return this.states.has(state) && this.states.get(state) === null;
    }
}
class NavigationCoordinator {
    constructor(router, 
    /**
     * The navigation that created the coordinator.
     */
    navigation) {
        this.router = router;
        this.navigation = navigation;
        this.instructions = [];
        this.matchedInstructions = [];
        this.processedInstructions = [];
        this.changedEndpoints = [];
        /**
         * Whether the coordinator is running/has started entity transitions.
         */
        this.running = false;
        /**
         * Whether the coordinator's run is completed.
         */
        this.completed = false;
        /**
         * Whether the coordinator's run is cancelled.
         */
        this.cancelled = false;
        /**
         * Whether the coordinator has got all endpoints added.
         */
        this.hasAllEndpoints = false;
        /**
         * Instructions that should be appended to the navigation
         */
        this.appendedInstructions = [];
        /**
         * Whether the coordinator is closed for new appended instructions.
         */
        this.closed = false;
        /**
         * The entities the coordinator is coordinating.
         */
        this.entities = [];
        /**
         * The sync states the coordinator is coordinating.
         */
        this.syncStates = new Map();
        /**
         * The sync states that's been checked (by any entity).
         */
        this.checkedSyncStates = new Set();
    }
    /**
     * Create a navigation coordinator.
     *
     * @param router - The router
     * @param navigation - The navigation that creates the coordinator
     * @param options - The navigation coordinator options
     */
    static create(router, navigation, options) {
        const coordinator = new NavigationCoordinator(router, navigation);
        // TODO: Set flow options from router
        options.syncStates.forEach((state) => coordinator.addSyncState(state));
        return coordinator;
    }
    /**
     * Append instructions to the current process.
     *
     * @param instructions - The instructions to append
     */
    appendInstructions(instructions) {
        this.instructions.push(...instructions);
        this.manageDefaults();
    }
    /**
     * Remove instructions from the current process.
     *
     * @param instructions - The instructions to remove
     */
    removeInstructions(instructions) {
        this.instructions = this.instructions.filter(instr => !instructions.includes(instr));
        this.matchedInstructions = this.matchedInstructions.filter(instr => !instructions.includes(instr));
    }
    manageDefaults() {
        const router = this.router;
        // Process non-defaults first
        this.instructions = [...this.instructions.filter(instr => !instr.default), ...this.instructions.filter(instr => instr.default)];
        // Make sure all appended instructions have the correct scope
        this.instructions.forEach(instruction => {
            if (instruction.scope == null) {
                instruction.scope = this.navigation.scope ?? this.router.rootScope?.scope ?? null;
            }
        });
        const instructions = this.instructions.filter(instr => !instr.isClear(router));
        while (instructions.length > 0) {
            const instruction = instructions.shift();
            // Already processed an instruction for this endpoint
            const foundProcessed = this.processedInstructions.some(instr => !instr.isClear(router) && !instr.cancelled && instr.sameEndpoint(instruction, true));
            // An already matched (but not processed) instruction for this endpoint
            const existingMatched = this.matchedInstructions.find(instr => !instr.isClear(router) && instr.sameEndpoint(instruction, true));
            // An already existing (but not matched or processed) instruction for this endpoint
            const existingInstruction = this.instructions.find(instr => !instr.isClear(router) && instr.sameEndpoint(instruction, true) && instr !== instruction);
            // If it's a default instruction that's already got a non-default in some way, remove it
            if (instruction.default &&
                (foundProcessed ||
                    (existingMatched !== void 0 && !existingMatched.default) ||
                    (existingInstruction !== void 0 && !existingInstruction.default))) {
                arrayRemove(this.instructions, value => value === instruction);
                continue;
            }
            // There's already a matched instruction, but it's default (or appended instruction isn't) so it should be removed
            if (existingMatched !== void 0) {
                arrayRemove(this.matchedInstructions, value => value === existingMatched);
                continue;
            }
            // There's already an existing instruction, but it's default (or appended instruction isn't) so it should be removed
            if (existingInstruction !== void 0) {
                arrayRemove(this.instructions, value => value === existingInstruction);
            }
        }
    }
    /**
     * Process the appended instructions, moving them to matched or remaining.
     */
    async processInstructions() {
        const changedEndpoints = [];
        let guard = 100;
        while (this.instructions.length > 0) {
            if (!guard--) { // Guard against endless loop
                console.error('processInstructions endless loop', this.navigation, this.instructions);
                throw new Error('Endless loop');
            }
            // Process non-defaults first (by separating and adding back)
            this.instructions = [...this.instructions.filter(instr => !instr.default), ...this.instructions.filter(instr => instr.default)];
            const scope = this.instructions[0].scope;
            if (scope == null) {
                throw new Error('No scope for instruction');
            }
            // eslint-disable-next-line no-await-in-loop
            changedEndpoints.push(...await this.processInstructionsForScope(scope));
        }
        return changedEndpoints;
    }
    async processInstructionsForScope(scope) {
        const router = this.router;
        const options = router.configuration.options;
        // Get all endpoints affected by any clear all routing instructions and then remove those
        // routing instructions.
        const clearEndpoints = this.getClearAllEndpoints(scope);
        // If there are instructions for this scope that aren't part of an already found configured route...
        const nonRouteInstructions = this.getInstructionsForScope(scope).filter(instr => !(instr.route instanceof Route));
        if (nonRouteInstructions.length > 0) {
            // ...find the routing instructions for them. The result will be either that there's a configured
            // route (which in turn contains routing instructions) or a list of routing instructions
            // TODO(return): This needs to be updated
            const foundRoute = scope.findInstructions(nonRouteInstructions, options.useDirectRouting, options.useConfiguredRoutes);
            // Make sure we got routing instructions...
            if (nonRouteInstructions.some(instr => !instr.component.none || instr.route != null)
                && !foundRoute.foundConfiguration
                && !foundRoute.foundInstructions) {
                // ...call unknownRoute hook if we didn't...
                // TODO: Add unknownRoute hook here and put possible result in instructions
                throw this.createUnknownRouteError(nonRouteInstructions);
            }
            // ...and replace the non-route instructions with the found routing instructions.
            this.instructions.splice(this.instructions.indexOf(nonRouteInstructions[0]), nonRouteInstructions.length, ...foundRoute.instructions);
            // // ...and use any already found and the newly found routing instructions.
        }
        // If there are any unresolved components (functions or promises), resolve into components
        const unresolvedPromise = RoutingInstruction.resolve(this.getInstructionsForScope(scope));
        if (unresolvedPromise instanceof Promise) {
            await unresolvedPromise;
        }
        // Make sure "add all" instructions have the correct name and scope
        for (const addInstruction of this.getInstructionsForScope(scope).filter(instr => instr.isAddAll(router))) {
            addInstruction.endpoint.set(addInstruction.scope.endpoint.name);
            addInstruction.scope = addInstruction.scope.owningScope;
        }
        let guard = 100;
        do {
            // Match the instructions to available endpoints within, and with the help of, their scope
            // TODO(return): This needs to be updated
            this.matchEndpoints(scope);
            if (!guard--) { // Guard against endless loop
                router.unresolvedInstructionsError(this.navigation, this.instructions);
            }
            const changedEndpoints = [];
            // Get all the endpoints of matched instructions...
            const matchedEndpoints = this.matchedInstructions.map(instr => instr.endpoint.instance);
            // ...and create and add clear instructions for all endpoints that
            // aren't already in an instruction.
            this.matchedInstructions.push(...clearEndpoints
                .filter(endpoint => !matchedEndpoints.includes(endpoint))
                .map(endpoint => RoutingInstruction.createClear(router, endpoint)));
            // TODO: Review whether this await poses a problem (it's currently necessary for new viewports to load)
            // eslint-disable-next-line no-await-in-loop
            const hooked = await RoutingHook.invokeBeforeNavigation(this.matchedInstructions, this.navigation);
            if (hooked === false) {
                router.cancelNavigation(this.navigation, this);
                return [];
            }
            else if (hooked !== true && hooked !== this.matchedInstructions) {
                // TODO(return): Do a full findInstructions again with a new FoundRoute so that this
                // hook can return other values as well
                this.matchedInstructions = hooked;
            }
            for (const matchedInstruction of this.matchedInstructions) {
                const endpoint = matchedInstruction.endpoint.instance;
                if (endpoint !== null) {
                    // Set endpoint path to the configured route path so that it knows it's part
                    // of a configured route.
                    // Inform endpoint of new content and retrieve the action it'll take
                    const action = endpoint.setNextContent(matchedInstruction, this.navigation);
                    if (action !== 'skip') {
                        // Add endpoint to changed endpoints this iteration and to the coordinator's purview
                        changedEndpoints.push(endpoint);
                        this.addEndpoint(endpoint);
                    }
                    // We're doing something, so don't clear this endpoint...
                    const dontClear = [endpoint];
                    if (action === 'swap') {
                        // ...and none of it's _current_ children if we're swapping them out.
                        dontClear.push(...endpoint.getContent().connectedScope.allScopes(true).map(scope => scope.endpoint));
                    }
                    // Exclude the endpoints to not clear from the ones to be cleared...
                    arrayRemove(clearEndpoints, clear => dontClear.includes(clear));
                    // ...as well as already matched clear instructions (but not itself).
                    arrayRemove(this.matchedInstructions, matched => matched !== matchedInstruction
                        && matched.isClear(router) && dontClear.includes(matched.endpoint.instance));
                    // TODO: Does the below ever happen?! Parent is never in clearEndpoints, right?
                    // And also exclude the routing instruction's parent viewport scope...
                    if (!matchedInstruction.isClear(router) && matchedInstruction.scope?.parent?.isViewportScope) {
                        // ...from clears...
                        arrayRemove(clearEndpoints, clear => clear === matchedInstruction.scope.parent.endpoint);
                        // ...and already matched clears.
                        arrayRemove(this.matchedInstructions, matched => matched !== matchedInstruction
                            && matched.isClear(router) && matched.endpoint.instance === matchedInstruction.scope.parent.endpoint);
                    }
                    // If the instruction has a next scope instructions, add them to the instructions
                    // to be processed next...
                    if (matchedInstruction.hasNextScopeInstructions) {
                        this.instructions.push(...matchedInstruction.nextScopeInstructions);
                        // ...and if the endpoint has been changed/swapped, move the next scope instructions
                        // into the new endpoint content scope and clear the endpoint instance.
                        if (action !== 'skip') {
                            for (const nextScopeInstruction of matchedInstruction.nextScopeInstructions) {
                                nextScopeInstruction.scope = endpoint.scope;
                                nextScopeInstruction.endpoint.instance = null;
                            }
                        }
                    }
                    else {
                        // If there are no next scope instructions the endpoint's scope (its children)
                        // needs to be cleared
                        clearEndpoints.push(...matchedInstruction.endpoint.instance.scope.children.map(s => s.endpoint));
                    }
                }
            }
            // In order to make sure all relevant canUnload are run on the first run iteration
            // we only run once all (top) instructions are doing something/there are no skip
            // action instructions.
            // If all first iteration instructions now do something the transitions can start
            const skipping = this.matchedInstructions.filter(instr => instr.endpoint.instance?.transitionAction === 'skip');
            const skippingWithMore = skipping.filter(instr => instr.hasNextScopeInstructions);
            if (skipping.length === 0 || (skippingWithMore.length === 0)) { // TODO: !!!!!!  && !foundRoute.hasRemaining)) {
                // If navigation is unrestricted (no other syncing done than on canUnload) we can
                // instruct endpoints to transition
                if (!router.isRestrictedNavigation) {
                    this.finalEndpoint();
                }
                this.run();
                // Wait for ("blocking") canUnload to finish
                if (this.hasAllEndpoints) {
                    const guardedUnload = this.waitForSyncState('guardedUnload');
                    if (guardedUnload instanceof Promise) {
                        // eslint-disable-next-line no-await-in-loop
                        await guardedUnload;
                    }
                }
            }
            // If, for whatever reason, this navigation got cancelled, stop processing
            if (this.cancelled) {
                router.cancelNavigation(this.navigation, this);
                return [];
            }
            // Add this iteration's changed endpoints (inside the loop) to the total of all
            // updated endpoints (outside the loop)
            arrayAddUnique(this.changedEndpoints, changedEndpoints);
            // Make sure these endpoints in these instructions stays unavailable
            this.processedInstructions.push(...this.matchedInstructions.splice(0));
            // If this isn't a restricted ("static") navigation everything will run as soon as possible
            // and then we need to wait for new viewports to be loaded before continuing here (but of
            // course only if we're running)
            // TODO: Use a better solution here (by checking and waiting for relevant viewports)
            if (!router.isRestrictedNavigation &&
                (this.matchedInstructions.length > 0 || this.instructions.length > 0) && this.running) {
                const waitForSwapped = this.waitForSyncState('swapped');
                if (waitForSwapped instanceof Promise) {
                    // eslint-disable-next-line no-await-in-loop
                    await waitForSwapped;
                }
            }
            this.instructions.push(...clearEndpoints.map(endpoint => RoutingInstruction.createClear(router, endpoint)));
            // If there are any unresolved components (functions or promises) to be appended, resolve them
            const unresolvedPromise = RoutingInstruction.resolve(this.matchedInstructions);
            if (unresolvedPromise instanceof Promise) {
                // eslint-disable-next-line no-await-in-loop
                await unresolvedPromise;
            }
            // Remove cancelled endpoints from changed endpoints (last instruction is cancelled)
            this.changedEndpoints = this.changedEndpoints.filter(endpoint => !([...this.processedInstructions]
                .reverse()
                .find(instruction => instruction.endpoint.instance === endpoint)
                ?.cancelled ?? false));
        } while (this.matchedInstructions.length > 0 || this.getInstructionsForScope(scope).length > 0);
        return this.changedEndpoints;
    }
    /**
     * Get all instructions for a specific scope
     */
    getInstructionsForScope(scope) {
        // Make sure instruction defaults are removed if there are non-defaults
        this.manageDefaults();
        // Always process all non-default instructions first
        const instructions = this.instructions.filter(instr => instr.scope === scope && !instr.default);
        if (instructions.length > 0) {
            return instructions;
        }
        // If there are no non-default instructions, process all default instructions
        return this.instructions.filter(instr => instr.scope === scope);
    }
    /**
     * Ensure that there's a clear all instruction present in instructions for a scope.
     */
    ensureClearStateInstruction(scope) {
        const router = this.router;
        if (!this.instructions.some(instr => instr.scope === scope && instr.isClearAll(router))) {
            const clearAll = RoutingInstruction.create(RoutingInstruction.clear(router));
            clearAll.scope = scope;
            this.instructions.unshift(clearAll);
        }
    }
    /**
     * Match the instructions to available endpoints within, and with the help of, their scope.
     *
     * @param scope - The scope to match the instructions within
     * @param instructions - The instructions to matched
     * @param alreadyFound - The already found matches
     * @param disregardViewports - Whether viewports should be ignored when matching
     */
    matchEndpoints(scope, disregardViewports = false) {
        const scopeInstructions = this.getInstructionsForScope(scope);
        const matchedInstructions = EndpointMatcher.matchEndpoints(scope, scopeInstructions, [...this.processedInstructions, ...this.matchedInstructions], disregardViewports).matchedInstructions;
        this.matchedInstructions.push(...matchedInstructions);
        this.instructions = this.instructions.filter(instr => !matchedInstructions.includes(instr));
    }
    /**
     * Run the navigation coordination, transitioning all entities/endpoints
     */
    run() {
        if (!this.running) {
            this.running = true;
            for (const entity of this.entities) {
                if (!entity.running) {
                    entity.running = true;
                    entity.endpoint.transition(this);
                }
            }
        }
    }
    /**
     * Add a navigation state to be synchronized.
     *
     * @param state - The state to add
     */
    addSyncState(state) {
        const openPromise = new OpenPromise(`addSyncState: ${state}`);
        this.syncStates.set(state, openPromise);
    }
    /**
     * Add an endpoint to be synchronized.
     *
     * @param endpoint - The endpoint to add
     */
    addEndpoint(endpoint) {
        const entity = new Entity(endpoint);
        this.entities.push(entity);
        // A new entity might invalidate earlier reached states, so reset
        this.recheckSyncStates();
        if (this.running) {
            // If we're running transitions, start the transition
            entity.endpoint.transition(this);
        }
        return entity;
    }
    /**
     * Remove an endpoint from synchronization.
     *
     * @param endpoint - The endpoint to remove
     */
    removeEndpoint(endpoint) {
        const endpoints = this.entities.map(e => e.endpoint);
        const removes = [endpoint];
        let children = [endpoint];
        // Recursively find all children of the endpoint
        while (children.length > 0) {
            children = endpoints.filter(e => e?.parentViewport != null && children.includes(e.parentViewport));
            removes.push(...children);
        }
        // Remove the entities for the endpoint and all its children
        for (const remove of removes) {
            // Find the entity...
            const entity = this.entities.find(e => e.endpoint === remove);
            if (entity !== void 0) {
                // ...and remove it.
                arrayRemove(this.entities, ent => ent === entity);
            }
        }
        // Removing an entity might take us further along the overall process, so check ALL states
        this.checkSyncState();
    }
    /**
     * Set the Runner step controlling the transition for an endpoint.
     *
     * @param endpoint - The endpoint that gets the step set
     * @param step - The step that's controlling the transition
     */
    setEndpointStep(endpoint, step) {
        // Find the entity for the endpoint...
        let entity = this.entities.find(e => e.endpoint === endpoint);
        if (entity === void 0) {
            // ...adding it if it doesn't exist.
            entity = this.addEndpoint(endpoint);
        }
        entity.step = step;
    }
    /**
     * Get the Runner step controlling the transition for an endpoint.
     *
     * @param endpoint - The endpoint to get the step for
     */
    getEndpointStep(endpoint) {
        // Find the entity for the endpoint...
        const entity = this.entities.find(e => e.endpoint === endpoint);
        return entity?.step ?? null;
    }
    /**
     * Add a (reached) navigation state for an endpoint.
     *
     * @param endpoint - The endpoint that's reached a state
     * @param state - The state that's been reached
     */
    addEndpointState(endpoint, state) {
        // Find the entity for the endpoint...
        let entity = this.entities.find(e => e.endpoint === endpoint);
        if (entity === void 0) {
            // ...adding it if it doesn't exist.
            entity = this.addEndpoint(endpoint);
        }
        // Something is waiting for this specific entity/endpoint to reach the state...
        const openPromise = entity.states.get(state);
        if (openPromise instanceof OpenPromise) {
            // ...so resolve it.
            openPromise.resolve();
        }
        entity.states.set(state, null);
        // Check if this was the last entity/endpoint needed to resolve the state
        this.checkSyncState(state);
    }
    /**
     * Wait for a navigation state to be reached. If endpoint is specified, it
     * will be marked as waiting for the state notified when it is reached (if
     * waiting is necessary).
     *
     * @param state - The state to wait for
     * @param endpoint - The specific endpoint to wait for
     */
    waitForSyncState(state, endpoint = null) {
        if (this.entities.length === 0) {
            return;
        }
        // Get the promise, if any, indicating that we're synchronizing this state...
        const openPromise = this.syncStates.get(state);
        if (openPromise === void 0) {
            // ...and return void (nothing to wait for) if it's not synchronized.
            return;
        }
        // If a specified endpoing is waiting for a state...
        if (endpoint !== null) {
            const entity = this.entities.find(e => e.endpoint === endpoint);
            // ...and it's got an entity without existing promise (and the state
            // is still pending)...
            if (entity?.syncPromise === null && openPromise.isPending) {
                // ...mark the entity as waiting for the state.
                entity.syncingState = state;
                entity.syncPromise = new OpenPromise(`waitForSyncState: ${state}`);
                // Also add the state as checked for the entity...
                entity.checkedStates.push(state);
                // ...and over all.
                this.checkedSyncStates.add(state);
                Promise.resolve().then(() => {
                    // Check if this has resolved anything waiting
                    this.checkSyncState(state);
                }).catch(err => { throw err; });
                // Return the promise to await
                return entity.syncPromise.promise;
            }
        }
        // Return the promise to await if it's still pending
        return openPromise.isPending ? openPromise.promise : void 0;
    }
    /**
     * Wait (if necessary) for an endpoint to reach a specific state.
     *
     * @param endpoint - The endpoint to wait for
     * @param state - The state to wait for
     */
    waitForEndpointState(endpoint, state) {
        if (!this.syncStates.has(state)) {
            return;
        }
        // Find the entity...
        let entity = this.entities.find(e => e.endpoint === endpoint);
        // ...adding it if it doesn't exist.
        if (entity == null) {
            entity = this.addEndpoint(endpoint);
        }
        // If we've already reached, return (no wait)
        if (entity.hasReachedState(state)) {
            return;
        }
        // Get open promise...
        let openPromise = entity.states.get(state);
        // ...creating a new one if necessary.
        if (openPromise == null) {
            openPromise = new OpenPromise(`waitForEndpointState: ${state}`);
            entity.states.set(state, openPromise);
        }
        // Return the promise to await
        return openPromise.promise;
    }
    /**
     * Notify that all endpoints has been added to the coordinator.
     */
    finalEndpoint() {
        this.hasAllEndpoints = true;
        // Check all synchronized states to see which has been reached
        this.syncStates.forEach((_promise, state) => this.checkSyncState(state));
    }
    /**
     * Finalize the navigation, calling finalizeContentChange in all endpoints.
     */
    finalize() {
        this.entities.forEach(entity => entity.endpoint.finalizeContentChange(this, null));
        this.completed = true;
        this.navigation.completed = true;
        this.syncStates.clear();
    }
    /**
     * Cancel the navigation, calling cancelContentChange in all endpoints and
     * cancelling the navigation itself.
     */
    cancel() {
        this.cancelled = true;
        this.instructions = [];
        this.matchedInstructions = [];
        // TODO: Take care of disabling viewports when cancelling and stateful!
        this.entities.forEach(entity => {
            const abort = entity.endpoint.cancelContentChange(this);
            if (abort instanceof Promise) {
                abort.catch(error => { throw error; });
            }
        });
        // TODO: Review this since it probably should happen in turn
        this.router.navigator.cancel(this.navigation)
            .then(() => {
            this.navigation.process?.resolve(false);
        })
            .catch(error => { throw error; });
        this.completed = true;
        this.navigation.completed = true;
        // Resolve awaiting processes
        [...this.syncStates.values()].forEach(promise => {
            if (promise.isPending) {
                promise.resolve();
            }
        });
        this.syncStates.clear();
    }
    /**
     * Check if a navigation state has been reached, notifying waiting
     * endpoints if so.
     *
     * @param state - The state to check
     */
    checkSyncState(state) {
        if (state === void 0) {
            // Check all synchronized states to see which has been reached
            this.syncStates.forEach((_promise, state) => this.checkSyncState(state));
            return;
        }
        // Get the promise, if any, indicating that we're synchronizing this state...
        const openPromise = this.syncStates.get(state);
        if (openPromise === void 0) {
            // ...and return void (nothing to wait for) if it's not synchronized.
            return;
        }
        // States aren't reached until all endpoints have been added (but the
        // router can tell the coordinator that all endpoints have been added
        // even though they haven't, to get the states reached)
        if (this.hasAllEndpoints &&
            openPromise.isPending &&
            // Check that this state has been done by all state entities and if so resolve the promise
            this.entities.every(ent => ent.hasReachedState(state)) &&
            // Check that this state has been checked (reached) by all state entities and if so resolve the promise
            (!this.checkedSyncStates.has(state) || this.entities.every(ent => ent.checkedStates.includes(state)))) {
            for (const entity of this.entities) {
                if (entity.syncingState === state) {
                    entity.syncPromise?.resolve();
                    entity.syncPromise = null;
                    entity.syncingState = null;
                }
            }
            openPromise.resolve();
        }
    }
    /**
     * Re-check the sync states (since a new endpoint has been added) and add
     * now unresolved ones back.
     */
    recheckSyncStates() {
        this.syncStates.forEach((promise, state) => {
            if (!promise.isPending && !this.entities.every(ent => ent.hasReachedState(state))) {
                this.addSyncState(state);
            }
        });
    }
    /**
     * Get all endpoints affected by any clear all routing instructions and then remove those
     * routing instructions.
     *
     * @param instructions - The instructions to process
     */
    getClearAllEndpoints(scope) {
        const router = this.router;
        let clearEndpoints = [];
        // If there's any clear all routing instruction...
        if (this.instructions.some(instr => (instr.scope ?? scope) === scope && instr.isClearAll(router))) {
            // ...get all the endpoints to be cleared...
            clearEndpoints = scope.enabledChildren // TODO(alpha): Verify the need for rootScope check below
                .filter(sc => !sc.endpoint.isEmpty) // && sc !== this.router.rootScope?.connectedScope)
                .map(sc => sc.endpoint);
            // ...and remove the clear all instructions
            this.instructions = this.instructions.filter(instr => !((instr.scope ?? scope) === scope && instr.isClearAll(router)));
        }
        return clearEndpoints;
    }
    /**
     * Deal with/throw an unknown route error.
     *
     * @param instructions - The failing instructions
     */
    createUnknownRouteError(instructions) {
        const options = this.router.configuration.options;
        const route = RoutingInstruction.stringify(this.router, instructions);
        // TODO: Add missing/unknown route handling
        if (instructions[0].route != null) {
            if (!options.useConfiguredRoutes) {
                return new Error(`Can not match '${route}' since the router is configured to not use configured routes.`);
            }
            else {
                return new Error(`No matching configured route found for '${route}'.`);
            }
        }
        else if (options.useConfiguredRoutes && options.useDirectRouting) {
            return new Error(`No matching configured route or component found for '${route}'.`);
        }
        else if (options.useConfiguredRoutes) {
            return new Error(`No matching configured route found for '${route}'.`);
        }
        else {
            return new Error(`No matching route/component found for '${route}'.`);
        }
    }
}

/**
 * @internal - Shouldn't be used directly
 */
class RoutingHook {
    constructor(hook, options, id) {
        this.hook = hook;
        this.id = id;
        this.type = 'beforeNavigation';
        this.includeTargets = [];
        this.excludeTargets = [];
        if (options.type !== void 0) {
            this.type = options.type;
        }
        for (const target of options.include ?? []) {
            this.includeTargets.push(new Target(target));
        }
        for (const target of options.exclude ?? []) {
            this.excludeTargets.push(new Target(target));
        }
    }
    static add(hookFunction, options) {
        const hook = new RoutingHook(hookFunction, options ?? {}, ++this.lastIdentity);
        this.hooks[hook.type].push(hook);
        return this.lastIdentity;
    }
    static remove(id) {
        for (const type in this.hooks) {
            if (Object.prototype.hasOwnProperty.call(this.hooks, type)) {
                const index = this.hooks[type].findIndex(hook => hook.id === id);
                if (index >= 0) {
                    this.hooks[type].splice(index, 1);
                }
            }
        }
    }
    static removeAll() {
        for (const type in this.hooks) {
            this.hooks[type] = [];
        }
    }
    static async invokeBeforeNavigation(routingInstructions, navigationInstruction) {
        return this.invoke('beforeNavigation', navigationInstruction, routingInstructions);
    }
    static async invokeTransformFromUrl(url, navigationInstruction) {
        return this.invoke('transformFromUrl', navigationInstruction, url);
    }
    static async invokeTransformToUrl(state, navigationInstruction) {
        return this.invoke('transformToUrl', navigationInstruction, state);
    }
    static async invokeTransformTitle(title, navigationInstruction) {
        return this.invoke('transformTitle', navigationInstruction, title);
    }
    static async invoke(type, navigationInstruction, arg) {
        let outcome = arg;
        for (const hook of this.hooks[type]) {
            if (!hook.wantsMatch || hook.matches(arg)) {
                outcome = await hook.invoke(navigationInstruction, arg);
                if (typeof outcome === 'boolean') {
                    if (!outcome) {
                        return false;
                    }
                }
                else {
                    arg = outcome;
                }
            }
        }
        return outcome;
    }
    get wantsMatch() {
        return this.includeTargets.length > 0 || this.excludeTargets.length > 0;
    }
    matches(routingInstructions) {
        if (this.includeTargets.length && !this.includeTargets.some(target => target.matches(routingInstructions))) {
            return false;
        }
        if (this.excludeTargets.length && this.excludeTargets.some(target => target.matches(routingInstructions))) {
            return false;
        }
        return true;
    }
    invoke(navigationInstruction, arg) {
        // TODO: Fix the type here
        return this.hook(arg, navigationInstruction);
    }
}
RoutingHook.hooks = {
    beforeNavigation: [],
    transformFromUrl: [],
    transformToUrl: [],
    transformTitle: [],
};
RoutingHook.lastIdentity = 0;
class Target {
    constructor(target) {
        this.componentType = null;
        this.componentName = null;
        this.viewport = null;
        this.viewportName = null;
        if (typeof target === 'string') {
            this.componentName = target;
        }
        else if (InstructionComponent.isType(target)) {
            this.componentType = target;
            this.componentName = InstructionComponent.getName(target);
        }
        else {
            const cvTarget = target;
            if (cvTarget.component != null) {
                this.componentType = InstructionComponent.isType(cvTarget.component)
                    ? InstructionComponent.getType(cvTarget.component)
                    : null;
                this.componentName = InstructionComponent.getName(cvTarget.component);
            }
            if (cvTarget.viewport != null) {
                this.viewport = InstructionEndpoint.isInstance(cvTarget.viewport) ? cvTarget.viewport : null;
                this.viewportName = InstructionEndpoint.getName(cvTarget.viewport);
            }
        }
    }
    matches(routingInstructions) {
        const instructions = routingInstructions.slice();
        if (!instructions.length) {
            // instructions.push(new RoutingInstruction(''));
            instructions.push(RoutingInstruction.create(''));
        }
        for (const instruction of instructions) {
            if ((this.componentName !== null && this.componentName === instruction.component.name) ||
                (this.componentType !== null && this.componentType === instruction.component.type) ||
                (this.viewportName !== null && this.viewportName === instruction.endpoint.name) ||
                (this.viewport !== null && this.viewport === instruction.endpoint.instance)) {
                return true;
            }
        }
        return false;
    }
}

class Title {
    static async getTitle(instructions, navigation, titleOptions) {
        // First invoke with viewport instructions
        let title = await RoutingHook.invokeTransformTitle(instructions, navigation);
        if (typeof title !== 'string') {
            // Hook didn't return a title, so run title logic
            const componentTitles = Title.stringifyTitles(title, navigation, titleOptions);
            title = titleOptions.appTitle;
            title = title.replace(/\${componentTitles}/g, componentTitles);
            title = title.replace(/\${appTitleSeparator}/g, componentTitles !== '' ? titleOptions.appTitleSeparator : '');
        }
        // Invoke again with complete string
        title = await RoutingHook.invokeTransformTitle(title, navigation);
        return title;
    }
    static stringifyTitles(instructions, navigation, titleOptions) {
        const titles = instructions
            .map(instruction => Title.stringifyTitle(instruction, navigation, titleOptions))
            .filter(instruction => (instruction?.length ?? 0) > 0);
        return titles.join(' + ');
    }
    static stringifyTitle(instruction, navigation, titleOptions) {
        const nextInstructions = instruction.nextScopeInstructions;
        let stringified = Title.resolveTitle(instruction, navigation, titleOptions);
        if (Array.isArray(nextInstructions) && nextInstructions.length > 0) {
            let nextStringified = Title.stringifyTitles(nextInstructions, navigation, titleOptions);
            if (nextStringified.length > 0) {
                if (nextInstructions.length !== 1) { // TODO: This should really also check that the instructions have value
                    nextStringified = `[ ${nextStringified} ]`;
                }
                if (stringified.length > 0) {
                    stringified = titleOptions.componentTitleOrder === 'top-down'
                        ? stringified + titleOptions.componentTitleSeparator + nextStringified
                        : nextStringified + titleOptions.componentTitleSeparator + stringified;
                }
                else {
                    stringified = nextStringified;
                }
            }
        }
        return stringified;
    }
    static resolveTitle(instruction, navigation, titleOptions) {
        let title = instruction.getTitle(navigation);
        if (titleOptions.transformTitle != null) {
            title = titleOptions.transformTitle(title, instruction, navigation);
        }
        return title;
    }
}

/* eslint-disable prefer-template */
/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
const IRouter = /*@__PURE__*/ DI.createInterface('IRouter', x => x.singleton(Router));
class Router {
    constructor() {
        /**
         * The root viewport scope.
         */
        this.rootScope = null;
        /**
         * The active routing instructions.
         */
        this.activeComponents = [];
        /**
         * Instructions that are appended between navigations and should be appended
         * to next navigation. (This occurs during startup, when there's no navigation
         * to append viewport default instructions to.)
         */
        this.appendedInstructions = [];
        /**
         * Whether the router is active/started
         */
        this.isActive = false;
        /**
         * The currently active coordinators (navigations)
         */
        this.coordinators = [];
        /**
         * Whether the first load has happened
         */
        this.loadedFirst = false;
        /**
         * Is processing navigation
         *
         * @internal
         */
        this._isProcessingNav = false;
        /** @internal */
        this._logger = resolve(ILogger);
        /**
         * @internal
         */
        this.container = resolve(IContainer);
        this.ea = resolve(IEventAggregator);
        /**
         * The navigator that manages navigation queue and history
         *
         * @internal
         */
        this.navigator = resolve(Navigator);
        /**
         * The viewer (browser) that displays url, navigation buttons
         */
        this.viewer = resolve(BrowserViewerStore);
        /**
         * The store (browser) that stores navigations
         */
        this.store = resolve(BrowserViewerStore);
        /**
         * The router configuration
         */
        this.configuration = resolve(IRouterConfiguration);
        /**
         * Handle the navigator's navigate event.
         *
         * @param event - The event to handle
         *
         * @internal
         */
        this.handleNavigatorNavigateEvent = (event) => {
            void this._doHandleNavigatorNavigateEvent(event);
        };
        /**
         * Handle the navigator's state change event.
         *
         * @param event - The event to handle
         *
         * @internal
         */
        this.handleNavigatorStateChangeEvent = (event) => {
            // It's already a proper navigation (browser history or cache), go
            // directly to navigate
            if (event.state?.navigationIndex != null) {
                const entry = Navigation.create(event.state.navigations[event.state.navigationIndex]);
                entry.instruction = event.viewerState.instruction;
                entry.fromBrowser = true;
                this.navigator.navigate(entry).catch(error => { throw error; });
            }
            else {
                this.load(event.viewerState.instruction, { fromBrowser: true }).catch(error => { throw error; });
            }
        };
        /**
         * Processes the route/instructions in a (queued) navigation.
         *
         * @param evNavigation - The navigation to process
         *
         * @internal
         */
        this.processNavigation = async (navigation) => {
            // To avoid race condition double triggering at refresh
            this.loadedFirst = true;
            const options = this.configuration.options;
            // Get and initialize a navigation coordinator that will keep track of all endpoint's progresses
            // and make sure they're in sync when they are supposed to be (no `canLoad` before all `canUnload`
            // and so on).
            const coordinator = NavigationCoordinator.create(this, navigation, { syncStates: this.configuration.options.navigationSyncStates });
            this.coordinators.push(coordinator);
            // If there are instructions appended between/before any navigation,
            // append them to this navigation. (This happens with viewport defaults
            // during startup.)
            coordinator.appendInstructions(this.appendedInstructions.splice(0));
            this.ea.publish(RouterNavigationStartEvent.eventName, RouterNavigationStartEvent.create(navigation));
            // Invoke the transformFromUrl hook if it exists
            let transformedInstruction = typeof navigation.instruction === 'string' && !navigation.useFullStateInstruction
                ? await RoutingHook.invokeTransformFromUrl(navigation.instruction, coordinator.navigation)
                : (navigation.useFullStateInstruction ? navigation.fullStateInstruction : navigation.instruction);
            // If app uses a base path remove it if present (unless we're using fragment hash)
            const basePath = options.basePath;
            if (basePath !== null &&
                typeof transformedInstruction === 'string' && transformedInstruction.startsWith(basePath) &&
                !options.useUrlFragmentHash) {
                transformedInstruction = transformedInstruction.slice(basePath.length);
            }
            // TODO: Review this
            if (transformedInstruction === '/') {
                transformedInstruction = '';
            }
            if (typeof transformedInstruction === 'string') {
                if (transformedInstruction === '') {
                    transformedInstruction = [new RoutingInstruction('')]; // Make sure empty route is also processed
                    transformedInstruction[0].default = true;
                }
                else if (transformedInstruction === '-') {
                    transformedInstruction = [new RoutingInstruction('-'), new RoutingInstruction('')]; // Make sure clean all plus empty route is also processed
                    transformedInstruction[1].default = true;
                }
                else {
                    transformedInstruction = RoutingInstruction.parse(this, transformedInstruction);
                }
            }
            // The instruction should have a scope so use rootScope if it doesn't
            navigation.scope ??= this.rootScope.scope;
            // TODO(return): Only use navigation.scope for string and instructions without their own scope
            coordinator.appendInstructions(transformedInstruction);
            // If router options defaults to navigations being complete state navigation (containing the
            // complete set of routing instructions rather than just the ones that change), ensure
            // that there's an instruction to clear all non-specified viewports in all the scopes of
            // the top instructions. With viewports left and right containing components Alpha and Beta
            // respectively, doing 'gamma@left' as a complete state navigation would load Gamma in left and
            // unload Beta in right. In a partial navigation, Gamme would still be loaded but right would
            // be left as is.
            if (options.completeStateNavigations) {
                arrayUnique(transformedInstruction, false)
                    .map(instr => instr.scope)
                    .forEach(scope => coordinator.ensureClearStateInstruction(scope));
            }
            let guard = 100;
            do {
                if (!guard--) { // Guard against endless loop
                    this.unresolvedInstructionsError(navigation, coordinator.instructions);
                }
                // eslint-disable-next-line no-await-in-loop
                await coordinator.processInstructions();
            } while (coordinator.instructions.length > 0);
            // TODO: Look into adding everything above as well
            return Runner.run('processNavigation', () => {
                // console.log('### processNavigation DONE', coordinator.navigation.instruction, coordinator.navigation, coordinator);
                coordinator.closed = true;
                coordinator.finalEndpoint();
                return coordinator.waitForSyncState('completed');
            }, () => {
                coordinator.finalize();
                return this.updateNavigation(navigation);
            }, () => {
                // Remove history entry if no history endpoint updated
                if (navigation.navigation.new && !navigation.navigation.first && !navigation.repeating && coordinator.changedEndpoints.every(endpoint => endpoint.options.noHistory)) {
                    navigation.untracked = true;
                }
                // TODO: Review this when adding noHistory back
                // return this.navigator.finalize(navigation, this.coordinators.length === 1);
            }, async () => {
                while (this.coordinators.length > 0 && this.coordinators[0].completed) {
                    const coord = this.coordinators.shift();
                    // await this.updateNavigation(coord.navigation);
                    // eslint-disable-next-line no-await-in-loop
                    await this.navigator.finalize(coord.navigation, false /* this.coordinators.length === 0 */);
                    this.ea.publish(RouterNavigationCompleteEvent.eventName, RouterNavigationCompleteEvent.create(coord.navigation));
                    this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(coord.navigation));
                    coord.navigation.process?.resolve(true);
                }
            });
        };
    }
    /**
     * Whether the router is currently navigating.
     */
    get isNavigating() {
        return this.coordinators.length > 0;
    }
    /**
     * Whether the router has a navigation that's open for more
     * instructions to be appended.
     */
    get hasOpenNavigation() {
        return this.coordinators.filter(coordinator => !coordinator.closed).length > 0;
    }
    /**
     * Whether navigations are restricted/synchronized beyond the minimum.
     */
    get isRestrictedNavigation() {
        const syncStates = this.configuration.options.navigationSyncStates;
        return syncStates.includes('guardedLoad') ||
            syncStates.includes('unloaded') ||
            syncStates.includes('loaded') ||
            syncStates.includes('guarded') ||
            syncStates.includes('routed');
    }
    /**
     * Whether navigation history is stateful
     *
     * @internal
     */
    get statefulHistory() {
        return this.configuration.options.statefulHistoryLength !== void 0 && this.configuration.options.statefulHistoryLength > 0;
    }
    /**
     * Start the router, activing the event listeners.
     */
    start() {
        if (this.isActive) {
            throw createMappedError(2000 /* ErrorNames.router_started */);
        }
        this.isActive = true;
        const root = this.container.get(IAppRoot);
        // root.config.component shouldn't be used in the end. Metadata will probably eliminate it
        this.rootScope = new ViewportScope(this, 'rootScope', root.controller.viewModel, null, true, root.config.component);
        const options = this.configuration.options;
        // If base path isn't configured...
        if (options.basePath === null) {
            // ...get it from baseURI (base element href)
            const url = new URL(root.host.baseURI);
            options.basePath = url.pathname;
        }
        // Base path shouldn't end with '/' (to differentiate absolutes from relative)
        if (options.basePath.endsWith('/')) {
            options.basePath = options.basePath.slice(0, -1);
        }
        this.navigator.start({
            store: this.store,
            viewer: this.viewer,
            statefulHistoryLength: this.configuration.options.statefulHistoryLength,
        });
        this._navigatorStateChangeEventSubscription = this.ea.subscribe(NavigatorStateChangeEvent.eventName, this.handleNavigatorStateChangeEvent);
        this._navigatorNavigateEventSubscription = this.ea.subscribe(NavigatorNavigateEvent.eventName, this.handleNavigatorNavigateEvent);
        this.viewer.start({ useUrlFragmentHash: this.configuration.options.useUrlFragmentHash });
        this.ea.publish(RouterStartEvent.eventName, RouterStartEvent.create());
    }
    /**
     * Stop the router.
     */
    stop() {
        if (!this.isActive) {
            throw createMappedError(2001 /* ErrorNames.router_not_started */);
        }
        this.ea.publish(RouterStopEvent.eventName, RouterStopEvent.create());
        this.navigator.stop();
        this.viewer.stop();
        this._navigatorStateChangeEventSubscription.dispose();
        this._navigatorNavigateEventSubscription.dispose();
    }
    /**
     * Perform the initial load, using the current url.
     *
     * @internal
     */
    async initialLoad() {
        const { instruction, hash } = this.viewer.viewerState;
        const result = this.load(instruction, {
            fragment: hash,
            replacing: true,
            fromBrowser: false
        });
        this.loadedFirst = true;
        return result;
    }
    /** @internal */
    async _doHandleNavigatorNavigateEvent(event) {
        // TODO: Fix the fast-switch multiple navigations issue without this throttle
        if (this._isProcessingNav) {
            // We prevent multiple navigation at the same time, but we store the last navigation requested.
            if (this._pendingNavigation) {
                // This pending navigation is cancelled
                this._pendingNavigation.navigation.process?.resolve(false);
            }
            this._pendingNavigation = event;
            return;
        }
        this._isProcessingNav = true;
        try {
            await this.processNavigation(event.navigation);
        }
        catch (error) {
            event.navigation.process?.reject(error);
        }
        finally {
            this._isProcessingNav = false;
        }
        if (this._pendingNavigation) {
            const pending = this._pendingNavigation;
            this._pendingNavigation = undefined;
            await this._doHandleNavigatorNavigateEvent(pending);
        }
    }
    /**
     * Is processing navigation
     *
     * @internal
     */
    get isProcessingNav() {
        return this._isProcessingNav || this._pendingNavigation != null;
    }
    /**
     * Get a named endpoint of a specific type.
     *
     * @param type - The type of endpoint to get
     * @param name - The name of the endpoint to get
     */
    getEndpoint(type, name) {
        return this.allEndpoints(type).find(endpoint => endpoint.name === name) ?? null;
    }
    /**
     * Get all endpoints of a specific type.
     *
     * @param type - The type of the endpoints to get
     * @param includeDisabled - Whether disabled/non-active endpoints should be included
     * @param includeReplaced - Whether replaced endpoints should be included
     */
    allEndpoints(type, includeDisabled = false) {
        return this.rootScope.scope
            .allScopes(includeDisabled)
            .filter(scope => type === null || scope.type === type)
            .map(scope => scope.endpoint);
    }
    /**
     * Public API (not yet implemented)
     */
    addEndpoint(_type, ..._args) {
        throw createMappedError(99 /* ErrorNames.method_not_implemented */, 'addEndPoint');
    }
    /**
     * Connect an endpoint custom element to an endpoint. Called from the custom
     * elements of endopints.
     *
     * @param endpoint - An already connected endpoint
     * @param type - The type of the endpoint
     * @param connectedCE - The endpoint custom element
     * @param name - The name of the endpoint
     * @param options - The custom element options
     *
     * @internal
     */
    connectEndpoint(endpoint, type, connectedCE, name, options) {
        const container = connectedCE.container;
        const closestEndpoint = container.has(Router.closestEndpointKey, true)
            ? container.get(Router.closestEndpointKey)
            : this.rootScope;
        const parentScope = closestEndpoint.connectedScope;
        if (endpoint === null) {
            endpoint = parentScope.addEndpoint(type, name, connectedCE, options);
            Registration.instance(Router.closestEndpointKey, endpoint).register(container);
        }
        return endpoint;
    }
    /**
     * Disconnect an custom element endpoint from an endpoint. Called from the
     * custom elements of endpoints.
     *
     * @param step - The previous step in this transition Run
     * @param endpoint - The endpoint to disconnect from
     * @param connectedCE - The custom element to disconnect
     */
    disconnectEndpoint(step, endpoint, connectedCE) {
        if (!endpoint.connectedScope.parent.removeEndpoint(step, endpoint, connectedCE)) {
            throw createMappedError(2002 /* ErrorNames.router_remove_endpoint_failure */, endpoint.name);
        }
    }
    /**
     * Load navigation instructions.
     *
     * @param instructions - The instructions to load
     * @param options - The options to use when loading the instructions
     */
    async load(instructions, options) {
        options = options ?? {};
        instructions = this.extractFragment(instructions, options);
        instructions = this.extractQuery(instructions, options);
        let scope = null;
        ({ instructions, scope } = this.applyLoadOptions(instructions, options));
        const append = options.append ?? false;
        if (append !== false) {
            if (append instanceof NavigationCoordinator) {
                if (!append.closed) {
                    instructions = RoutingInstruction.from(this, instructions);
                    this.appendInstructions(instructions, scope, append);
                    // Can't return current navigation promise since it can lead to deadlock in load
                    return Promise.resolve();
                }
            }
            else {
                if (!this.loadedFirst || this.hasOpenNavigation) {
                    instructions = RoutingInstruction.from(this, instructions);
                    this.appendInstructions(instructions, scope);
                    // Can't return current navigation promise since it can lead to deadlock in load
                    return Promise.resolve();
                }
            }
        }
        const entry = Navigation.create({
            instruction: instructions,
            fullStateInstruction: '',
            scope: scope,
            title: options.title,
            data: options.data,
            query: options.query,
            fragment: options.fragment,
            parameters: options.parameters,
            replacing: (options.replacing ?? false) || options.replace,
            repeating: (options.append ?? false) !== false,
            fromBrowser: options.fromBrowser ?? false,
            origin: options.origin,
            completed: false,
        });
        return this.navigator.navigate(entry);
    }
    /**
     * Apply the load options on the instructions.
     *
     * @param loadInstructions - The instructions to load
     * @param options - The load options to apply when loading the instructions
     * @param keepString - Whether the load instructions should remain as a string (if it's a string)
     *
     */
    applyLoadOptions(loadInstructions, options, keepString = true) {
        options = options ?? {};
        if ('origin' in options && !('context' in options)) {
            options.context = options.origin;
        }
        const { scope, instruction } = RoutingScope.for(options.context ?? null, typeof loadInstructions === 'string' ? loadInstructions : undefined);
        if (typeof loadInstructions === 'string') {
            if (!keepString) {
                loadInstructions = RoutingInstruction.from(this, instruction);
                for (const loadInstruction of loadInstructions) {
                    if (loadInstruction.scope === null) {
                        loadInstruction.scope = scope;
                    }
                }
            }
            else {
                loadInstructions = instruction;
            }
        }
        else {
            loadInstructions = RoutingInstruction.from(this, loadInstructions);
            for (const loadInstruction of loadInstructions) {
                if (loadInstruction.scope === null) {
                    loadInstruction.scope = scope;
                }
            }
        }
        return {
            instructions: loadInstructions,
            scope,
        };
    }
    /**
     * Refresh/reload the current navigation
     */
    refresh() {
        return this.navigator.refresh();
    }
    /**
     * Go one step back in navigation history.
     */
    back() {
        return this.navigator.go(-1);
    }
    /**
     * Go one step forward in navigation history.
     */
    forward() {
        return this.navigator.go(1);
    }
    /**
     * Go a specified amount of steps back or forward in navigation history.
     *
     * @param delta - The amount of steps to go. A positive number goes
     * forward, a negative goes backwards.
     */
    go(delta) {
        return this.navigator.go(delta);
    }
    /**
     * Check whether a set of instructions are active. All instructions need
     * to be active for the condition to be true.
     *
     * @param instructions - The instructions to check
     * @param options - The load options to apply to the instructions to check
     */
    checkActive(instructions, options) {
        // TODO: Look into allowing strings/routes as well
        if (typeof instructions === 'string') {
            throw createMappedError(2003 /* ErrorNames.router_check_activate_string_error */, instructions);
        }
        options = options ?? {};
        // Make sure we have proper routing instructions
        ({ instructions } = this.applyLoadOptions(instructions, options));
        // If no scope is set, use the root scope
        instructions.forEach((instruction) => instruction.scope ??= this.rootScope.scope);
        // Get all unique involved scopes.
        const scopes = arrayUnique(instructions.map(instruction => instruction.scope));
        // Go through all the scopes and for each scope...
        for (const scope of scopes) {
            // ...get the matching (top/entry level) instructions...
            const scopeInstructions = scope.matchScope(instructions, false);
            // ...and active instructions (on any level) and...
            const scopeActives = scope.matchScope(this.activeComponents, true);
            // ...if any instruction, including next scope instructions, isn't found...
            if (!RoutingInstruction.contains(this, scopeActives, scopeInstructions, true)) {
                // ...the instructions are not considered active.
                return false;
            }
        }
        return true;
    }
    /**
     * Deal with/throw an unresolved instructions error.
     *
     * @param navigation - The failed navigation
     * @param instructions - The unresovled instructions
     */
    unresolvedInstructionsError(navigation, instructions) {
        this.ea.publish(RouterNavigationErrorEvent.eventName, RouterNavigationErrorEvent.create(navigation));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(navigation));
        throw createUnresolvedinstructionsError(instructions, this._logger);
    }
    /**
     * Cancel a navigation (without it being an error).
     *
     * @param navigation - The navigation to cancel
     * @param coordinator - The coordinator for the navigation
     */
    cancelNavigation(navigation, coordinator) {
        coordinator.cancel();
        this.ea.publish(RouterNavigationCancelEvent.eventName, RouterNavigationCancelEvent.create(navigation));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(navigation));
    }
    /**
     * Append instructions to the current navigation.
     *
     * @param instructions - The instructions to append
     * @param scope - The scope of the instructions
     */
    appendInstructions(instructions, scope = null, coordinator = null) {
        if (scope === null) {
            scope = this.rootScope.scope;
        }
        for (const instruction of instructions) {
            if (instruction.scope === null) {
                instruction.scope = scope;
            }
        }
        if (coordinator === null) {
            for (let i = this.coordinators.length - 1; i >= 0; i--) {
                if (!this.coordinators[i].closed) {
                    coordinator = this.coordinators[i];
                    break;
                }
            }
        }
        if (coordinator === null) {
            // If we haven't loaded the first instruction, the append is from
            // viewport defaults so we add them to router's appendInstructions
            // so they are added to the first navigation.
            if (!this.loadedFirst) {
                this.appendedInstructions.push(...instructions);
            }
            else {
                throw createMappedError(2004 /* ErrorNames.router_failed_appending_routing_instructions */);
            }
        }
        coordinator?.appendInstructions(instructions);
    }
    /**
     * Update the navigation with full state, url, query string and title. The
     * appropriate hooks are called. The `activeComponents` are also set.
     *
     * @param navigation - The navigation to update
     */
    async updateNavigation(navigation) {
        // Make sure instructions added not from root scope are properly parented
        // up to root scope
        this.rootScope.scope.reparentRoutingInstructions();
        const instructions = this.rootScope.scope.getRoutingInstructions(navigation.timestamp);
        // The following makes sure right viewport/viewport scopes are set and update
        // whether viewport name is necessary or not
        let { matchedInstructions } = this.rootScope.scope.matchEndpoints(instructions, [], true);
        let guard = 100;
        while (matchedInstructions.length > 0) {
            // Guard against endless loop
            if (guard-- === 0) {
                throw createMappedError(2005 /* ErrorNames.router_failed_finding_viewport_when_updating_viewer_path */);
            }
            matchedInstructions = matchedInstructions.map(instruction => {
                const { matchedInstructions } = instruction.endpoint.instance.scope.matchEndpoints(instruction.nextScopeInstructions ?? [], [], true);
                return matchedInstructions;
            }).flat();
        }
        if (navigation.timestamp >= (this.activeNavigation?.timestamp ?? 0)) {
            this.activeNavigation = navigation;
            this.activeComponents = instructions;
        }
        // const fullViewportStates: RoutingInstruction[] = [];
        // // Handle default / root page, because "-" + "" = "-" (so just a "clear")
        // const targetRoute = instructions.length === 1 ? instructions[0].route : null;
        // if (!(targetRoute != null && ((typeof targetRoute === 'string' && targetRoute === '') || ((targetRoute as FoundRoute).matching === '')))) {
        //   fullViewportStates.push(RoutingInstruction.create(RoutingInstruction.clear(this)) as RoutingInstruction);
        // }
        // fullViewportStates.push(...RoutingInstruction.clone(instructions, this.statefulHistory));
        // navigation.fullStateInstruction = fullViewportStates;
        // First invoke with viewport instructions (should it perhaps get full state?)
        let state = await RoutingHook.invokeTransformToUrl(instructions, navigation);
        if (typeof state !== 'string') {
            // Convert to string if necessary
            state = RoutingInstruction.stringify(this, state, { endpointContext: true });
        }
        // Invoke again with string
        state = await RoutingHook.invokeTransformToUrl(state, navigation);
        // Specified query has precedence over parameters
        if (navigation.query == null && navigation.parameters != null) {
            const search = new URLSearchParams();
            for (let [key, values] of Object.entries(navigation.parameters)) {
                key = encodeURIComponent(key);
                if (!Array.isArray(values)) {
                    values = [values];
                }
                for (const value of values) {
                    search.append(key, encodeURIComponent(value));
                }
            }
            navigation.query = search.toString();
        }
        // Add base path...
        let basePath = `${this.configuration.options.basePath}/`;
        // ...unless it's not set or we've got an absolute state/path (or we're using fragment hash)
        if (basePath === null || (state !== '' && state[0] === '/') ||
            this.configuration.options.useUrlFragmentHash) {
            basePath = '';
        }
        const query = ((navigation.query?.length ?? 0) > 0 ? "?" + navigation.query : '');
        const fragment = ((navigation.fragment?.length ?? 0) > 0 ? "#" + navigation.fragment : '');
        navigation.path = basePath + state + query + fragment;
        const path = navigation.path.slice(basePath.length);
        navigation.fullStateInstruction = RoutingInstruction.clear(this) + (path.length > 0 ? Separators.for(this).sibling : '') + path;
        if ((navigation.title ?? null) === null) {
            const title = await Title.getTitle(instructions, navigation, this.configuration.options.title);
            if (title !== null) {
                // eslint-disable-next-line require-atomic-updates
                navigation.title = title;
            }
        }
        return Promise.resolve();
    }
    /**
     * Extract and setup the fragment from instructions or options.
     *
     * @param instructions - The instructions to extract the fragment from
     * @param options - The options containing the fragment
     *
     * TODO: Review query extraction; different pos for path and fragment
     *
     * @internal
     */
    extractFragment(instructions, options) {
        // If instructions is a string and contains a fragment, extract it
        if (typeof instructions === 'string' && options.fragment == null) {
            const [path, fragment] = instructions.split('#');
            instructions = path;
            options.fragment = fragment;
        }
        return instructions;
    }
    /**
     * Extract and setup the query and parameters from instructions or options.
     *
     * @param instructions - The instructions to extract the query from
     * @param options - The options containing query and/or parameters
     *
     * TODO: Review query extraction; different pos for path and fragment
     *
     * @internal
     */
    extractQuery(instructions, options) {
        // If instructions is a string and contains a query string, extract it
        if (typeof instructions === 'string' && options.query == null) {
            const [path, search] = instructions.split('?');
            instructions = path;
            options.query = search;
        }
        // If parameters is a string, it's really a query string so move it
        if (typeof options.parameters === 'string' && options.query == null) {
            options.query = options.parameters;
            options.parameters = void 0;
        }
        if (typeof (options.query) === 'string' && options.query.length > 0) {
            options.parameters ??= {};
            const searchParams = new URLSearchParams(options.query);
            searchParams.forEach((value, key) => {
                key = decodeURIComponent(key);
                value = decodeURIComponent(value);
                if (key in options.parameters) {
                    if (!Array.isArray(options.parameters[key])) {
                        options.parameters[key] = [options.parameters[key]];
                    }
                    options.parameters[key].push(value);
                }
                else {
                    options.parameters[key] = value;
                }
            });
        }
        return instructions;
    }
}
Router.closestEndpointKey = Protocol.annotation.keyFor('closest-endpoint');
function createUnresolvedinstructionsError(remainingInstructions, logger) {
    // TODO: Improve error message, including suggesting solutions
    const error = createMappedError(2006 /* ErrorNames.router_infinite_instruction */, remainingInstructions.length);
    error.remainingInstructions = remainingInstructions;
    logger.warn(error, error.remainingInstructions);
    {
        // eslint-disable-next-line no-console
        console.log(error, error.remainingInstructions);
    }
    return error;
}
class RouterEvent {
    constructor(eventName) {
        this.eventName = eventName;
    }
}
class RouterStartEvent extends RouterEvent {
    static create() {
        return new RouterStartEvent(this.eventName);
    }
}
RouterStartEvent.eventName = 'au:router:router-start';
class RouterStopEvent extends RouterEvent {
    static create() {
        return new RouterStopEvent(this.eventName);
    }
}
RouterStopEvent.eventName = 'au:router:router-stop';
class RouterNavigationEvent {
    constructor(eventName, navigation) {
        this.eventName = eventName;
        this.navigation = navigation;
    }
}
class RouterNavigationStartEvent extends RouterNavigationEvent {
    static create(navigation) {
        return new RouterNavigationStartEvent(this.eventName, navigation);
    }
}
RouterNavigationStartEvent.eventName = 'au:router:navigation-start';
class RouterNavigationEndEvent extends RouterNavigationEvent {
    static create(navigation) {
        return new RouterNavigationEndEvent(this.eventName, navigation);
    }
}
RouterNavigationEndEvent.eventName = 'au:router:navigation-end';
class RouterNavigationCancelEvent extends RouterNavigationEvent {
    static create(navigation) {
        return new RouterNavigationCancelEvent(this.eventName, navigation);
    }
}
RouterNavigationCancelEvent.eventName = 'au:router:navigation-cancel';
class RouterNavigationCompleteEvent extends RouterNavigationEvent {
    static create(navigation) {
        return new RouterNavigationCompleteEvent(this.eventName, navigation);
    }
}
RouterNavigationCompleteEvent.eventName = 'au:router:navigation-complete';
class RouterNavigationErrorEvent extends RouterNavigationEvent {
    static create(navigation) {
        return new RouterNavigationErrorEvent(this.eventName, navigation);
    }
}
RouterNavigationErrorEvent.eventName = 'au:router:navigation-error';

const ILinkHandler = /*@__PURE__*/ DI.createInterface('ILinkHandler', x => x.singleton(LinkHandler));
/**
 * Class responsible for handling interactions that should trigger navigation.
 */
class LinkHandler {
    constructor() {
        this.window = resolve(IWindow);
        this.router = resolve(IRouter);
    }
    handleEvent(e) {
        this.handleClick(e);
    }
    handleClick(event) {
        // Only process clean left click
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }
        const target = event.currentTarget;
        // Ignore links with the `external` attribute
        if (target.hasAttribute('external')) {
            return;
        }
        // Only process links into this window
        const targetWindow = target.getAttribute('target') ?? '';
        if (targetWindow.length > 0 && targetWindow !== this.window.name && targetWindow !== '_self') {
            return;
        }
        const loadAttr = CustomAttribute.for(target, 'load');
        const load = loadAttr !== void 0 ? loadAttr.viewModel.value : null;
        const href = this.router.configuration.options.useHref && target.hasAttribute('href') ? target.getAttribute('href') : null;
        // Ignore empty links
        if ((load === null || load.length === 0) && (href === null || href.length === 0)) {
            return;
        }
        // This link is for us, so prevent default behaviour
        event.preventDefault();
        let instruction = load ?? href ?? '';
        if (typeof instruction === 'string' && instruction.startsWith('#')) {
            instruction = instruction.slice(1);
            // '#' === '/' === '#/'
            // TODO: Investigate if this is still valid (don't think so)
            if (!instruction.startsWith('/')) {
                instruction = `/${instruction}`;
            }
        }
        this.router.load(instruction, { origin: target }).catch(error => { throw error; });
    }
}

function route(configOrPath) {
    return function (target, context) {
        context.addInitializer(function () {
            Route.configure(configOrPath, target);
        });
        return target;
    };
}

/**
 * Get either a provided value or the value of an html attribute,
 * depending on `useValue`. If `doExistCheck` is `true` the
 * existence of the html attribute is returned, regardless of
 * `useValue` (or `value`).
 *
 * @param name - Attribute name
 * @param value - The value that's used if `useValue` or if
 * the attribute doesn't exist on the element (so it's also default)
 * @param useValue - Whether the value should be used (unless check exists)
 * @param element - The element with the attributes
 * @param doExistCheck - Whether only the existence of the html attribute
 * should be checked and returned as a boolean
 */
function getValueOrAttribute(name, value, useValue, element, doExistCheck = false) {
    // If an attribute exist check is requested, Aurelia sets the value to ""
    if (doExistCheck) {
        return value === "";
        // return element.hasAttribute(name);
    }
    if (useValue) {
        return value;
    }
    const attribute = element.getAttribute(name) ?? '';
    // If no or empty attribute, the provided value serves as default
    return attribute.length > 0 ? attribute : value;
}
/**
 * Make it possible to wait for router start by subscribing to the
 * router start event and return a promise that's resolved when
 * the router start event fires.
 */
function waitForRouterStart(router, ea) {
    if (router.isActive) {
        return;
    }
    return new Promise((resolve) => {
        const subscription = ea.subscribe(RouterStartEvent.eventName, () => {
            resolve();
            subscription.dispose();
        });
    });
}
function getConsideredActiveInstructions(router, controller, element, value) {
    let activeInstructions = CustomAttribute
        .for(element, 'considered-active')?.viewModel?.value;
    if (activeInstructions === void 0) {
        activeInstructions = value;
    }
    const created = router.applyLoadOptions(activeInstructions, { context: controller });
    const instructions = RoutingInstruction.from(router, created.instructions);
    for (const instruction of instructions) {
        if (instruction.scope === null) {
            instruction.scope = created.scope;
        }
    }
    return instructions;
}
function getLoadIndicator(element) {
    let indicator = element.parentElement;
    while (indicator != null) {
        if (indicator.tagName === 'AU-VIEWPORT') {
            indicator = null;
            break;
        }
        if (indicator.hasAttribute('load-active')) {
            break;
        }
        indicator = indicator.parentElement;
    }
    indicator ??= element;
    return indicator;
}
/** @internal */ const bmToView = BindingMode.toView;

const ParentViewport = CustomElement.createInjectable();
class ViewportCustomElement {
    constructor() {
        /**
         * The name of the viewport. Should be unique within the routing scope.
         */
        this.name = 'default';
        /**
         * A list of components that is using the viewport. These components
         * can only be loaded into this viewport and this viewport can't
         * load any other components.
         */
        this.usedBy = '';
        /**
         * The default component that's loaded if the viewport is created
         * without having a component specified (in that navigation).
         */
        this.default = '';
        /**
         * The component loaded if the viewport can't load the specified
         * component. The component is passed as a parameter to the fallback.
         */
        this.fallback = '';
        /**
         * Whether the fallback action is to load the fallback component in
         * place of the unloadable component and continue with any child
         * instructions or if the fallback is to be called and the processing
         * of the children to be aborted.
         */
        this.fallbackAction = '';
        /**
         * Indicates that the viewport has no scope.
         */
        this.noScope = false;
        /**
         * Indicates that the viewport doesn't add a content link to
         * the Location URL.
         */
        this.noLink = false;
        /**
         * Indicates that the viewport doesn't add a title to the browser
         * window title.
         */
        this.noTitle = false;
        /**
         * Indicates that the viewport doesn't add history content to
         * the History API.
         */
        this.noHistory = false;
        /**
         * Whether the components of the viewport are stateful or not.
         */
        this.stateful = false;
        /**
         * The connected Viewport.
         */
        this.endpoint = null;
        /**
         * Child viewports waiting to be connected.
         */
        this.pendingChildren = [];
        /**
         * Promise to await while children are waiting to be connected.
         */
        this.pendingPromise = null;
        /**
         * Whether the viewport is bound or not.
         */
        this.isBound = false;
        this.router = resolve(IRouter);
        this.element = resolve(INode);
        this.container = resolve(IContainer);
        this.ea = resolve(IEventAggregator);
        this.parentViewport = resolve(ParentViewport);
        this.instruction = resolve(IInstruction);
    }
    hydrated(controller) {
        this.controller = controller;
        // TODO: Below was here for a reason, investigate if no longer necessary
        // this.container = controller.container;
        // eslint-disable-next-line
        const hasDefault = this.instruction.props.filter((instr) => instr.to === 'default').length > 0;
        if (hasDefault && this.parentViewport != null) {
            this.parentViewport.pendingChildren.push(this);
            if (this.parentViewport.pendingPromise === null) {
                this.parentViewport.pendingPromise = new OpenPromise(`hydrated: ViewportCustomElement`);
            }
        }
        Runner.run(null, 
        // The first viewport(s) might be hydrated before the router is started
        () => waitForRouterStart(this.router, this.ea), () => {
            // Only call connect this early if we need to
            if (this.router.isRestrictedNavigation) {
                this.connect();
            }
        });
    }
    binding(initiator, _parent) {
        this.isBound = true;
        return Runner.run('binding', 
        // The first viewport(s) might be bound before the router is started
        () => waitForRouterStart(this.router, this.ea), () => {
            // Prefer to connect here since we've got bound data in component
            if (!this.router.isRestrictedNavigation) {
                this.connect();
            }
        }, () => {
            // TODO(post-alpha): Consider using an event instead (not a priority)
            // If a content is waiting for us to be connected...
            if (this.endpoint?.activeResolve != null) {
                // ...resolve the promise
                this.endpoint.activeResolve();
                this.endpoint.activeResolve = null;
            }
        }, () => {
            if (this.endpoint !== null && this.endpoint.getNextContent() === null) {
                return this.endpoint.activate(null, initiator, this.controller, /* true, */ void 0)?.asValue;
                // TODO: Restore scroll state (in attaching/attached)
            }
        });
    }
    detaching(initiator, parent) {
        if (this.endpoint !== null) {
            // TODO: Save scroll state before detach
            this.isBound = false;
            return this.endpoint.deactivate(null, initiator, parent);
        }
    }
    unbinding(_initiator, _parent) {
        if (this.endpoint !== null) {
            // TODO: Don't unload when stateful, instead save to cache. Something like
            // this.viewport.cacheContent();
            // Disconnect doesn't destroy anything, just disconnects it
            return this.disconnect(null);
        }
    }
    dispose() {
        this.endpoint?.dispose();
        this.endpoint = null;
    }
    /**
     * Connect this custom element to a router endpoint (Viewport).
     */
    connect() {
        const { isBound, element } = this;
        // Collect custom element options from either properties (if the custom
        // element has been bound) or from html attributes (booleans are always
        // set based on whether html attribute exists)
        const name = getValueOrAttribute('name', this.name, isBound, element);
        const options = {};
        // Endpoint property is `scope` but html attribute is `no-scope` so negate it
        options.scope = !getValueOrAttribute('no-scope', this.noScope, false, element, true);
        options.usedBy = getValueOrAttribute('used-by', this.usedBy, isBound, element);
        options.default = getValueOrAttribute('default', this.default, isBound, element);
        options.fallback = getValueOrAttribute('fallback', this.fallback, isBound, element);
        options.fallbackAction = getValueOrAttribute('fallback-action', this.fallbackAction, isBound, element);
        options.noLink = getValueOrAttribute('no-link', this.noLink, isBound, element, true);
        options.noTitle = getValueOrAttribute('no-title', this.noTitle, isBound, element, true);
        options.noHistory = getValueOrAttribute('no-history', this.noHistory, isBound, element, true);
        options.stateful = getValueOrAttribute('stateful', this.stateful, isBound, element, true);
        Object
            .keys(options)
            .forEach(key => {
            if (options[key] === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete options[key];
            }
        });
        this.endpoint = this.router.connectEndpoint(this.endpoint, 'Viewport', this, name, options);
        const parentViewport = this.parentViewport;
        if (parentViewport != null) {
            arrayRemove(parentViewport.pendingChildren, child => child === this);
            if (parentViewport.pendingChildren.length === 0 && parentViewport.pendingPromise !== null) {
                parentViewport.pendingPromise.resolve();
                parentViewport.pendingPromise = null;
            }
        }
    }
    /**
     * Disconnect this custom element from its router endpoint (Viewport).
     */
    disconnect(step) {
        if (this.endpoint !== null) {
            this.router.disconnectEndpoint(step, this.endpoint, this);
        }
    }
    /**
     * Set whether the viewport is currently active or not. Adds or removes
     * activity classes to the custom element
     *
     * @param active - Whether the viewport is active or not
     */
    setActivity(state, active) {
        const prefix = this.router.configuration.options.indicators.viewportNavigating;
        if (typeof state === 'string') {
            this.element.classList.toggle(state, active);
        }
        else {
            for (const key in state) {
                this.element.classList.toggle(`${prefix}-${key}`, active && state[key]);
            }
        }
    }
}
CustomElement.define({
    name: 'au-viewport',
    injectable: ParentViewport,
    bindables: ['name', 'usedBy', 'default', 'fallback', 'fallbackAction', 'noScope', 'noLink', 'noTitle', 'noHistory', 'stateful']
}, ViewportCustomElement);

/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
const ParentViewportScope = CustomElement.createInjectable();
class ViewportScopeCustomElement {
    constructor() {
        this.name = 'default';
        this.catches = '';
        this.collection = false;
        this.source = null;
        this.viewportScope = null;
        this.isBound = false;
        this.router = resolve(IRouter);
        this.element = resolve(INode);
        this.container = resolve(IContainer);
        this.parent = resolve(ParentViewportScope);
        this.parentController = resolve(IController);
    }
    // Maybe this really should be here. Check with Binh.
    // public create(
    //   controller: IDryCustomElementController<this>,
    //   parentContainer: IContainer,
    //   definition: CustomElementDefinition,
    //   parts: PartialCustomElementDefinitionParts | undefined,
    // ): PartialCustomElementDefinition {
    //   // TODO(fkleuver): describe this somewhere in the docs instead
    //   // Under the condition that there is no `replace` attribute on this custom element's declaration,
    //   // and this custom element is containerless, its content will be placed in a part named 'default'
    //   // See packages/jit-html/src/template-binder.ts line 411 (`replace = 'default';`) for the logic that governs this.
    //   // We could tidy this up into a formal api in the future. For now, there are two ways to do this:
    //   // 1. inject the `@IInstruction` (IHydrateElementInstruction) and grab .parts['default'] from there, manually creating a view factory from that, etc.
    //   // 2. what we're doing right here: grab the 'default' part from the create hook and return it as the definition, telling the render context to use that part to compile this element instead
    //   // This effectively causes this element to render its declared content as if it was its own template.
    //   // We do need to set `containerless` to true on the part definition so that the correct projector is used since parts default to non-containerless.
    //   // Otherwise, the controller will try to do `appendChild` on a comment node when it has to do `insertBefore`.
    //   // Also, in this particular scenario (specific to viewport-scope) we need to clone the part so as to prevent the resulting compiled definition
    //   // from ever being cached. That's the only reason why we're spreading the part into a new object for `getOrCreate`. If we didn't clone the object, this specific element wouldn't work correctly.
    //   const part = parts!['default'];
    //   return CustomElementDefinition.getOrCreate({ ...part, containerless: true });
    // }
    hydrated(controller) {
        this.controller = controller;
    }
    bound(_initiator, _parent) {
        this.isBound = true;
        this.$controller.scope = this.parentController.scope;
        this.connect();
        if (this.viewportScope !== null) {
            this.viewportScope.binding();
        }
    }
    unbinding(_initiator, _parent) {
        if (this.viewportScope !== null) {
            this.viewportScope.unbinding();
        }
        return Promise.resolve();
    }
    connect() {
        if (this.router.rootScope === null) {
            return;
        }
        const name = this.getAttribute('name', this.name);
        const options = {};
        let value = this.getAttribute('catches', this.catches);
        if (value !== void 0) {
            options.catches = value;
        }
        value = this.getAttribute('collection', this.collection, true);
        if (value !== void 0) {
            options.collection = value;
        }
        // TODO: Needs to be bound? How to solve?
        options.source = this.source ?? null;
        this.viewportScope = this.router.connectEndpoint(this.viewportScope, 'ViewportScope', this, name, options);
    }
    disconnect() {
        if (this.viewportScope) {
            this.router.disconnectEndpoint(null, this.viewportScope, this);
        }
        this.viewportScope = null;
    }
    getAttribute(key, value, checkExists = false) {
        if (this.isBound) {
            return value;
        }
        else {
            if (this.element.hasAttribute(key)) {
                if (checkExists) {
                    return true;
                }
                else {
                    value = this.element.getAttribute(key);
                    if (value.length > 0) {
                        return value;
                    }
                }
            }
        }
        return void 0;
    }
}
CustomElement.define({
    name: 'au-viewport-scope',
    template: '<template></template>',
    containerless: false,
    injectable: ParentViewportScope,
    bindables: ['name', 'catches', 'collection', 'source'],
}, ViewportScopeCustomElement);

class LoadCustomAttribute {
    constructor() {
        /** @internal */ this._separateProperties = false;
        this.hasHref = null;
        this.element = resolve(INode);
        this.router = resolve(IRouter);
        this.linkHandler = resolve(ILinkHandler);
        this.ea = resolve(IEventAggregator);
        this.activeClass = this.router.configuration.options.indicators.loadActive;
        this.navigationEndHandler = (_navigation) => {
            void this.updateActive();
        };
    }
    binding() {
        if (this.value == null) {
            this._separateProperties = true;
        }
        this.element.addEventListener('click', this.linkHandler);
        this.updateValue();
        void this.updateActive();
        this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
    }
    unbinding() {
        this.element.removeEventListener('click', this.linkHandler);
        this.routerNavigationSubscription.dispose();
    }
    valueChanged(_newValue) {
        this.updateValue();
        void this.updateActive();
    }
    updateValue() {
        if (this._separateProperties) {
            this.value = {
                component: this.component,
                parameters: this.parameters,
                viewport: this.viewport,
                id: this.id,
            };
        }
        if (this.hasHref === null) {
            this.hasHref = this.element.hasAttribute('href');
        }
        if (!this.hasHref) {
            let value = this.value;
            if (typeof value !== 'string') {
                const instruction = RoutingInstruction.from(this.router, value).shift();
                const found = this._findRoute(value);
                if (found.foundConfiguration) {
                    instruction.route = found.matching;
                }
                value = RoutingInstruction.stringify(this.router, [instruction]);
            }
            const { scope, instruction } = RoutingScope.for(this.element, value);
            const scopePath = scope?.path ?? '';
            value = `${scopePath}${instruction ?? ''}`;
            if (this.router.configuration.options.useUrlFragmentHash && !value.startsWith('#')) {
                value = `#/${value}`;
            }
            this.element.setAttribute('href', value);
        }
    }
    async updateActive() {
        const controller = CustomAttribute.for(this.element, 'load').parent;
        const routeValue = typeof this.value === 'string' ? { id: this.value, path: this.value } : this.value;
        const found = this._findRoute(routeValue);
        const instructions = found.foundConfiguration
            ? found.instructions
            : getConsideredActiveInstructions(this.router, controller, this.element, this.value);
        const element = getLoadIndicator(this.element);
        element.classList.toggle(this.activeClass, this.router.checkActive(instructions, { context: controller }));
    }
    /** @internal */
    _findRoute(value) {
        if (typeof value === 'string') {
            return new FoundRoute();
        }
        const scope = RoutingScope.for(this.element).scope ?? this.router.rootScope.scope;
        if (value.id != null) {
            return scope.findMatchingRoute(value.id, value.parameters ?? {});
        }
        const path = value.path;
        if (path != null) {
            return scope.findMatchingRoute(path, value.parameters ?? {});
        }
        return new FoundRoute();
    }
}
CustomAttribute.define({
    name: 'load',
    bindables: {
        value: { mode: bmToView },
        component: {},
        parameters: {},
        viewport: {},
        id: {},
    }
}, LoadCustomAttribute);

class HrefCustomAttribute {
    constructor() {
        this.element = resolve(INode);
        this.router = resolve(IRouter);
        this.linkHandler = resolve(ILinkHandler);
        this.ea = resolve(IEventAggregator);
        this.activeClass = this.router.configuration.options.indicators.loadActive;
        this.navigationEndHandler = (_navigation) => {
            this.updateActive();
        };
    }
    binding() {
        if (this.router.configuration.options.useHref && !this.hasLoad() && !this.element.hasAttribute('external')) {
            this.element.addEventListener('click', this.linkHandler);
            this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
        }
        this.updateValue();
        this.updateActive();
    }
    unbinding() {
        this.element.removeEventListener('click', this.linkHandler);
        this.routerNavigationSubscription?.dispose();
    }
    valueChanged() {
        this.updateValue();
        this.updateActive();
    }
    updateValue() {
        this.element.setAttribute('href', this.value);
    }
    updateActive() {
        if (this.router.configuration.options.useHref && !this.hasLoad() && !this.element.hasAttribute('external')) {
            const controller = CustomAttribute.for(this.element, 'href').parent;
            const instructions = getConsideredActiveInstructions(this.router, controller, this.element, this.value);
            const element = getLoadIndicator(this.element);
            element.classList.toggle(this.activeClass, this.router.checkActive(instructions, { context: controller }));
        }
    }
    hasLoad() {
        const parent = this.$controller.parent;
        const siblings = parent.children;
        return siblings?.some(c => c.vmKind === 'customAttribute' && c.viewModel instanceof LoadCustomAttribute) ?? false;
    }
}
HrefCustomAttribute.$au = {
    type: 'custom-attribute',
    name: 'href',
    noMultiBindings: true,
    bindables: {
        value: { mode: bmToView }
    }
};

class ConsideredActiveCustomAttribute {
}
CustomAttribute.define({ name: 'considered-active', bindables: { value: { mode: bmToView } } }, ConsideredActiveCustomAttribute);

const IRouterConfiguration = /*@__PURE__*/ DI.createInterface('IRouterConfiguration', x => x.singleton(RouterConfiguration));
const RouterRegistration = IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
const DefaultComponents = [
    RouterRegistration,
];
const ViewportCustomElementRegistration = ViewportCustomElement;
const ViewportScopeCustomElementRegistration = ViewportScopeCustomElement;
const LoadCustomAttributeRegistration = LoadCustomAttribute;
const HrefCustomAttributeRegistration = HrefCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`, `au-nav`
 * - Custom Attributes: `goto`, `load`, `href`
 */
const DefaultResources = [
    ViewportCustomElement,
    ViewportScopeCustomElement,
    LoadCustomAttribute,
    HrefCustomAttribute,
    ConsideredActiveCustomAttribute,
];
/**
 * A DI configuration object containing router resource registrations
 * and the router options API.
 */
class RouterConfiguration {
    /**
     * Register this configuration in a provided container and
     * register app tasks for starting and stopping the router.
     *
     * @param container - The container to register in
     */
    static register(container) {
        const _this = container.get(IRouterConfiguration);
        // Transfer options (that's possibly modified through .customize)
        _this.options = RouterConfiguration.options;
        _this.options.setRouterConfiguration(_this);
        // Reset defaults
        RouterConfiguration.options = RouterOptions.create();
        return container.register(...DefaultComponents, ...DefaultResources, AppTask.activating(IRouter, RouterConfiguration.configurationCall), AppTask.activated(IRouter, (router) => router.initialLoad()), AppTask.deactivated(IRouter, (router) => router.stop()));
    }
    /**
     * Make it possible to specify options to Router activation.
     *
     * @param config - Either a config object that's passed to router's
     * start or a config function that's called instead of router's start.
     */
    static customize(config) {
        if (config === undefined) {
            RouterConfiguration.options = RouterOptions.create();
            RouterConfiguration.configurationCall = (router) => {
                router.start();
            };
        }
        else if (config instanceof Function) {
            RouterConfiguration.configurationCall = config;
        }
        else {
            RouterConfiguration.options = RouterOptions.create();
            RouterConfiguration.options.apply(config);
        }
        return RouterConfiguration;
    }
    /**
     * Create a new container with this configuration applied to it.
     */
    static createContainer() {
        return this.register(DI.createContainer());
    }
    /**
     * Get the router configuration for a context.
     *
     * @param context - The context to get the configuration for
     */
    static for(context) {
        if (context instanceof Router) {
            return context.configuration;
        }
        return context.get(IRouterConfiguration);
    }
    /**
     * Apply router options.
     *
     * @param options - The options to apply
     * @param firstResetDefaults - Whether the default router options should
     * be set before applying the specified options
     */
    apply(options, firstResetDefaults = false) {
        if (firstResetDefaults) {
            this.options = RouterOptions.create();
        }
        this.options.apply(options);
    }
    addHook(hookFunction, options) {
        return RoutingHook.add(hookFunction, options);
    }
    /**
     * Remove a routing hook.
     *
     * @param id - The id of the hook to remove (returned from the addHook call)
     */
    removeHook(id) {
        return RoutingHook.remove(id);
    }
    /**
     * Remove all routing hooks.
     */
    removeAllHooks() {
        return RoutingHook.removeAll();
    }
}
// ONLY used during registration to support .customize. Transfered to
// instance property after that.
RouterConfiguration.options = RouterOptions.create();
RouterConfiguration.configurationCall = (router) => {
    router.start();
};

export { ConfigurableRoute, ConsideredActiveCustomAttribute, DefaultComponents, DefaultResources, Endpoint$1 as Endpoint, EndpointContent, FoundRoute, HrefCustomAttribute, HrefCustomAttributeRegistration, ILinkHandler, IRouter, IRouterConfiguration, InstructionParameters, LinkHandler, LoadCustomAttribute, LoadCustomAttributeRegistration, Navigation, NavigationCoordinator, NavigationFlags, Navigator, RecognizedRoute, Endpoint as RecognizerEndpoint, Route, RouteRecognizer, Router, RouterConfiguration, RouterNavigationCancelEvent, RouterNavigationCompleteEvent, RouterNavigationEndEvent, RouterNavigationErrorEvent, RouterNavigationStartEvent, RouterOptions, RouterRegistration, RouterStartEvent, RouterStopEvent, Routes, RoutingHook, RoutingInstruction, RoutingScope, Runner, Step, Viewport, ViewportContent, ViewportCustomElement, ViewportCustomElementRegistration, ViewportOptions, ViewportScope, ViewportScopeContent, ViewportScopeCustomElement, ViewportScopeCustomElementRegistration, route, routes };
//# sourceMappingURL=index.dev.mjs.map
