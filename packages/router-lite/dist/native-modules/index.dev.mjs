import { DI, resolve, IEventAggregator, ILogger, emptyArray, onResolve, getResourceKeyFor, onResolveAll, emptyObject, isObjectOrFunction, IContainer, Registration, isArrayIndex, IModuleLoader, InstanceProvider, noop } from '../../../kernel/dist/native-modules/index.mjs';
import { BindingMode, isCustomElementViewModel, IHistory, ILocation, IWindow, CustomElement, CustomElementDefinition, Controller, IPlatform, MountTarget, IController, IAppRoot, isCustomElementController, registerHostNode, CustomAttribute, INode, refs, AppTask } from '../../../runtime-html/dist/native-modules/index.mjs';
import { RESIDUE, RecognizedRoute, Endpoint, ConfigurableRoute, RouteRecognizer } from '../../../route-recognizer/dist/native-modules/index.mjs';
import { Metadata } from '../../../metadata/dist/native-modules/index.mjs';
import { IObserverLocator, batch } from '../../../runtime/dist/native-modules/index.mjs';

/**
 * Ranges
 * - viewport        : 3000 - 3049
 * - component agent : 3050 - 3099
 * - location manager: 3100 - 3149
 * - route-context   : 3150 - 3199
 * - router-events   : 3200 - 3249
 * - router          : 3250 - 3299
 * - viewport agent  : 3300 - 3400
 * - instruction     : 3400 - 3449
 * - navigation model: 3450 - 3499
 * - expression      : 3500 - 3549
 * - route           : 3550 - 3599
 */

const eventMessageMap = {
    // #region viewport
    [3000 /* Events.vpHydrated */]: 'hydrated',
    [3001 /* Events.vpAttaching */]: 'attaching',
    [3002 /* Events.vpDetaching */]: 'detaching',
    [3003 /* Events.vpDispose */]: 'dispose',
    // #endregion
    // #region component agent
    [3050 /* Events.caCreated */]: 'created',
    [3051 /* Events.caActivateSelf */]: 'activating - self',
    [3052 /* Events.caActivateInitiator */]: 'activating - via initiator',
    [3053 /* Events.caDeactivateSelf */]: 'deactivating - self',
    [3054 /* Events.caDeactivateInitiator */]: 'deactivating - via initiator',
    [3055 /* Events.caDispose */]: 'disposing',
    [3056 /* Events.caCanUnload */]: 'canUnload(next:%s) - invoking %s hooks',
    [3057 /* Events.caCanLoad */]: 'canLoad(next:%s) - invoking %s hooks',
    [3058 /* Events.caUnloading */]: 'unloading(next:%s) - invoking %s hooks',
    [3059 /* Events.caLoading */]: 'loading(next:%s) - invoking %s hooks',
    // #endregion
    // #region location manager
    [3100 /* Events.lmBaseHref */]: 'baseHref set to path: %s',
    [3101 /* Events.lmStartListening */]: 'starting listening to %s',
    [3102 /* Events.lmStopListening */]: 'stopping listening to %s',
    [3103 /* Events.lmPushState */]: 'pushing to history state: %s (title: \'%s\', url: \'%s\')',
    [3104 /* Events.lmReplaceState */]: 'replacing history state: %s (title: \'%s\', url: \'%s\')',
    [3105 /* Events.lmPushStateNonSerializable */]: 'pushing to history state: NOT_SERIALIZABLE (title: \'%s\', url: \'%s\')',
    [3106 /* Events.lmReplaceStateNonSerializable */]: 'replacing history state: NOT_SERIALIZABLE (title: \'%s\', url: \'%s\')',
    // #endregion
    // #region route context
    [3150 /* Events.rcCreated */]: 'created',
    [3151 /* Events.rcNodeChanged */]: 'Node changed from %s to %s',
    [3152 /* Events.rcResolveNullishContext */]: 'The given context is nullish (%s); resolving to root RouteContext',
    [3153 /* Events.rcResolveInstance */]: 'The given context (%s) is an instance of RouteContext; resolving to it',
    [3154 /* Events.rcResolveNode */]: 'The given context is a node (nodeName:%s); resolving RouteContext from controller\'s RenderContext',
    [3155 /* Events.rcResolveNodeFailed */]: 'Failed to resolve RouteContext from node %s; error: %s',
    [3156 /* Events.rcResolveCe */]: 'The given context is a custom element viewmodel (name:%s); resolving RouteContext from controller\'s RenderContext',
    [3157 /* Events.rcResolveCtrl */]: 'The given context is a custom element controller (name:%s); resolving RouteContext from controller\'s RenderContext',
    [3158 /* Events.rcResolveVpa */]: 'Resolving viewport agent for the request: %s',
    [3159 /* Events.rcCreateCa */]: 'Creating component agent for the node: %s',
    [3160 /* Events.rcRegisterVp */]: 'Registering viewport: %s',
    [3161 /* Events.rcRegisterVpSkip */]: 'Skipping registering viewport: %s; it is already registered',
    [3162 /* Events.rcUnregisterVp */]: 'Unregistering viewport: %s',
    [3163 /* Events.rcUnregisterVpSkip */]: 'Skipping unregistering viewport: %s; it is not registered',
    [3164 /* Events.rcRecognizePath */]: 'Recognizing path: %s',
    [3165 /* Events.rcAddRoute */]: 'Adding route: %s',
    [3166 /* Events.rcEagerPathGenerationFailed */]: 'Unable to eagerly generate path for %s; reasons: %s',
    [3167 /* Events.rcNoAppRoot */]: 'The provided container has no registered IAppRoot. RouteContext.setRoot can only be used after Aurelia.app was called, on a container that is within that app\'s component tree.',
    [3168 /* Events.rcHasRootContext */]: 'A root RouteContext is already registered. A possible cause is the RouterConfiguration being registered more than once in the same container tree. If you have a multi-rooted app, make sure you register RouterConfiguration only in the "forked" containers and not in the common root.',
    [3169 /* Events.rcNoRootCtrl */]: 'The provided IAppRoot does not (yet) have a controller. A possible cause is calling this API manually before Aurelia.start() is called',
    [3170 /* Events.rcResolveInvalidCtxType */]: 'Invalid context type: %s',
    [3171 /* Events.rcNoNode */]: 'Invariant violation: RouteNode should be set immediately after the RouteContext is created. Context: %s',
    [3172 /* Events.rcNoVpa */]: 'RouteContext has no ViewportAgent: %s',
    [3173 /* Events.rcNoPathLazyImport */]: 'Invalid route config. When the component property is a lazy import, the path must be specified.',
    [3174 /* Events.rcNoAvailableVpa */]: 'Failed to resolve %s at:\n%s',
    [3175 /* Events.rcInvalidLazyImport */]: '%s does not appear to be a component or CustomElement recognizable by Aurelia; make sure to use the @customElement decorator for your class if not using conventions.',
    // #endregion
    // #region router events
    [3200 /* Events.rePublishingEvent */]: 'Publishing event: %s',
    [3201 /* Events.reInvokingSubscriber */]: 'Invoking subscriber #%s (event: %s)',
    // #endregion
    // #region router
    [3250 /* Events.rtrLoading */]: 'Loading instruction: %s',
    [3251 /* Events.rtrIsActive */]: 'Checking if the route %s is active in context %s',
    [3252 /* Events.rtrResolvingRcExisting */]: 'Resolving existing RouteContext for %s',
    [3253 /* Events.rtrResolvingRcNew */]: 'Creating new RouteContext for %s',
    [3254 /* Events.rtrIgnoringIdenticalNav */]: 'Ignoring navigation triggered by \'%s\' because it is the same URL as the previous navigation which was triggered by \'api\'.',
    [3255 /* Events.rtrReusingPromise */]: 'Reusing promise/resolve/reject from the previously failed transition %s',
    [3256 /* Events.rtrSchedulingTr */]: 'Scheduling transition: %s',
    [3257 /* Events.rtrTrSucceeded */]: 'Transition succeeded: %s',
    [3258 /* Events.rtrRunBegin */]: 'Running transition: %s',
    [3259 /* Events.rtrRunCancelled */]: 'Aborting transition %s because a new transition was queued in response to the NavigationStartEvent',
    [3260 /* Events.rtrRunVitCompile */]: 'Compiling viewport instructions tree %s',
    [3261 /* Events.rtrRunCanUnload */]: 'invoking canUnload on %s nodes',
    [3262 /* Events.rtrRunCanLoad */]: 'invoking canLoad on %s nodes',
    [3263 /* Events.rtrRunUnloading */]: 'invoking unloading on %s nodes',
    [3264 /* Events.rtrRunLoading */]: 'invoking loading on %s nodes',
    [3265 /* Events.rtrRunSwapping */]: 'invoking swapping on %s nodes',
    [3266 /* Events.rtrRunFinalizing */]: 'finalizing transition',
    [3267 /* Events.rtrCancelNavigationStart */]: 'navigation %s',
    [3268 /* Events.rtrCancelNavigationCompleted */]: 'navigation %s; finished.',
    [3269 /* Events.rtrNextTr */]: 'scheduling next transition: %s',
    [3270 /* Events.rtrTrFailed */]: 'Transition %s failed with error: %s',
    [3271 /* Events.rtrNoCtx */]: 'Root RouteContext is not set. Did you forget to register RouteConfiguration, or try to navigate before calling Aurelia.start()?',
    // #endregion
    // #region viewport agent
    [3300 /* Events.vpaCreated */]: 'created',
    [3301 /* Events.vpaActivateFromVpNone */]: 'Nothing to activate at %s',
    [3302 /* Events.vpaActivateFromVpExisting */]: 'Activating existing component agent at %s',
    [3303 /* Events.vpaActivateFromVpNext */]: 'Activating next component agent at %s',
    [3304 /* Events.vpaDeactivateFromVpNone */]: 'Nothing to deactivate at %s',
    [3305 /* Events.vpaDeactivateFromVpExisting */]: 'Deactivating existing component agent at %s',
    [3306 /* Events.vpaDeactivationFromVpRunning */]: 'Already deactivating at %s',
    [3307 /* Events.vpaDeactivateFromVpCurrent */]: 'Deactivating current component agent at %s',
    [3308 /* Events.vpaHandlesVpMismatch */]: 'Cannot handle the request %s due to viewport name mismatch %s',
    [3309 /* Events.vpaHandlesUsedByMismatch */]: 'Cannot handle the request %s as componentName not included in usedBy %s',
    [3310 /* Events.vpaHandles */]: 'Viewport %s can handle the request %s',
    [3311 /* Events.vpaIsAvailableInactive */]: 'Viewport is not available as it is inactive',
    [3312 /* Events.vpaIsAvailableScheduled */]: 'Viewport is not available as an update is scheduled for %s',
    [3313 /* Events.vpaCanUnloadChildren */]: 'Invoking on children at %s',
    [3314 /* Events.vpaCanUnloadExisting */]: 'Invoking on existing component at %s',
    [3315 /* Events.vpaCanUnloadSelf */]: 'Finished invoking on children, now invoking on own component at %s',
    [3316 /* Events.vpaCanUnloadFinished */]: 'Finished at %s',
    [3317 /* Events.vpaCanUnloadNone */]: 'Nothing to unload at %s',
    [3318 /* Events.vpaCanLoadNext */]: 'Invoking on next component at %s',
    [3319 /* Events.vpaCanLoadNone */]: 'Nothing to load at %s',
    [3320 /* Events.vpaCanLoadResidue */]: 'Compiling residue for %s; plan is set to %s',
    [3321 /* Events.vpaCanLoadResidueDelay */]: 'Delaying residue compilation for %s until activate',
    [3322 /* Events.vpaCanLoadChildren */]: 'Finished own component; invoking on children at %s',
    [3323 /* Events.vpaCanLoadFinished */]: 'Finished at %s',
    [3324 /* Events.vpaUnloadingChildren */]: 'Invoking on children at %s',
    [3325 /* Events.vpaUnloadingExisting */]: 'Invoking on existing component at %s',
    [3326 /* Events.vpaUnloadingSelf */]: 'Finished invoking on children, now invoking on own component at %s',
    [3327 /* Events.vpaUnloadingFinished */]: 'Finished at %s',
    [3328 /* Events.vpaUnloadingNone */]: 'Nothing to unload at %s',
    [3329 /* Events.vpaLoadingNext */]: 'Invoking on next component at %s',
    [3330 /* Events.vpaLoadingNone */]: 'Nothing to load at %s',
    [3331 /* Events.vpaLoadingChildren */]: 'Finished own component; invoking on children at %s',
    [3332 /* Events.vpaLoadingFinished */]: 'Finished at %s',
    [3333 /* Events.vpaDeactivateCurrent */]: 'Invoking on the current component at %s',
    [3334 /* Events.vpaDeactivateNone */]: 'Nothing to deactivate at %s',
    [3335 /* Events.vpaDeactivationRunning */]: 'Already deactivating at %s',
    [3336 /* Events.vpaActivateNextScheduled */]: 'Invoking canLoad(), loading() and activate() on the next component at %s',
    [3337 /* Events.vpaActivateNext */]: 'Invoking on the next component at %s',
    [3338 /* Events.vpaActivateNone */]: 'Nothing to activate at %s',
    [3339 /* Events.vpaSwapEmptyCurr */]: 'Running activate on next instead, because there is nothing to deactivate at %s',
    [3340 /* Events.vpaSwapEmptyNext */]: 'Running deactivate on current instead, because there is nothing to activate at %s',
    [3341 /* Events.vpaSwapSkipToChildren */]: 'Skipping this level and swapping children instead at %s',
    [3342 /* Events.vpaSwap */]: 'Swapping current and next at %s',
    [3343 /* Events.vpaProcessDynamicChildren */]: 'Processing dynamic children at %s',
    [3344 /* Events.vpaScheduleUpdate */]: 'Scheduling update for %s; plan is set to %s',
    [3345 /* Events.vpaCancelUpdate */]: 'Cancelling update for %s',
    [3346 /* Events.vpaEndTransitionEmptyCurr */]: 'setting currState to State.currIsEmpty at %s',
    [3347 /* Events.vpaEndTransitionActiveCurrLifecycle */]: 'setting currState to State.currIsActive at %s',
    [3348 /* Events.vpaEndTransitionActiveCurrReplace */]: 'setting currState to State.currIsActive and reassigning curCA at %s',
    [3349 /* Events.vpaDispose */]: 'disposing at %s',
    [3350 /* Events.vpaUnexpectedActivation */]: 'Unexpected viewport activation outside of a transition context at %s',
    [3351 /* Events.vpaUnexpectedDeactivation */]: 'Unexpected viewport deactivation outside of a transition context at %s',
    [3352 /* Events.vpaUnexpectedState */]: 'Unexpected state at %s of %s',
    [3353 /* Events.vpaUnexpectedGuardsResult */]: 'Unexpected guardsResult %s at %s',
    [3354 /* Events.vpaCanLoadGuardsResult */]: 'canLoad returned redirect result %s by the component agent %s',
    // #endregion
    // #region instruction
    [3400 /* Events.instrInvalid */]: 'Invalid component %s: must be either a class, a custom element ViewModel, or a (partial) custom element definition',
    [3401 /* Events.instrNoFallback */]: 'Neither the route \'%s\' matched any configured route at \'%s\' nor a fallback is configured for the viewport \'%s\' - did you forget to add \'%s\' to the routes list of the route decorator of \'%s\'?',
    [3402 /* Events.instrUnknownRedirect */]: '\'%s\' did not match any configured route or registered component name at \'%s\' - did you forget to add \'%s\' to the routes list of the route decorator of \'%s\'?',
    [3403 /* Events.instrInvalidUrlComponentOperation */]: 'Invalid instruction type %s for "toUrlComponent" operation. If you are seeing this error, then it is probably because of an internal bug. Please report it.',
    // #endregion
    // #region navigation model
    [3450 /* Events.nmNoEndpoint */]: 'No endpoint found for path \'%s\'',
    // #endregion
    // #region expression
    [3500 /* Events.exprUnexpectedSegment */]: 'Expected %s at index %s of \'%s\', but got: \'%s\' (rest=\'%s\')',
    [3501 /* Events.exprNotDone */]: 'Unexpected \'%s\' at index %s of \'%s\'',
    [3502 /* Events.exprUnexpectedKind */]: 'Unexpected expression kind %s',
    // #endregion
    // #region route
    [3550 /* Events.rtConfigFromHookApplied */]: 'Invalid operation, the configuration from the get hook is already applied.',
    [3551 /* Events.rtNoCtxStrComponent */]: 'When retrieving the RouteConfig for a component name, a RouteContext (that can resolve it) must be provided',
    [3552 /* Events.rtNoComponent */]: 'Could not find a CustomElement named \'%s\' in the current container scope of %s. This means the component is neither registered at Aurelia startup nor via the \'dependencies\' decorator or static property.',
    [3553 /* Events.rtNoCtxLazyImport */]: 'RouteContext must be provided when resolving an imported module',
    [3554 /* Events.rtInvalidConfigProperty */]: 'Invalid route config property: "%s". Expected %s, but got %s.',
    [3555 /* Events.rtInvalidConfig */]: 'Invalid route config: expected an object or string, but got: %s',
    [3556 /* Events.rtUnknownConfigProperty */]: 'Unknown route config property: "%s.%s". Please specify known properties only.',
    [3557 /* Events.rtUnknownRedirectConfigProperty */]: 'Unknown redirect route config property: "%s.%s". Only \'path\' and \'redirectTo\' should be specified for redirects.',
    [3558 /* Events.rtInvalidOperationNavigationStrategyComponent */]: 'Invalid operation, the component is not yet resolved for the navigation strategy (id: %s).',
    // #endregion
};
/**
 * Only happens in DEV mode.
 *
 * @internal
 */
function trace(logger, event, ...optionalParameters) {
    const message = eventMessageMap[event] ?? 'Unknown event';
    logger.trace(`AUR${event}: ${message}`, ...optionalParameters);
}
/**
 * Only happens in DEV mode.
 *
 * @internal
 */
function debug(logger, event, ...optionalParameters) {
    const message = eventMessageMap[event] ?? 'Unknown event';
    logger.debug(`AUR${event}: ${message}`, ...optionalParameters);
}
/** @internal */
function warn(logger, event, ...optionalParameters) {
    {
        const message = eventMessageMap[event];
        logger.warn(`AUR${event}: ${message}`, ...optionalParameters);
    }
}
/** @internal */
function error(logger, event, ...optionalParameters) {
    {
        const message = eventMessageMap[event];
        logger.error(`AUR${event}: ${message}`, ...optionalParameters);
    }
}
/** @internal */
function getMessage(event, ...optionalParameters) {
    {
        let message = eventMessageMap[event];
        let offset = 0;
        while (message.includes('%s') || offset < optionalParameters.length) {
            message = message.replace('%s', String(optionalParameters[offset++]));
        }
        return `AUR${event}: ${message}`;
    }
}
function logAndThrow(err, logger) {
    logger.error(err);
    throw err;
}

/** @internal */
class Batch {
    constructor(_stack, _cb, head) {
        this._stack = _stack;
        this._cb = _cb;
        this._done = false;
        this._next = null;
        this._head = head ?? this;
    }
    static _start(cb) {
        return new Batch(0, cb, null);
    }
    _push() {
        let cur = this;
        do {
            ++cur._stack;
            cur = cur._next;
        } while (cur !== null);
    }
    _pop() {
        let cur = this;
        do {
            if (--cur._stack === 0) {
                cur._invoke();
            }
            cur = cur._next;
        } while (cur !== null);
    }
    _invoke() {
        const cb = this._cb;
        if (cb !== null) {
            this._cb = null;
            cb(this);
            this._done = true;
        }
    }
    _continueWith(cb) {
        if (this._next === null) {
            return this._next = new Batch(this._stack, cb, this._head);
        }
        else {
            return this._next._continueWith(cb);
        }
    }
    _start() {
        this._head._push();
        this._head._pop();
        return this;
    }
}
function mergeDistinct(prev, next) {
    prev = prev.slice();
    next = next.slice();
    const merged = [];
    while (prev.length > 0) {
        const p = prev.shift();
        const prevVpa = p.context.vpa;
        if (merged.every(m => m.context.vpa !== prevVpa)) {
            const i = next.findIndex(n => n.context.vpa === prevVpa);
            if (i >= 0) {
                merged.push(...next.splice(0, i + 1));
            }
            else {
                merged.push(p);
            }
        }
    }
    merged.push(...next);
    return merged;
}
function tryStringify(value) {
    try {
        return JSON.stringify(value);
    }
    catch {
        return Object.prototype.toString.call(value);
    }
}
function ensureArrayOfStrings(value) {
    return typeof value === 'string' ? [value] : value;
}
function ensureString(value) {
    return typeof value === 'string' ? value : value[0];
}
function mergeURLSearchParams(source, other, clone) {
    const query = clone ? new URLSearchParams(source) : source;
    if (other == null)
        return query;
    for (const [key, value] of Object.entries(other)) {
        if (value == null)
            continue;
        query.append(key, value);
    }
    return query;
}
/** @internal */ const bmToView = BindingMode.toView;
/** @internal */ const bmFromView = BindingMode.fromView;

/**
 * @returns `true` if the given `value` is an non-null, non-undefined, and non-CustomElement object.
 */
function isNotNullishOrTypeOrViewModel(value) {
    return (typeof value === 'object' &&
        value !== null &&
        !isCustomElementViewModel(value));
}
function isPartialCustomElementDefinition(value) {
    // 'name' is the only mandatory property of a CustomElementDefinition.
    // It overlaps with RouteType and may overlap with CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'name') === true);
}
function isPartialChildRouteConfig(value) {
    // 'component' is the only mandatory property of a ChildRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
function isPartialRedirectRouteConfig(value) {
    // 'redirectTo' and 'path' are mandatory properties of a RedirectRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'redirectTo') === true);
}
// Yes, `isPartialChildRouteConfig` and `isPartialViewportInstruction` have identical logic but since that is coincidental,
// and the two are intended to be used in specific contexts, we keep these as two separate functions for now.
function isPartialViewportInstruction(value) {
    // 'component' is the only mandatory property of a INavigationInstruction
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
function expectType(expected, prop, value) {
    throw new Error(getMessage(3554 /* Events.rtInvalidConfigProperty */, prop, expected, tryStringify(value)));
}
/**
 * Validate a `IRouteConfig` or `IChildRouteConfig`.
 *
 * The validation of these types is the same, except that `component` is a mandatory property of `IChildRouteConfig`.
 * This property is checked for in `validateComponent`.
 */
function validateRouteConfig(config, parentPath) {
    if (config == null)
        throw new Error(getMessage(3555 /* Events.rtInvalidConfig */, config));
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'id':
            case 'viewport':
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            case 'caseSensitive':
            case 'nav':
                if (typeof value !== 'boolean') {
                    expectType('boolean', path, value);
                }
                break;
            case 'data':
                if (typeof value !== 'object' || value === null) {
                    expectType('object', path, value);
                }
                break;
            case 'title':
                switch (typeof value) {
                    case 'string':
                    case 'function':
                        break;
                    default:
                        expectType('string or function', path, value);
                }
                break;
            case 'path':
                if (value instanceof Array) {
                    for (let i = 0; i < value.length; ++i) {
                        if (typeof value[i] !== 'string') {
                            expectType('string', `${path}[${i}]`, value[i]);
                        }
                    }
                }
                else if (typeof value !== 'string') {
                    expectType('string or Array of strings', path, value);
                }
                break;
            case 'component':
                validateComponent(value, path, 'component');
                break;
            case 'routes': {
                if (!(value instanceof Array)) {
                    expectType('Array', path, value);
                }
                for (const route of value) {
                    const childPath = `${path}[${value.indexOf(route)}]`;
                    validateComponent(route, childPath, 'component');
                }
                break;
            }
            case 'transitionPlan':
                switch (typeof value) {
                    case 'string':
                        switch (value) {
                            case 'none':
                            case 'replace':
                            case 'invoke-lifecycles':
                                break;
                            default:
                                expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                        }
                        break;
                    case 'function':
                        break;
                    default:
                        expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                }
                break;
            case 'fallback':
                validateComponent(value, path, 'fallback');
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(getMessage(3556 /* Events.rtUnknownConfigProperty */, parentPath, key));
        }
    }
}
function validateRedirectRouteConfig(config, parentPath) {
    if (config == null)
        throw new Error(getMessage(3555 /* Events.rtInvalidConfig */, config));
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'path':
                if (value instanceof Array) {
                    for (let i = 0; i < value.length; ++i) {
                        if (typeof value[i] !== 'string') {
                            expectType('string', `${path}[${i}]`, value[i]);
                        }
                    }
                }
                else if (typeof value !== 'string') {
                    expectType('string or Array of strings', path, value);
                }
                break;
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(getMessage(3557 /* Events.rtUnknownRedirectConfigProperty */, parentPath, key));
        }
    }
}
function validateComponent(component, parentPath, property) {
    switch (typeof component) {
        case 'function':
            break;
        case 'object':
            if (component instanceof Promise || component instanceof NavigationStrategy) {
                break;
            }
            if (isPartialRedirectRouteConfig(component)) {
                validateRedirectRouteConfig(component, parentPath);
                break;
            }
            if (isPartialChildRouteConfig(component)) {
                validateRouteConfig(component, parentPath);
                break;
            }
            if (!isCustomElementViewModel(component) &&
                !isPartialCustomElementDefinition(component)) {
                expectType(`an object with at least a '${property}' property (see Routeable)`, parentPath, component);
            }
            break;
        case 'string':
            break;
        default:
            expectType('function, object or string (see Routeable)', parentPath, component);
    }
}
// This function is intentionally restricted to Params type as it is used only for Params.
// Feel free to extends the typings as per need.
function shallowEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (typeof a !== typeof b) {
        return false;
    }
    if (a === null || b === null) {
        return false;
    }
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
        return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (let i = 0, ii = aKeys.length; i < ii; ++i) {
        const key = aKeys[i];
        if (key !== bKeys[i]) {
            return false;
        }
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

const AuNavId = 'au-nav-id';
class Subscription {
    constructor(
    /** @internal */ _events, 
    /**
     * A unique serial number that makes individual subscribers more easily distinguishable in chronological order.
     *
     * Mainly for debugging purposes.
     */
    /** @internal */ _serial, 
    /** @internal */ _inner) {
        this._events = _events;
        this._serial = _serial;
        this._inner = _inner;
        /** @internal */ this._disposed = false;
    }
    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._inner.dispose();
            const subscriptions = this._events['_subscriptions'];
            subscriptions.splice(subscriptions.indexOf(this), 1);
        }
    }
}
const IRouterEvents = /*@__PURE__*/ DI.createInterface('IRouterEvents', x => x.singleton(RouterEvents));
class RouterEvents {
    constructor() {
        /** @internal */ this._subscriptionSerial = 0;
        /** @internal */ this._subscriptions = [];
        /** @internal */ this._ea = resolve(IEventAggregator);
        /** @internal */ this._logger = resolve(ILogger).scopeTo('RouterEvents');
    }
    publish(event) {
        trace(this._logger, 3200 /* Events.rePublishingEvent */, event);
        this._ea.publish(event.name, event);
    }
    subscribe(event, callback) {
        const subscription = new Subscription(this, ++this._subscriptionSerial, this._ea.subscribe(event, (message) => {
            trace(this._logger, 3201 /* Events.reInvokingSubscriber */, subscription._serial, event);
            callback(message);
        }));
        this._subscriptions.push(subscription);
        return subscription;
    }
}
class LocationChangeEvent {
    get name() { return 'au:router:location-change'; }
    constructor(id, url, trigger, state) {
        this.id = id;
        this.url = url;
        this.trigger = trigger;
        this.state = state;
    }
    toString() {
        return `LocationChangeEvent(id:${this.id},url:'${this.url}',trigger:'${this.trigger}')`
            ;
    }
}
class NavigationStartEvent {
    get name() { return 'au:router:navigation-start'; }
    constructor(id, instructions, trigger, managedState) {
        this.id = id;
        this.instructions = instructions;
        this.trigger = trigger;
        this.managedState = managedState;
    }
    toString() {
        return `NavigationStartEvent(id:${this.id},instructions:'${this.instructions}',trigger:'${this.trigger}')`
            ;
    }
}
class NavigationEndEvent {
    get name() { return 'au:router:navigation-end'; }
    constructor(id, instructions, finalInstructions) {
        this.id = id;
        this.instructions = instructions;
        this.finalInstructions = finalInstructions;
    }
    toString() {
        return `NavigationEndEvent(id:${this.id},instructions:'${this.instructions}',finalInstructions:'${this.finalInstructions}')`
            ;
    }
}
class NavigationCancelEvent {
    get name() { return 'au:router:navigation-cancel'; }
    constructor(id, instructions, reason) {
        this.id = id;
        this.instructions = instructions;
        this.reason = reason;
    }
    toString() {
        return `NavigationCancelEvent(id:${this.id},instructions:'${this.instructions}',reason:${String(this.reason)})`
            ;
    }
}
class NavigationErrorEvent {
    get name() { return 'au:router:navigation-error'; }
    constructor(id, instructions, error) {
        this.id = id;
        this.instructions = instructions;
        this.error = error;
    }
    toString() {
        return `NavigationErrorEvent(id:${this.id},instructions:'${this.instructions}',error:${String(this.error)})`
            ;
    }
}

const IBaseHref = /*@__PURE__*/ DI.createInterface('IBaseHref');
const ILocationManager = /*@__PURE__*/ DI.createInterface('ILocationManager', x => x.singleton(BrowserLocationManager));
/**
 * Default browser location manager.
 *
 * Encapsulates all DOM interactions (`window`, `location` and `history` apis) and exposes them in an environment-agnostic manner.
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
class BrowserLocationManager {
    constructor() {
        /** @internal */ this._eventId = 0;
        /** @internal */ this._logger = resolve(ILogger).root.scopeTo('LocationManager');
        /** @internal */ this._events = resolve(IRouterEvents);
        /** @internal */ this._history = resolve(IHistory);
        /** @internal */ this._location = resolve(ILocation);
        /** @internal */ this._window = resolve(IWindow);
        /** @internal */ this._baseHref = resolve(IBaseHref);
        /** @internal */ this._event = resolve(IRouterOptions).useUrlFragmentHash ? 'hashchange' : 'popstate';
        debug(this._logger, 3100 /* Events.lmBaseHref */, this._baseHref.href);
    }
    startListening() {
        trace(this._logger, 3101 /* Events.lmStartListening */, this._event);
        this._window.addEventListener(this._event, this, false);
    }
    stopListening() {
        trace(this._logger, 3102 /* Events.lmStopListening */, this._event);
        this._window.removeEventListener(this._event, this, false);
    }
    handleEvent(event) {
        this._events.publish(new LocationChangeEvent(++this._eventId, this.getPath(), this._event, 'state' in event ? event.state : null));
    }
    pushState(state, title, url) {
        url = this.addBaseHref(url);
        {
            try {
                const stateString = JSON.stringify(state);
                trace(this._logger, 3103 /* Events.lmPushState */, stateString, title, url);
            }
            catch (_err) {
                warn(this._logger, 3105 /* Events.lmPushStateNonSerializable */, title, url);
            }
        }
        this._history.pushState(state, title, url);
    }
    replaceState(state, title, url) {
        url = this.addBaseHref(url);
        {
            try {
                const stateString = JSON.stringify(state);
                trace(this._logger, 3104 /* Events.lmReplaceState */, stateString, title, url);
            }
            catch (err) {
                warn(this._logger, 3106 /* Events.lmReplaceStateNonSerializable */, title, url);
            }
        }
        this._history.replaceState(state, title, url);
    }
    getPath() {
        const { pathname, search, hash } = this._location;
        return this.removeBaseHref(`${pathname}${normalizeQuery(search)}${hash}`);
    }
    addBaseHref(path) {
        let fullPath;
        let base = this._baseHref.href;
        if (base.endsWith('/')) {
            base = base.slice(0, -1);
        }
        if (base.length === 0) {
            fullPath = path;
        }
        else {
            if (path.startsWith('/')) {
                path = path.slice(1);
            }
            fullPath = `${base}/${path}`;
        }
        return fullPath;
    }
    removeBaseHref(path) {
        const basePath = this._baseHref.pathname;
        if (path.startsWith(basePath)) {
            path = path.slice(basePath.length);
        }
        return normalizePath(path);
    }
}
/**
 * Strip trailing `/index.html` and trailing `/` from the path, if present.
 *
 * @internal
 */
function normalizePath(path) {
    let start;
    let end;
    let index;
    if ((index = path.indexOf('?')) >= 0 || (index = path.indexOf('#')) >= 0) {
        start = path.slice(0, index);
        end = path.slice(index);
    }
    else {
        start = path;
        end = '';
    }
    if (start.endsWith('/')) {
        start = start.slice(0, -1);
    }
    else if (start.endsWith('/index.html')) {
        start = start.slice(0, -11 /* '/index.html'.length */);
    }
    return `${start}${end}`;
}
function normalizeQuery(query) {
    return query.length > 0 && !query.startsWith('?') ? `?${query}` : query;
}

const noRoutes = emptyArray;
// Every kind of route configurations are normalized to this `RouteConfig` class.
class RouteConfig {
    get path() {
        const path = this._path;
        if (path.length > 0)
            return path;
        const ceDfn = CustomElement.getDefinition(this._component);
        return this._path = [ceDfn.name, ...ceDfn.aliases];
    }
    get component() { return this._getComponent(); }
    constructor(id, 
    /** @internal */
    _path, title, redirectTo, caseSensitive, transitionPlan, viewport, data, routes, fallback, component, nav) {
        this.id = id;
        this._path = _path;
        this.title = title;
        this.redirectTo = redirectTo;
        this.caseSensitive = caseSensitive;
        this.transitionPlan = transitionPlan;
        this.viewport = viewport;
        this.data = data;
        this.routes = routes;
        this.fallback = fallback;
        this.nav = nav;
        /** @internal */
        this._configurationFromHookApplied = false;
        /** @internal */ this._currentComponent = null;
        this._component = component;
        this._isNavigationStrategy = component instanceof NavigationStrategy;
    }
    /** @internal */
    static _create(configOrPath, Type) {
        if (typeof configOrPath === 'string' || configOrPath instanceof Array) {
            const path = ensureArrayOfStrings(configOrPath);
            const redirectTo = Type?.redirectTo ?? null;
            const caseSensitive = Type?.caseSensitive ?? false;
            const id = ensureString(Type?.id ?? (path instanceof Array ? path[0] : path));
            const title = Type?.title ?? null;
            const reentryBehavior = Type?.transitionPlan ?? null;
            const viewport = Type?.viewport ?? defaultViewportName;
            const data = Type?.data ?? {};
            const children = Type?.routes ?? noRoutes;
            return new RouteConfig(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, children, Type?.fallback ?? null, Type, Type?.nav ?? true);
        }
        else if (typeof configOrPath === 'object') {
            const config = configOrPath;
            validateRouteConfig(config, '');
            const path = ensureArrayOfStrings(config.path ?? Type?.path ?? emptyArray);
            const title = config.title ?? Type?.title ?? null;
            const redirectTo = config.redirectTo ?? Type?.redirectTo ?? null;
            const caseSensitive = config.caseSensitive ?? Type?.caseSensitive ?? false;
            const id = config.id ?? Type?.id ?? (path instanceof Array ? path[0] : path);
            const reentryBehavior = config.transitionPlan ?? Type?.transitionPlan ?? null;
            const viewport = config.viewport ?? Type?.viewport ?? defaultViewportName;
            const data = {
                ...Type?.data,
                ...config.data,
            };
            const children = [
                ...(config.routes ?? noRoutes),
                ...(Type?.routes ?? noRoutes),
            ];
            return new RouteConfig(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, children, config.fallback ?? Type?.fallback ?? null, config.component ?? Type ?? null, config.nav ?? true);
        }
        else {
            expectType('string, function/class or object', '', configOrPath);
        }
    }
    /**
     * Invoked when this component is used as a child under another parent.
     * Creates a new route config applying the child route config.
     * Note that the current rote config is not mutated.
     *
     * @internal
     */
    _applyChildRouteConfig(config, parentConfig) {
        validateRouteConfig(config, this.path[0] ?? '');
        const path = ensureArrayOfStrings(config.path ?? this.path);
        return new RouteConfig(ensureString(config.id ?? this.id ?? path), path, config.title ?? this.title, config.redirectTo ?? this.redirectTo, config.caseSensitive ?? this.caseSensitive, config.transitionPlan ?? this.transitionPlan ?? parentConfig?.transitionPlan ?? null, config.viewport ?? this.viewport, config.data ?? this.data, config.routes ?? this.routes, config.fallback ?? this.fallback ?? parentConfig?.fallback ?? null, this._component, // The RouteConfig is created using a definitive Type as component; do not overwrite it.
        config.nav ?? this.nav);
    }
    /** @internal */
    _getTransitionPlan(cur, next, overridingTransitionPlan) {
        if (hasSamePath(cur, next) && shallowEquals(cur.params, next.params))
            return 'none';
        if (overridingTransitionPlan != null)
            return overridingTransitionPlan;
        const plan = this.transitionPlan ?? 'replace';
        return typeof plan === 'function' ? plan(cur, next) : plan;
        function cleanPath(path) { return path.replace(`/*${RESIDUE}`, ''); }
        function hasSamePath(nodeA, nodeB) {
            const pathA = nodeA.finalPath;
            const pathB = nodeB.finalPath;
            // As this function is invoked when the components are same, we are giving a benefit of doubt for empty paths.
            // It is seems like a sensible assumption that a transition from '' to '/p1' (assuming p1 is same as the empty path) does not require a non-none transition.
            return pathA.length === 0 || pathB.length === 0 || cleanPath(pathA) === cleanPath(pathB);
        }
    }
    /** @internal */
    _applyFromConfigurationHook(instance, parent, routeNode) {
        // start strict
        if (this._configurationFromHookApplied)
            throw new Error(getMessage(3550 /* Events.rtConfigFromHookApplied */));
        if (typeof instance.getRouteConfig !== 'function')
            return;
        return onResolve(instance.getRouteConfig(parent, routeNode), value => {
            this._configurationFromHookApplied = true;
            if (value == null)
                return;
            let parentPath = parent?.path ?? '';
            if (typeof parentPath !== 'string') {
                parentPath = parentPath[0];
            }
            validateRouteConfig(value, parentPath);
            // the value from the hook takes precedence
            this.id = value.id ?? this.id;
            this._path = ensureArrayOfStrings(value.path ?? this.path);
            this.title = value.title ?? this.title;
            this.redirectTo = value.redirectTo ?? this.redirectTo;
            this.caseSensitive = value.caseSensitive ?? this.caseSensitive;
            this.transitionPlan = value.transitionPlan ?? this.transitionPlan;
            this.viewport = value.viewport ?? this.viewport;
            this.data = value.data ?? this.data;
            this.routes = value.routes ?? this.routes;
            this.fallback = value.fallback ?? this.fallback;
            this.nav = value.nav ?? this.nav;
        });
    }
    /** @internal */
    _clone() {
        return new RouteConfig(this.id, this.path, this.title, this.redirectTo, this.caseSensitive, this.transitionPlan, this.viewport, this.data, this.routes, this.fallback, this._component, this.nav);
    }
    /** @internal */
    _getFallback(viewportInstruction, routeNode, context) {
        const fallback = this.fallback;
        return typeof fallback === 'function'
            && !CustomElement.isType(fallback)
            ? fallback(viewportInstruction, routeNode, context)
            : fallback;
    }
    /** @internal */
    _getComponentName() {
        try {
            return this._getComponent().name;
        }
        catch {
            // TODO(Sayan): Convert all Errors in router lite to instances of RouterError
            return 'UNRESOLVED-NAVIGATION-STRATEGY';
        }
    }
    _getComponent(vi, ctx, node, route) {
        if (vi == null) {
            if (this._currentComponent != null)
                return this._currentComponent;
            if (this._isNavigationStrategy)
                throw new Error(getMessage(3558 /* Events.rtInvalidOperationNavigationStrategyComponent */, this.id));
            return this._currentComponent = this._component;
        }
        return this._currentComponent ??= this._isNavigationStrategy ? this._component.getComponent(vi, ctx, node, route) : this._component;
    }
    /** @internal */
    _handleNavigationStart() {
        if (!this._isNavigationStrategy)
            return;
        this._currentComponent = null;
    }
    toString() {
        let value = `RConf(id: ${this.id}, isNavigationStrategy: ${this._isNavigationStrategy}`;
        value += `, path: [${this.path.join(',')}]`;
        if (this.redirectTo)
            value += `, redirectTo: ${this.redirectTo}`;
        if (this.caseSensitive)
            value += `, caseSensitive: ${this.caseSensitive}`;
        if (this.transitionPlan != null)
            value += `, transitionPlan: ${this.transitionPlan}`;
        value += `, viewport: ${this.viewport}`;
        if (this._currentComponent != null)
            value += `, component: ${this._currentComponent.name}`;
        return `${value})`;
    }
}
const Route = {
    name: /*@__PURE__*/ getResourceKeyFor('route-configuration'),
    /**
     * Returns `true` if the specified type has any static route configuration (either via static properties or a &#64;route decorator)
     */
    isConfigured(Type) {
        return Metadata.has(Route.name, Type);
    },
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    configure(configOrPath, Type) {
        const config = RouteConfig._create(configOrPath, Type);
        Metadata.define(config, Type, Route.name);
        return Type;
    },
    /**
     * Get the `RouteConfig` associated with the specified type, creating a new one if it does not yet exist.
     */
    getConfig(Type) {
        if (!Route.isConfigured(Type)) {
            // This means there was no @route decorator on the class.
            // However there might still be static properties, and this API provides a unified way of accessing those.
            Route.configure({}, Type);
        }
        return Metadata.get(Route.name, Type);
    },
};
function route(configOrPath) {
    return function (target, context) {
        context.addInitializer(function () {
            Route.configure(configOrPath, this);
        });
        return target;
    };
}
/** @internal */
function resolveRouteConfiguration(routeable, isChild, parent, routeNode, context) {
    if (isPartialRedirectRouteConfig(routeable))
        return RouteConfig._create(routeable, null);
    const [instruction, ceDef] = resolveCustomElementDefinition(routeable, context);
    if (instruction.type === 5 /* NavigationInstructionType.NavigationStrategy */)
        return RouteConfig._create({ ...routeable, nav: false }, null);
    return onResolve(ceDef, $ceDef => {
        const type = $ceDef.Type;
        const routeConfig = Route.getConfig(type);
        // If the component is used as a child, then apply the child configuration (coming from parent) and return a new RouteConfig with the configuration applied.
        if (isPartialChildRouteConfig(routeable))
            return routeConfig._applyChildRouteConfig(routeable, parent);
        // If the component is used as a child, then return a clone.
        // Rationale: as this component can be used multiple times as child (either under same parent or different parents), we don't want to mutate the original route config for the type.
        if (isChild)
            return routeConfig._clone();
        if (!routeConfig._configurationFromHookApplied
            && instruction.type === 4 /* NavigationInstructionType.IRouteViewModel */
            && typeof routeable.getRouteConfig === 'function') {
            return onResolve(routeConfig._applyFromConfigurationHook(routeable, parent, routeNode), () => routeConfig);
        }
        return routeConfig;
    });
}
/** @internal */
function resolveCustomElementDefinition(routeable, context) {
    const instruction = createNavigationInstruction(routeable);
    let ceDef;
    switch (instruction.type) {
        case 5 /* NavigationInstructionType.NavigationStrategy */: return [instruction, null];
        case 0 /* NavigationInstructionType.string */: {
            if (context == null)
                throw new Error(getMessage(3551 /* Events.rtNoCtxStrComponent */));
            const dependencies = context.component.dependencies;
            let component = dependencies.find(d => isPartialCustomElementDefinition(d) && d.name === instruction.value)
                ?? CustomElement.find(context.container, instruction.value);
            if (component === null)
                throw new Error(getMessage(3552 /* Events.rtNoComponent */, instruction.value, context));
            if (!(component instanceof CustomElementDefinition)) {
                component = CustomElementDefinition.create(component);
                CustomElement.define(component);
            }
            ceDef = component;
            break;
        }
        case 2 /* NavigationInstructionType.CustomElementDefinition */:
            ceDef = instruction.value;
            break;
        case 4 /* NavigationInstructionType.IRouteViewModel */:
            // Get the class from the constructor property. There might be static properties on it.
            ceDef = CustomElement.getDefinition(instruction.value.constructor);
            break;
        case 3 /* NavigationInstructionType.Promise */:
            if (context == null)
                throw new Error(getMessage(3553 /* Events.rtNoCtxLazyImport */));
            ceDef = context._resolveLazy(instruction.value);
            break;
    }
    return [instruction, ceDef];
}
function createNavigationInstruction(routeable) {
    return isPartialChildRouteConfig(routeable)
        ? createNavigationInstruction(routeable.component)
        : TypedNavigationInstruction.create(routeable);
}

// The commented-out terminal symbols below are for reference / potential future need (should there be use cases to loosen up the syntax)
// These symbols are basically the minimum necessary terminals.
// const viewportTerminal = ['?', '#', '/', '+', ')', '!'];
// const actionTerminal = [...componentTerminal, '@', '('];
// const componentTerminal = [...actionTerminal];
// const paramTerminal = ['=', ',', ')'];
// These are the currently used terminal symbols.
// We're deliberately having every "special" (including the not-in-use '&', ''', '~', ';') as a terminal symbol,
// so as to make the syntax maximally restrictive for consistency and to minimize the risk of us having to introduce breaking changes in the future.
const terminal = ['?', '#', '/', '+', '(', ')', '@', '!', '=', ',', '&', '\'', '~', ';'];
/** @internal */
class ParserState {
    get _done() {
        return this._rest.length === 0;
    }
    constructor(_input) {
        this._input = _input;
        this._buffers = [];
        this._bufferIndex = 0;
        this._index = 0;
        this._rest = _input;
    }
    _startsWith(...values) {
        const rest = this._rest;
        return values.some(function (value) {
            return rest.startsWith(value);
        });
    }
    _consumeOptional(str) {
        if (this._startsWith(str)) {
            this._rest = this._rest.slice(str.length);
            this._index += str.length;
            this._append(str);
            return true;
        }
        return false;
    }
    _consume(str) {
        if (!this._consumeOptional(str)) {
            this._expect(`'${str}'`);
        }
    }
    _expect(msg) {
        throw new Error(getMessage(3500 /* Events.exprUnexpectedSegment */, msg, this._index, this._input, this._rest, this._rest));
    }
    _ensureDone() {
        if (!this._done) {
            throw new Error(getMessage(3501 /* Events.exprNotDone */, this._rest, this._index, this._input));
        }
    }
    _advance() {
        const char = this._rest[0];
        this._rest = this._rest.slice(1);
        ++this._index;
        this._append(char);
    }
    _record() {
        this._buffers[this._bufferIndex++] = '';
    }
    _playback() {
        const bufferIndex = --this._bufferIndex;
        const buffers = this._buffers;
        const buffer = buffers[bufferIndex];
        buffers[bufferIndex] = '';
        return buffer;
    }
    _discard() {
        this._buffers[--this._bufferIndex] = '';
    }
    _append(str) {
        const bufferIndex = this._bufferIndex;
        const buffers = this._buffers;
        for (let i = 0; i < bufferIndex; ++i) {
            buffers[i] += str;
        }
    }
}
const cache = new Map();
class RouteExpression {
    get kind() { return 'Route'; }
    constructor(isAbsolute, root, queryParams, fragment) {
        this.isAbsolute = isAbsolute;
        this.root = root;
        this.queryParams = queryParams;
        this.fragment = fragment;
    }
    static parse(value) {
        const key = value.toString();
        let result = cache.get(key);
        if (result === void 0) {
            cache.set(key, result = RouteExpression._$parse(value));
        }
        return result;
    }
    /** @internal */
    static _$parse(value) {
        const path = value.path;
        if (path === '') {
            return new RouteExpression(false, SegmentExpression.Empty, value.query, value.fragment);
        }
        /*
         * Now parse the actual route
         *
         * Notes:
         * A NT-Name as per DOM level 2: https://www.w3.org/TR/1998/REC-xml-19980210#NT-Name
         *  [4]  NameChar ::= Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender
         *  [5]  Name     ::= (Letter | '_' | ':') (NameChar)*
         *
         * As per https://url.spec.whatwg.org/#url-code-points - URL code points (from the ASCII range) are:
         * a-zA-Z0-9!$&'()*+,-./:;=?@_~
         * The other valid option is a % followed by two ASCII hex digits
         * Anything else is invalid.
         */
        const state = new ParserState(path);
        state._record();
        const isAbsolute = state._consumeOptional('/');
        const root = CompositeSegmentExpression._parse(state);
        state._ensureDone();
        state._discard();
        return new RouteExpression(isAbsolute, root, value.query, value.fragment);
    }
    toInstructionTree(options) {
        return new ViewportInstructionTree(options, this.isAbsolute, this.root._toInstructions(0, 0), mergeURLSearchParams(this.queryParams, options.queryParams, true), this.fragment ?? options.fragment);
    }
}
/**
 * A single 'traditional' (slash-separated) segment consisting of one or more sibling segments.
 *
 * ### Variations:
 *
 * 1: `a+b`
 * - siblings: [`a`, `b`]
 * - append: `false`
 *
 * 2: `+a`
 * - siblings: [`a`]
 * - append: `true`
 *
 * 3: `+a+a`
 * - siblings: [`a`, `b`]
 * - append: `true`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 * - b = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
class CompositeSegmentExpression {
    get kind() { return 'CompositeSegment'; }
    constructor(siblings) {
        this.siblings = siblings;
    }
    /** @internal */
    static _parse(state) {
        state._record();
        // If a segment starts with '+', e.g. '/+a' / '/+a@vp' / '/a/+b' / '/+a+b' etc, then its siblings
        // are considered to be "append"
        const append = state._consumeOptional('+');
        const siblings = [];
        do {
            siblings.push(ScopedSegmentExpression._parse(state));
        } while (state._consumeOptional('+'));
        if (!append && siblings.length === 1) {
            state._discard();
            return siblings[0];
        }
        state._discard();
        return new CompositeSegmentExpression(siblings);
    }
    /** @internal */
    _toInstructions(open, close) {
        switch (this.siblings.length) {
            case 0:
                return [];
            case 1:
                return this.siblings[0]._toInstructions(open, close);
            case 2:
                return [
                    ...this.siblings[0]._toInstructions(open, 0),
                    ...this.siblings[1]._toInstructions(0, close),
                ];
            default:
                return [
                    ...this.siblings[0]._toInstructions(open, 0),
                    ...this.siblings.slice(1, -1).flatMap(function (x) {
                        return x._toInstructions(0, 0);
                    }),
                    ...this.siblings[this.siblings.length - 1]._toInstructions(0, close),
                ];
        }
    }
}
/**
 * The (single) left-hand side and the (one or more) right-hand side of a slash-separated segment.
 *
 * Variations:
 *
 * 1: `a/b`
 * - left: `a`
 * - right: `b`
 *
 * Where
 * - a = `SegmentGroupExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression`)
 * - b = `ScopedSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression`)
 */
class ScopedSegmentExpression {
    get kind() { return 'ScopedSegment'; }
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    /** @internal */
    static _parse(state) {
        state._record();
        const left = SegmentGroupExpression._parse(state);
        if (state._consumeOptional('/')) {
            const right = ScopedSegmentExpression._parse(state);
            state._discard();
            return new ScopedSegmentExpression(left, right);
        }
        state._discard();
        return left;
    }
    /** @internal */
    _toInstructions(open, close) {
        const leftInstructions = this.left._toInstructions(open, 0);
        const rightInstructions = this.right._toInstructions(0, close);
        let cur = leftInstructions[leftInstructions.length - 1];
        while (cur.children.length > 0) {
            cur = cur.children[cur.children.length - 1];
        }
        cur.children.push(...rightInstructions);
        return leftInstructions;
    }
}
/**
 * Any kind of segment wrapped in parentheses, increasing its precedence.
 * Specifically, the parentheses are needed to deeply specify scoped siblings.
 * The precedence is intentionally similar to the familiar mathematical `/` and `+` operators.
 *
 * For example, consider this viewport structure:
 * - viewport-a
 * - - viewport-a1
 * - - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * This can only be deeply specified by using the grouping operator: `a/(a1+a2)+b/b1`
 *
 * Because `a/a1+a2+b/b1` would be interpreted differently:
 * - viewport-a
 * - - viewport-a1
 * - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * ### Variations:
 *
 * 1: `(a)`
 * - expression: `a`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
class SegmentGroupExpression {
    get kind() { return 'SegmentGroup'; }
    constructor(expression) {
        this.expression = expression;
    }
    /** @internal */
    static _parse(state) {
        state._record();
        if (state._consumeOptional('(')) {
            const expression = CompositeSegmentExpression._parse(state);
            state._consume(')');
            state._discard();
            return new SegmentGroupExpression(expression);
        }
        state._discard();
        return SegmentExpression._parse(state);
    }
    /** @internal */
    _toInstructions(open, close) {
        return this.expression._toInstructions(open + 1, close + 1);
    }
}
/**
 * A (non-composite) segment specifying a single component and (optional) viewport / action.
 */
class SegmentExpression {
    get kind() { return 'Segment'; }
    static get Empty() { return new SegmentExpression(ComponentExpression.Empty, ViewportExpression.Empty, true); }
    constructor(component, viewport, scoped) {
        this.component = component;
        this.viewport = viewport;
        this.scoped = scoped;
    }
    /** @internal */
    static _parse(state) {
        state._record();
        const component = ComponentExpression._parse(state);
        const viewport = ViewportExpression._parse(state);
        const scoped = !state._consumeOptional('!');
        state._discard();
        return new SegmentExpression(component, viewport, scoped);
    }
    /** @internal */
    _toInstructions(open, close) {
        return [
            ViewportInstruction.create({
                component: this.component.name,
                params: this.component.parameterList._toObject(),
                viewport: this.viewport.name,
                open,
                close,
            }),
        ];
    }
}
class ComponentExpression {
    get kind() { return 'Component'; }
    static get Empty() { return new ComponentExpression('', ParameterListExpression.Empty); }
    constructor(name, parameterList) {
        this.name = name;
        this.parameterList = parameterList;
        switch (name.charAt(0)) {
            case ':':
                this.isParameter = true;
                this.isStar = false;
                this.isDynamic = true;
                this.parameterName = name.slice(1);
                break;
            case '*':
                this.isParameter = false;
                this.isStar = true;
                this.isDynamic = true;
                this.parameterName = name.slice(1);
                break;
            default:
                this.isParameter = false;
                this.isStar = false;
                this.isDynamic = false;
                this.parameterName = name;
                break;
        }
    }
    /** @internal */
    static _parse(state) {
        state._record();
        state._record();
        if (!state._done) {
            if (state._startsWith('./')) {
                state._advance();
            }
            else if (state._startsWith('../')) {
                state._advance();
                state._advance();
            }
            else {
                while (!state._done && !state._startsWith(...terminal)) {
                    state._advance();
                }
            }
        }
        const name = state._playback();
        if (name.length === 0) {
            state._expect('component name');
        }
        const parameterList = ParameterListExpression._parse(state);
        state._discard();
        return new ComponentExpression(name, parameterList);
    }
}
class ViewportExpression {
    get kind() { return 'Viewport'; }
    static get Empty() { return new ViewportExpression(''); }
    constructor(name) {
        this.name = name;
    }
    /** @internal */
    static _parse(state) {
        state._record();
        let name = null;
        if (state._consumeOptional('@')) {
            state._record();
            while (!state._done && !state._startsWith(...terminal)) {
                state._advance();
            }
            name = decodeURIComponent(state._playback());
            if (name.length === 0) {
                state._expect('viewport name');
            }
        }
        state._discard();
        return new ViewportExpression(name);
    }
}
class ParameterListExpression {
    get kind() { return 'ParameterList'; }
    static get Empty() { return new ParameterListExpression([]); }
    constructor(expressions) {
        this.expressions = expressions;
    }
    /** @internal */
    static _parse(state) {
        state._record();
        const expressions = [];
        if (state._consumeOptional('(')) {
            do {
                expressions.push(ParameterExpression._parse(state, expressions.length));
                if (!state._consumeOptional(',')) {
                    break;
                }
            } while (!state._done && !state._startsWith(')'));
            state._consume(')');
        }
        state._discard();
        return new ParameterListExpression(expressions);
    }
    /** @internal */
    _toObject() {
        const params = {};
        for (const expr of this.expressions) {
            params[expr.key] = expr.value;
        }
        return params;
    }
}
class ParameterExpression {
    get kind() { return 'Parameter'; }
    static get Empty() { return new ParameterExpression('', ''); }
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    /** @internal */
    static _parse(state, index) {
        state._record();
        state._record();
        while (!state._done && !state._startsWith(...terminal)) {
            state._advance();
        }
        let key = state._playback();
        if (key.length === 0) {
            state._expect('parameter key');
        }
        let value;
        if (state._consumeOptional('=')) {
            state._record();
            while (!state._done && !state._startsWith(...terminal)) {
                state._advance();
            }
            value = decodeURIComponent(state._playback());
            if (value.length === 0) {
                state._expect('parameter value');
            }
        }
        else {
            value = key;
            key = index.toString();
        }
        state._discard();
        return new ParameterExpression(key, value);
    }
}
const AST = Object.freeze({
    RouteExpression,
    CompositeSegmentExpression,
    ScopedSegmentExpression,
    SegmentGroupExpression,
    SegmentExpression,
    ComponentExpression,
    ViewportExpression,
    ParameterListExpression,
    ParameterExpression,
});

// No-fallthrough disabled due to large numbers of false positives
/* eslint-disable no-fallthrough */
class ViewportRequest {
    constructor(viewportName, componentName) {
        this.viewportName = viewportName;
        this.componentName = componentName;
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        return `VR(viewport:'${this.viewportName}',component:'${this.componentName}')`;
    }
}
const viewportAgentLookup = new WeakMap();
class ViewportAgent {
    /** @internal */ get _currState() { return this._state & 16256 /* State.curr */; }
    /** @internal */ set _currState(state) { this._state = (this._state & 127 /* State.next */) | state; }
    /** @internal */ get _nextState() { return this._state & 127 /* State.next */; }
    /** @internal */ set _nextState(state) { this._state = (this._state & 16256 /* State.curr */) | state; }
    constructor(viewport, hostController, ctx) {
        this.viewport = viewport;
        this.hostController = hostController;
        /** @internal */ this._isActive = false;
        /** @internal */ this._curCA = null;
        /** @internal */ this._nextCA = null;
        /** @internal */ this._state = 8256 /* State.bothAreEmpty */;
        /** @internal */ this._$plan = 'replace';
        /** @internal */ this._currNode = null;
        /** @internal */ this._nextNode = null;
        /** @internal */ this._currTransition = null;
        /** @internal */ this._cancellationPromise = null;
        this._logger = ctx.container.get(ILogger).scopeTo(`ViewportAgent<${ctx._friendlyPath}>`);
        trace(this._logger, 3300 /* Events.vpaCreated */);
    }
    static for(viewport, ctx) {
        let viewportAgent = viewportAgentLookup.get(viewport);
        if (viewportAgent === void 0) {
            const controller = Controller.getCachedOrThrow(viewport);
            viewportAgentLookup.set(viewport, viewportAgent = new ViewportAgent(viewport, controller, ctx));
        }
        return viewportAgent;
    }
    /** @internal */
    _activateFromViewport(initiator, parent) {
        const tr = this._currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this._isActive = true;
        const logger = /*@__PURE__*/ this._logger.scopeTo('activateFromViewport()');
        switch (this._nextState) {
            case 64 /* State.nextIsEmpty */:
                switch (this._currState) {
                    case 8192 /* State.currIsEmpty */:
                        trace(logger, 3301 /* Events.vpaActivateFromVpNone */, this);
                        return;
                    case 4096 /* State.currIsActive */:
                        trace(logger, 3302 /* Events.vpaActivateFromVpExisting */, this);
                        return this._curCA._activate(initiator, parent);
                    default:
                        this._unexpectedState('activateFromViewport 1');
                }
            case 2 /* State.nextLoadDone */: {
                if (this._currTransition === null)
                    throw new Error(getMessage(3350 /* Events.vpaUnexpectedActivation */, this));
                trace(logger, 3303 /* Events.vpaActivateFromVpNext */, this);
                const b = Batch._start(b1 => { this._activate(initiator, this._currTransition, b1); });
                const p = new Promise(resolve => { b._continueWith(() => { resolve(); }); });
                return b._start()._done ? void 0 : p;
            }
            default:
                this._unexpectedState('activateFromViewport 2');
        }
    }
    /** @internal */
    _deactivateFromViewport(initiator, parent) {
        const tr = this._currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this._isActive = false;
        const logger = /*@__PURE__*/ this._logger.scopeTo('deactivateFromViewport()');
        switch (this._currState) {
            case 8192 /* State.currIsEmpty */:
                trace(logger, 3304 /* Events.vpaDeactivateFromVpNone */, this);
                return;
            case 4096 /* State.currIsActive */:
                trace(logger, 3305 /* Events.vpaDeactivateFromVpExisting */, this);
                return this._curCA._deactivate(initiator, parent);
            case 128 /* State.currDeactivate */:
                // This will happen with bottom-up deactivation because the child is already deactivated, the parent
                // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
                // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
                trace(logger, 3306 /* Events.vpaDeactivationFromVpRunning */, this);
                return;
            default: {
                if (this._currTransition === null)
                    throw new Error(getMessage(3351 /* Events.vpaUnexpectedDeactivation */, this));
                trace(logger, 3307 /* Events.vpaDeactivateFromVpCurrent */, this);
                const b = Batch._start(b1 => { this._deactivate(initiator, this._currTransition, b1); });
                const p = new Promise(resolve => { b._continueWith(() => { resolve(); }); });
                return b._start()._done ? void 0 : p;
            }
        }
    }
    /** @internal */
    _handles(req) {
        if (!this._isAvailable()) {
            return false;
        }
        const $vp = this.viewport;
        const reqVp = req.viewportName;
        const vp = $vp.name;
        const logger = /*@__PURE__*/ this._logger.scopeTo('handles()');
        /*
                         Name from viewport request
    
                         D (default)         N (Non-default)
    
              Name from  +-------------------------------------------+
         viewport agent  |                   |                       |
                         |        DD         |          DN           |
                         |    can handle     |      can't handle     |
              D (default)|                   |                       |
                         |                   |                       |
                         +-------------------------------------------+
                         |                   |                       |
         N (Non-default) |        DD         |          DD           |
                         |    can handle     |   can handle only     |
                         |                   |   if the names match  |
                         |                   |                       |
                         +-------------------------------------------+
        */
        if (reqVp !== defaultViewportName && vp !== reqVp) {
            trace(logger, 3308 /* Events.vpaHandlesVpMismatch */, req, vp);
            return false;
        }
        const usedBy = $vp.usedBy;
        if (usedBy.length > 0 && !usedBy.split(',').includes(req.componentName)) {
            trace(logger, 3309 /* Events.vpaHandlesUsedByMismatch */, req, usedBy);
            return false;
        }
        trace(logger, 3310 /* Events.vpaHandles */, vp, req);
        return true;
    }
    /** @internal */
    _isAvailable() {
        const logger = /*@__PURE__*/ this._logger.scopeTo('isAvailable()');
        if (!this._isActive) {
            trace(logger, 3311 /* Events.vpaIsAvailableInactive */);
            return false;
        }
        if (this._nextState !== 64 /* State.nextIsEmpty */) {
            trace(logger, 3312 /* Events.vpaIsAvailableScheduled */, this._nextNode);
            return false;
        }
        return true;
    }
    /** @internal */
    _canUnload(tr, b) {
        if (this._currTransition === null) {
            this._currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b._push();
        const logger = /*@__PURE__*/ this._logger.scopeTo('canUnload()');
        void onResolve(this._cancellationPromise, () => {
            // run canUnload bottom-up
            Batch._start(b1 => {
                trace(logger, 3313 /* Events.vpaCanUnloadChildren */, this);
                for (const node of this._currNode.children) {
                    node.context.vpa._canUnload(tr, b1);
                }
            })._continueWith(b1 => {
                switch (this._currState) {
                    case 4096 /* State.currIsActive */:
                        trace(logger, 3314 /* Events.vpaCanUnloadExisting */, this);
                        switch (this._$plan) {
                            case 'none':
                                this._currState = 1024 /* State.currCanUnloadDone */;
                                return;
                            case 'invoke-lifecycles':
                            case 'replace':
                                this._currState = 2048 /* State.currCanUnload */;
                                b1._push();
                                Batch._start(b2 => {
                                    trace(logger, 3315 /* Events.vpaCanUnloadSelf */, this);
                                    this._curCA._canUnload(tr, this._nextNode, b2);
                                })._continueWith(() => {
                                    trace(logger, 3316 /* Events.vpaCanUnloadFinished */, this);
                                    this._currState = 1024 /* State.currCanUnloadDone */;
                                    b1._pop();
                                })._start();
                                return;
                        }
                    case 8192 /* State.currIsEmpty */:
                        trace(logger, 3317 /* Events.vpaCanUnloadNone */, this);
                        return;
                    default:
                        tr._handleError(new Error(`Unexpected state at canUnload of ${this}`));
                }
            })._continueWith(() => {
                b._pop();
            })._start();
        });
    }
    /** @internal */
    _canLoad(tr, b) {
        if (this._currTransition === null) {
            this._currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b._push();
        const logger = /*@__PURE__*/ this._logger.scopeTo('canLoad()');
        // run canLoad top-down
        Batch._start(b1 => {
            switch (this._nextState) {
                case 32 /* State.nextIsScheduled */:
                    trace(logger, 3318 /* Events.vpaCanLoadNext */, this);
                    this._nextState = 16 /* State.nextCanLoad */;
                    switch (this._$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this._curCA._canLoad(tr, this._nextNode, b1);
                        case 'replace':
                            b1._push();
                            void onResolve(this._nextNode.context._createComponentAgent(this.hostController, this._nextNode), ca => {
                                (this._nextCA = ca)._canLoad(tr, this._nextNode, b1);
                                b1._pop();
                            });
                    }
                case 64 /* State.nextIsEmpty */:
                    trace(logger, 3319 /* Events.vpaCanLoadNone */, this);
                    return;
                default:
                    this._unexpectedState('canLoad');
            }
        })._continueWith(b1 => {
            if (tr.guardsResult !== true) {
                trace(logger, 3354 /* Events.vpaCanLoadGuardsResult */, tr.guardsResult, this._nextCA);
                return;
            }
            const next = this._nextNode;
            switch (this._$plan) {
                case 'none':
                case 'invoke-lifecycles': {
                    trace(logger, 3320 /* Events.vpaCanLoadResidue */, next, this._$plan);
                    // These plans can only occur if there is already a current component active in this viewport,
                    // and it is the same component as `next`.
                    // This means the RouteContext of `next` was created during a previous transition and might contain
                    // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
                    // first pass of activation, instead of lazily in a later pass after `processResidue`.
                    // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
                    // their target viewports have the appropriate updates scheduled.
                    b1._push();
                    const ctx = next.context;
                    void onResolve(ctx.allResolved, () => onResolve(onResolve(onResolveAll(...next.residue.splice(0).map(vi => createAndAppendNodes(this._logger, next, vi))), () => onResolveAll(...ctx.getAvailableViewportAgents().reduce((acc, vpa) => {
                        const vp = vpa.viewport;
                        const component = vp.default;
                        if (component === null)
                            return acc;
                        acc.push(createAndAppendNodes(this._logger, next, ViewportInstruction.create({ component, viewport: vp.name, })));
                        return acc;
                    }, []))), () => { b1._pop(); }));
                    return;
                }
                case 'replace':
                    trace(logger, 3321 /* Events.vpaCanLoadResidueDelay */, next);
                    return;
            }
        })._continueWith(b1 => {
            switch (this._nextState) {
                case 16 /* State.nextCanLoad */:
                    trace(logger, 3322 /* Events.vpaCanLoadChildren */, this);
                    this._nextState = 8 /* State.nextCanLoadDone */;
                    for (const node of this._nextNode.children) {
                        node.context.vpa._canLoad(tr, b1);
                    }
                    return;
                case 64 /* State.nextIsEmpty */:
                    return;
                default:
                    this._unexpectedState('canLoad');
            }
        })._continueWith(() => {
            trace(logger, 3323 /* Events.vpaCanLoadFinished */, this);
            b._pop();
        })._start();
    }
    /** @internal */
    _unloading(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b._push();
        const logger = /*@__PURE__*/ this._logger.scopeTo('unloading()');
        // run unloading bottom-up
        Batch._start(b1 => {
            trace(logger, 3324 /* Events.vpaUnloadingChildren */, this);
            for (const node of this._currNode.children) {
                node.context.vpa._unloading(tr, b1);
            }
        })._continueWith(b1 => {
            switch (this._currState) {
                case 1024 /* State.currCanUnloadDone */:
                    trace(logger, 3325 /* Events.vpaUnloadingExisting */, this);
                    switch (this._$plan) {
                        case 'none':
                            this._currState = 256 /* State.currUnloadDone */;
                            return;
                        case 'invoke-lifecycles':
                        case 'replace':
                            this._currState = 512 /* State.currUnload */;
                            b1._push();
                            Batch._start(b2 => {
                                trace(logger, 3326 /* Events.vpaUnloadingSelf */, this);
                                this._curCA._unloading(tr, this._nextNode, b2);
                            })._continueWith(() => {
                                trace(logger, 3327 /* Events.vpaUnloadingFinished */, this);
                                this._currState = 256 /* State.currUnloadDone */;
                                b1._pop();
                            })._start();
                            return;
                    }
                case 8192 /* State.currIsEmpty */:
                    trace(logger, 3328 /* Events.vpaUnloadingNone */, this);
                    for (const node of this._currNode.children) {
                        node.context.vpa._unloading(tr, b);
                    }
                    return;
                default:
                    this._unexpectedState('unloading');
            }
        })._continueWith(() => {
            b._pop();
        })._start();
    }
    /** @internal */
    _loading(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b._push();
        const logger = /*@__PURE__*/ this._logger.scopeTo('loading()');
        // run load top-down
        Batch._start(b1 => {
            switch (this._nextState) {
                case 8 /* State.nextCanLoadDone */: {
                    trace(logger, 3329 /* Events.vpaLoadingNext */, this);
                    this._nextState = 4 /* State.nextLoad */;
                    switch (this._$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this._curCA._loading(tr, this._nextNode, b1);
                        case 'replace':
                            return this._nextCA._loading(tr, this._nextNode, b1);
                    }
                }
                case 64 /* State.nextIsEmpty */:
                    trace(logger, 3330 /* Events.vpaLoadingNone */, this);
                    return;
                default:
                    this._unexpectedState('loading');
            }
        })._continueWith(b1 => {
            switch (this._nextState) {
                case 4 /* State.nextLoad */:
                    trace(logger, 3331 /* Events.vpaLoadingChildren */, this);
                    this._nextState = 2 /* State.nextLoadDone */;
                    for (const node of this._nextNode.children) {
                        node.context.vpa._loading(tr, b1);
                    }
                    return;
                case 64 /* State.nextIsEmpty */:
                    return;
                default:
                    this._unexpectedState('loading');
            }
        })._continueWith(() => {
            trace(logger, 3332 /* Events.vpaLoadingFinished */, this);
            b._pop();
        })._start();
    }
    /** @internal */
    _deactivate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b._push();
        const logger = /*@__PURE__*/ this._logger.scopeTo('deactivate()');
        switch (this._currState) {
            case 256 /* State.currUnloadDone */:
                trace(logger, 3333 /* Events.vpaDeactivateCurrent */, this);
                this._currState = 128 /* State.currDeactivate */;
                switch (this._$plan) {
                    case 'none':
                    case 'invoke-lifecycles':
                        b._pop();
                        return;
                    case 'replace': {
                        const controller = this.hostController;
                        const curCa = this._curCA;
                        tr._run(() => {
                            return onResolve(curCa._deactivate(initiator, controller), () => {
                                // Call dispose if initiator is null. If there is an initiator present, then the curCa will be disposed when the initiator is disposed.
                                if (initiator === null) {
                                    curCa._dispose();
                                }
                            });
                        }, () => {
                            b._pop();
                        });
                    }
                }
                return;
            case 8192 /* State.currIsEmpty */:
                trace(logger, 3334 /* Events.vpaDeactivateNone */, this);
                b._pop();
                return;
            case 128 /* State.currDeactivate */:
                trace(logger, 3335 /* Events.vpaDeactivationRunning */, this);
                b._pop();
                return;
            default:
                this._unexpectedState('deactivate');
        }
    }
    /** @internal */
    _activate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b._push();
        const logger = /*@__PURE__*/ this._logger.scopeTo('activate()');
        if (this._nextState === 32 /* State.nextIsScheduled */) {
            trace(logger, 3336 /* Events.vpaActivateNextScheduled */, this);
            // This is the default v2 mode "lazy loading" situation
            Batch._start(b1 => {
                this._canLoad(tr, b1);
            })._continueWith(b1 => {
                this._loading(tr, b1);
            })._continueWith(b1 => {
                this._activate(initiator, tr, b1);
            })._continueWith(() => {
                b._pop();
            })._start();
            return;
        }
        switch (this._nextState) {
            case 2 /* State.nextLoadDone */:
                trace(logger, 3337 /* Events.vpaActivateNext */, this);
                this._nextState = 1 /* State.nextActivate */;
                // run activate top-down
                Batch._start(b1 => {
                    switch (this._$plan) {
                        case 'none':
                        case 'invoke-lifecycles':
                            return;
                        case 'replace': {
                            const controller = this.hostController;
                            tr._run(() => {
                                b1._push();
                                return this._nextCA._activate(initiator, controller);
                            }, () => {
                                b1._pop();
                            });
                        }
                    }
                })._continueWith(b1 => {
                    this._processDynamicChildren(tr, b1);
                })._continueWith(() => {
                    b._pop();
                })._start();
                return;
            case 64 /* State.nextIsEmpty */:
                trace(logger, 3338 /* Events.vpaActivateNone */, this);
                b._pop();
                return;
            default:
                this._unexpectedState('activate');
        }
    }
    /** @internal */
    _swap(tr, b) {
        const logger = /*@__PURE__*/ this._logger.scopeTo('swap()');
        if (this._currState === 8192 /* State.currIsEmpty */) {
            trace(logger, 3339 /* Events.vpaSwapEmptyCurr */, this);
            this._activate(null, tr, b);
            return;
        }
        if (this._nextState === 64 /* State.nextIsEmpty */) {
            trace(logger, 3340 /* Events.vpaSwapEmptyNext */, this);
            this._deactivate(null, tr, b);
            return;
        }
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        if (!(this._currState === 256 /* State.currUnloadDone */ &&
            this._nextState === 2 /* State.nextLoadDone */)) {
            this._unexpectedState('swap');
        }
        this._currState = 128 /* State.currDeactivate */;
        this._nextState = 1 /* State.nextActivate */;
        switch (this._$plan) {
            case 'none':
            case 'invoke-lifecycles': {
                trace(logger, 3341 /* Events.vpaSwapSkipToChildren */, this);
                const nodes = mergeDistinct(this._nextNode.children, this._currNode.children);
                for (const node of nodes) {
                    node.context.vpa._swap(tr, b);
                }
                return;
            }
            case 'replace': {
                trace(logger, 3342 /* Events.vpaSwap */, this);
                const controller = this.hostController;
                const curCA = this._curCA;
                const nextCA = this._nextCA;
                b._push();
                Batch._start(b1 => {
                    tr._run(() => {
                        b1._push();
                        return onResolve(curCA._deactivate(null, controller), () => curCA._dispose());
                    }, () => {
                        b1._pop();
                    });
                })._continueWith(b1 => {
                    tr._run(() => {
                        b1._push();
                        return nextCA._activate(null, controller);
                    }, () => {
                        b1._pop();
                    });
                })._continueWith(b1 => {
                    this._processDynamicChildren(tr, b1);
                })._continueWith(() => {
                    b._pop();
                })._start();
                return;
            }
        }
    }
    /** @internal */
    _processDynamicChildren(tr, b) {
        trace(this._logger, 3343 /* Events.vpaProcessDynamicChildren */, this);
        const next = this._nextNode;
        tr._run(() => {
            b._push();
            const ctx = next.context;
            return onResolve(ctx.allResolved, () => {
                const existingChildren = next.children.slice();
                return onResolve(onResolveAll(...next
                    .residue
                    .splice(0)
                    .map(vi => createAndAppendNodes(this._logger, next, vi))), () => onResolve(onResolveAll(...ctx
                    .getAvailableViewportAgents()
                    .reduce((acc, vpa) => {
                    const vp = vpa.viewport;
                    const component = vp.default;
                    if (component === null)
                        return acc;
                    acc.push(createAndAppendNodes(this._logger, next, ViewportInstruction.create({ component, viewport: vp.name, })));
                    return acc;
                }, [])), () => next.children.filter(x => !existingChildren.includes(x))));
            });
        }, newChildren => {
            Batch._start(b1 => {
                for (const node of newChildren) {
                    tr._run(() => {
                        b1._push();
                        return node.context.vpa._canLoad(tr, b1);
                    }, () => {
                        b1._pop();
                    });
                }
            })._continueWith(b1 => {
                if (tr.guardsResult !== true)
                    return;
                for (const node of newChildren) {
                    tr._run(() => {
                        b1._push();
                        return node.context.vpa._loading(tr, b1);
                    }, () => {
                        b1._pop();
                    });
                }
            })._continueWith(b1 => {
                if (tr.guardsResult !== true)
                    return;
                for (const node of newChildren) {
                    tr._run(() => {
                        b1._push();
                        return node.context.vpa._activate(null, tr, b1);
                    }, () => {
                        b1._pop();
                    });
                }
            })._continueWith(() => {
                b._pop();
            })._start();
        });
    }
    /** @internal */
    _scheduleUpdate(options, next) {
        switch (this._nextState) {
            case 64 /* State.nextIsEmpty */:
                this._nextNode = next;
                this._nextState = 32 /* State.nextIsScheduled */;
                break;
            default:
                this._unexpectedState('scheduleUpdate 1');
        }
        switch (this._currState) {
            case 8192 /* State.currIsEmpty */:
            case 4096 /* State.currIsActive */:
            case 1024 /* State.currCanUnloadDone */:
                break;
            default:
                this._unexpectedState('scheduleUpdate 2');
        }
        const cur = this._curCA?._routeNode ?? null;
        if (cur === null || cur.component !== next.component) {
            // Component changed (or is cleared), so set to 'replace'
            this._$plan = 'replace';
        }
        else {
            // Component is the same, so determine plan based on config and/or convention
            this._$plan = next.context.config._getTransitionPlan(cur, next, options.transitionPlan);
        }
        trace(this._logger, 3344 /* Events.vpaScheduleUpdate */, this);
    }
    /** @internal */
    _cancelUpdate() {
        if (this._currNode !== null) {
            this._currNode.children.forEach(function (node) {
                node.context.vpa._cancelUpdate();
            });
        }
        if (this._nextNode !== null) {
            this._nextNode.children.forEach(function (node) {
                node.context.vpa._cancelUpdate();
            });
        }
        trace(this._logger, 3345 /* Events.vpaCancelUpdate */, this._nextNode);
        let currentDeactivationPromise = null;
        let nextDeactivationPromise = null;
        switch (this._currState) {
            case 8192 /* State.currIsEmpty */:
            case 4096 /* State.currIsActive */:
                this._currTransition = null;
                break;
            case 2048 /* State.currCanUnload */:
            case 1024 /* State.currCanUnloadDone */:
                this._currState = 4096 /* State.currIsActive */;
                this._currTransition = null;
                break;
            case 512 /* State.currUnload */:
            case 256 /* State.currUnloadDone */:
            case 128 /* State.currDeactivate */:
                currentDeactivationPromise = onResolve(this._curCA?._deactivate(null, this.hostController), () => {
                    this._curCA?._dispose();
                    this._currState = 8192 /* State.currIsEmpty */;
                    this._curCA = null;
                });
                break;
        }
        switch (this._nextState) {
            case 64 /* State.nextIsEmpty */:
            case 32 /* State.nextIsScheduled */:
            case 16 /* State.nextCanLoad */:
            case 8 /* State.nextCanLoadDone */:
                this._nextNode = null;
                this._nextState = 64 /* State.nextIsEmpty */;
                break;
            case 4 /* State.nextLoad */:
            case 2 /* State.nextLoadDone */:
            case 1 /* State.nextActivate */: {
                nextDeactivationPromise = onResolve(this._nextCA?._deactivate(null, this.hostController), () => {
                    this._nextCA?._dispose();
                    this._$plan = 'replace';
                    this._nextState = 64 /* State.nextIsEmpty */;
                    this._nextCA = null;
                    this._nextNode = null;
                });
                break;
            }
        }
        if (currentDeactivationPromise !== null && nextDeactivationPromise !== null) {
            this._cancellationPromise = onResolve(onResolveAll(currentDeactivationPromise, nextDeactivationPromise), () => {
                this._currTransition = null;
                this._cancellationPromise = null;
            });
        }
    }
    /** @internal */
    _endTransition() {
        if (this._currNode !== null) {
            this._currNode.children.forEach(function (node) {
                node.context.vpa._endTransition();
            });
        }
        if (this._nextNode !== null) {
            this._nextNode.children.forEach(function (node) {
                node.context.vpa._endTransition();
            });
        }
        if (this._currTransition !== null) {
            const logger = /*@__PURE__*/ this._logger.scopeTo('endTransition()');
            ensureTransitionHasNotErrored(this._currTransition);
            switch (this._nextState) {
                case 64 /* State.nextIsEmpty */:
                    switch (this._currState) {
                        case 8192 /* State.currIsEmpty */:
                        case 128 /* State.currDeactivate */:
                            trace(logger, 3346 /* Events.vpaEndTransitionEmptyCurr */, this);
                            this._currState = 8192 /* State.currIsEmpty */;
                            this._curCA = null;
                            break;
                        default:
                            this._unexpectedState('endTransition 1');
                    }
                    break;
                case 1 /* State.nextActivate */:
                    switch (this._currState) {
                        case 8192 /* State.currIsEmpty */:
                        case 128 /* State.currDeactivate */:
                            switch (this._$plan) {
                                case 'none':
                                    trace(logger, 3347 /* Events.vpaEndTransitionActiveCurrLifecycle */, this);
                                    this._currState = 4096 /* State.currIsActive */;
                                    break;
                                case 'invoke-lifecycles':
                                    trace(logger, 3347 /* Events.vpaEndTransitionActiveCurrLifecycle */, this);
                                    this._currState = 4096 /* State.currIsActive */;
                                    this._curCA._routeNode = this._nextNode;
                                    break;
                                case 'replace':
                                    trace(logger, 3348 /* Events.vpaEndTransitionActiveCurrReplace */, this);
                                    this._currState = 4096 /* State.currIsActive */;
                                    this._curCA = this._nextCA;
                                    break;
                            }
                            this._currNode = this._nextNode;
                            break;
                        default:
                            this._unexpectedState('endTransition 2');
                    }
                    break;
                default:
                    this._unexpectedState('endTransition 3');
            }
            this._$plan = 'replace';
            this._nextState = 64 /* State.nextIsEmpty */;
            this._nextNode = null;
            this._nextCA = null;
            this._currTransition = null;
        }
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        return `VPA(state:${$state(this._state)},plan:'${this._$plan}',n:${this._nextNode},c:${this._currNode},viewport:${this.viewport})`;
    }
    /** @internal */
    _dispose() {
        trace(this._logger, 3349 /* Events.vpaDispose */, this);
        this._curCA?._dispose();
    }
    /** @internal */
    _unexpectedState(label) {
        throw new Error(getMessage(3352 /* Events.vpaUnexpectedState */, label, this));
    }
}
function ensureGuardsResultIsTrue(vpa, tr) {
    if (tr.guardsResult !== true)
        throw new Error(getMessage(3353 /* Events.vpaUnexpectedGuardsResult */, tr.guardsResult, vpa));
}
function ensureTransitionHasNotErrored(tr) {
    if (tr.error !== void 0 && !tr.erredWithUnknownRoute)
        throw tr.error;
}

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
    if ((state & 8192 /* State.currIsEmpty */) === 8192 /* State.currIsEmpty */) {
        flags.push('currIsEmpty');
    }
    if ((state & 4096 /* State.currIsActive */) === 4096 /* State.currIsActive */) {
        flags.push('currIsActive');
    }
    if ((state & 2048 /* State.currCanUnload */) === 2048 /* State.currCanUnload */) {
        flags.push('currCanUnload');
    }
    if ((state & 1024 /* State.currCanUnloadDone */) === 1024 /* State.currCanUnloadDone */) {
        flags.push('currCanUnloadDone');
    }
    if ((state & 512 /* State.currUnload */) === 512 /* State.currUnload */) {
        flags.push('currUnload');
    }
    if ((state & 256 /* State.currUnloadDone */) === 256 /* State.currUnloadDone */) {
        flags.push('currUnloadDone');
    }
    if ((state & 128 /* State.currDeactivate */) === 128 /* State.currDeactivate */) {
        flags.push('currDeactivate');
    }
    if ((state & 64 /* State.nextIsEmpty */) === 64 /* State.nextIsEmpty */) {
        flags.push('nextIsEmpty');
    }
    if ((state & 32 /* State.nextIsScheduled */) === 32 /* State.nextIsScheduled */) {
        flags.push('nextIsScheduled');
    }
    if ((state & 16 /* State.nextCanLoad */) === 16 /* State.nextCanLoad */) {
        flags.push('nextCanLoad');
    }
    if ((state & 8 /* State.nextCanLoadDone */) === 8 /* State.nextCanLoadDone */) {
        flags.push('nextCanLoadDone');
    }
    if ((state & 4 /* State.nextLoad */) === 4 /* State.nextLoad */) {
        flags.push('nextLoad');
    }
    if ((state & 2 /* State.nextLoadDone */) === 2 /* State.nextLoadDone */) {
        flags.push('nextLoadDone');
    }
    if ((state & 1 /* State.nextActivate */) === 1 /* State.nextActivate */) {
        flags.push('nextActivate');
    }
    return flags.join('|');
}

class RouteNode {
    get root() {
        return this._tree.root;
    }
    get isInstructionsFinalized() { return this._isInstructionsFinalized; }
    constructor(
    /**
     * The original configured path pattern that was matched.
     */
    path, 
    /**
     * If one or more redirects have occurred, then this is the final path match, in all other cases this is identical to `path`
     */
    finalPath, 
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    context, 
    /** @internal */
    _originalInstruction, 
    /** Can only be `null` for the composition root */
    instruction, params, queryParams, fragment, data, 
    /**
     * The viewport is always `null` for the root `RouteNode`.
     *
     * NOTE: It might make sense to have a `null` viewport mean other things as well (such as, don't load this component)
     * but that is currently not a deliberately implemented feature and we might want to explicitly validate against it
     * if we decide not to implement that.
     *
     * This is used simply on metadata level. Hence hiding it from the public API.
     * If need be, we can expose it later.
     *
     * @internal
     */
    _viewport, title, component, 
    /**
     * Not-yet-resolved viewport instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    residue) {
        this.path = path;
        this.finalPath = finalPath;
        this.context = context;
        this._originalInstruction = _originalInstruction;
        this.instruction = instruction;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this._viewport = _viewport;
        this.title = title;
        this.component = component;
        this.residue = residue;
        /** @internal */ this._version = 1;
        /** @internal */
        this._isInstructionsFinalized = false;
        this.children = [];
        this._originalInstruction ??= instruction;
    }
    static create(input) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [RESIDUE]: _, ...params } = input.params ?? {};
        return new RouteNode(
        /*        path */ input.path, 
        /*   finalPath */ input.finalPath, 
        /*     context */ input.context, 
        /* originalIns */ input.originalInstruction ?? input.instruction, 
        /* instruction */ input.instruction, 
        /*      params */ Object.freeze(params), 
        /* queryParams */ input.queryParams ?? emptyQuery, 
        /*    fragment */ input.fragment ?? null, 
        /*        data */ Object.freeze(input.data ?? emptyObject), 
        /*    viewport */ input._viewport ?? null, 
        /*       title */ input.title ?? null, 
        /*   component */ input.component, 
        /*     residue */ input.residue ?? []);
    }
    contains(instructions, matchEndpoint = false) {
        if (this.context === instructions.options.context) {
            const nodeChildren = this.children;
            const instructionChildren = instructions.children;
            for (let i = 0, ii = nodeChildren.length; i < ii; ++i) {
                for (let j = 0, jj = instructionChildren.length; j < jj; ++j) {
                    const instructionChild = instructionChildren[j];
                    const instructionEndpoint = matchEndpoint ? instructionChild.recognizedRoute?.route.endpoint : null;
                    const nodeChild = nodeChildren[i + j] ?? null;
                    const instruction = nodeChild !== null
                        ? nodeChild.isInstructionsFinalized ? nodeChild.instruction : nodeChild._originalInstruction
                        : null;
                    const childEndpoint = instruction?.recognizedRoute?.route.endpoint;
                    if (i + j < ii
                        && ((instructionEndpoint?.equalsOrResidual(childEndpoint) ?? false)
                            || (instruction?.contains(instructionChild) ?? false))) {
                        if (j + 1 === jj) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }
        return this.children.some(function (x) {
            return x.contains(instructions, matchEndpoint);
        });
    }
    /** @internal */
    _appendChild(child) {
        this.children.push(child);
        child._setTree(this._tree);
    }
    /** @internal */
    _clearChildren() {
        for (const c of this.children) {
            c._clearChildren();
            c.context.vpa._cancelUpdate();
        }
        this.children.length = 0;
    }
    getTitle(separator) {
        const titleParts = [
            ...this.children.map(x => x.getTitle(separator)),
            typeof this.title === 'function' ? this.title.call(void 0, this) : this.title,
        ].filter(x => x !== null);
        return titleParts.length === 0 ? null : titleParts.join(separator);
    }
    computeAbsolutePath() {
        if (this.context.isRoot) {
            return '';
        }
        const parentPath = this.context.parent.node.computeAbsolutePath();
        const thisPath = this.instruction.toUrlComponent(false);
        return parentPath.length > 0
            ? thisPath.length > 0
                ? `${parentPath}/${thisPath}`
                : parentPath
            : thisPath;
    }
    /** @internal */
    _setTree(tree) {
        this._tree = tree;
        for (const child of this.children) {
            child._setTree(tree);
        }
    }
    /** @internal */
    _finalizeInstruction() {
        this._isInstructionsFinalized = true;
        const children = this.children.map(x => x._finalizeInstruction());
        const instruction = this.instruction._clone();
        instruction.children.splice(0, instruction.children.length, ...children);
        return this.instruction = instruction;
    }
    /** @internal */
    _clone() {
        const clone = new RouteNode(this.path, this.finalPath, this.context, this._originalInstruction, this.instruction, this.params, // as this is frozen, it's safe to share
        this.queryParams, // as this is frozen, it's safe to share
        this.fragment, this.data, // as this is frozen, it's safe to share
        this._viewport, this.title, this.component, [...this.residue]);
        const children = this.children;
        const len = children.length;
        for (let i = 0; i < len; ++i) {
            clone.children.push(children[i]._clone());
        }
        clone._version = this._version + 1;
        if (clone.context.node === this) {
            clone.context.node = clone;
        }
        return clone;
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        const props = [];
        const component = this.context?.config._getComponentName() ?? '';
        if (component.length > 0) {
            props.push(`c:'${component}'`);
        }
        const path = this.context?.config.path ?? '';
        if (path.length > 0) {
            props.push(`path:'${path}'`);
        }
        if (this.children.length > 0) {
            props.push(`children:[${this.children.map(String).join(',')}]`);
        }
        if (this.residue.length > 0) {
            props.push(`residue:${this.residue.map(function (r) {
                if (typeof r === 'string') {
                    return `'${r}'`;
                }
                return String(r);
            }).join(',')}`);
        }
        return `RN(ctx:'${this.context?._friendlyPath}',${props.join(',')})`;
    }
}
class RouteTree {
    constructor(options, queryParams, fragment, root) {
        this.options = options;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.root = root;
    }
    contains(instructions, matchEndpoint = false) {
        return this.root.contains(instructions, matchEndpoint);
    }
    /** @internal */
    _clone() {
        const clone = new RouteTree(this.options._clone(), this.queryParams, // as this is frozen, it's safe to share
        this.fragment, this.root._clone());
        clone.root._setTree(this);
        return clone;
    }
    /** @internal */
    _finalizeInstructions() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map(x => x._finalizeInstruction()), this.queryParams, this.fragment);
    }
    /** @internal */
    _mergeQuery(other) {
        this.queryParams = Object.freeze(mergeURLSearchParams(this.queryParams, other, true));
    }
    toString() {
        return this.root.toString();
    }
}
function createAndAppendNodes(log, node, vi) {
    log.trace(`createAndAppendNodes(node:%s,vi:%s`, node, vi);
    switch (vi.component.type) {
        case 0 /* NavigationInstructionType.string */:
            switch (vi.component.value) {
                case '..':
                    // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
                    node = node.context.parent?.node ?? node;
                    node._clearChildren();
                // falls through
                case '.':
                    return onResolveAll(...vi.children.map(childVI => {
                        return createAndAppendNodes(log, node, childVI);
                    }));
                default: {
                    log.trace(`createAndAppendNodes invoking createNode`);
                    const ctx = node.context;
                    const originalInstruction = vi._clone();
                    let rr = vi.recognizedRoute;
                    // early return; we already have a recognized route, don't bother with the rest.
                    if (rr !== null)
                        return appendNode(log, node, createConfiguredNode(log, node, vi, rr, originalInstruction));
                    // if there are children, then then it might be the case that the parameters are put in the children, and that case it is best to go the default flow.
                    // However, when that's not the case, then we perhaps try to lookup the route-id.
                    // This is another early termination.
                    if (vi.children.length === 0) {
                        const result = ctx._generateViewportInstruction(vi);
                        if (result !== null) {
                            node._tree._mergeQuery(result.query);
                            const newVi = result.vi;
                            newVi.children.push(...vi.children);
                            return appendNode(log, node, createConfiguredNode(log, node, newVi, newVi.recognizedRoute, vi));
                        }
                    }
                    let collapse = 0;
                    let path = vi.component.value;
                    let cur = vi;
                    while (cur.children.length === 1) {
                        cur = cur.children[0];
                        if (cur.component.type === 0 /* NavigationInstructionType.string */) {
                            ++collapse;
                            path = `${path}/${cur.component.value}`;
                        }
                        else {
                            break;
                        }
                    }
                    rr = ctx.recognize(path);
                    log.trace('createNode recognized route: %s', rr);
                    const residue = rr?.residue ?? null;
                    log.trace('createNode residue:', residue);
                    const noResidue = residue === null;
                    // If the residue matches the whole path it means that empty route is configured, but the path in itself is not configured.
                    // Therefore the path matches the configured empty route and puts the whole path into residue.
                    if (rr === null || residue === path) {
                        // check if a route-id is used
                        const eagerResult = ctx._generateViewportInstruction({
                            component: vi.component.value,
                            params: vi.params ?? emptyObject,
                            open: vi.open,
                            close: vi.close,
                            viewport: vi.viewport,
                            children: vi.children,
                        });
                        if (eagerResult !== null) {
                            node._tree._mergeQuery(eagerResult.query);
                            return appendNode(log, node, createConfiguredNode(log, node, eagerResult.vi, eagerResult.vi.recognizedRoute, vi));
                        }
                        // fallback
                        const name = vi.component.value;
                        if (name === '')
                            return;
                        let vp = vi.viewport;
                        if (vp === null || vp.length === 0)
                            vp = defaultViewportName;
                        const vpa = ctx.getFallbackViewportAgent(vp);
                        const fallback = vpa !== null
                            ? vpa.viewport._getFallback(vi, node, ctx)
                            : ctx.config._getFallback(vi, node, ctx);
                        if (fallback === null)
                            throw new UnknownRouteError(getMessage(3401 /* Events.instrNoFallback */, name, ctx._friendlyPath, vp, name, ctx.component.name));
                        if (typeof fallback === 'string') {
                            // fallback: id -> route -> CEDefn (Route configuration)
                            // look for a route first
                            log.trace(`Fallback is set to '${fallback}'. Looking for a recognized route.`);
                            const rd = ctx.childRoutes.find(x => x.id === fallback);
                            if (rd !== void 0)
                                return appendNode(log, node, createFallbackNode(log, rd, node, vi));
                            log.trace(`No route configuration for the fallback '${fallback}' is found; trying to recognize the route.`);
                            const rr = ctx.recognize(fallback, true);
                            if (rr !== null && rr.residue !== fallback)
                                return appendNode(log, node, createConfiguredNode(log, node, vi, rr, null));
                        }
                        // fallback is not recognized as a configured route; treat as CE and look for a route configuration.
                        log.trace(`The fallback '${fallback}' is not recognized as a route; treating as custom element name.`);
                        return onResolve(resolveRouteConfiguration(fallback, false, ctx.config, null, ctx), rc => appendNode(log, node, createFallbackNode(log, rc, node, vi)));
                    }
                    // readjust the children wrt. the residue
                    rr.residue = null;
                    vi.component.value = noResidue
                        ? path
                        : path.slice(0, -(residue.length + 1));
                    let addResidue = !noResidue;
                    for (let i = 0; i < collapse; ++i) {
                        const child = vi.children[0];
                        if (residue?.startsWith(child.component.value) ?? false) {
                            addResidue = false;
                            break;
                        }
                        vi.viewport = child.viewport;
                        vi.children = child.children;
                    }
                    if (addResidue) {
                        vi.children.unshift(ViewportInstruction.create(residue));
                    }
                    vi.recognizedRoute = rr;
                    log.trace('createNode after adjustment vi:%s', vi);
                    return appendNode(log, node, createConfiguredNode(log, node, vi, rr, originalInstruction));
                }
            }
        case 3 /* NavigationInstructionType.Promise */:
        case 4 /* NavigationInstructionType.IRouteViewModel */:
        case 2 /* NavigationInstructionType.CustomElementDefinition */: {
            const rc = node.context;
            return onResolve(resolveCustomElementDefinition(vi.component.value, rc)[1], ced => {
                const { vi: newVi, query } = rc._generateViewportInstruction({
                    component: ced,
                    params: vi.params ?? emptyObject,
                    open: vi.open,
                    close: vi.close,
                    viewport: vi.viewport,
                    children: vi.children,
                });
                node._tree._mergeQuery(query);
                return appendNode(log, node, createConfiguredNode(log, node, newVi, newVi.recognizedRoute, vi));
            });
        }
    }
}
function createConfiguredNode(log, node, vi, rr, originalVi, route = rr.route.endpoint.route) {
    const ctx = node.context;
    const rt = node._tree;
    return onResolve(route.handler, $handler => {
        route.handler = $handler;
        log.trace(`creatingConfiguredNode(rdc:%s, vi:%s)`, $handler, vi);
        if ($handler.redirectTo === null) {
            const viWithVp = (vi.viewport?.length ?? 0) > 0;
            const vpName = (viWithVp ? vi.viewport : $handler.viewport);
            return onResolve(resolveCustomElementDefinition($handler._getComponent(vi, ctx, node, rr.route), ctx)[1], ced => {
                const vpa = ctx._resolveViewportAgent(new ViewportRequest(vpName, ced.name));
                if (!viWithVp) {
                    vi.viewport = vpa.viewport.name;
                }
                const router = ctx.container.get(IRouter);
                return onResolve(router.getRouteContext(vpa, ced, null, vpa.hostController.container, ctx.config, ctx, $handler), childCtx => {
                    log.trace('createConfiguredNode setting the context node');
                    const $node = childCtx.node = RouteNode.create({
                        path: rr.route.endpoint.route.path,
                        finalPath: route.path,
                        context: childCtx,
                        instruction: vi,
                        originalInstruction: originalVi,
                        params: rr.route.params,
                        queryParams: rt.queryParams,
                        fragment: rt.fragment,
                        data: $handler.data,
                        _viewport: vpName,
                        component: ced,
                        title: $handler.title,
                        // Note: at this point, the residue from the recognized route should be converted to VI children. Hence the residues are not added back to the RouteNode.
                        residue: vi.children.slice(),
                    });
                    $node._setTree(node._tree);
                    log.trace(`createConfiguredNode(vi:%s) -> %s`, vi, $node);
                    return $node;
                });
            });
        }
        // Migrate parameters to the redirect
        const origPath = RouteExpression.parse(pathUrlParser.parse(route.path));
        const redirPath = RouteExpression.parse(pathUrlParser.parse($handler.redirectTo));
        let origCur;
        let redirCur;
        const newSegs = [];
        switch (origPath.root.kind) {
            case 'ScopedSegment':
            case 'Segment':
                origCur = origPath.root;
                break;
            default:
                throw new Error(getMessage(3502 /* Events.exprUnexpectedKind */, origPath.root.kind));
        }
        switch (redirPath.root.kind) {
            case 'ScopedSegment':
            case 'Segment':
                redirCur = redirPath.root;
                break;
            default:
                throw new Error(getMessage(3502 /* Events.exprUnexpectedKind */, redirPath.root.kind));
        }
        let origSeg;
        let redirSeg;
        let origDone = false;
        let redirDone = false;
        while (!(origDone && redirDone)) {
            if (origDone) {
                origSeg = null;
            }
            else if (origCur.kind === 'Segment') {
                origSeg = origCur;
                origDone = true;
            }
            else if (origCur.left.kind === 'Segment') {
                origSeg = origCur.left;
                switch (origCur.right.kind) {
                    case 'ScopedSegment':
                    case 'Segment':
                        origCur = origCur.right;
                        break;
                    default:
                        throw new Error(getMessage(3502 /* Events.exprUnexpectedKind */, origCur.right.kind));
                }
            }
            else {
                throw new Error(getMessage(3502 /* Events.exprUnexpectedKind */, origCur.left.kind));
            }
            if (redirDone) {
                redirSeg = null;
            }
            else if (redirCur.kind === 'Segment') {
                redirSeg = redirCur;
                redirDone = true;
            }
            else if (redirCur.left.kind === 'Segment') {
                redirSeg = redirCur.left;
                switch (redirCur.right.kind) {
                    case 'ScopedSegment':
                    case 'Segment':
                        redirCur = redirCur.right;
                        break;
                    default:
                        throw new Error(getMessage(3502 /* Events.exprUnexpectedKind */, redirCur.right.kind));
                }
            }
            else {
                throw new Error(getMessage(3502 /* Events.exprUnexpectedKind */, redirCur.left.kind));
            }
            if (redirSeg !== null) {
                if (redirSeg.component.isDynamic && (origSeg?.component.isDynamic ?? false)) {
                    newSegs.push(rr.route.params[redirSeg.component.parameterName]);
                }
                else {
                    newSegs.push(redirSeg.component.name);
                }
            }
        }
        const newPath = newSegs.filter(Boolean).join('/');
        const redirRR = ctx.recognize(newPath);
        if (redirRR === null)
            throw new UnknownRouteError(getMessage(3402 /* Events.instrUnknownRedirect */, newPath, ctx._friendlyPath, newPath, ctx.component.name));
        return createConfiguredNode(log, node, ViewportInstruction.create({
            recognizedRoute: redirRR,
            component: newPath,
            children: vi.children,
            viewport: vi.viewport,
            open: vi.open,
            close: vi.close,
        }), redirRR, originalVi);
    });
}
function appendNode(log, node, childNode) {
    return onResolve(childNode, $childNode => {
        log.trace(`appendNode($childNode:%s)`, $childNode);
        node._appendChild($childNode);
        return $childNode.context.vpa._scheduleUpdate(node._tree.options, $childNode);
    });
}
/**
 * Creates route node from the given RouteConfig `rc` for a unknown path (non-configured route).
 */
function createFallbackNode(log, rc, node, vi) {
    // we aren't migrating the parameters for missing route
    const rr = new $RecognizedRoute(new RecognizedRoute(new Endpoint(new ConfigurableRoute(rc.path[0], rc.caseSensitive, rc), []), emptyObject), null);
    // Do not pass on any residue. That is if the current path is unconfigured/what/ever ignore the rest after we hit an unconfigured route.
    // If need be later a special parameter can be created for this.
    vi.children.length = 0;
    return createConfiguredNode(log, node, vi, rr, null);
}

/** @internal */
const emptyQuery = Object.freeze(new URLSearchParams());
function isManagedState(state) {
    return isObjectOrFunction(state) && Object.prototype.hasOwnProperty.call(state, AuNavId) === true;
}
function toManagedState(state, navId) {
    return { ...state, [AuNavId]: navId };
}
/** @internal */
class UnknownRouteError extends Error {
}
class Transition {
    get erredWithUnknownRoute() { return this._erredWithUnknownRoute; }
    constructor(id, prevInstructions, instructions, finalInstructions, instructionsChanged, trigger, options, managedState, previousRouteTree, routeTree, promise, resolve, reject, guardsResult, error) {
        this.id = id;
        this.prevInstructions = prevInstructions;
        this.instructions = instructions;
        this.finalInstructions = finalInstructions;
        this.instructionsChanged = instructionsChanged;
        this.trigger = trigger;
        this.options = options;
        this.managedState = managedState;
        this.previousRouteTree = previousRouteTree;
        this.routeTree = routeTree;
        this.promise = promise;
        this.resolve = resolve;
        this.reject = reject;
        this.guardsResult = guardsResult;
        this.error = error;
        /** @internal */
        this._erredWithUnknownRoute = false;
    }
    /** @internal */
    static _create(input) {
        return new Transition(input.id, input.prevInstructions, input.instructions, input.finalInstructions, input.instructionsChanged, input.trigger, input.options, input.managedState, input.previousRouteTree, input.routeTree, input.promise, input.resolve, input.reject, input.guardsResult, void 0);
    }
    /** @internal */
    _run(cb, next) {
        if (this.guardsResult !== true) {
            return;
        }
        try {
            const ret = cb();
            if (ret instanceof Promise) {
                ret.then(next).catch(err => {
                    this._handleError(err);
                });
            }
            else {
                next(ret);
            }
        }
        catch (err) {
            this._handleError(err);
        }
    }
    /** @internal */
    _handleError(err) {
        this._erredWithUnknownRoute = err instanceof UnknownRouteError;
        this.reject(this.error = err);
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions})`;
    }
}
const IRouter = /*@__PURE__*/ DI.createInterface('IRouter', x => x.singleton(Router));
class Router {
    /** @internal */
    get _ctx() {
        const ctx = this._$ctx;
        if (ctx !== null)
            return ctx;
        if (!this._container.has(IRouteContext, true))
            throw new Error(getMessage(3271 /* Events.rtrNoCtx */));
        return this._$ctx = this._container.get(IRouteContext);
    }
    get routeTree() {
        let routeTree = this._routeTree;
        if (routeTree === null) {
            // Lazy instantiation for only the very first (synthetic) tree.
            // Doing it here instead of in the constructor to delay it until we have the context.
            const ctx = this._ctx;
            routeTree = this._routeTree = new RouteTree(NavigationOptions.create(this.options, {}), emptyQuery, null, RouteNode.create({
                path: '',
                finalPath: '',
                context: ctx,
                instruction: null,
                component: CustomElement.getDefinition(ctx.config.component),
                title: ctx.config.title,
            }));
        }
        return routeTree;
    }
    get currentTr() {
        return this._currentTr ??= Transition._create({
            id: 0,
            prevInstructions: this._instructions,
            instructions: this._instructions,
            finalInstructions: this._instructions,
            instructionsChanged: true,
            trigger: 'api',
            options: NavigationOptions.create(this.options, {}),
            managedState: null,
            previousRouteTree: this.routeTree._clone(),
            routeTree: this.routeTree,
            resolve: null,
            reject: null,
            promise: null,
            guardsResult: true,
            error: void 0,
        });
    }
    /** @internal */
    set currentTr(value) {
        this._currentTr = value;
    }
    get isNavigating() {
        return this._isNavigating;
    }
    constructor() {
        /** @internal */ this._$ctx = null;
        /** @internal */
        this._routeTree = null;
        /** @internal */
        this._currentTr = null;
        /** @internal */ this._navigated = false;
        /** @internal */ this._navigationId = 0;
        /** @internal */ this._nextTr = null;
        /** @internal */ this._locationChangeSubscription = null;
        /** @internal */ this._hasTitleBuilder = false;
        /** @internal */ this._isNavigating = false;
        /** @internal */ this._container = resolve(IContainer);
        /** @internal */ this._p = resolve(IPlatform);
        /** @internal */ this._logger = resolve(ILogger).root.scopeTo('Router');
        /** @internal */ this._events = resolve(IRouterEvents);
        /** @internal */ this._locationMgr = resolve(ILocationManager);
        this.options = resolve(IRouterOptions);
        this._vpaLookup = new Map();
        this._instructions = ViewportInstructionTree.create('', this.options);
        this._container.registerResolver(Router, Registration.instance(Router, this));
    }
    /**
     * Get the closest RouteContext relative to the provided component, controller or node.
     *
     * @param context - The object from which to resolve the closest RouteContext.
     *
     * @returns when the value is:
     * - `null`: the root
     * - `IRouteContext`: the provided value (no-op)
     * - `HTMLElement`: the context of the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): the context of this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     *
     * @internal
     */
    _resolveContext(context) {
        return RouteContext.resolve(this._ctx, context);
    }
    start(performInitialNavigation) {
        this._hasTitleBuilder = typeof this.options.buildTitle === 'function';
        this._locationMgr.startListening();
        this._locationChangeSubscription = this._events.subscribe('au:router:location-change', e => {
            // At the time of writing, chromium throttles popstate events at a maximum of ~100 per second.
            // While macroTasks run up to 250 times per second, it is extremely unlikely that more than ~100 per second of these will run due to the double queueing.
            // However, this throttle limit could theoretically be hit by e.g. integration tests that don't mock Location/History.
            // If the throttle limit is hit, then add a throttle config.
            this._p.taskQueue.queueTask(() => {
                // Don't try to restore state that might not have anything to do with the Aurelia app
                const state = isManagedState(e.state) ? e.state : null;
                const routerOptions = this.options;
                const options = NavigationOptions.create(routerOptions, { historyStrategy: 'replace' });
                const instructions = ViewportInstructionTree.create(e.url, routerOptions, options, this._ctx);
                // The promise will be stored in the transition. However, unlike `load()`, `start()` does not return this promise in any way.
                // The router merely guarantees that it will be awaited (or canceled) before the next transition, so a race condition is impossible either way.
                // However, it is possible to get floating promises lingering during non-awaited unit tests, which could have unpredictable side-effects.
                // So we do want to solve this at some point.
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this._enqueue(instructions, e.trigger, state, null);
            });
        });
        if (!this._navigated && performInitialNavigation) {
            return this.load(this._locationMgr.getPath(), { historyStrategy: this.options.historyStrategy !== 'none' ? 'replace' : 'none' });
        }
    }
    stop() {
        this._locationMgr.stopListening();
        this._locationChangeSubscription?.dispose();
    }
    load(instructionOrInstructions, options) {
        const instructions = this.createViewportInstructions(instructionOrInstructions, options);
        trace(this._logger, 3250 /* Events.rtrLoading */, instructions);
        return this._enqueue(instructions, 'api', null, null);
    }
    isActive(instructionOrInstructions, context) {
        const ctx = this._resolveContext(context);
        const instructions = instructionOrInstructions instanceof ViewportInstructionTree
            ? instructionOrInstructions
            : this.createViewportInstructions(instructionOrInstructions, { context: ctx, historyStrategy: this.options.historyStrategy });
        trace(this._logger, 3251 /* Events.rtrIsActive */, instructions, ctx);
        return this.routeTree.contains(instructions, false);
    }
    /**
     * Retrieve the RouteContext, which contains statically configured routes combined with the customElement metadata associated with a type.
     *
     * The customElement metadata is lazily associated with a type via the RouteContext the first time `getOrCreate` is called.
     *
     * @param viewportAgent - The ViewportAgent hosting the component associated with this RouteContext. If the RouteContext for the component+viewport combination already exists, the ViewportAgent will be updated in case it changed.
     * @param componentDefinition - The custom element definition.
     * @param container - The `controller.container` of the component hosting the viewport that the route will be loaded into.
     *
     */
    getRouteContext(viewportAgent, componentDefinition, componentInstance, container, parentRouteConfig, parentContext, $rdConfig) {
        const logger = /*@__PURE__*/ container.get(ILogger).scopeTo('RouteContext');
        return onResolve(
        // In case of navigation strategy, get the route config for the resolved component directly.
        // Conceptually, navigation strategy is another form of lazy-loading the route config for the given component.
        // Hence, when we see a navigation strategy, we resolve the route config for the component first.
        $rdConfig instanceof RouteConfig && !$rdConfig._isNavigationStrategy
            ? $rdConfig
            : resolveRouteConfiguration(
            // getRouteConfig is prioritized over the statically configured routes via @route decorator.
            typeof componentInstance?.getRouteConfig === 'function' ? componentInstance : componentDefinition.Type, false, parentRouteConfig, null, parentContext), rdConfig => {
            let routeConfigLookup = this._vpaLookup.get(viewportAgent);
            if (routeConfigLookup === void 0) {
                this._vpaLookup.set(viewportAgent, routeConfigLookup = new WeakMap());
            }
            let routeContext = routeConfigLookup.get(rdConfig);
            if (routeContext !== void 0) {
                trace(logger, 3252 /* Events.rtrResolvingRcExisting */, rdConfig);
                return routeContext;
            }
            trace(logger, 3253 /* Events.rtrResolvingRcNew */, rdConfig);
            const parent = container.has(IRouteContext, true) ? container.get(IRouteContext) : null;
            routeConfigLookup.set(rdConfig, routeContext = new RouteContext(viewportAgent, parent, componentDefinition, rdConfig, container, this));
            return routeContext;
        });
    }
    createViewportInstructions(instructionOrInstructions, options) {
        if (instructionOrInstructions instanceof ViewportInstructionTree)
            return instructionOrInstructions;
        let context = (options?.context ?? null);
        if (typeof instructionOrInstructions === 'string') {
            instructionOrInstructions = this._locationMgr.removeBaseHref(instructionOrInstructions);
        }
        const isVpInstr = isPartialViewportInstruction(instructionOrInstructions);
        let $instruction = isVpInstr ? instructionOrInstructions.component : instructionOrInstructions;
        if (typeof $instruction === 'string' && $instruction.startsWith('../') && context !== null) {
            context = this._resolveContext(context);
            while ($instruction.startsWith('../') && (context?.parent ?? null) !== null) {
                $instruction = $instruction.slice(3);
                context = context.parent;
            }
        }
        if (isVpInstr) {
            instructionOrInstructions.component = $instruction;
        }
        else {
            instructionOrInstructions = $instruction;
        }
        const routerOptions = this.options;
        return ViewportInstructionTree.create(instructionOrInstructions, routerOptions, NavigationOptions.create(routerOptions, { ...options, context }), this._ctx);
    }
    /**
     * Enqueue an instruction tree to be processed as soon as possible.
     *
     * Will wait for any existing in-flight transition to finish, otherwise starts immediately.
     *
     * @param instructions - The instruction tree that determines the transition
     * @param trigger - `'popstate'` or `'hashchange'` if initiated by a browser event, or `'api'` for manually initiated transitions via the `load` api.
     * @param state - The state to restore, if any.
     * @param failedTr - If this is a redirect / fallback from a failed transition, the previous transition is passed forward to ensure the original promise resolves with the latest result.
     *
     * @internal
     */
    _enqueue(instructions, trigger, state, failedTr) {
        const lastTr = this.currentTr;
        const logger = this._logger;
        if (trigger !== 'api' && lastTr.trigger === 'api' && lastTr.instructions.equals(instructions)) {
            // User-triggered navigation that results in `replaceState` with the same URL. The API call already triggered the navigation; event is ignored.
            debug(logger, 3254 /* Events.rtrIgnoringIdenticalNav */, trigger);
            return true;
        }
        let resolve = (void 0); // Need this initializer because TS doesn't know the promise executor will run synchronously
        let reject = (void 0);
        let promise;
        const restorePrevRT = this.options.restorePreviousRouteTreeOnError;
        if (failedTr === null || failedTr.erredWithUnknownRoute || (failedTr.error != null && restorePrevRT)) {
            promise = new Promise(function ($resolve, $reject) { resolve = $resolve; reject = $reject; });
        }
        else {
            // Ensure that `await router.load` only resolves when the transition truly finished, so chain forward on top of
            // any previously failed transition that caused a recovering backwards navigation.
            debug(logger, 3255 /* Events.rtrReusingPromise */, failedTr);
            promise = failedTr.promise;
            resolve = failedTr.resolve;
            reject = failedTr.reject;
        }
        // This is an intentional overwrite: if a new transition is scheduled while the currently scheduled transition hasn't even started yet,
        // then the currently scheduled transition is effectively canceled/ignored.
        // This is consistent with the runtime's controller behavior, where if you rapidly call async activate -> deactivate -> activate (for example), then the deactivate is canceled.
        const nextTr = this._nextTr = Transition._create({
            id: ++this._navigationId,
            trigger,
            managedState: state,
            prevInstructions: lastTr.finalInstructions,
            finalInstructions: instructions,
            instructionsChanged: !lastTr.finalInstructions.equals(instructions),
            instructions,
            options: instructions.options,
            promise,
            resolve,
            reject,
            previousRouteTree: this.routeTree,
            routeTree: this._routeTree = this.routeTree._clone(),
            guardsResult: true,
            error: void 0,
        });
        debug(logger, 3256 /* Events.rtrSchedulingTr */, nextTr);
        if (!this._isNavigating) {
            // Catch any errors that might be thrown by `run` and reject the original promise which is awaited down below
            try {
                this._run(nextTr);
            }
            catch (err) {
                nextTr._handleError(err);
            }
        }
        return nextTr.promise.then(ret => {
            debug(logger, 3257 /* Events.rtrTrSucceeded */, nextTr);
            return ret;
        }).catch(err => {
            error(logger, 3270 /* Events.rtrTrFailed */, nextTr, err);
            if (nextTr.erredWithUnknownRoute) {
                this._cancelNavigation(nextTr);
            }
            else {
                this._isNavigating = false;
                this._events.publish(new NavigationErrorEvent(nextTr.id, nextTr.instructions, err));
                if (restorePrevRT) {
                    this._cancelNavigation(nextTr);
                }
                else {
                    const $nextTr = this._nextTr;
                    // because the navigation failed it makes sense to restore the previous route-tree so that with next navigation, lifecycle hooks are correctly invoked.
                    if ($nextTr !== null) {
                        $nextTr.previousRouteTree = nextTr.previousRouteTree;
                    }
                    else {
                        this._routeTree = nextTr.previousRouteTree;
                    }
                }
            }
            throw err;
        });
    }
    /** @internal */
    _run(tr) {
        this.currentTr = tr;
        this._nextTr = null;
        /**
         * Future optimization scope:
         * Can we devise a plan to ignore a transition?
         * The idea is to deterministically identify that the given transition is already active.
         * In that case, we only choose to execute the transition if the transitionPlan is set to replace. (this check is currently done in the viewport agent).
         *
         * Solution idea:
         * The root RouteNode needs to be consistently updated, even when children nodes are lazily added.
         * When done, the instruction can be compared starting with the root node.
         */
        this._isNavigating = true;
        let navigationContext = this._resolveContext(tr.options.context);
        const logger = /*@__PURE__*/ this._logger.scopeTo('run()');
        trace(logger, 3258 /* Events.rtrRunBegin */, tr);
        this._events.publish(new NavigationStartEvent(tr.id, tr.instructions, tr.trigger, tr.managedState));
        // If user triggered a new transition in response to the NavigationStartEvent
        // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
        if (this._nextTr !== null) {
            debug(logger, 3259 /* Events.rtrRunCancelled */, tr);
            return this._run(this._nextTr);
        }
        tr._run(() => {
            const vit = tr.finalInstructions;
            trace(logger, 3260 /* Events.rtrRunVitCompile */, vit);
            /**
             * Updating route tree:
             * Returns a stateful `RouteTree` based on the provided context and transition.
             *
             * This process will always start from the root context and build a new complete tree, up until (and including)
             * the context that was passed-in.
             *
             * If there are any additional child navigations to be resolved lazily, those will be added to the leaf
             * `RouteNode`s `residue` property which is then resolved by the router after the leaf node is loaded.
             *
             * This means that a `RouteTree` can (and often will) be built incrementally during the loading process.
             */
            // The root of the routing tree is always the CompositionRoot of the Aurelia app.
            // From a routing perspective it's simply a "marker": it does not need to be loaded,
            // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
            // other than by reading (deps, optional route config, owned viewports) from it.
            const rootCtx = this._ctx;
            const rt = tr.routeTree;
            rt.options = vit.options;
            rt.queryParams = rootCtx.node._tree.queryParams = vit.queryParams;
            rt.fragment = rootCtx.node._tree.fragment = vit.fragment;
            const log = /*@__PURE__*/ navigationContext.container.get(ILogger).scopeTo('RouteTree');
            if (vit.isAbsolute) {
                navigationContext = rootCtx;
            }
            if (navigationContext === rootCtx) {
                rt.root._setTree(rt);
                rootCtx.node = rt.root;
            }
            const suffix = navigationContext.allResolved instanceof Promise ? ' - awaiting promise' : '';
            log.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${suffix}`, rootCtx, rt, vit);
            // Wait till the promises to resolve the child routes are resolved.
            // Note that a route configuration can be a promise.
            return onResolve(navigationContext.allResolved, () => updateNode(log, vit, navigationContext, rootCtx.node));
        }, () => {
            const prev = tr.previousRouteTree.root.children;
            const next = tr.routeTree.root.children;
            const all = mergeDistinct(prev, next);
            Batch._start(b => {
                trace(logger, 3261 /* Events.rtrRunCanUnload */, prev.length);
                for (const node of prev) {
                    node.context.vpa._canUnload(tr, b);
                }
            })._continueWith(b => {
                if (tr.guardsResult !== true) {
                    b._push(); // prevent the next step in the batch from running
                    this._cancelNavigation(tr);
                }
            })._continueWith(b => {
                trace(logger, 3262 /* Events.rtrRunCanLoad */, next.length);
                for (const node of next) {
                    node.context.vpa._canLoad(tr, b);
                }
            })._continueWith(b => {
                if (tr.guardsResult !== true) {
                    b._push();
                    this._cancelNavigation(tr);
                }
            })._continueWith(b => {
                trace(logger, 3263 /* Events.rtrRunUnloading */, prev.length);
                for (const node of prev) {
                    node.context.vpa._unloading(tr, b);
                }
            })._continueWith(b => {
                trace(logger, 3264 /* Events.rtrRunLoading */, next.length);
                for (const node of next) {
                    node.context.vpa._loading(tr, b);
                }
            })._continueWith(b => {
                trace(logger, 3265 /* Events.rtrRunSwapping */, all.length);
                for (const node of all) {
                    node.context.vpa._swap(tr, b);
                }
            })._continueWith(b => {
                // it is possible that some of the child routes are cancelling the navigation
                if (tr.guardsResult !== true) {
                    b._push();
                    this._cancelNavigation(tr);
                }
            })._continueWith(() => {
                trace(logger, 3266 /* Events.rtrRunFinalizing */);
                // order doesn't matter for this operation
                all.forEach(function (node) {
                    node.context.vpa._endTransition();
                });
                this._navigated = true;
                this._instructions = tr.finalInstructions = tr.routeTree._finalizeInstructions();
                this._isNavigating = false;
                // apply history state
                const newUrl = tr.finalInstructions.toUrl(true, this.options._urlParser);
                switch (tr.options._getHistoryStrategy(this._instructions)) {
                    case 'none':
                        // do nothing
                        break;
                    case 'push':
                        this._locationMgr.pushState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
                        break;
                    case 'replace':
                        this._locationMgr.replaceState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), newUrl);
                        break;
                }
                this._events.publish(new NavigationEndEvent(tr.id, tr.instructions, this._instructions));
                tr.resolve(true);
                this._runNextTransition();
            })._start();
        });
    }
    updateTitle(tr = this.currentTr) {
        const title = this._getTitle(tr);
        if (title.length > 0) {
            this._p.document.title = title;
        }
        return this._p.document.title;
    }
    /** @internal */
    _getTitle(tr = this.currentTr) {
        let title;
        if (this._hasTitleBuilder) {
            title = this.options.buildTitle(tr) ?? '';
        }
        else {
            switch (typeof tr.options.title) {
                case 'function':
                    title = tr.options.title.call(void 0, tr.routeTree.root) ?? '';
                    break;
                case 'string':
                    title = tr.options.title;
                    break;
                default:
                    title = tr.routeTree.root.getTitle(tr.options.titleSeparator) ?? '';
                    break;
            }
        }
        return title;
    }
    /** @internal */
    _cancelNavigation(tr) {
        const logger = /*@__PURE__*/ this._logger.scopeTo('cancelNavigation()');
        trace(logger, 3267 /* Events.rtrCancelNavigationStart */, tr);
        const prev = tr.previousRouteTree.root.children;
        const next = tr.routeTree.root.children;
        const all = mergeDistinct(prev, next);
        // order doesn't matter for this operation
        all.forEach(function (node) {
            node.context.vpa._cancelUpdate();
        });
        this._instructions = tr.prevInstructions;
        this._routeTree = tr.previousRouteTree;
        this._isNavigating = false;
        const guardsResult = tr.guardsResult;
        this._events.publish(new NavigationCancelEvent(tr.id, tr.instructions, `guardsResult is ${guardsResult}`));
        if (guardsResult === false) {
            tr.resolve(false);
            // In case a new navigation was requested in the meantime, immediately start processing it
            this._runNextTransition();
        }
        else {
            let instructions;
            if (this._navigated && (tr.erredWithUnknownRoute || (tr.error != null && this.options.restorePreviousRouteTreeOnError)))
                instructions = tr.prevInstructions;
            else if (guardsResult === true)
                return;
            else
                instructions = guardsResult;
            void onResolve(this._enqueue(instructions, 'api', tr.managedState, tr), () => {
                trace(this._logger, 3268 /* Events.rtrCancelNavigationCompleted */, tr);
            });
        }
    }
    /** @internal */
    _runNextTransition() {
        if (this._nextTr === null)
            return;
        trace(this._logger, 3269 /* Events.rtrNextTr */, this._nextTr);
        this._p.taskQueue.queueTask(() => {
            // nextTransition is allowed to change up until the point when it's actually time to process it,
            // so we need to check it for null again when the scheduled task runs.
            const nextTr = this._nextTr;
            if (nextTr === null)
                return;
            try {
                this._run(nextTr);
            }
            catch (err) {
                nextTr._handleError(err);
            }
        });
    }
}
function updateNode(log, vit, ctx, node) {
    log.trace(`updateNode(ctx:%s,node:%s)`, ctx, node);
    node.queryParams = vit.queryParams;
    node.fragment = vit.fragment;
    if (!node.context.isRoot) {
        node.context.vpa._scheduleUpdate(node._tree.options, node);
    }
    if (node.context === ctx) {
        // Do an in-place update (remove children and re-add them by compiling the instructions into nodes)
        node._clearChildren();
        // - first append the nodes as children, compiling the viewport instructions.
        // - if afterward, any viewports are still available
        //   - look at the default value of those viewports
        //   - create instructions, and
        //   - add the compiled nodes from those to children of the node.
        return onResolve(onResolveAll(...vit.children.map(vi => createAndAppendNodes(log, node, vi))), () => onResolveAll(...ctx.getAvailableViewportAgents().reduce((acc, vpa) => {
            const vp = vpa.viewport;
            const component = vp.default;
            if (component === null)
                return acc;
            acc.push(createAndAppendNodes(log, node, ViewportInstruction.create({ component, viewport: vp.name, })));
            return acc;
        }, [])));
    }
    // Drill down until we're at the node whose context matches the provided navigation context
    return onResolveAll(...node.children.map(child => {
        return updateNode(log, vit, ctx, child);
    }));
}

class ParsedUrl {
    constructor(path, query, fragment) {
        this.path = path;
        this.query = query;
        this.fragment = fragment;
        this.id = `${path}?${query?.toString() ?? ''}#${fragment ?? ''}`;
    }
    toString() {
        return this.id;
    }
    /** @internal */
    static _create(value) {
        /**
         * Look for the fragment first and strip it away.
         * Next, look for the query string and strip it away.
         * The remaining value is the path.
         */
        let fragment = null;
        const fragmentStart = value.indexOf('#');
        if (fragmentStart >= 0) {
            const rawFragment = value.slice(fragmentStart + 1);
            fragment = decodeURIComponent(rawFragment);
            value = value.slice(0, fragmentStart);
        }
        let queryParams = null;
        const queryStart = value.indexOf('?');
        if (queryStart >= 0) {
            const queryString = value.slice(queryStart + 1);
            value = value.slice(0, queryStart);
            queryParams = Object.freeze(new URLSearchParams(queryString));
        }
        return new ParsedUrl(value, queryParams ?? emptyQuery, fragment);
    }
}
function stringify(pathOrParsedUrl, query, fragment) {
    // normalize the input
    let path;
    if (typeof pathOrParsedUrl === 'string') {
        path = pathOrParsedUrl;
    }
    else {
        path = pathOrParsedUrl.path;
        query = pathOrParsedUrl.query;
        fragment = pathOrParsedUrl.fragment;
    }
    query ??= emptyQuery;
    // compose the path, query and fragment to compose the serialized URL
    let queryString = query.toString();
    queryString = queryString === '' ? '' : `?${queryString}`;
    const hash = fragment != null && fragment.length > 0 ? `#${encodeURIComponent(fragment)}` : '';
    return `${path}${queryString}${hash}`;
}
const pathUrlParser = Object.freeze({
    parse(value) {
        return ParsedUrl._create(value);
    },
    stringify(pathOrParsedUrl, query, fragment) {
        return stringify(pathOrParsedUrl, query, fragment);
    }
});
const fragmentUrlParser = Object.freeze({
    parse(value) {
        /**
         * Look for the fragment; if found then take it and discard the rest.
         * Otherwise, the entire value is the fragment.
         * Next, look for the query string and strip it away.
         * Construct the serialized URL, with the fragment as path, the query and null fragment.
         */
        const start = value.indexOf('#');
        if (start >= 0) {
            const rawFragment = value.slice(start + 1);
            value = decodeURIComponent(rawFragment);
        }
        return ParsedUrl._create(value);
    },
    stringify(pathOrParsedUrl, query, fragment) {
        return `/#/${stringify(pathOrParsedUrl, query, fragment)}`;
    }
});

function valueOrFuncToValue(instructions, valueOrFunc) {
    if (typeof valueOrFunc === 'function') {
        return valueOrFunc(instructions);
    }
    return valueOrFunc;
}
const IRouterOptions = /*@__PURE__*/ DI.createInterface('RouterOptions');
class RouterOptions {
    constructor(useUrlFragmentHash, useHref, 
    /**
     * The strategy to use for interacting with the browser's `history` object (if applicable).
     *
     * - `none`: do not interact with the `history` object at all.
     * - `replace`: replace the current state in history
     * - `push`: push a new state onto the history (default)
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `push`
     */
    historyStrategy, 
    /**
     * An optional handler to build the title.
     * When configured, the work of building the title string is completely handed over to this function.
     * If this function returns `null`, the title is not updated.
     */
    buildTitle, 
    /**
     * When set to `false`, the navigation model won't be generated.
     * The default value is `true`.
     */
    useNavigationModel, 
    /**
     * The class that is added to the element by the `load` custom attribute, if the associated instruction is active.
     * If no value is provided while configuring router, no class will be added.
     * The default value is `null`.
     */
    activeClass, 
    /**
     * When set to `true`, the router will try to restore previous route tree, when a routing instruction errs.
     * Set this to `false`, if a stricter behavior is desired. However, in that case, you need to ensure the avoidance of errors.
     * The default value is `true`.
     */
    restorePreviousRouteTreeOnError) {
        this.useUrlFragmentHash = useUrlFragmentHash;
        this.useHref = useHref;
        this.historyStrategy = historyStrategy;
        this.buildTitle = buildTitle;
        this.useNavigationModel = useNavigationModel;
        this.activeClass = activeClass;
        this.restorePreviousRouteTreeOnError = restorePreviousRouteTreeOnError;
        this._urlParser = useUrlFragmentHash ? fragmentUrlParser : pathUrlParser;
    }
    static create(input) {
        return new RouterOptions(input.useUrlFragmentHash ?? false, input.useHref ?? true, input.historyStrategy ?? 'push', input.buildTitle ?? null, input.useNavigationModel ?? true, input.activeClass ?? null, input.restorePreviousRouteTreeOnError ?? true);
    }
    toString() {
        return `RO(${[
            ['historyStrategy', 'history'],
        ].map(([key, name]) => {
            const value = this[key];
            return `${name}:${typeof value === 'function' ? value : `'${value}'`}`;
        }).join(',')})`;
    }
}
class NavigationOptions {
    constructor(
    /**
     * Same as `RouterOptions#historyStrategy`.
     */
    historyStrategy, title, titleSeparator, 
    /**
     * Specify a context to use for relative navigation.
     *
     * - `null` (or empty): navigate relative to the root (absolute navigation)
     * - `IRouteContext`: navigate relative to specifically this RouteContext (advanced users).
     * - `HTMLElement`: navigate relative to the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): navigate relative to this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     */
    context, 
    /**
     * Specify an object to be serialized to a query string, and then set to the query string of the new URL.
     */
    queryParams, 
    /**
     * Specify the hash fragment for the new URL.
     */
    fragment, 
    /**
     * Specify any kind of state to be stored together with the history entry for this navigation.
     */
    state, transitionPlan) {
        this.historyStrategy = historyStrategy;
        this.title = title;
        this.titleSeparator = titleSeparator;
        this.context = context;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.state = state;
        this.transitionPlan = transitionPlan;
    }
    static create(routerOptions, input) {
        return new NavigationOptions(input.historyStrategy ?? routerOptions.historyStrategy, input.title ?? null, input.titleSeparator ?? ' | ', input.context ?? null, input.queryParams ?? null, input.fragment ?? '', input.state ?? null, input.transitionPlan ?? null);
    }
    /** @internal */
    _clone() {
        return new NavigationOptions(this.historyStrategy, this.title, this.titleSeparator, this.context, { ...this.queryParams }, this.fragment, this.state === null ? null : { ...this.state }, this.transitionPlan);
    }
    /** @internal */
    _getHistoryStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.historyStrategy);
    }
}

const defaultViewportName = 'default';
class ViewportInstruction {
    constructor(open, close, recognizedRoute, component, viewport, params, children) {
        this.open = open;
        this.close = close;
        this.recognizedRoute = recognizedRoute;
        this.component = component;
        this.viewport = viewport;
        this.params = params;
        this.children = children;
    }
    static create(instruction) {
        if (instruction instanceof ViewportInstruction)
            return instruction; // eslint is being really weird here
        if (isPartialViewportInstruction(instruction)) {
            const component = TypedNavigationInstruction.create(instruction.component);
            const children = instruction.children?.map(ViewportInstruction.create) ?? [];
            return new ViewportInstruction(instruction.open ?? 0, instruction.close ?? 0, instruction.recognizedRoute ?? null, component, instruction.viewport ?? null, Object.freeze(instruction.params ?? null), children);
        }
        const typedInstruction = TypedNavigationInstruction.create(instruction);
        return new ViewportInstruction(0, 0, null, typedInstruction, null, null, []);
    }
    contains(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length < otherChildren.length) {
            return false;
        }
        if (!this.component.equals(other.component))
            return false;
        // if either of the viewports are not set then ignore
        const vp = this.viewport ?? null;
        const otherVp = other.viewport ?? null;
        if (vp !== null && otherVp !== null && vp !== otherVp)
            return false;
        for (let i = 0, ii = otherChildren.length; i < ii; ++i) {
            if (!thisChildren[i].contains(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        if (!this.component.equals(other.component) ||
            this.viewport !== other.viewport ||
            !shallowEquals(this.params, other.params)) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    /** @internal */
    _clone() {
        return new ViewportInstruction(this.open, this.close, this.recognizedRoute, this.component._clone(), this.viewport, this.params, [...this.children]);
    }
    toUrlComponent(recursive = true) {
        const component = this.component.toUrlComponent();
        const vp = this.viewport;
        const viewport = component.length === 0 || vp === null || vp.length === 0 || vp === defaultViewportName ? '' : `@${vp}`;
        const thisPart = `${'('.repeat(this.open)}${component}${stringifyParams(this.params)}${viewport}${')'.repeat(this.close)}`;
        const childPart = recursive ? this.children.map(x => x.toUrlComponent()).join('+') : '';
        return thisPart.length > 0
            ? childPart.length > 0
                ? `${thisPart}/${childPart}`
                : thisPart
            : childPart;
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        const component = `c:${this.component}`;
        const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `viewport:${this.viewport}`;
        const children = this.children.length === 0 ? '' : `children:[${this.children.map(String).join(',')}]`;
        const props = [component, viewport, children].filter(Boolean).join(',');
        return `VPI(${props})`;
    }
}
/**
 * Note on the parenthesized parameters:
 * We will land on this branch if and only if the component cannot be eagerly recognized (in the RouteContext#generateViewportInstruction) AND the parameters are also provided.
 * When the routes are eagerly recognized, then there is no parameters left at this point and everything is already packed in the generated path as well as in the recognized route.
 * Thus, in normal scenarios the users will never land here.
 *
 * Whenever, they are using a hand composed (string) path, then in that case there is no question of having parameters at this point, rather the given path is recognized in the createAndAppendNodes.
 * It might be a rare edge case where users provide half the parameters in the string path and half as form of parameters; example: `load="route: r1/id1; params.bind: {id2}"`.
 * We might not want to officially support such cases.
 *
 * However, as the route recognition is inherently lazy (think about child routes, whose routing configuration are not resolved till a child routing context is created, or
 * the usage of instance level getRouteConfig), the component cannot be recognized fully eagerly. Thus, it is difficult at this point to correctly handle parameters as defined by the path templates defined for the component.
 * This artifact is kept here for the purpose of fallback.
 *
 * We can think about a stricter mode where we throw error if any params remains unconsumed at this point.
 * Or simply ignore the params while creating the URL. However, that does not feel right at all.
 */
function stringifyParams(params) {
    if (params === null)
        return '';
    const keys = Object.keys(params);
    const numKeys = keys.length;
    if (numKeys === 0)
        return '';
    const values = Array(numKeys);
    const indexKeys = [];
    const namedKeys = [];
    for (const key of keys) {
        if (isArrayIndex(key)) {
            indexKeys.push(Number(key));
        }
        else {
            namedKeys.push(key);
        }
    }
    for (let i = 0; i < numKeys; ++i) {
        const indexKeyIdx = indexKeys.indexOf(i);
        if (indexKeyIdx > -1) {
            values[i] = params[i];
            indexKeys.splice(indexKeyIdx, 1);
        }
        else {
            const namedKey = namedKeys.shift();
            values[i] = `${namedKey}=${params[namedKey]}`;
        }
    }
    return `(${values.join(',')})`;
}
class ViewportInstructionTree {
    constructor(options, isAbsolute, children, queryParams, fragment) {
        this.options = options;
        this.isAbsolute = isAbsolute;
        this.children = children;
        this.queryParams = queryParams;
        this.fragment = fragment;
        Object.freeze(queryParams);
    }
    static create(instructionOrInstructions, routerOptions, options, rootCtx) {
        options = options instanceof NavigationOptions ? options : NavigationOptions.create(routerOptions, options ?? emptyObject);
        let context = options.context;
        if (!(context instanceof RouteContext) && rootCtx != null) {
            context = options.context = RouteContext.resolve(rootCtx, context);
        }
        const hasContext = context != null;
        if (instructionOrInstructions instanceof Array) {
            const len = instructionOrInstructions.length;
            const children = new Array(len);
            const query = new URLSearchParams(options.queryParams ?? emptyObject);
            for (let i = 0; i < len; i++) {
                const instruction = instructionOrInstructions[i];
                const eagerVi = hasContext ? context._generateViewportInstruction(instruction) : null;
                if (eagerVi !== null) {
                    children[i] = eagerVi.vi;
                    mergeURLSearchParams(query, eagerVi.query, false);
                }
                else {
                    children[i] = ViewportInstruction.create(instruction);
                }
            }
            return new ViewportInstructionTree(options, false, children, query, options.fragment);
        }
        if (typeof instructionOrInstructions === 'string') {
            const expr = RouteExpression.parse(routerOptions._urlParser.parse(instructionOrInstructions));
            return expr.toInstructionTree(options);
        }
        const eagerVi = hasContext
            ? context._generateViewportInstruction(isPartialViewportInstruction(instructionOrInstructions)
                ? { ...instructionOrInstructions, params: instructionOrInstructions.params ?? emptyObject }
                : { component: instructionOrInstructions, params: emptyObject })
            : null;
        const query = new URLSearchParams(options.queryParams ?? emptyObject);
        return eagerVi !== null
            ? new ViewportInstructionTree(options, false, [eagerVi.vi], mergeURLSearchParams(query, eagerVi.query, false), options.fragment)
            : new ViewportInstructionTree(options, false, [ViewportInstruction.create(instructionOrInstructions)], query, options.fragment);
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    toUrl(isFinalInstruction, parser) {
        let parentPath = '';
        if (!isFinalInstruction) {
            const parentPaths = [];
            let ctx = this.options.context;
            if (ctx != null && !(ctx instanceof RouteContext))
                throw new Error('Invalid operation; incompatible navigation context.');
            while (ctx != null && !ctx.isRoot) {
                const vpa = ctx.vpa;
                const node = vpa._currState === 4096 /* State.currIsActive */ ? vpa._currNode : vpa._nextNode;
                if (node == null)
                    throw new Error('Invalid operation; nodes of the viewport agent are not set.');
                parentPaths.splice(0, 0, node.instruction.toUrlComponent());
                ctx = ctx.parent;
            }
            if (parentPaths[0] === '') {
                parentPaths.splice(0, 1);
            }
            parentPath = parentPaths.join('/');
        }
        const currentPath = this.toPath();
        return parser.stringify(parentPath.length > 0 ? `${parentPath}/${currentPath}` : currentPath, this.queryParams, this.fragment);
    }
    toPath() {
        return this.children.map(x => x.toUrlComponent()).join('+');
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        return `[${this.children.map(String).join(',')}]`;
    }
}
class NavigationStrategy {
    constructor(
    /** @internal */ getComponent) {
        this.getComponent = getComponent;
    }
}

class TypedNavigationInstruction {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static create(instruction) {
        if (instruction instanceof TypedNavigationInstruction) {
            return instruction;
        }
        if (typeof instruction === 'string')
            return new TypedNavigationInstruction(0 /* NavigationInstructionType.string */, instruction);
        // Typings prevent this from happening, but guard it anyway due to `as any` and the sorts being a thing in userland code and tests.
        if (!isObjectOrFunction(instruction))
            expectType('function/class or object', '', instruction);
        if (instruction instanceof NavigationStrategy)
            return new TypedNavigationInstruction(5 /* NavigationInstructionType.NavigationStrategy */, instruction);
        if (typeof instruction === 'function') {
            if (CustomElement.isType(instruction)) {
                // This is the class itself
                // CustomElement.getDefinition will throw if the type is not a custom element
                const definition = CustomElement.getDefinition(instruction);
                return new TypedNavigationInstruction(2 /* NavigationInstructionType.CustomElementDefinition */, definition);
            }
            else {
                return TypedNavigationInstruction.create(instruction());
            }
        }
        if (instruction instanceof Promise)
            return new TypedNavigationInstruction(3 /* NavigationInstructionType.Promise */, instruction);
        if (isPartialViewportInstruction(instruction)) {
            const viewportInstruction = ViewportInstruction.create(instruction);
            return new TypedNavigationInstruction(1 /* NavigationInstructionType.ViewportInstruction */, viewportInstruction);
        }
        if (isCustomElementViewModel(instruction))
            return new TypedNavigationInstruction(4 /* NavigationInstructionType.IRouteViewModel */, instruction);
        // We might have gotten a complete definition. In that case use it as-is.
        if (instruction instanceof CustomElementDefinition)
            return new TypedNavigationInstruction(2 /* NavigationInstructionType.CustomElementDefinition */, instruction);
        // If we have a partial definition, create a complete definition from it.
        // Use-case:
        // import * as component from './conventional-html-only-component.html';
        // @route({
        //   routes: [
        //     {
        //       path: 'path',
        //       component,
        //     },
        //   ],
        // })
        if (isPartialCustomElementDefinition(instruction)) {
            const definition = CustomElementDefinition.create(instruction);
            CustomElement.define(definition);
            return new TypedNavigationInstruction(2 /* NavigationInstructionType.CustomElementDefinition */, definition);
        }
        throw new Error(getMessage(3400 /* Events.instrInvalid */, tryStringify(instruction)));
    }
    equals(other) {
        switch (this.type) {
            case 5 /* NavigationInstructionType.NavigationStrategy */:
            case 2 /* NavigationInstructionType.CustomElementDefinition */:
            case 4 /* NavigationInstructionType.IRouteViewModel */:
            case 3 /* NavigationInstructionType.Promise */:
            case 0 /* NavigationInstructionType.string */:
                return this.type === other.type && this.value === other.value;
            case 1 /* NavigationInstructionType.ViewportInstruction */:
                return this.type === other.type && this.value.equals(other.value);
        }
    }
    /** @internal */
    _clone() {
        return new TypedNavigationInstruction(this.type, this.value);
    }
    toUrlComponent() {
        switch (this.type) {
            case 2 /* NavigationInstructionType.CustomElementDefinition */:
                return this.value.name;
            case 4 /* NavigationInstructionType.IRouteViewModel */:
            case 3 /* NavigationInstructionType.Promise */:
            case 5 /* NavigationInstructionType.NavigationStrategy */:
                throw new Error(getMessage(3403 /* Events.instrInvalidUrlComponentOperation */, this.type));
            case 1 /* NavigationInstructionType.ViewportInstruction */:
                return this.value.toUrlComponent();
            case 0 /* NavigationInstructionType.string */:
                return this.value;
        }
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        switch (this.type) {
            case 2 /* NavigationInstructionType.CustomElementDefinition */:
                return `CEDef(name:'${this.value.name}')`;
            case 5 /* NavigationInstructionType.NavigationStrategy */:
                return `NS`;
            case 3 /* NavigationInstructionType.Promise */:
                return `Promise`;
            case 4 /* NavigationInstructionType.IRouteViewModel */:
                return `VM(name:'${CustomElement.getDefinition(this.value.constructor).name}')`;
            case 1 /* NavigationInstructionType.ViewportInstruction */:
                return this.value.toString();
            case 0 /* NavigationInstructionType.string */:
                return `'${this.value}'`;
        }
    }
}

/**
 * A component agent handles an instance of a routed view-model (a component).
 * It deals with invoking the hooks (`canLoad`, `loading`, `canUnload`, `unloading`),
 * and activating, deactivating, and disposing the component (via the associated controller).
 *
 * @internal
 */
class ComponentAgent {
    constructor(
    /** @internal */ _instance, 
    /** @internal */ _controller, 
    /** @internal */ _routeNode, 
    /** @internal */ _ctx, 
    /** @internal */ _routerOptions) {
        this._instance = _instance;
        this._controller = _controller;
        this._routeNode = _routeNode;
        this._ctx = _ctx;
        this._routerOptions = _routerOptions;
        this._logger = _controller.container.get(ILogger).scopeTo(`ComponentAgent<${_ctx._friendlyPath}>`);
        trace(this._logger, 3050 /* Events.caCreated */);
        const lifecycleHooks = _controller.lifecycleHooks;
        this._canLoadHooks = (lifecycleHooks.canLoad ?? []).map(x => x.instance);
        this._loadHooks = (lifecycleHooks.loading ?? []).map(x => x.instance);
        this._canUnloadHooks = (lifecycleHooks.canUnload ?? []).map(x => x.instance);
        this._unloadHooks = (lifecycleHooks.unloading ?? []).map(x => x.instance);
        this._hasCanLoad = 'canLoad' in _instance;
        this._hasLoad = 'loading' in _instance;
        this._hasCanUnload = 'canUnload' in _instance;
        this._hasUnload = 'unloading' in _instance;
    }
    /** @internal */
    _activate(initiator, parent) {
        const controller = this._controller;
        const viewportController = this._ctx.vpa.hostController;
        switch (controller.mountTarget) {
            case MountTarget.host:
            case MountTarget.shadowRoot:
                viewportController.host.appendChild(controller.host);
                break;
            case MountTarget.location:
                viewportController.host.append(controller.location.$start, controller.location);
                break;
            case MountTarget.none:
                throw new Error('Invalid mount target for routed component');
        }
        if (initiator === null) {
            trace(this._logger, 3051 /* Events.caActivateSelf */);
            return this._controller.activate(this._controller, parent);
        }
        trace(this._logger, 3052 /* Events.caActivateInitiator */);
        // Promise return values from user VM hooks are awaited by the initiator
        void this._controller.activate(initiator, parent);
    }
    /** @internal */
    _deactivate(initiator, parent) {
        const controller = this._controller;
        // there's a case controller was disposed and is being deactivated again?
        // todo: these 3 lines seems invasive, and ugly, should this be a method on Controller?
        controller.host?.remove();
        controller.location?.remove();
        controller.location?.$start?.remove();
        if (initiator === null) {
            trace(this._logger, 3053 /* Events.caDeactivateSelf */);
            return controller.deactivate(controller, parent);
        }
        trace(this._logger, 3054 /* Events.caDeactivateInitiator */);
        // Promise return values from user VM hooks are awaited by the initiator
        void controller.deactivate(initiator, parent);
    }
    /** @internal */
    _dispose() {
        trace(this._logger, 3055 /* Events.caDispose */);
        this._controller.dispose();
    }
    /** @internal */
    _canUnload(tr, next, b) {
        trace(this._logger, 3056 /* Events.caCanUnload */, next, this._canUnloadHooks.length);
        b._push();
        let promise = Promise.resolve();
        for (const hook of this._canUnloadHooks) {
            b._push();
            promise = promise.then(() => new Promise((res) => {
                if (tr.guardsResult !== true) {
                    b._pop();
                    res();
                    return;
                }
                tr._run(() => {
                    return hook.canUnload(this._instance, next, this._routeNode);
                }, ret => {
                    if (tr.guardsResult === true && ret === false) {
                        tr.guardsResult = false;
                    }
                    b._pop();
                    res();
                });
            }));
        }
        if (this._hasCanUnload) {
            b._push();
            // deepscan-disable-next-line UNUSED_VAR_ASSIGN
            promise = promise.then(() => {
                if (tr.guardsResult !== true) {
                    b._pop();
                    return;
                }
                tr._run(() => {
                    return this._instance.canUnload(next, this._routeNode);
                }, ret => {
                    if (tr.guardsResult === true && ret === false) {
                        tr.guardsResult = false;
                    }
                    b._pop();
                });
            });
        }
        b._pop();
    }
    /** @internal */
    _canLoad(tr, next, b) {
        trace(this._logger, 3057 /* Events.caCanLoad */, next, this._canLoadHooks.length);
        const rootCtx = this._ctx.root;
        b._push();
        let promise = Promise.resolve();
        for (const hook of this._canLoadHooks) {
            b._push();
            promise = promise.then(() => new Promise((res) => {
                if (tr.guardsResult !== true) {
                    b._pop();
                    res();
                    return;
                }
                tr._run(() => {
                    return hook.canLoad(this._instance, next.params, next, this._routeNode);
                }, ret => {
                    if (tr.guardsResult === true && ret != null && ret !== true) {
                        tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this._routerOptions, void 0, rootCtx);
                    }
                    b._pop();
                    res();
                });
            }));
        }
        if (this._hasCanLoad) {
            b._push();
            // deepscan-disable-next-line UNUSED_VAR_ASSIGN
            promise = promise.then(() => {
                if (tr.guardsResult !== true) {
                    b._pop();
                    return;
                }
                tr._run(() => {
                    return this._instance.canLoad(next.params, next, this._routeNode);
                }, ret => {
                    if (tr.guardsResult === true && ret != null && ret !== true) {
                        tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret, this._routerOptions, void 0, rootCtx);
                    }
                    b._pop();
                });
            });
        }
        b._pop();
    }
    /** @internal */
    _unloading(tr, next, b) {
        trace(this._logger, 3058 /* Events.caUnloading */, next, this._unloadHooks.length);
        b._push();
        for (const hook of this._unloadHooks) {
            tr._run(() => {
                b._push();
                return hook.unloading(this._instance, next, this._routeNode);
            }, () => {
                b._pop();
            });
        }
        if (this._hasUnload) {
            tr._run(() => {
                b._push();
                return this._instance.unloading(next, this._routeNode);
            }, () => {
                b._pop();
            });
        }
        b._pop();
    }
    /** @internal */
    _loading(tr, next, b) {
        trace(this._logger, 3059 /* Events.caLoading */, next, this._loadHooks.length);
        b._push();
        for (const hook of this._loadHooks) {
            tr._run(() => {
                b._push();
                return hook.loading(this._instance, next.params, next, this._routeNode);
            }, () => {
                b._pop();
            });
        }
        if (this._hasLoad) {
            tr._run(() => {
                b._push();
                return this._instance.loading(next.params, next, this._routeNode);
            }, () => {
                b._pop();
            });
        }
        b._pop();
    }
}

const IRouteContext = /*@__PURE__*/ DI.createInterface('IRouteContext');
const allowedEagerComponentTypes = Object.freeze(['string', 'object', 'function']);
function isEagerInstruction(val) {
    // don't try to resolve an instruction with children eagerly, as the children are essentially resolved lazily, for now.
    if (val == null)
        return false;
    const params = val.params;
    const component = val.component;
    return typeof params === 'object'
        && params !== null
        && component != null
        && allowedEagerComponentTypes.includes(typeof component)
        && !(component instanceof Promise) // a promise component is inherently meant to be lazy-loaded
    ;
}
/**
 * Holds the information of a component in the context of a specific container.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteConfig and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteConfig` for a type is overridden manually via `Route.configure`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
class RouteContext {
    get isRoot() {
        return this.parent === null;
    }
    get depth() {
        return this.path.length - 1;
    }
    get allResolved() {
        return this._allResolved;
    }
    get node() {
        const node = this._node;
        if (node === null)
            throw new Error(getMessage(3171 /* Events.rcNoNode */, this));
        return node;
    }
    /** @internal */
    set node(value) {
        const prev = this._prevNode = this._node;
        if (prev !== value) {
            this._node = value;
            trace(this._logger, 3151 /* Events.rcNodeChanged */, this._prevNode, value);
        }
    }
    /**
     * The viewport hosting the component associated with this RouteContext.
     * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
     */
    get vpa() {
        const vpa = this._vpa;
        if (vpa === null)
            throw new Error(getMessage(3172 /* Events.rcNoVpa */, this));
        return vpa;
    }
    get navigationModel() {
        return this._navigationModel;
    }
    constructor(viewportAgent, parent, component, config, parentContainer, _router) {
        this.parent = parent;
        this.component = component;
        this.config = config;
        this._router = _router;
        /** @internal */ this._childViewportAgents = [];
        /**
         * The (fully resolved) configured child routes of this context's `RouteConfig`
         */
        this.childRoutes = [];
        /** @internal */
        this._allResolved = null;
        /** @internal */ this._prevNode = null;
        /** @internal */ this._node = null;
        /** @internal */ this._childRoutesConfigured = false;
        this._vpa = viewportAgent;
        if (parent === null) {
            this.root = this;
            this.path = [this];
            this._friendlyPath = component.name;
        }
        else {
            this.root = parent.root;
            this.path = [...parent.path, this];
            this._friendlyPath = `${parent._friendlyPath}/${component.name}`;
        }
        this._logger = parentContainer.get(ILogger).scopeTo(`RouteContext<${this._friendlyPath}>`);
        trace(this._logger, 3150 /* Events.rcCreated */);
        const observer = parentContainer.get(IObserverLocator).getObserver(this._router, 'isNavigating');
        const subscriber = {
            handleChange: (newValue, _previousValue) => {
                if (newValue !== true)
                    return;
                this.config._handleNavigationStart();
                for (const childRoute of this.childRoutes) {
                    if (childRoute instanceof Promise)
                        continue;
                    childRoute._handleNavigationStart();
                }
            }
        };
        observer.subscribe(subscriber);
        this._unsubscribeIsNavigatingChange = () => observer.unsubscribe(subscriber);
        this._moduleLoader = parentContainer.get(IModuleLoader);
        const container = this.container = parentContainer.createChild();
        this._platform = container.get(IPlatform);
        container.registerResolver(IController, this._hostControllerProvider = new InstanceProvider(), true);
        const ctxProvider = new InstanceProvider('IRouteContext', this);
        container.registerResolver(IRouteContext, ctxProvider);
        container.registerResolver(RouteContext, ctxProvider);
        this._recognizer = new RouteRecognizer();
        if (_router.options.useNavigationModel) {
            const navModel = this._navigationModel = new NavigationModel([]);
            // Note that routing-contexts have the same lifetime as the app itself; therefore, an attempt to dispose the subscription is kind of useless.
            // Also considering that in a realistic app the number of configured routes are limited in number, this subscription and keeping the routes' active property in sync should not create much issue.
            // If need be we can optimize it later.
            container
                .get(IRouterEvents)
                .subscribe('au:router:navigation-end', () => navModel._setIsActive(_router, this));
        }
        else {
            this._navigationModel = null;
        }
        this._processConfig(config);
    }
    /** @internal */
    _processConfig(config) {
        const allPromises = [];
        const childrenRoutes = config.routes ?? noRoutes;
        const len = childrenRoutes.length;
        if (len === 0) {
            const getRouteConfig = config.component.prototype?.getRouteConfig;
            this._childRoutesConfigured = getRouteConfig == null ? true : typeof getRouteConfig !== 'function';
            return;
        }
        const navModel = this._navigationModel;
        const hasNavModel = navModel !== null;
        let i = 0;
        for (; i < len; i++) {
            const childRoute = childrenRoutes[i];
            if (childRoute instanceof Promise) {
                allPromises.push(this._addRoute(childRoute));
                continue;
            }
            const rdResolution = resolveRouteConfiguration(childRoute, true, config, null, this);
            if (rdResolution instanceof Promise) {
                if (!isPartialChildRouteConfig(childRoute) || childRoute.path == null)
                    throw new Error(getMessage(3173 /* Events.rcNoPathLazyImport */));
                for (const path of ensureArrayOfStrings(childRoute.path)) {
                    this._$addRoute(path, childRoute.caseSensitive ?? false, rdResolution);
                }
                const idx = this.childRoutes.length;
                const p = rdResolution.then((rdConfig) => {
                    return this.childRoutes[idx] = rdConfig;
                });
                this.childRoutes.push(p);
                if (hasNavModel) {
                    navModel._addRoute(p);
                }
                allPromises.push(p.then(noop));
                continue;
            }
            for (const path of rdResolution.path ?? emptyArray) {
                this._$addRoute(path, rdResolution.caseSensitive, rdResolution);
            }
            this.childRoutes.push(rdResolution);
            if (hasNavModel) {
                navModel._addRoute(rdResolution);
            }
        }
        this._childRoutesConfigured = true;
        if (allPromises.length > 0) {
            this._allResolved = Promise.all(allPromises).then(() => {
                this._allResolved = null;
            });
        }
    }
    /**
     * Create a new `RouteContext` and register it in the provided container.
     *
     * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
     *
     * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
     */
    static setRoot(container) {
        const logger = container.get(ILogger).scopeTo('RouteContext');
        if (!container.has(IAppRoot, true)) {
            logAndThrow(new Error(getMessage(3167 /* Events.rcNoAppRoot */)), logger);
        }
        if (container.has(IRouteContext, true)) {
            logAndThrow(new Error(getMessage(3168 /* Events.rcHasRootContext */)), logger);
        }
        const { controller } = container.get(IAppRoot);
        if (controller === void 0) {
            logAndThrow(new Error(getMessage(3169 /* Events.rcNoRootCtrl */)), logger);
        }
        const router = container.get(IRouter);
        return onResolve(router.getRouteContext(null, controller.definition, controller.viewModel, controller.container, null, null, null), routeContext => {
            container.register(Registration.instance(IRouteContext, routeContext));
            routeContext.node = router.routeTree.root;
        });
    }
    static resolve(root, context) {
        const rootContainer = root.container;
        const logger = rootContainer.get(ILogger).scopeTo('RouteContext');
        if (context == null) {
            trace(logger, 3152 /* Events.rcResolveNullishContext */, context);
            return root;
        }
        if (context instanceof RouteContext) {
            trace(logger, 3153 /* Events.rcResolveInstance */, context);
            return context;
        }
        if (context instanceof rootContainer.get(IPlatform).Node) {
            trace(logger, 3154 /* Events.rcResolveNode */, context.nodeName);
            try {
                // CustomElement.for can theoretically throw in (as of yet) unknown situations.
                // If that happens, we want to know about the situation and *not* just fall back to the root context, as that might make
                // some already convoluted issues impossible to troubleshoot.
                // That's why we catch, log and re-throw instead of just letting the error bubble up.
                // This also gives us a set point in the future to potentially handle supported scenarios where this could occur.
                const controller = CustomElement.for(context, { searchParents: true });
                return controller.container.get(IRouteContext);
            }
            catch (err) {
                error(logger, 3155 /* Events.rcResolveNodeFailed */, context.nodeName, err);
                throw err;
            }
        }
        if (isCustomElementViewModel(context)) {
            const controller = context.$controller;
            trace(logger, 3156 /* Events.rcResolveCe */, controller.definition.name);
            return controller.container.get(IRouteContext);
        }
        if (isCustomElementController(context)) {
            const controller = context;
            trace(logger, 3157 /* Events.rcResolveCtrl */, controller.definition.name);
            return controller.container.get(IRouteContext);
        }
        logAndThrow(new Error(getMessage(3170 /* Events.rcResolveInvalidCtxType */, Object.prototype.toString.call(context))), logger);
    }
    dispose() {
        this.container.dispose();
        this._unsubscribeIsNavigatingChange();
    }
    /** @internal */
    _resolveViewportAgent(req) {
        trace(this._logger, 3158 /* Events.rcResolveVpa */, req);
        const agent = this._childViewportAgents.find(x => { return x._handles(req); });
        if (agent === void 0)
            throw new Error(getMessage(3174 /* Events.rcNoAvailableVpa */, req, this._printTree()));
        return agent;
    }
    getAvailableViewportAgents() {
        return this._childViewportAgents.filter(x => x._isAvailable());
    }
    getFallbackViewportAgent(name) {
        return this._childViewportAgents.find(x => x._isAvailable() && x.viewport.name === name && x.viewport.fallback !== '') ?? null;
    }
    /**
     * Create a component based on the provided viewportInstruction.
     *
     * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
     * @param routeNode - The routeNode that describes the component + state.
     *
     * @internal
     */
    _createComponentAgent(hostController, routeNode) {
        trace(this._logger, 3159 /* Events.rcCreateCa */, routeNode);
        this._hostControllerProvider.prepare(hostController);
        const container = this.container.createChild({ inheritParentResources: true });
        const platform = this._platform;
        const elDefn = routeNode.component;
        const host = platform.document.createElement(elDefn.name);
        registerHostNode(container, host, platform);
        const componentInstance = container.invoke(elDefn.Type);
        // this is the point where we can load the delayed (non-static) child route configuration by calling the getRouteConfig
        const task = this._childRoutesConfigured
            ? void 0
            : onResolve(resolveRouteConfiguration(componentInstance, false, this.config, routeNode, null), config => this._processConfig(config));
        return onResolve(task, () => {
            const controller = Controller.$el(container, componentInstance, host, { projections: null }, elDefn);
            const componentAgent = new ComponentAgent(componentInstance, controller, routeNode, this, this._router.options);
            this._hostControllerProvider.dispose();
            return componentAgent;
        });
    }
    /** @internal */
    _registerViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (this._childViewportAgents.includes(agent)) {
            trace(this._logger, 3161 /* Events.rcRegisterVpSkip */, agent);
            return agent;
        }
        trace(this._logger, 3160 /* Events.rcRegisterVp */, agent);
        this._childViewportAgents.push(agent);
        return agent;
    }
    /** @internal */
    _unregisterViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (!this._childViewportAgents.includes(agent)) {
            trace(this._logger, 3163 /* Events.rcUnregisterVpSkip */, agent);
            return;
        }
        trace(this._logger, 3162 /* Events.rcUnregisterVp */, agent);
        this._childViewportAgents.splice(this._childViewportAgents.indexOf(agent), 1);
    }
    recognize(path, searchAncestor = false) {
        trace(this._logger, 3164 /* Events.rcRecognizePath */, path);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let _current = this;
        let _continue = true;
        let result = null;
        while (_continue) {
            result = _current._recognizer.recognize(path);
            if (result === null) {
                if (!searchAncestor || _current.isRoot)
                    return null;
                _current = _current.parent;
            }
            else {
                _continue = false;
            }
        }
        return new $RecognizedRoute(result, Reflect.has(result.params, RESIDUE)
            ? (result.params[RESIDUE] ?? null)
            : null);
    }
    _addRoute(routeable) {
        trace(this._logger, 3165 /* Events.rcAddRoute */, routeable);
        return onResolve(resolveRouteConfiguration(routeable, true, this.config, null, this), rdConfig => {
            for (const path of rdConfig.path ?? emptyArray) {
                this._$addRoute(path, rdConfig.caseSensitive, rdConfig);
            }
            this._navigationModel?._addRoute(rdConfig);
            this.childRoutes.push(rdConfig);
        });
    }
    /** @internal */
    _$addRoute(path, caseSensitive, handler) {
        this._recognizer.add({
            path,
            caseSensitive,
            handler,
        }, true);
    }
    /** @internal */
    _resolveLazy(promise) {
        return this._moduleLoader.load(promise, m => {
            // when we have import('./some-path').then(x => x.somethingSpecific)
            const raw = m.raw;
            if (typeof raw === 'function') {
                const def = CustomElement.isType(raw) ? CustomElement.getDefinition(raw) : null;
                if (def != null)
                    return def;
            }
            let defaultExport = void 0;
            let firstNonDefaultExport = void 0;
            for (const item of m.items) {
                const def = (CustomElement.isType(item.value)
                    // static resource API may require to change this item.definition
                    // into CustomElement.getDefinition(item.value) or CustomElement.getOrCreateDefinition(item.value)
                    ? item.definition
                    : null);
                if (def != null) {
                    if (item.key === 'default') {
                        defaultExport = def;
                    }
                    else if (firstNonDefaultExport === void 0) {
                        firstNonDefaultExport = def;
                    }
                }
            }
            if (defaultExport === void 0 && firstNonDefaultExport === void 0) {
                if (!isPartialCustomElementDefinition(raw))
                    throw new Error(getMessage(3175 /* Events.rcInvalidLazyImport */, promise));
                // use-case: import('./conventional-html-only-component.html')
                const definition = CustomElementDefinition.create(raw);
                CustomElement.define(definition);
                return definition;
            }
            return firstNonDefaultExport ?? defaultExport;
        });
    }
    _generateViewportInstruction(instruction) {
        if (!isEagerInstruction(instruction))
            return null;
        const component = instruction.component;
        let paths;
        let throwError = false;
        if (component instanceof RouteConfig) {
            paths = component.path;
            throwError = true;
        }
        else if (typeof component === 'string') {
            const $rdConfig = this.childRoutes.find(x => x.id === component);
            if ($rdConfig === void 0)
                return null;
            paths = $rdConfig.path;
        }
        else if (component.type === 0 /* NavigationInstructionType.string */) {
            const $rdConfig = this.childRoutes.find(x => x.id === component.value);
            if ($rdConfig === void 0)
                return null;
            paths = $rdConfig.path;
        }
        else {
            // as the component is ensured not to be a promise in here, the resolution should also be synchronous
            const ced = resolveCustomElementDefinition(component, this)[1];
            paths = this.childRoutes.reduce((acc, x) => {
                if (x.component === ced.Type) {
                    acc.push(...x.path);
                }
                return acc;
            }, []);
            throwError = true;
        }
        if (paths === void 0)
            return null;
        const params = instruction.params;
        const recognizer = this._recognizer;
        const numPaths = paths.length;
        const errors = [];
        let result = null;
        if (numPaths === 1) {
            const result = core(paths[0]);
            if (result === null) {
                if (throwError)
                    throw new Error(getMessage(3166 /* Events.rcEagerPathGenerationFailed */, instruction, errors));
                debug(this._logger, 3166 /* Events.rcEagerPathGenerationFailed */, instruction, errors);
                return null;
            }
            return {
                vi: ViewportInstruction.create({
                    recognizedRoute: new $RecognizedRoute(new RecognizedRoute(result.endpoint, result.consumed), null),
                    component: result.path,
                    children: instruction.children,
                    viewport: instruction.viewport,
                    open: instruction.open,
                    close: instruction.close,
                }),
                query: result.query,
            };
        }
        let maxScore = 0;
        for (let i = 0; i < numPaths; i++) {
            const res = core(paths[i]);
            if (res === null)
                continue;
            if (result === null) {
                result = res;
                maxScore = Object.keys(res.consumed).length;
            }
            else if (Object.keys(res.consumed).length > maxScore) { // ignore anything other than monotonically increasing consumption
                result = res;
            }
        }
        if (result === null) {
            if (throwError)
                throw new Error(getMessage(3166 /* Events.rcEagerPathGenerationFailed */, instruction, errors));
            debug(this._logger, 3166 /* Events.rcEagerPathGenerationFailed */, instruction, errors);
            return null;
        }
        return {
            vi: ViewportInstruction.create({
                recognizedRoute: new $RecognizedRoute(new RecognizedRoute(result.endpoint, result.consumed), null),
                component: result.path,
                children: instruction.children,
                viewport: instruction.viewport,
                open: instruction.open,
                close: instruction.close,
            }),
            query: result.query,
        };
        function core(path) {
            const endpoint = recognizer.getEndpoint(path);
            if (endpoint === null) {
                errors.push(`No endpoint found for the path: '${path}'.`);
                return null;
            }
            const consumed = Object.create(null);
            for (const param of endpoint.params) {
                const key = param.name;
                let value = params[key];
                if (value == null || String(value).length === 0) {
                    if (!param.isOptional) {
                        errors.push(`No value for the required parameter '${key}' is provided for the path: '${path}'.`);
                        return null;
                    }
                    value = '';
                }
                else {
                    if (!param.satisfiesPattern(value)) {
                        errors.push(`The value '${value}' for the parameter '${key}' does not satisfy the pattern '${param.pattern}'.`);
                        return null;
                    }
                    consumed[key] = value;
                }
                const pattern = param.isStar
                    ? `*${key}`
                    : param.isOptional
                        ? `:${key}?`
                        : `:${key}`;
                path = path.replace(pattern, encodeURIComponent(value));
            }
            const consumedKeys = Object.keys(consumed);
            const query = Object.fromEntries(Object.entries(params).filter(([key]) => !consumedKeys.includes(key)));
            return { path: path.replace(/\/\//g, '/'), endpoint, consumed, query };
        }
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        const vpAgents = this._childViewportAgents;
        const viewports = vpAgents.map(String).join(',');
        return `RC(path:'${this._friendlyPath}',viewports:[${viewports}])`;
    }
    /** @internal */
    _printTree() {
        const tree = [];
        for (let i = 0; i < this.path.length; ++i) {
            tree.push(`${' '.repeat(i)}${this.path[i]}`);
        }
        return tree.join('\n');
    }
}
class $RecognizedRoute {
    constructor(route, residue) {
        this.route = route;
        this.residue = residue;
    }
    toString() {
        const route = this.route;
        const cr = route.endpoint.route;
        return `RR(route:(endpoint:(route:(path:${cr.path},handler:${cr.handler})),params:${JSON.stringify(route.params)}),residue:${this.residue})`;
    }
}
// Usage of classical interface pattern is intentional.
class NavigationModel {
    constructor(routes) {
        this.routes = routes;
        this._promise = void 0;
    }
    resolve() {
        return onResolve(this._promise, noop);
    }
    /** @internal */
    _setIsActive(router, context) {
        void onResolve(this._promise, () => {
            for (const route of this.routes) {
                route._setIsActive(router, context);
            }
        });
    }
    /** @internal */
    _addRoute(route) {
        const routes = this.routes;
        if (!(route instanceof Promise)) {
            if ((route.nav ?? false) && route.redirectTo === null) {
                routes.push(NavigationRoute._create(route));
            }
            return;
        }
        const index = routes.length;
        routes.push((void 0)); // reserve the slot
        let promise = void 0;
        promise = this._promise = onResolve(this._promise, () => onResolve(route, rdConfig => {
            if (rdConfig.nav && rdConfig.redirectTo === null) {
                routes[index] = NavigationRoute._create(rdConfig);
            }
            else {
                routes.splice(index, 1);
            }
            if (this._promise === promise) {
                this._promise = void 0;
            }
        }));
    }
}
// Usage of classical interface pattern is intentional.
class NavigationRoute {
    constructor(id, path, title, data) {
        this.id = id;
        this.path = path;
        this.title = title;
        this.data = data;
        this._trees = null;
    }
    /** @internal */
    static _create(rdConfig) {
        return new NavigationRoute(rdConfig.id, ensureArrayOfStrings(rdConfig.path ?? emptyArray), rdConfig.title, rdConfig.data);
    }
    get isActive() {
        return this._isActive;
    }
    /** @internal */
    _setIsActive(router, context) {
        let trees = this._trees;
        if (trees === null) {
            const routerOptions = router.options;
            trees = this._trees = this.path.map(p => {
                const ep = context._recognizer.getEndpoint(p);
                if (ep === null)
                    throw new Error(getMessage(3450 /* Events.nmNoEndpoint */, p));
                return new ViewportInstructionTree(NavigationOptions.create(routerOptions, { context }), false, [
                    ViewportInstruction.create({
                        recognizedRoute: new $RecognizedRoute(new RecognizedRoute(ep, emptyObject), null),
                        component: p,
                    })
                ], emptyQuery, null);
            });
        }
        this._isActive = trees.some(vit => router.routeTree.contains(vit, true));
    }
}

class ViewportCustomElement {
    constructor() {
        this.name = defaultViewportName;
        this.usedBy = '';
        this.default = '';
        this.fallback = '';
        /** @internal */ this._agent = (void 0);
        /** @internal */ this._controller = (void 0);
        /** @internal */
        this._ctx = resolve(IRouteContext);
        /** @internal */
        this._logger = (resolve(ILogger).scopeTo(`au-viewport<${this._ctx._friendlyPath}>`));
    }
    /** @internal */
    _getFallback(viewportInstruction, routeNode, context) {
        const fallback = this.fallback;
        return typeof fallback === 'function'
            && !CustomElement.isType(fallback)
            ? fallback(viewportInstruction, routeNode, context)
            : fallback;
    }
    hydrated(controller) {
        trace(this._logger, 3000 /* Events.vpHydrated */);
        this._controller = controller;
        this._agent = this._ctx._registerViewport(this);
    }
    attaching(initiator, _parent) {
        trace(this._logger, 3001 /* Events.vpAttaching */);
        return this._agent._activateFromViewport(initiator, this._controller);
    }
    detaching(initiator, _parent) {
        trace(this._logger, 3002 /* Events.vpDetaching */);
        return this._agent._deactivateFromViewport(initiator, this._controller);
    }
    dispose() {
        trace(this._logger, 3003 /* Events.vpDispose */);
        this._ctx._unregisterViewport(this);
        this._agent._dispose();
        this._agent = (void 0);
    }
    // Should not be adjust for DEV as it is also used of logging in production build.
    toString() {
        const propStrings = [];
        for (const prop of props) {
            const value = this[prop];
            // Only report props that don't have default values (but always report name)
            // This is a bit naive and dirty right now, but it's mostly for debugging purposes anyway. Can clean up later. Maybe put it in a serializer
            switch (typeof value) {
                case 'string':
                    if (value !== '') {
                        propStrings.push(`${prop}:'${value}'`);
                    }
                    break;
                default: {
                    propStrings.push(`${prop}:${String(value)}`);
                }
            }
        }
        return `VP(ctx:'${this._ctx._friendlyPath}',${propStrings.join(',')})`;
    }
}
CustomElement.define({
    name: 'au-viewport',
    bindables: ['name', 'usedBy', 'default', 'fallback'],
}, ViewportCustomElement);
const props = [
    'name',
    'usedBy',
    'default',
    'fallback',
];

class LoadCustomAttribute {
    constructor() {
        /** @internal */ this._el = resolve(INode);
        /** @internal */ this._router = resolve(IRouter);
        /** @internal */ this._ctx = resolve(IRouteContext);
        /** @internal */ this._events = resolve(IRouterEvents);
        /** @internal */ this._locationMgr = resolve(ILocationManager);
        this.attribute = 'href';
        this.active = false;
        /** @internal */ this._href = null;
        /** @internal */ this._instructions = null;
        /** @internal */ this._navigationEndListener = null;
        this.onClick = (e) => {
            if (this._instructions === null) {
                return;
            }
            // Ensure this is an ordinary left-button click.
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
                return;
            }
            e.preventDefault();
            // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
            void this._router.load(this._instructions, { context: this.context });
        };
        const el = this._el;
        // Ensure the element is not explicitly marked as external.
        this._isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
        this._activeClass = this._router.options.activeClass;
    }
    binding() {
        if (this._isEnabled) {
            this._el.addEventListener('click', this.onClick);
        }
        this.valueChanged();
        this._navigationEndListener = this._events.subscribe('au:router:navigation-end', _e => {
            const active = this.active = this._instructions !== null && this._router.isActive(this._instructions, this.context);
            const activeClass = this._activeClass;
            if (activeClass === null)
                return;
            this._el.classList.toggle(activeClass, active);
        });
    }
    attaching() {
        const ctx = this.context;
        const promise = ctx.allResolved;
        if (promise !== null) {
            return promise.then(() => {
                this.valueChanged();
            });
        }
    }
    unbinding() {
        if (this._isEnabled) {
            this._el.removeEventListener('click', this.onClick);
        }
        this._navigationEndListener.dispose();
    }
    valueChanged() {
        const router = this._router;
        const options = router.options;
        const component = this.route;
        // this allows binding context to null for navigation from root; unbound vs explicit null binding
        let ctx = this.context;
        if (ctx === void 0) {
            ctx = this.context = this._ctx;
        }
        else if (ctx === null) {
            ctx = this.context = this._ctx.root;
        }
        if (component != null && ctx.allResolved === null) {
            const params = this.params;
            const instructions = this._instructions = router.createViewportInstructions(typeof params === 'object' && params !== null
                ? { component, params }
                : component, { context: ctx });
            this._href = instructions.toUrl(false, options._urlParser);
        }
        else {
            this._instructions = null;
            this._href = null;
        }
        const controller = CustomElement.for(this._el, { optional: true });
        if (controller !== null) {
            controller.viewModel[this.attribute] = this._instructions;
        }
        else {
            if (this._href === null) {
                this._el.removeAttribute(this.attribute);
            }
            else {
                const value = options.useUrlFragmentHash ? this._href : this._locationMgr.addBaseHref(this._href);
                this._el.setAttribute(this.attribute, value);
            }
        }
    }
}
CustomAttribute.define({
    name: 'load',
    bindables: {
        route: { mode: bmToView, primary: true, callback: 'valueChanged' },
        params: { mode: bmToView, callback: 'valueChanged' },
        attribute: { mode: bmToView },
        active: { mode: bmFromView },
        context: { mode: bmToView, callback: 'valueChanged' }
    }
}, LoadCustomAttribute);

/*
 * Note: Intentionally, there is no bindable `context` here.
 * Otherwise this CA needs to be turned into a multi-binding CA.
 * Which means that the following simplest case won't work any longer:
 *
 * ```html
 * <a href="https://bla.bla.com/bla" data-external>bla</a>
 * ```
 * Because the template compiler will think that `https` is a bindable property in this CA,
 * and will fail as it won't find a bindable property `https` here in this CA.
 * Therefore, till the template compiler can handle that correctly, introduction of a bindable context is intentionally omitted.
 */
class HrefCustomAttribute {
    /** @internal */
    get _isExternal() {
        return this._el.hasAttribute('external') || this._el.hasAttribute('data-external');
    }
    constructor() {
        /** @internal */ this._el = resolve(INode);
        /** @internal */ this._router = resolve(IRouter);
        /** @internal */ this._ctx = resolve(IRouteContext);
        /** @internal */ this._isInitialized = false;
        if (this._router.options.useHref &&
            // Ensure the element is an anchor
            this._el.nodeName === 'A') {
            const windowName = resolve(IWindow).name;
            // Ensure the anchor targets the current window.
            switch (this._el.getAttribute('target')) {
                case null:
                case windowName:
                case '_self':
                    this._isEnabled = true;
                    break;
                default:
                    this._isEnabled = false;
                    break;
            }
        }
        else {
            this._isEnabled = false;
        }
    }
    binding() {
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._isEnabled = this._isEnabled && refs.get(this._el, CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
        }
        this.valueChanged(this.value);
        this._el.addEventListener('click', this);
        // this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this);
    }
    unbinding() {
        // this.eventListener.dispose();
        this._el.removeEventListener('click', this);
    }
    valueChanged(newValue) {
        if (newValue == null) {
            this._el.removeAttribute('href');
        }
        else {
            if (this._router.options.useUrlFragmentHash
                && this._ctx.isRoot
                && !/^[.#]/.test(newValue)
                && !this._isExternal) {
                newValue = `#${newValue}`;
            }
            this._el.setAttribute('href', newValue);
        }
    }
    handleEvent(e) {
        this._onClick(e);
    }
    /** @internal */
    _onClick(e) {
        // Ensure this is an ordinary left-button click
        if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0
            // on an internally managed link
            || this._isExternal
            || !this._isEnabled) {
            return;
        }
        // Use the normalized attribute instead of this.value to ensure consistency.
        const href = this._el.getAttribute('href');
        if (href !== null) {
            e.preventDefault();
            // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
            void this._router.load(href, { context: this._ctx });
        }
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

const RouterRegistration = IRouter;
/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
const DefaultComponents = [
    RouterRegistration,
];
const ViewportCustomElementRegistration = ViewportCustomElement;
const LoadCustomAttributeRegistration = LoadCustomAttribute;
const HrefCustomAttributeRegistration = HrefCustomAttribute;
/**
 * Default router resources:
 * - Custom Elements: `au-viewport`
 * - Custom Attributes: `load`, `href`
 */
const DefaultResources = [
    ViewportCustomElement,
    LoadCustomAttribute,
    HrefCustomAttribute,
];
function configure(container, options) {
    let basePath = null;
    if (isObjectOrFunction(options)) {
        basePath = options.basePath ?? null;
    }
    else {
        options = {};
    }
    const routerOptions = RouterOptions.create(options);
    return container.register(Registration.cachedCallback(IBaseHref, (handler, _, __) => {
        const window = handler.get(IWindow);
        const url = new URL(window.document.baseURI);
        url.pathname = normalizePath(basePath ?? url.pathname);
        return url;
    }), Registration.instance(IRouterOptions, routerOptions), Registration.instance(RouterOptions, routerOptions), AppTask.creating(IRouter, _ => { }), AppTask.hydrated(IContainer, RouteContext.setRoot), AppTask.activated(IRouter, router => router.start(true)), AppTask.deactivated(IRouter, router => router.stop()), ...DefaultComponents, ...DefaultResources);
}
const RouterConfiguration = {
    register(container) {
        return configure(container);
    },
    /**
     * Make it possible to specify options to Router activation.
     * Parameter is either a config object that's passed to Router's activate
     * or a config function that's called instead of Router's activate.
     */
    customize(options) {
        return {
            register(container) {
                return configure(container, options);
            },
        };
    },
};

class ScrollState {
    constructor(/** @internal */ _el) {
        this._el = _el;
        this._top = _el.scrollTop;
        this._left = _el.scrollLeft;
    }
    /** @internal */
    static _has(el) {
        return el.scrollTop > 0 || el.scrollLeft > 0;
    }
    /** @internal */
    _restore() {
        this._el.scrollTo(this._left, this._top);
        this._el = null;
    }
}
function restoreState(state) {
    state._restore();
}
class HostElementState {
    constructor(host) {
        /** @internal */ this._scrollStates = [];
        this._save(host.children);
    }
    /** @internal */
    _save(elements) {
        let el;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            el = elements[i];
            if (ScrollState._has(el)) {
                this._scrollStates.push(new ScrollState(el));
            }
            this._save(el.children);
        }
    }
    /** @internal */
    _restore() {
        this._scrollStates.forEach(restoreState);
        this._scrollStates = null;
    }
}
const IStateManager = /*@__PURE__*/ DI.createInterface('IStateManager', x => x.singleton(ScrollStateManager));
class ScrollStateManager {
    constructor() {
        this._cache = new WeakMap();
    }
    saveState(controller) {
        this._cache.set(controller.host, new HostElementState(controller.host));
    }
    restoreState(controller) {
        const state = this._cache.get(controller.host);
        if (state !== void 0) {
            state._restore();
            this._cache.delete(controller.host);
        }
    }
}

const ICurrentRoute = /*@__PURE__*/ DI.createInterface('ICurrentRoute', x => x.singleton(CurrentRoute));
class CurrentRoute {
    constructor() {
        this.path = '';
        this.url = '';
        this.title = '';
        this.query = new URLSearchParams();
        this.parameterInformation = emptyArray;
        const router = resolve(IRouter);
        const options = router.options;
        // In a realistic app, the lifetime of the CurrentRoute instance is the same as the app itself.
        // Therefor the disposal of the subscription is avoided here.
        // An alternative would be to introduce a new configuration option such that the router initializes this class in its constructor and also registers the class to container.
        // Then the app task hooks of the router can be used directly to start/dispose the subscription.
        resolve(IRouterEvents)
            .subscribe('au:router:navigation-end', (event) => {
            const vit = event.finalInstructions;
            batch(() => {
                this.path = vit.toPath();
                this.url = vit.toUrl(true, options._urlParser);
                this.title = router._getTitle();
                this.query = vit.queryParams;
                this.parameterInformation = vit.children.map((instruction) => ParameterInformation.create(instruction));
            });
        });
    }
}
class ParameterInformation {
    constructor(config, viewport, params, children) {
        this.config = config;
        this.viewport = viewport;
        this.params = params;
        this.children = children;
    }
    static create(instruction) {
        const route = instruction.recognizedRoute?.route;
        const params = Object.create(null);
        Object.assign(params, route?.params ?? instruction.params);
        Reflect.deleteProperty(params, RESIDUE);
        return new ParameterInformation(route?.endpoint.route.handler ?? null, instruction.viewport, params, instruction.children.map((ci) => this.create(ci)));
    }
}

export { AST, AuNavId, ComponentExpression, CompositeSegmentExpression, DefaultComponents, DefaultResources, HrefCustomAttribute, HrefCustomAttributeRegistration, ICurrentRoute, ILocationManager, IRouteContext, IRouter, IRouterEvents, IRouterOptions, IStateManager, LoadCustomAttribute, LoadCustomAttributeRegistration, LocationChangeEvent, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationOptions, NavigationStartEvent, NavigationStrategy, ParameterExpression, ParameterListExpression, Route, RouteConfig, RouteContext, RouteExpression, RouteNode, RouteTree, Router, RouterConfiguration, RouterOptions, RouterRegistration, ScopedSegmentExpression, SegmentExpression, SegmentGroupExpression, Transition, ViewportAgent, ViewportCustomElement, ViewportCustomElementRegistration, ViewportExpression, fragmentUrlParser, isManagedState, pathUrlParser, route, toManagedState };
//# sourceMappingURL=index.dev.mjs.map
