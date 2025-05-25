import { onResolve as t, getResourceKeyFor as i, resolve as s, IEventAggregator as n, IContainer as e, Protocol as r, DI as o, ILogger as h, Registration as u } from "@aurelia/kernel";

import { CustomElement as a, isCustomElementViewModel as l, IPlatform as c, registerHostNode as f, Controller as d, IWindow as p, IHistory as g, ILocation as v, IAppRoot as m, CustomAttribute as w, BindingMode as R, INode as C, IController as y, AppTask as I } from "@aurelia/runtime-html";

import { Metadata as E } from "@aurelia/metadata";

import { RouteRecognizer as S, ConfigurableRoute as N, RecognizedRoute as b, Endpoint as k } from "@aurelia/route-recognizer";

import { IInstruction as $ } from "@aurelia/template-compiler";

let P = class Endpoint {
    constructor(t, i, s, n = {}) {
        this.router = t;
        this.name = i;
        this.connectedCE = s;
        this.options = n;
        this.contents = [];
        this.transitionAction = "";
        this.path = null;
    }
    getContent() {
        return this.contents[0];
    }
    getNextContent() {
        return this.contents.length > 1 ? this.contents[this.contents.length - 1] : null;
    }
    getTimeContent(t = Infinity) {
        return this.getContent();
    }
    getNavigationContent(t) {
        if (t instanceof NavigationCoordinator) {
            t = t.navigation;
        }
        if (t instanceof Navigation) {
            return this.contents.find((i => i.navigation === t)) ?? null;
        }
        return null;
    }
    get activeContent() {
        return this.getNextContent() ?? this.getContent();
    }
    get connectedScope() {
        return this.activeContent?.connectedScope;
    }
    get scope() {
        return this.connectedScope.scope;
    }
    get owningScope() {
        return this.connectedScope.owningScope;
    }
    get connectedController() {
        return this.connectedCE?.$controller ?? null;
    }
    get isViewport() {
        return this instanceof Viewport;
    }
    get isViewportScope() {
        return this instanceof ViewportScope;
    }
    get isEmpty() {
        return false;
    }
    get pathname() {
        return this.connectedScope.pathname;
    }
    toString() {
        throw new Error(`Method 'toString' needs to be implemented in all endpoints!`);
    }
    setNextContent(t, i) {
        throw new Error(`Method 'setNextContent' needs to be implemented in all endpoints!`);
    }
    setConnectedCE(t, i) {
        throw new Error(`Method 'setConnectedCE' needs to be implemented in all endpoints!`);
    }
    transition(t) {
        throw new Error(`Method 'transition' needs to be implemented in all endpoints!`);
    }
    finalizeContentChange(t, i) {
        throw new Error(`Method 'finalizeContentChange' needs to be implemented in all endpoints!`);
    }
    cancelContentChange(t, i = null) {
        throw new Error(`Method 'cancelContentChange' needs to be implemented in all endpoints!`);
    }
    getRoutes() {
        throw new Error(`Method 'getRoutes' needs to be implemented in all endpoints!`);
    }
    getTitle(t) {
        throw new Error(`Method 'getTitle' needs to be implemented in all endpoints!`);
    }
    removeEndpoint(t, i) {
        this.contents.forEach((t => t.delete()));
        return true;
    }
    canUnload(t, i) {
        return true;
    }
    canLoad(t, i) {
        return true;
    }
    unload(t, i) {
        return;
    }
    load(t, i) {
        return;
    }
};

class EndpointContent {
    constructor(t, i, s, n, e = RoutingInstruction.create(""), r = Navigation.create({
        instruction: "",
        fullStateInstruction: ""
    })) {
        this.router = t;
        this.endpoint = i;
        this.instruction = e;
        this.navigation = r;
        this.completed = false;
        this.connectedScope = new RoutingScope(t, n, s, this);
        if (this.router.rootScope !== null) {
            (this.endpoint.connectedScope?.parent ?? this.router.rootScope.scope).addChild(this.connectedScope);
        }
    }
    get isActive() {
        return this.endpoint.activeContent === this;
    }
    delete() {
        this.connectedScope.parent?.removeChild(this.connectedScope);
    }
}

class FoundRoute {
    constructor(t = null, i = "", s = [], n = "", e = {}) {
        this.match = t;
        this.matching = i;
        this.instructions = s;
        this.remaining = n;
        this.params = e;
    }
    get foundConfiguration() {
        return this.match !== null;
    }
    get foundInstructions() {
        return this.instructions.some((t => !t.component.none));
    }
    get hasRemaining() {
        return this.instructions.some((t => t.hasNextScopeInstructions));
    }
}

class InstructionParser {
    static parse(t, i, s, n) {
        if (!i) {
            return {
                instructions: [],
                remaining: ""
            };
        }
        if (i.startsWith(t.sibling) && !InstructionParser.isAdd(t, i)) {
            throw new Error(`Instruction parser error: Unnecessary siblings separator ${t.sibling} in beginning of instruction part "${i}".`);
        }
        const e = [];
        let r = 1e3;
        while (i.length && r) {
            r--;
            if (i.startsWith(t.scope)) {
                if (e.length === 0) {
                    throw new Error(`Instruction parser error: Children without parent in instruction part "(${i}" is not allowed.`);
                }
                n = false;
                i = i.slice(t.scope.length);
                const r = i.startsWith(t.groupStart);
                if (r) {
                    i = i.slice(t.groupStart.length);
                    s = true;
                }
                const {instructions: o, remaining: h} = InstructionParser.parse(t, i, r, false);
                e[e.length - 1].nextScopeInstructions = o;
                i = h;
            } else if (i.startsWith(t.groupStart)) {
                i = i.slice(t.groupStart.length);
                const {instructions: s, remaining: r} = InstructionParser.parse(t, i, true, n);
                e.push(...s);
                i = r;
            } else if (i.startsWith(t.groupEnd)) {
                if (s) {
                    i = i.slice(t.groupEnd.length);
                }
                let n = 0;
                const r = i.length;
                for (;n < r; n++) {
                    if (i.slice(n, n + t.sibling.length) === t.sibling) {
                        return {
                            instructions: e,
                            remaining: i
                        };
                    }
                    if (i.slice(n, n + t.groupEnd.length) !== t.groupEnd) {
                        if (e.length > 1) {
                            throw new Error(`Instruction parser error: Children below scope ${t.groupStart}${t.groupEnd} in instruction part "(${i}" is not allowed.`);
                        } else {
                            i = i.slice(n);
                            break;
                        }
                    }
                }
                if (n >= r) {
                    return {
                        instructions: e,
                        remaining: i
                    };
                }
            } else if (i.startsWith(t.sibling) && !InstructionParser.isAdd(t, i)) {
                if (!s) {
                    return {
                        instructions: e,
                        remaining: i
                    };
                }
                i = i.slice(t.sibling.length);
            } else {
                const {instruction: s, remaining: n} = InstructionParser.parseOne(t, i);
                e.push(s);
                i = n;
            }
        }
        return {
            instructions: e,
            remaining: i
        };
    }
    static isAdd(t, i) {
        return i === t.add || i.startsWith(`${t.add}${t.viewport}`);
    }
    static parseOne(t, i) {
        const s = [ t.parameters, t.viewport, t.noScope, t.groupEnd, t.scope, t.sibling ];
        let n = void 0;
        let e = void 0;
        let r = void 0;
        let o = true;
        let h;
        let u;
        const a = i;
        const l = [ t.add, t.clear ];
        for (const e of l) {
            if (i === e) {
                n = i;
                i = "";
                s.shift();
                s.shift();
                h = t.viewport;
                break;
            }
        }
        if (n === void 0) {
            for (const e of l) {
                if (i.startsWith(`${e}${t.viewport}`)) {
                    n = e;
                    i = i.slice(`${e}${t.viewport}`.length);
                    s.shift();
                    s.shift();
                    h = t.viewport;
                    break;
                }
            }
        }
        if (n === void 0) {
            ({token: h, pos: u} = InstructionParser.findNextToken(i, s));
            n = u !== -1 ? i.slice(0, u) : i;
            i = u !== -1 ? i.slice(u + h.length) : "";
            s.shift();
            if (h === t.parameters) {
                ({token: h, pos: u} = InstructionParser.findNextToken(i, [ t.parametersEnd ]));
                e = i.slice(0, u);
                i = i.slice(u + h.length);
                ({token: h} = InstructionParser.findNextToken(i, s));
                i = i.slice(h.length);
            }
            s.shift();
        }
        if (h === t.viewport) {
            ({token: h, pos: u} = InstructionParser.findNextToken(i, s));
            r = u !== -1 ? i.slice(0, u) : i;
            i = u !== -1 ? i.slice(u + h.length) : "";
        }
        s.shift();
        if (h === t.noScope) {
            o = false;
        }
        if (h === t.groupEnd || h === t.scope || h === t.sibling) {
            i = `${h}${i}`;
        }
        if ((n ?? "") === "") {
            throw new Error(`Instruction parser error: No component specified in instruction part "${i}".`);
        }
        const c = RoutingInstruction.create(n, r, e, o);
        c.unparsed = a;
        return {
            instruction: c,
            remaining: i
        };
    }
    static findNextToken(t, i) {
        const s = {};
        for (const n of i) {
            const i = t.indexOf(n);
            if (i > -1) {
                s[n] = t.indexOf(n);
            }
        }
        const n = Math.min(...Object.values(s));
        for (const t in s) {
            if (s[t] === n) {
                return {
                    token: t,
                    pos: n
                };
            }
        }
        return {
            token: "",
            pos: -1
        };
    }
}

class TitleOptions {
    constructor(t = "${componentTitles}${appTitleSeparator}Aurelia", i = " | ", s = "top-down", n = " > ", e = true, r = "app-", o) {
        this.appTitle = t;
        this.appTitleSeparator = i;
        this.componentTitleOrder = s;
        this.componentTitleSeparator = n;
        this.useComponentNames = e;
        this.componentPrefix = r;
        this.transformTitle = o;
    }
    static create(t = {}) {
        t = typeof t === "string" ? {
            appTitle: t
        } : t;
        return new TitleOptions(t.appTitle, t.appTitleSeparator, t.componentTitleOrder, t.componentTitleSeparator, t.useComponentNames, t.componentPrefix, t.transformTitle);
    }
    static for(t) {
        return RouterOptions.for(t).title;
    }
    apply(t = {}) {
        t = typeof t === "string" ? {
            appTitle: t
        } : t;
        this.appTitle = t.appTitle ?? this.appTitle;
        this.appTitleSeparator = t.appTitleSeparator ?? this.appTitleSeparator;
        this.componentTitleOrder = t.componentTitleOrder ?? this.componentTitleOrder;
        this.componentTitleSeparator = t.componentTitleSeparator ?? this.componentTitleSeparator;
        this.useComponentNames = t.useComponentNames ?? this.useComponentNames;
        this.componentPrefix = t.componentPrefix ?? this.componentPrefix;
        this.transformTitle = "transformTitle" in t ? t.transformTitle : this.transformTitle;
    }
}

class Separators {
    constructor(t = "@", i = "+", s = "/", n = "(", e = ")", r = "!", o = "(", h = ")", u = ",", a = "=", l = "+", c = "-", f = ".") {
        this.viewport = t;
        this.sibling = i;
        this.scope = s;
        this.groupStart = n;
        this.groupEnd = e;
        this.noScope = r;
        this.parameters = o;
        this.parametersEnd = h;
        this.parameterSeparator = u;
        this.parameterKeySeparator = a;
        this.add = l;
        this.clear = c;
        this.action = f;
    }
    static create(t = {}) {
        return new Separators(t.viewport, t.sibling, t.scope, t.groupStart, t.groupEnd, t.noScope, t.parameters, t.parametersEnd, t.parameterSeparator, t.parameterKeySeparator, t.add, t.clear, t.action);
    }
    static for(t) {
        return RouterOptions.for(t).separators;
    }
    apply(t = {}) {
        this.viewport = t.viewport ?? this.viewport;
        this.sibling = t.sibling ?? this.sibling;
        this.scope = t.scope ?? this.scope;
        this.groupStart = t.groupStart ?? this.groupStart;
        this.groupEnd = t.groupEnd ?? this.groupEnd;
        this.noScope = t.noScope ?? this.noScope;
        this.parameters = t.parameters ?? this.parameters;
        this.parametersEnd = t.parametersEnd ?? this.parametersEnd;
        this.parameterSeparator = t.parameterSeparator ?? this.parameterSeparator;
        this.parameterKeySeparator = t.parameterKeySeparator ?? this.parameterKeySeparator;
        this.add = t.add ?? this.add;
        this.clear = t.clear ?? this.clear;
        this.action = t.action ?? this.action;
    }
}

class Indicators {
    constructor(t = "active", i = "navigating") {
        this.loadActive = t;
        this.viewportNavigating = i;
    }
    static create(t = {}) {
        return new Indicators(t.loadActive, t.viewportNavigating);
    }
    static for(t) {
        return RouterOptions.for(t).indicators;
    }
    apply(t = {}) {
        this.loadActive = t.loadActive ?? this.loadActive;
        this.viewportNavigating = t.viewportNavigating ?? this.viewportNavigating;
    }
}

class RouterOptions {
    constructor(t = Separators.create(), i = Indicators.create(), s = true, n = null, e = true, r = 0, o = true, h = true, u = false, a = TitleOptions.create(), l = [ "guardedUnload", "swapped", "completed" ], c = "attach-next-detach-current", f = "", d = "abort") {
        this.separators = t;
        this.indicators = i;
        this.useUrlFragmentHash = s;
        this.basePath = n;
        this.useHref = e;
        this.statefulHistoryLength = r;
        this.useDirectRouting = o;
        this.useConfiguredRoutes = h;
        this.completeStateNavigations = u;
        this.title = a;
        this.navigationSyncStates = l;
        this.swapOrder = c;
        this.fallback = f;
        this.fallbackAction = d;
        this.registrationHooks = [];
    }
    static create(t = {}) {
        return new RouterOptions(Separators.create(t.separators), Indicators.create(t.indicators), t.useUrlFragmentHash, t.basePath, t.useHref, t.statefulHistoryLength, t.useDirectRouting, t.useConfiguredRoutes, t.completeStateNavigations, TitleOptions.create(t.title), t.navigationSyncStates, t.swapOrder, t.fallback, t.fallbackAction);
    }
    static for(t) {
        if (t instanceof RouterConfiguration) {
            return t.options;
        }
        if (t instanceof Router) {
            t = t.configuration;
        } else {
            t = t.get(q);
        }
        return t.options;
    }
    apply(t) {
        t = t ?? {};
        this.separators.apply(t.separators);
        this.indicators.apply(t.indicators);
        this.useUrlFragmentHash = t.useUrlFragmentHash ?? this.useUrlFragmentHash;
        this.basePath = t.basePath ?? this.basePath;
        this.useHref = t.useHref ?? this.useHref;
        this.statefulHistoryLength = t.statefulHistoryLength ?? this.statefulHistoryLength;
        this.useDirectRouting = t.useDirectRouting ?? this.useDirectRouting;
        this.useConfiguredRoutes = t.useConfiguredRoutes ?? this.useConfiguredRoutes;
        this.completeStateNavigations = t.completeStateNavigations ?? this.completeStateNavigations;
        this.title.apply(t.title);
        this.navigationSyncStates = t.navigationSyncStates ?? this.navigationSyncStates;
        this.swapOrder = t.swapOrder ?? this.swapOrder;
        this.fallback = t.fallback ?? this.fallback;
        this.fallbackAction = t.fallbackAction ?? this.fallbackAction;
        if (Array.isArray(t.hooks)) {
            if (this.routerConfiguration !== void 0) {
                t.hooks.forEach((t => this.routerConfiguration.addHook(t.hook, t.options)));
            } else {
                this.registrationHooks = t.hooks;
            }
        }
    }
    setRouterConfiguration(t) {
        this.routerConfiguration = t;
        this.registrationHooks.forEach((t => this.routerConfiguration.addHook(t.hook, t.options)));
        this.registrationHooks.length = 0;
    }
}

class InstructionParameters {
    constructor() {
        this.parametersString = null;
        this.parametersRecord = null;
        this.parametersList = null;
        this.parametersType = "none";
    }
    get none() {
        return this.parametersType === "none";
    }
    static create(t) {
        const i = new InstructionParameters;
        i.set(t);
        return i;
    }
    static parse(t, i, s = false) {
        if (i == null || i.length === 0) {
            return [];
        }
        const n = Separators.for(t);
        const e = n.parameterSeparator;
        const r = n.parameterKeySeparator;
        if (typeof i === "string") {
            const t = [];
            const n = i.split(e);
            for (const i of n) {
                let n;
                let e;
                [n, e] = i.split(r);
                if (e === void 0) {
                    e = s ? decodeURIComponent(n) : n;
                    n = void 0;
                } else if (s) {
                    n = decodeURIComponent(n);
                    e = decodeURIComponent(e);
                }
                t.push({
                    key: n,
                    value: e
                });
            }
            return t;
        }
        if (Array.isArray(i)) {
            return i.map((t => ({
                key: void 0,
                value: t
            })));
        }
        const o = Object.keys(i);
        o.sort();
        return o.map((t => ({
            key: t,
            value: i[t]
        })));
    }
    get typedParameters() {
        switch (this.parametersType) {
          case "string":
            return this.parametersString;

          case "array":
            return this.parametersList;

          case "object":
            return this.parametersRecord;

          default:
            return null;
        }
    }
    static stringify(t, i, s = false) {
        if (!Array.isArray(i) || i.length === 0) {
            return "";
        }
        const n = Separators.for(t);
        return i.map((t => {
            const i = t.key !== void 0 && s ? encodeURIComponent(t.key) : t.key;
            const e = s ? encodeURIComponent(t.value) : t.value;
            return i !== void 0 && i !== e ? i + n.parameterKeySeparator + e : e;
        })).join(n.parameterSeparator);
    }
    static contains(t, i) {
        return Object.keys(i).every((s => i[s] === t[s]));
    }
    parameters(t) {
        return InstructionParameters.parse(t, this.typedParameters);
    }
    set(t) {
        this.parametersString = null;
        this.parametersList = null;
        this.parametersRecord = null;
        if (t == null || t === "") {
            this.parametersType = "none";
            t = null;
        } else if (typeof t === "string") {
            this.parametersType = "string";
            this.parametersString = t;
        } else if (Array.isArray(t)) {
            this.parametersType = "array";
            this.parametersList = t;
        } else {
            this.parametersType = "object";
            this.parametersRecord = t;
        }
    }
    get(t, i) {
        if (i === void 0) {
            return this.parameters(t);
        }
        const s = this.parameters(t).filter((t => t.key === i)).map((t => t.value));
        if (s.length === 0) {
            return;
        }
        return s.length === 1 ? s[0] : s;
    }
    addParameters(t) {
        if (this.parametersType === "none") {
            return this.set(t);
        }
        if (this.parametersType !== "object") {
            throw new Error("Can't add object parameters to existing non-object parameters!");
        }
        this.set({
            ...this.parametersRecord,
            ...t
        });
    }
    toSpecifiedParameters(t, i) {
        i = i ?? [];
        const s = this.parameters(t);
        const n = {};
        for (const t of i) {
            let i = s.findIndex((i => i.key === t));
            if (i >= 0) {
                const [e] = s.splice(i, 1);
                n[t] = e.value;
            } else {
                i = s.findIndex((t => t.key === void 0));
                if (i >= 0) {
                    const [e] = s.splice(i, 1);
                    n[t] = e.value;
                }
            }
        }
        for (const t of s.filter((t => t.key !== void 0))) {
            n[t.key] = t.value;
        }
        let e = i.length;
        for (const t of s.filter((t => t.key === void 0))) {
            n[e++] = t.value;
        }
        return n;
    }
    toSortedParameters(t, i) {
        i = i || [];
        const s = this.parameters(t);
        const n = [];
        for (const t of i) {
            let i = s.findIndex((i => i.key === t));
            if (i >= 0) {
                const t = {
                    ...s.splice(i, 1)[0]
                };
                t.key = void 0;
                n.push(t);
            } else {
                i = s.findIndex((t => t.key === void 0));
                if (i >= 0) {
                    const t = {
                        ...s.splice(i, 1)[0]
                    };
                    n.push(t);
                } else {
                    n.push({
                        value: void 0
                    });
                }
            }
        }
        const e = s.filter((t => t.key !== void 0));
        e.sort(((t, i) => (t.key || "") < (i.key || "") ? 1 : (i.key || "") < (t.key || "") ? -1 : 0));
        n.push(...e);
        n.push(...s.filter((t => t.key === void 0)));
        return n;
    }
    same(t, i, s) {
        const n = s !== null ? s.parameters : [];
        const e = this.toSpecifiedParameters(t, n);
        const r = i.toSpecifiedParameters(t, n);
        return Object.keys(e).every((t => e[t] === r[t])) && Object.keys(r).every((t => r[t] === e[t]));
    }
}

class InstructionComponent {
    constructor() {
        this.name = null;
        this.type = null;
        this.instance = null;
        this.promise = null;
        this.func = null;
    }
    static create(t) {
        const i = new InstructionComponent;
        i.set(t);
        return i;
    }
    static isName(t) {
        return typeof t === "string";
    }
    static isDefinition(t) {
        return a.isType(t.Type);
    }
    static isType(t) {
        return a.isType(t);
    }
    static isInstance(t) {
        return l(t);
    }
    static isAppelation(t) {
        return InstructionComponent.isName(t) || InstructionComponent.isType(t) || InstructionComponent.isInstance(t);
    }
    static getName(t) {
        if (InstructionComponent.isName(t)) {
            return t;
        } else if (InstructionComponent.isType(t)) {
            return a.getDefinition(t).name;
        } else {
            return InstructionComponent.getName(t.constructor);
        }
    }
    static getType(t) {
        if (InstructionComponent.isName(t)) {
            return null;
        } else if (InstructionComponent.isType(t)) {
            return t;
        } else {
            return t.constructor;
        }
    }
    static getInstance(t) {
        if (InstructionComponent.isName(t) || InstructionComponent.isType(t)) {
            return null;
        } else {
            return t;
        }
    }
    set(t) {
        let i = null;
        let s = null;
        let n = null;
        let e = null;
        let r = null;
        if (t instanceof Promise) {
            e = t;
        } else if (InstructionComponent.isName(t)) {
            i = InstructionComponent.getName(t);
        } else if (InstructionComponent.isType(t)) {
            i = this.getNewName(t);
            s = InstructionComponent.getType(t);
        } else if (InstructionComponent.isInstance(t)) {
            i = this.getNewName(InstructionComponent.getType(t));
            s = InstructionComponent.getType(t);
            n = InstructionComponent.getInstance(t);
        } else if (typeof t === "function") {
            r = t;
        }
        this.name = i;
        this.type = s;
        this.instance = n;
        this.promise = e;
        this.func = r;
    }
    resolve(t) {
        if (this.func !== null) {
            this.set(this.func(t));
        }
        if (!(this.promise instanceof Promise)) {
            return;
        }
        return this.promise.then((t => {
            if (InstructionComponent.isAppelation(t)) {
                this.set(t);
                return;
            }
            if (t.default != null) {
                this.set(t.default);
                return;
            }
            const i = Object.keys(t).filter((t => !t.startsWith("__")));
            if (i.length === 0) {
                throw new Error(`Failed to load component Type from resolved Promise since no export was specified.`);
            }
            if (i.length > 1) {
                throw new Error(`Failed to load component Type from resolved Promise since no 'default' export was specified when having multiple exports.`);
            }
            const s = i[0];
            this.set(t[s]);
        }));
    }
    get none() {
        return !this.isName() && !this.isType() && !this.isInstance() && !this.isFunction() && !this.isPromise();
    }
    isName() {
        return this.name != null && this.name !== "" && !this.isType() && !this.isInstance();
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
    toType(t, i) {
        void this.resolve(i);
        if (this.type !== null) {
            return this.type;
        }
        if (this.name !== null && typeof this.name === "string") {
            if (t === null) {
                throw new Error(`No container available when trying to resolve component '${this.name}'!`);
            }
            if (t.has(a.keyFrom(this.name), true)) {
                const i = t.getResolver(a.keyFrom(this.name));
                if (i !== null && i.getFactory !== void 0) {
                    const s = i.getFactory(t);
                    if (s) {
                        return s.Type;
                    }
                }
            }
        }
        return null;
    }
    toInstance(i, s, n, e) {
        return t(this.resolve(e), (() => {
            if (this.instance !== null) {
                return this.instance;
            }
            if (i == null) {
                return null;
            }
            return this.t(i, s, n, e);
        }));
    }
    same(t, i = false) {
        return i ? this.type === t.type : this.name === t.name;
    }
    getNewName(t) {
        if (this.name === null) {
            return InstructionComponent.getName(t);
        }
        return this.name;
    }
    t(t, i, s, n) {
        const e = t.createChild();
        const r = this.isType() ? this.type : e.getResolver(a.keyFrom(this.name)).getFactory(e).Type;
        const o = s.appendChild(e.get(c).document.createElement(a.getDefinition(r).name));
        f(e, o);
        const h = e.invoke(r);
        if (h == null) {
            throw new Error(`Failed to create instance when trying to resolve component '${this.name}'!`);
        }
        const u = d.$el(e, h, o, null);
        u.parent = i;
        return h;
    }
}

function arrayRemove(t, i) {
    const s = [];
    let n = t.findIndex(i);
    while (n >= 0) {
        s.push(t.splice(n, 1)[0]);
        n = t.findIndex(i);
    }
    return s;
}

function arrayAddUnique(t, i) {
    if (!Array.isArray(i)) {
        i = [ i ];
    }
    for (const s of i) {
        if (!t.includes(s)) {
            t.push(s);
        }
    }
    return t;
}

function arrayUnique(t, i = false) {
    return t.filter(((t, s, n) => (i || t != null) && n.indexOf(t) === s));
}

class OpenPromise {
    constructor(t = "") {
        this.description = t;
        this.isPending = true;
        this.promise = new Promise(((t, i) => {
            this.i = t;
            this.h = i;
            OpenPromise.promises.push(this);
        }));
    }
    resolve(t) {
        this.i(t);
        this.isPending = false;
        OpenPromise.promises = OpenPromise.promises.filter((t => t !== this));
    }
    reject(t) {
        this.h(t);
        this.isPending = false;
        OpenPromise.promises = OpenPromise.promises.filter((t => t !== this));
    }
}

OpenPromise.promises = [];

class Runner {
    constructor() {
        this.isDone = false;
        this.isCancelled = false;
        this.isResolved = false;
        this.isRejected = false;
        this.isAsync = false;
    }
    static run(t, ...i) {
        if (i.length === 0) {
            return void 0;
        }
        let s = false;
        if (t === null || typeof t === "string") {
            t = new Step(t);
            s = true;
        }
        const n = new Step(i.shift());
        Runner.connect(t, n, (t?.runParallel ?? false) || s);
        if (i.length > 0) {
            Runner.add(n, false, ...i);
        }
        if (s) {
            Runner.process(t);
            if (t.result instanceof Promise) {
                this.runners.set(t.result, t);
            }
            return t.result;
        }
        return n;
    }
    static runParallel(t, ...i) {
        if ((i?.length ?? 0) === 0) {
            return [];
        }
        let s = false;
        if (t === null) {
            t = new Step;
            s = true;
        } else {
            t = Runner.connect(t, new Step, true);
        }
        Runner.add(t, true, ...i);
        if (s) {
            Runner.process(t);
        }
        if (t.result instanceof Promise) {
            this.runners.set(t.result, t);
        }
        return s ? t.result ?? [] : t;
    }
    static step(t) {
        if (t instanceof Promise) {
            return Runner.runners.get(t);
        }
    }
    static cancel(t) {
        const i = Runner.step(t);
        if (i !== void 0) {
            i.cancel();
        }
    }
    static add(t, i, ...s) {
        let n = new Step(s.shift(), i);
        if (t !== null) {
            n = Runner.connect(t, n, i);
        }
        const e = n;
        while (s.length > 0) {
            n = Runner.connect(n, new Step(s.shift(), i), false);
        }
        return e;
    }
    static connect(t, i, s) {
        if (!s) {
            const s = t.next;
            t.next = i;
            i.previous = t;
            i.next = s;
            if (s !== null) {
                s.previous = i;
                s.parent = null;
            }
        } else {
            const s = t.child;
            t.child = i;
            i.parent = t;
            i.next = s;
            if (s !== null) {
                s.parent = null;
                s.previous = i;
            }
        }
        return i;
    }
    static process(t) {
        const i = t.root;
        while (t !== null && !t.isDoing && !t.isDone) {
            i.current = t;
            if (t.isParallelParent) {
                t.isDone = true;
                let i = t.child;
                while (i !== null) {
                    Runner.process(i);
                    i = i.next;
                }
            } else {
                t.isDoing = true;
                t.value = t.step;
                while (t.value instanceof Function && !t.isCancelled && !t.isExited && !t.isDone) {
                    t.value = t.value(t);
                }
                if (!t.isCancelled) {
                    if (t.value instanceof Promise) {
                        const s = t.value;
                        Runner.ensurePromise(i);
                        ((t, i) => {
                            i.then((i => {
                                t.value = i;
                                Runner.settlePromise(t);
                                t.isDone = true;
                                t.isDoing = false;
                                const s = t.nextToDo();
                                if (s !== null && !t.isExited) {
                                    Runner.process(s);
                                } else {
                                    if (t.root.doneAll || t.isExited) {
                                        Runner.settlePromise(t.root);
                                    }
                                }
                            })).catch((t => {
                                throw t;
                            }));
                        })(t, s);
                    } else {
                        t.isDone = true;
                        t.isDoing = false;
                        if (!t.isExited) {
                            t = t.nextToDo();
                        } else {
                            t = null;
                        }
                    }
                }
            }
        }
        if (i.isCancelled) {
            Runner.settlePromise(i, "reject");
        } else if (i.doneAll || i.isExited) {
            Runner.settlePromise(i);
        }
    }
    static ensurePromise(t) {
        if (t.finally === null) {
            t.finally = new OpenPromise(`Runner: ${t.name}, ${t.previousValue}, ${t.value}, ${t.root.report}`);
            t.promise = t.finally.promise;
            return true;
        }
        return false;
    }
    static settlePromise(t, i = "resolve") {
        if (t.finally?.isPending ?? false) {
            t.promise = null;
            switch (i) {
              case "resolve":
                t.finally?.resolve(t.result);
                break;

              case "reject":
                t.finally?.reject(t.result);
                break;
            }
        }
    }
}

Runner.runners = new WeakMap;

Runner.roots = {};

class Step {
    constructor(t = void 0, i = false) {
        this.step = t;
        this.runParallel = i;
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
        this.id = "-1";
        this.id = `${Step.id++}`;
        if (typeof t === "string") {
            this.id += ` ${t}`;
        }
    }
    get isParallelParent() {
        return this.child?.runParallel ?? false;
    }
    get result() {
        if (this.promise !== null) {
            return this.promise;
        }
        if (this.child !== null) {
            if (this.isParallelParent) {
                const t = [];
                let i = this.child;
                while (i !== null) {
                    t.push(i.result);
                    i = i.next;
                }
                return t;
            } else {
                return this === this.root && this.exited !== null ? this.exited.result : this.child?.tail?.result;
            }
        }
        let t = this.value;
        while (t instanceof Step) {
            t = t.result;
        }
        return t;
    }
    get asValue() {
        return this.result;
    }
    get previousValue() {
        return this.runParallel ? this.head.parent?.parent?.previous?.result : this.previous?.result;
    }
    get name() {
        let t = `${this.id}`;
        if (this.runParallel) {
            t = `:${t}`;
        }
        if (this.value instanceof Promise || this.promise instanceof Promise) {
            t = `${t}*`;
        }
        if (this.finally !== null) {
            t = `${t}*`;
        }
        if (this.child !== null) {
            t = `${t}>`;
        }
        if (this.isDone) {
            t = `(${t})`;
        }
        return t;
    }
    get root() {
        let t = this.head;
        while (t.parent !== null) {
            t = t.parent.head;
        }
        return t;
    }
    get head() {
        let t = this;
        while (t.previous !== null) {
            t = t.previous;
        }
        return t;
    }
    get tail() {
        let t = this;
        while (t.next !== null) {
            t = t.next;
        }
        return t;
    }
    get done() {
        if (!this.isDone) {
            return false;
        }
        let t = this.child;
        while (t !== null) {
            if (!t.done) {
                return false;
            }
            t = t.next;
        }
        return true;
    }
    get doneAll() {
        if (!this.isDone || this.child !== null && !this.child.doneAll || this.next !== null && !this.next.doneAll) {
            return false;
        }
        return true;
    }
    cancel(t = true) {
        if (t) {
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
    exit(t = true) {
        if (t) {
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
        if (this.child !== null && !this.child.isDoing && !this.child.isDone) {
            return this.child;
        }
        if (this.runParallel && !this.head.parent.done) {
            return null;
        }
        return this.nextOrUp();
    }
    nextOrUp() {
        let t = this.next;
        while (t !== null) {
            if (!t.isDoing && !t.isDone) {
                return t;
            }
            t = t.next;
        }
        const i = this.head.parent ?? null;
        if (i === null || !i.done) {
            return null;
        }
        return i.nextOrUp();
    }
    get path() {
        return `${this.head.parent?.path ?? ""}/${this.name}`;
    }
    get tree() {
        let t = "";
        let i = this.head;
        let s = i.parent;
        let n = "";
        while (s !== null) {
            n = `${s.path}${n}`;
            s = s.head.parent;
        }
        do {
            t += `${n}/${i.name}\n`;
            if (i === this) {
                break;
            }
            i = i.next;
        } while (i !== null);
        return t;
    }
    get report() {
        let t = `${this.path}\n`;
        t += this.child?.report ?? "";
        t += this.next?.report ?? "";
        return t;
    }
}

Step.id = 0;

const createMappedError = (t, ...i) => {
    const s = String(t).padStart(4, "0");
    return new Error(`AUR${s}:${i.map(String)}`);
};

class Route {
    constructor(t, i, s, n, e, r, o, h) {
        this.path = t;
        this.id = i;
        this.redirectTo = s;
        this.instructions = n;
        this.caseSensitive = e;
        this.title = r;
        this.reloadBehavior = o;
        this.data = h;
    }
    static configure(t, i) {
        const s = Route.create(t, i);
        E.define(s, i, Route.resourceKey);
        return i;
    }
    static getConfiguration(t) {
        const i = E.get(Route.resourceKey, t) ?? {};
        if (Array.isArray(t.parameters)) {
            i.parameters = t.parameters;
        }
        if ("title" in t) {
            i.title = t.title;
        }
        return i instanceof Route ? i : Route.create(i, t);
    }
    static create(t, i = null) {
        if (i !== null) {
            t = Route.transferTypeToComponent(t, i);
        }
        if (a.isType(t)) {
            t = Route.getConfiguration(t);
        } else if (i === null) {
            t = {
                ...t
            };
        }
        const s = Route.transferIndividualIntoInstructions(t);
        Route.validateRouteConfiguration(s);
        let n = s.path;
        if (Array.isArray(n)) {
            n = n.join(",");
        }
        return new Route(s.path ?? "", s.id ?? n ?? null, s.redirectTo ?? null, s.instructions ?? null, s.caseSensitive ?? false, s.title ?? null, s.reloadBehavior ?? null, s.data ?? null);
    }
    static transferTypeToComponent(t, i) {
        if (a.isType(t)) {
            throw createMappedError(2012);
        }
        const s = {
            ...t
        };
        if ("component" in s || "instructions" in s) {
            throw createMappedError(2013);
        }
        if (!("redirectTo" in s)) {
            s.component = i;
        }
        if (!("path" in s) && !("redirectTo" in s)) {
            s.path = a.getDefinition(i).name;
        }
        return s;
    }
    static transferIndividualIntoInstructions(t) {
        if (t == null) {
            throw createMappedError(2014);
        }
        if (t.component != null || t.viewport != null || t.parameters != null || t.children != null) {
            if (t.instructions != null) {
                throw createMappedError(2015);
            }
            t.instructions = [ {
                component: t.component,
                viewport: t.viewport,
                parameters: t.parameters,
                children: t.children
            } ];
        }
        return t;
    }
    static validateRouteConfiguration(t) {
        if (t.redirectTo === null && t.instructions === null) {
            throw createMappedError(2016);
        }
    }
}

Route.resourceKey = i("route");

const V = {
    name: /*@__PURE__*/ i("routes"),
    isConfigured(t) {
        return E.has(V.name, t) || "routes" in t;
    },
    configure(t, i) {
        const s = t.map((t => Route.create(t)));
        E.define(s, i, V.name);
        return i;
    },
    getConfiguration(t) {
        const i = t;
        const s = [];
        const n = E.get(V.name, t);
        if (Array.isArray(n)) {
            s.push(...n);
        }
        if (Array.isArray(i.routes)) {
            s.push(...i.routes);
        }
        return s.map((t => t instanceof Route ? t : Route.create(t)));
    }
};

function routes(t) {
    return function(i, s) {
        s.addInitializer((function() {
            V.configure(t, this);
        }));
        return i;
    };
}

class ViewportScopeContent extends EndpointContent {}

class ViewportScope extends P {
    constructor(t, i, s, n, e, r = null, o = {
        catches: [],
        source: null
    }) {
        super(t, i, s);
        this.rootComponentType = r;
        this.options = o;
        this.instruction = null;
        this.available = true;
        this.sourceItem = null;
        this.sourceItemIndex = -1;
        this.remove = false;
        this.add = false;
        this.contents.push(new ViewportScopeContent(t, this, n, e));
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
        const t = this.connectedScope.parent;
        if (t === null) {
            return [ this ];
        }
        return t.enabledChildren.filter((t => t.isViewportScope && t.endpoint.name === this.name)).map((t => t.endpoint));
    }
    get source() {
        return this.options.source ?? null;
    }
    get catches() {
        let t = this.options.catches ?? [];
        if (typeof t === "string") {
            t = t.split(",");
        }
        return t;
    }
    get default() {
        if (this.catches.length > 0) {
            return this.catches[0];
        }
    }
    toString() {
        const t = this.instruction?.component.name ?? "";
        const i = this.getNextContent()?.instruction.component.name ?? "";
        return `vs:${this.name}[${t}->${i}]`;
    }
    setNextContent(t, i) {
        t.endpoint.set(this);
        this.remove = t.isClear(this.router) || t.isClearAll(this.router);
        this.add = t.isAdd(this.router) && Array.isArray(this.source);
        if (this.add) {
            t.component.name = null;
        }
        if (this.default !== void 0 && t.component.name === null) {
            t.component.name = this.default;
        }
        this.contents.push(new ViewportScopeContent(this.router, this, this.owningScope, this.scope.hasScope, t, i));
        return "swap";
    }
    transition(t) {
        Runner.run("viewport-scope.transition", (i => t.setEndpointStep(this, i.root)), (() => t.addEndpointState(this, "guardedUnload")), (() => t.addEndpointState(this, "guardedLoad")), (() => t.addEndpointState(this, "guarded")), (() => t.addEndpointState(this, "loaded")), (() => t.addEndpointState(this, "unloaded")), (() => t.addEndpointState(this, "routed")), (() => t.addEndpointState(this, "swapped")), (() => t.addEndpointState(this, "completed")));
    }
    finalizeContentChange(t, i) {
        const s = this.contents.findIndex((i => i.navigation === t.navigation));
        let n = this.contents[s];
        if (this.remove) {
            const t = new ViewportScopeContent(this.router, this, this.owningScope, this.scope.hasScope);
            this.contents.splice(s, 1, t);
            n.delete();
            n = t;
        }
        n.completed = true;
        let e = 0;
        for (let t = 0, i = s; t < i; t++) {
            if (!(this.contents[0].navigation.completed ?? false)) {
                break;
            }
            e++;
        }
        this.contents.splice(0, e);
        if (this.remove && Array.isArray(this.source)) {
            this.removeSourceItem();
        }
    }
    cancelContentChange(t, i = null) {
        [ ...new Set(this.scope.children.map((t => t.endpoint))) ].forEach((s => s.cancelContentChange(t, i)));
        const s = this.contents.findIndex((i => i.navigation === t.navigation));
        if (s < 0) {
            return;
        }
        this.contents.splice(s, 1);
        if (this.add) {
            const t = this.source.indexOf(this.sourceItem);
            this.source.splice(t, 1);
            this.sourceItem = null;
        }
    }
    acceptSegment(t) {
        if (t === null && t === void 0 || t.length === 0) {
            return true;
        }
        if (t === RoutingInstruction.clear(this.router) || t === RoutingInstruction.add(this.router) || t === this.name) {
            return true;
        }
        if (this.catches.length === 0) {
            return true;
        }
        if (this.catches.includes(t)) {
            return true;
        }
        if (this.catches.filter((t => t.includes("*"))).length) {
            return true;
        }
        return false;
    }
    binding() {
        const t = this.source || [];
        if (t.length > 0 && this.sourceItem === null) {
            this.sourceItem = this.getAvailableSourceItem();
        }
    }
    unbinding() {
        if (this.sourceItem !== null && this.source !== null) {
            arrayRemove(this.source, (t => t === this.sourceItem));
        }
        this.sourceItem = null;
    }
    getAvailableSourceItem() {
        if (this.source === null) {
            return null;
        }
        const t = this.siblings;
        for (const i of this.source) {
            if (t.every((t => t.sourceItem !== i))) {
                return i;
            }
        }
        return null;
    }
    addSourceItem() {
        const t = {};
        this.source.push(t);
        return t;
    }
    removeSourceItem() {
        this.sourceItemIndex = this.source.indexOf(this.sourceItem);
        if (this.sourceItemIndex >= 0) {
            this.source.splice(this.sourceItemIndex, 1);
        }
    }
    getRoutes() {
        const t = [];
        if (this.rootComponentType !== null) {
            const i = this.rootComponentType.constructor === this.rootComponentType.constructor.constructor ? this.rootComponentType : this.rootComponentType.constructor;
            t.push(...V.getConfiguration(i) ?? []);
        }
        return t;
    }
}

class StoredNavigation {
    constructor(t = {
        instruction: "",
        fullStateInstruction: ""
    }) {
        this.instruction = t.instruction;
        this.fullStateInstruction = t.fullStateInstruction;
        this.scope = t.scope;
        this.index = t.index;
        this.firstEntry = t.firstEntry;
        this.path = t.path;
        this.title = t.title;
        this.query = t.query;
        this.fragment = t.fragment;
        this.parameters = t.parameters;
        this.data = t.data;
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
            data: this.data
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

class Navigation extends StoredNavigation {
    constructor(t = {
        instruction: "",
        fullStateInstruction: ""
    }) {
        super(t);
        this.navigation = new NavigationFlags;
        this.repeating = false;
        this.previous = null;
        this.fromBrowser = false;
        this.origin = null;
        this.replacing = false;
        this.refreshing = false;
        this.untracked = false;
        this.process = null;
        this.completed = true;
        this.fromBrowser = t.fromBrowser ?? this.fromBrowser;
        this.origin = t.origin ?? this.origin;
        this.replacing = t.replacing ?? this.replacing;
        this.refreshing = t.refreshing ?? this.refreshing;
        this.untracked = t.untracked ?? this.untracked;
        this.historyMovement = t.historyMovement ?? this.historyMovement;
        this.process = null;
        this.timestamp = Date.now();
    }
    get useFullStateInstruction() {
        return (this.navigation.back ?? false) || (this.navigation.forward ?? false) || (this.navigation.refresh ?? false);
    }
    static create(t = {
        instruction: "",
        fullStateInstruction: ""
    }) {
        return new Navigation(t);
    }
}

class AwaitableMap {
    constructor() {
        this.map = new Map;
    }
    set(t, i) {
        const s = this.map.get(t);
        if (s instanceof OpenPromise) {
            s.resolve(i);
        }
        this.map.set(t, i);
    }
    delete(t) {
        const i = this.map.get(t);
        if (i instanceof OpenPromise) {
            i.reject();
        }
        this.map.delete(t);
    }
    await(t) {
        if (!this.map.has(t)) {
            const i = new OpenPromise(`AwaitableMap: ${t}`);
            this.map.set(t, i);
            return i.promise;
        }
        const i = this.map.get(t);
        if (i instanceof OpenPromise) {
            return i.promise;
        }
        return i;
    }
    has(t) {
        return this.map.has(t) && !(this.map.get(t) instanceof OpenPromise);
    }
    clone() {
        const t = new AwaitableMap;
        t.map = new Map(this.map);
        return t;
    }
}

class ViewportContent extends EndpointContent {
    constructor(t, i, s, n, e = RoutingInstruction.create(""), r = Navigation.create({
        instruction: "",
        fullStateInstruction: ""
    }), o = null) {
        super(t, i, s, n, e, r);
        this.router = t;
        this.instruction = e;
        this.navigation = r;
        this.contentStates = new AwaitableMap;
        this.fromCache = false;
        this.fromHistory = false;
        this.reload = false;
        this.activatedResolve = null;
        if (!this.instruction.component.isType() && o?.container != null) {
            this.instruction.component.type = this.toComponentType(o.container);
        }
    }
    get componentInstance() {
        return this.instruction.component.instance;
    }
    get reloadBehavior() {
        if (this.instruction.route instanceof FoundRoute && this.instruction.route.match?.reloadBehavior !== null) {
            return this.instruction.route.match?.reloadBehavior;
        }
        return this.instruction.component.instance !== null && "reloadBehavior" in this.instruction.component.instance && this.instruction.component.instance.reloadBehavior !== void 0 ? this.instruction.component.instance.reloadBehavior : "default";
    }
    get controller() {
        return this.instruction.component.instance?.$controller;
    }
    equalComponent(t) {
        return this.instruction.sameComponent(this.router, t.instruction);
    }
    equalParameters(t) {
        return this.instruction.sameComponent(this.router, t.instruction, true) && (this.navigation.query ?? "") === (t.navigation.query ?? "");
    }
    isCacheEqual(t) {
        return this.instruction.sameComponent(this.router, t.instruction, true);
    }
    createComponent(i, s, n, e) {
        if (this.contentStates.has("created")) {
            return;
        }
        if (!this.fromCache && !this.fromHistory) {
            try {
                return t(this.toComponentInstance(s.container, s.controller, s.element), (t => {
                    this.instruction.component.set(t);
                    this.contentStates.set("created", void 0);
                }));
            } catch (r) {
                this.u(r);
                if ((n ?? "") !== "") {
                    if (e === "process-children") {
                        this.instruction.parameters.set([ this.instruction.component.name ]);
                    } else {
                        this.instruction.parameters.set([ this.instruction.unparsed ?? this.instruction.component.name ]);
                        if (this.instruction.hasNextScopeInstructions) {
                            i.removeInstructions(this.instruction.nextScopeInstructions);
                            this.instruction.nextScopeInstructions = null;
                        }
                    }
                    this.instruction.component.set(n);
                    try {
                        return t(this.toComponentInstance(s.container, s.controller, s.element), (t => {
                            this.instruction.component.set(t);
                            this.contentStates.set("created", void 0);
                        }));
                    } catch (t) {
                        this.u(t);
                        throw createMappedError(2017, this.instruction.component.name, t);
                    }
                } else {
                    throw createMappedError(2017, this.instruction.component.name);
                }
            }
        }
        this.contentStates.set("created", void 0);
    }
    canLoad() {
        if (!this.contentStates.has("created") || this.contentStates.has("checkedLoad") && !this.reload) {
            return true;
        }
        const t = this.instruction.component.instance;
        if (t == null) {
            return true;
        }
        this.contentStates.set("checkedLoad", void 0);
        const i = this.endpoint.parentViewport?.getTimeContent(this.navigation.timestamp)?.instruction?.typeParameters(this.router);
        const s = this.instruction.typeParameters(this.router);
        const n = {
            ...this.navigation.parameters,
            ...i,
            ...s
        };
        const e = this.R(t, "canLoad").map((i => s => {
            if (s?.previousValue != null && s.previousValue !== true) {
                s.exit();
                return s.previousValue ?? false;
            }
            return i(t, n, this.instruction, this.navigation);
        }));
        if (t.canLoad != null) {
            e.push((i => {
                if ((i?.previousValue ?? true) === false) {
                    return false;
                }
                return t.canLoad(n, this.instruction, this.navigation);
            }));
        }
        if (e.length === 0) {
            return true;
        }
        if (e.length === 1) {
            return e[0](null);
        }
        return Runner.run("canLoad", ...e);
    }
    canUnload(t) {
        if (this.contentStates.has("checkedUnload") && !this.reload) {
            return true;
        }
        this.contentStates.set("checkedUnload", void 0);
        if (!this.contentStates.has("loaded")) {
            return true;
        }
        const i = this.instruction.component.instance;
        if (t === null) {
            t = Navigation.create({
                instruction: "",
                fullStateInstruction: "",
                previous: this.navigation
            });
        }
        const s = this.R(i, "canUnload").map((s => n => {
            if ((n?.previousValue ?? true) === false) {
                return false;
            }
            return s(i, this.instruction, t);
        }));
        if (i.canUnload != null) {
            s.push((s => {
                if ((s?.previousValue ?? true) === false) {
                    return false;
                }
                return i.canUnload?.(this.instruction, t);
            }));
        }
        if (s.length === 0) {
            return true;
        }
        if (s.length === 1) {
            return s[0](null);
        }
        return Runner.run("canUnload", ...s);
    }
    load(t) {
        return Runner.run(t, (() => this.contentStates.await("checkedLoad")), (() => {
            if (!this.contentStates.has("created") || this.contentStates.has("loaded") && !this.reload) {
                return;
            }
            this.reload = false;
            this.contentStates.set("loaded", void 0);
            const t = this.instruction.component.instance;
            const i = this.endpoint.parentViewport?.getTimeContent(this.navigation.timestamp)?.instruction?.typeParameters(this.router);
            const s = this.instruction.typeParameters(this.router);
            const n = {
                ...this.navigation.parameters,
                ...i,
                ...s
            };
            const e = this.R(t, "loading").map((i => () => i(t, n, this.instruction, this.navigation)));
            e.push(...this.R(t, "load").map((i => () => {
                console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
                return i(t, n, this.instruction, this.navigation);
            })));
            if (e.length !== 0) {
                if (typeof t.loading === "function") {
                    e.push((() => t.loading(n, this.instruction, this.navigation)));
                }
                if (hasVmHook(t, "load")) {
                    console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
                    e.push((() => t.load(n, this.instruction, this.navigation)));
                }
                return Runner.run("load", ...e);
            }
            if (hasVmHook(t, "loading")) {
                return t.loading(n, this.instruction, this.navigation);
            }
            if (hasVmHook(t, "load")) {
                console.warn(`[Deprecated] Found deprecated hook name "load" in ${this.instruction.component.name}. Please use the new name "loading" instead.`);
                return t.load(n, this.instruction, this.navigation);
            }
        }));
    }
    unload(t) {
        if (!this.contentStates.has("loaded")) {
            return;
        }
        this.contentStates.delete("loaded");
        const i = this.instruction.component.instance;
        if (t === null) {
            t = Navigation.create({
                instruction: "",
                fullStateInstruction: "",
                previous: this.navigation
            });
        }
        const s = this.R(i, "unloading").map((s => () => s(i, this.instruction, t)));
        s.push(...this.R(i, "unload").map((s => () => {
            console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
            return s(i, this.instruction, t);
        })));
        if (s.length !== 0) {
            if (hasVmHook(i, "unloading")) {
                s.push((() => i.unloading(this.instruction, t)));
            }
            if (hasVmHook(i, "unload")) {
                console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
                s.push((() => i.unload(this.instruction, t)));
            }
            return Runner.run("unload", ...s);
        }
        if (hasVmHook(i, "unloading")) {
            return i.unloading(this.instruction, t);
        }
        if (hasVmHook(i, "unload")) {
            console.warn(`[Deprecated] Found deprecated hook name "unload" in ${this.instruction.component.name}. Please use the new name "unloading" instead.`);
            return i.unload(this.instruction, t);
        }
    }
    activateComponent(t, i, s, n, e, r) {
        return Runner.run(t, (() => this.contentStates.await("loaded")), (() => this.waitForParent(s)), (() => {
            if (this.contentStates.has("activating") || this.contentStates.has("activated")) {
                return;
            }
            this.contentStates.set("activating", void 0);
            return this.controller?.activate(i ?? this.controller, s, void 0);
        }), (() => {
            this.contentStates.set("activated", void 0);
        }));
    }
    deactivateComponent(t, i, s, n, e = false) {
        if (!this.contentStates.has("activated") && !this.contentStates.has("activating")) {
            return;
        }
        return Runner.run(t, (() => {
            if (e && n.element !== null) {
                const t = Array.from(n.element.getElementsByTagName("*"));
                for (const i of t) {
                    if (i.scrollTop > 0 || i.scrollLeft) {
                        i.setAttribute("au-element-scroll", `${i.scrollTop},${i.scrollLeft}`);
                    }
                }
            }
            this.contentStates.delete("activated");
            this.contentStates.delete("activating");
            return this.controller?.deactivate(i ?? this.controller, s);
        }));
    }
    disposeComponent(t, i, s = false) {
        if (!this.contentStates.has("created") || this.instruction.component.instance == null) {
            return;
        }
        if (!s) {
            this.contentStates.delete("created");
            return this.controller?.dispose();
        } else {
            i.push(this);
        }
    }
    freeContent(t, i, s, n, e = false) {
        return Runner.run(t, (() => this.unload(s)), (t => this.deactivateComponent(t, null, i.controller, i, e)), (() => this.disposeComponent(i, n, e)));
    }
    toComponentName() {
        return this.instruction.component.name;
    }
    toComponentType(t) {
        if (this.instruction.component.none) {
            return null;
        }
        return this.instruction.component.toType(t, this.instruction);
    }
    toComponentInstance(t, i, s) {
        if (this.instruction.component.none) {
            return null;
        }
        return this.instruction.component.toInstance(t, i, s, this.instruction);
    }
    waitForParent(t) {
        if (t === null) {
            return;
        }
        if (!t.isActive) {
            return new Promise((t => {
                this.endpoint.activeResolve = t;
            }));
        }
    }
    u(t) {
        if (!t.message.startsWith("AUR0009:")) {
            throw t;
        }
    }
    R(t, i) {
        const s = t.$controller.lifecycleHooks[i] ?? [];
        return s.map((t => t.instance[i].bind(t.instance)));
    }
}

function hasVmHook(t, i) {
    return typeof t[i] === "function";
}

class ViewportOptions {
    constructor(t = true, i = [], s = "", n = "", e = "", r = false, o = false, h = false, u = false, a = false) {
        this.scope = t;
        this.usedBy = i;
        this.fallback = n;
        this.fallbackAction = e;
        this.noLink = r;
        this.noTitle = o;
        this.stateful = h;
        this.forceDescription = u;
        this.noHistory = a;
        this.default = undefined;
        this.default = s;
    }
    static create(t) {
        const i = new ViewportOptions;
        if (t !== void 0) {
            i.apply(t);
        }
        return i;
    }
    apply(t) {
        this.scope = t.scope ?? this.scope;
        this.usedBy = (typeof t.usedBy === "string" ? t.usedBy.split(",").filter((t => t.length > 0)) : t.usedBy) ?? this.usedBy;
        this.default = t.default ?? this.default;
        this.fallback = t.fallback ?? this.fallback;
        this.fallbackAction = t.fallbackAction ?? this.fallbackAction;
        this.noLink = t.noLink ?? this.noLink;
        this.noTitle = t.noTitle ?? this.noTitle;
        this.stateful = t.stateful ?? this.stateful;
        this.forceDescription = t.forceDescription ?? this.forceDescription;
        this.noHistory = t.noHistory ?? this.noHistory;
    }
}

class Viewport extends P {
    constructor(t, i, s, n, e, r) {
        super(t, i, s);
        this.contents = [];
        this.forceRemove = false;
        this.options = new ViewportOptions;
        this.activeResolve = null;
        this.connectionResolve = null;
        this.clear = false;
        this.coordinators = [];
        this.previousViewportState = null;
        this.cache = [];
        this.historyCache = [];
        this.contents.push(new ViewportContent(t, this, n, e));
        this.contents[0].completed = true;
        if (r !== void 0) {
            this.options.apply(r);
        }
    }
    getContent() {
        if (this.contents.length === 1) {
            return this.contents[0];
        }
        let t;
        for (let i = 0, s = this.contents.length; i < s; i++) {
            if (this.contents[i].completed ?? false) {
                t = this.contents[i];
            } else {
                break;
            }
        }
        return t;
    }
    getNextContent() {
        if (this.contents.length === 1) {
            return null;
        }
        const t = this.contents.indexOf(this.getContent());
        return this.contents.length > t ? this.contents[t + 1] : null;
    }
    getTimeContent(t) {
        let i = null;
        for (let s = 0, n = this.contents.length; s < n; s++) {
            if (this.contents[s].navigation.timestamp > t) {
                break;
            }
            i = this.contents[s];
        }
        return i;
    }
    getNavigationContent(t) {
        return super.getNavigationContent(t);
    }
    get parentViewport() {
        let t = this.connectedScope;
        while (t?.parent != null) {
            t = t.parent;
            if (t.endpoint.isViewport) {
                return t.endpoint;
            }
        }
        return null;
    }
    get isEmpty() {
        return this.getContent().componentInstance === null;
    }
    get doForceRemove() {
        let t = this.connectedScope;
        while (t !== null) {
            if (t.isViewport && t.endpoint.forceRemove) {
                return true;
            }
            t = t.parent;
        }
        return false;
    }
    isActiveNavigation(t) {
        return this.coordinators[this.coordinators.length - 1] === t;
    }
    toString() {
        const t = this.getContent()?.instruction.component.name ?? "";
        const i = this.getNextContent()?.instruction.component.name ?? "";
        return `v:${this.name}[${t}->${i}]`;
    }
    setNextContent(t, i) {
        t.endpoint.set(this);
        this.clear = t.isClear(this.router);
        const s = this.getContent();
        const n = new ViewportContent(this.router, this, this.owningScope, this.scope.hasScope, !this.clear ? t : void 0, i, this.connectedCE ?? null);
        this.contents.push(n);
        n.fromHistory = n.componentInstance !== null && i.navigation != null ? !!i.navigation.back || !!i.navigation.forward : false;
        if (this.options.stateful) {
            const t = this.cache.find((t => n.isCacheEqual(t)));
            if (t !== void 0) {
                this.contents.splice(this.contents.indexOf(n), 1, t);
                n.fromCache = true;
            } else {
                this.cache.push(n);
            }
        }
        if (n.componentInstance !== null && s.componentInstance === n.componentInstance) {
            n.delete();
            this.contents.splice(this.contents.indexOf(n), 1);
            return this.transitionAction = "skip";
        }
        if (!s.equalComponent(n) || i.navigation.refresh || s.reloadBehavior === "refresh") {
            return this.transitionAction = "swap";
        }
        if (s.reloadBehavior === "disallow") {
            n.delete();
            this.contents.splice(this.contents.indexOf(n), 1);
            return this.transitionAction = "skip";
        }
        if (s.reloadBehavior === "reload") {
            s.reload = true;
            n.instruction.component.set(s.componentInstance);
            n.contentStates = s.contentStates.clone();
            n.reload = s.reload;
            return this.transitionAction = "reload";
        }
        if (this.options.stateful && s.equalParameters(n)) {
            n.delete();
            this.contents.splice(this.contents.indexOf(n), 1);
            return this.transitionAction = "skip";
        }
        if (!s.equalParameters(n)) {
            {
                return this.transitionAction = "swap";
            }
        }
        n.delete();
        this.contents.splice(this.contents.indexOf(n), 1);
        return this.transitionAction = "skip";
    }
    setConnectedCE(t, i) {
        i = i ?? {};
        if (this.connectedCE !== t) {
            this.previousViewportState = {
                ...this
            };
            this.clearState();
            this.connectedCE = t;
            this.options.apply(i);
            this.connectionResolve?.();
        }
        const s = (this.scope.parent?.endpoint.getRoutes() ?? []).filter((t => (Array.isArray(t.path) ? t.path : [ t.path ]).includes(""))).length > 0;
        if (this.getContent().componentInstance === null && this.getNextContent()?.componentInstance == null && (this.options.default || s)) {
            const t = RoutingInstruction.parse(this.router, this.options.default ?? "");
            if (t.length === 0 && s) {
                const i = this.scope.parent?.findInstructions([ RoutingInstruction.create("") ], false, this.router.configuration.options.useConfiguredRoutes);
                if (i?.foundConfiguration) {
                    t.push(...i.instructions);
                }
            }
            for (const i of t) {
                i.endpoint.set(this);
                i.scope = this.owningScope;
                i.default = true;
            }
            this.router.load(t, {
                append: true
            }).catch((t => {
                throw t;
            }));
        }
    }
    remove(t, i) {
        if (this.connectedCE === i) {
            return Runner.run(t, (t => {
                if (this.getContent().componentInstance !== null) {
                    return this.getContent().freeContent(t, this.connectedCE, this.getNextContent()?.navigation ?? null, this.historyCache, this.doForceRemove ? false : this.router.statefulHistory || this.options.stateful);
                }
            }), (t => {
                if (this.doForceRemove) {
                    const i = [];
                    for (const t of this.historyCache) {
                        i.push((i => t.freeContent(i, null, null, this.historyCache, false)));
                    }
                    i.push((() => {
                        this.historyCache = [];
                    }));
                    return Runner.run(t, ...i);
                }
                return true;
            }));
        }
        return false;
    }
    async transition(t) {
        const i = this.router.configuration.options.indicators.viewportNavigating;
        this.coordinators.push(t);
        while (this.coordinators[0] !== t) {
            await this.coordinators[0].waitForSyncState("completed");
        }
        let s = this.parentViewport;
        if (s !== null && s.transitionAction !== "reload" && s.transitionAction !== "swap") {
            s = null;
        }
        const n = [ i => {
            if (this.isActiveNavigation(t)) {
                return this.canUnload(t, i);
            }
        }, i => {
            if (this.isActiveNavigation(t)) {
                if ((i.previousValue ?? true) === false) {
                    t.cancel();
                }
            }
        }, i => {
            if (this.isActiveNavigation(t)) {
                return RoutingInstruction.resolve([ this.getNavigationContent(t).instruction ]);
            }
        }, i => {
            if (this.isActiveNavigation(t)) {
                if (this.router.isRestrictedNavigation) {
                    const i = this.router.configuration.options;
                    return this.getNavigationContent(t).createComponent(t, this.connectedCE, this.options.fallback || i.fallback, this.options.fallbackAction || i.fallbackAction);
                }
            }
        }, () => t.addEndpointState(this, "guardedUnload"), () => t.waitForSyncState("guardedUnload", this), () => s !== null ? t.waitForEndpointState(s, "guardedLoad") : void 0, i => {
            if (this.isActiveNavigation(t)) {
                return this.canLoad(t, i);
            }
        }, i => {
            if (this.isActiveNavigation(t)) {
                let s = i.previousValue ?? true;
                if (typeof s === "boolean") {
                    if (!s) {
                        t.cancel();
                        const i = this.getNavigationContent(t).instruction;
                        t.removeInstructions(i.dynasty);
                        i.nextScopeInstructions = null;
                        return;
                    }
                } else {
                    const n = this.getNavigationContent(t).instruction;
                    t.removeInstructions(n.dynasty);
                    n.nextScopeInstructions = null;
                    if (typeof s === "string") {
                        const t = this.scope;
                        const i = this.router.configuration.options;
                        let n = RoutingInstruction.parse(this.router, s);
                        const e = t.parent?.findInstructions(n, i.useDirectRouting, i.useConfiguredRoutes);
                        if (e?.foundConfiguration || e?.foundInstructions) {
                            n = e.instructions;
                        }
                        for (const i of n) {
                            i.endpoint.set(this);
                            i.scope = t.owningScope;
                        }
                        s = n;
                    }
                    return Runner.run(i, (() => {
                        void this.router.load(s, {
                            append: t
                        });
                    }), (i => this.cancelContentChange(t, i)), (() => RoutingInstruction.resolve(s)), (t => t.exit()));
                }
            }
            t.addEndpointState(this, "guardedLoad");
            t.addEndpointState(this, "guarded");
        } ];
        const e = [ () => t.waitForSyncState("guarded", this), i => {
            if (this.isActiveNavigation(t)) {
                return this.unload(t, i);
            }
        }, () => t.addEndpointState(this, "unloaded"), () => t.waitForSyncState("unloaded", this), () => s !== null ? t.waitForEndpointState(s, "loaded") : void 0, i => {
            if (this.isActiveNavigation(t)) {
                return this.load(t, i);
            }
        }, () => t.addEndpointState(this, "loaded"), () => t.addEndpointState(this, "routed") ];
        const r = [ () => t.waitForSyncState("routed", this), () => t.waitForEndpointState(this, "routed") ];
        const o = this.router.configuration.options.swapOrder;
        switch (o) {
          case "detach-current-attach-next":
            r.push((i => {
                if (this.isActiveNavigation(t)) {
                    return this.removeContent(i, t);
                }
            }), (i => {
                if (this.isActiveNavigation(t)) {
                    return this.addContent(i, t);
                }
            }));
            break;

          case "attach-next-detach-current":
            r.push((i => {
                if (this.isActiveNavigation(t)) {
                    return this.addContent(i, t);
                }
            }), (i => {
                if (this.isActiveNavigation(t)) {
                    return this.removeContent(i, t);
                }
            }));
            break;

          case "detach-attach-simultaneously":
            r.push((i => Runner.runParallel(i, (i => {
                if (this.isActiveNavigation(t)) {
                    return this.removeContent(i, t);
                }
            }), (i => {
                if (this.isActiveNavigation(t)) {
                    return this.addContent(i, t);
                }
            }))));
            break;

          case "attach-detach-simultaneously":
            r.push((i => Runner.runParallel(i, (i => {
                if (this.isActiveNavigation(t)) {
                    return this.addContent(i, t);
                }
            }), (i => {
                if (this.isActiveNavigation(t)) {
                    return this.removeContent(i, t);
                }
            }))));
            break;
        }
        r.push((() => t.addEndpointState(this, "swapped")));
        this.connectedCE?.setActivity?.(i, true);
        this.connectedCE?.setActivity?.(t.navigation.navigation, true);
        const h = Runner.run("transition", (i => t.setEndpointStep(this, i.root)), ...n, ...e, ...r, (() => t.addEndpointState(this, "completed")), (() => t.waitForSyncState("bound")), (() => {
            this.connectedCE?.setActivity?.(i, false);
            this.connectedCE?.setActivity?.(t.navigation.navigation, false);
        }));
        if (h instanceof Promise) {
            h.catch((t => {}));
        }
    }
    canUnload(t, i) {
        return Runner.run(i, (i => this.getContent().connectedScope.canUnload(t, i)), (i => {
            if ((i.previousValue ?? true) === false) {
                return false;
            }
            return this.getContent().canUnload(t.navigation);
        }));
    }
    canLoad(t, i) {
        if (this.clear) {
            return true;
        }
        return Runner.run(i, (() => this.waitForConnected()), (() => {
            const i = this.router.configuration.options;
            const s = this.getNavigationContent(t);
            return s.createComponent(t, this.connectedCE, this.options.fallback || i.fallback, this.options.fallbackAction || i.fallbackAction);
        }), (() => this.getNavigationContent(t).canLoad()));
    }
    load(t, i) {
        if (this.clear) {
            return;
        }
        return this.getNavigationContent(t).load(i);
    }
    addContent(t, i) {
        return this.activate(t, null, this.connectedController, i);
    }
    removeContent(t, i) {
        if (this.isEmpty) {
            return;
        }
        const s = this.router.statefulHistory || (this.options.stateful ?? false);
        return Runner.run(t, (() => i.addEndpointState(this, "bound")), (() => i.waitForSyncState("bound")), (t => this.deactivate(t, null, this.connectedController)), (() => s ? this.dispose() : void 0));
    }
    activate(t, i, s, n) {
        if (this.activeContent.componentInstance !== null) {
            return Runner.run(t, (() => this.activeContent.canLoad()), (t => this.activeContent.load(t)), (t => this.activeContent.activateComponent(t, i, s, this.connectedCE, (() => n?.addEndpointState(this, "bound")), n?.waitForSyncState("bound"))));
        }
    }
    deactivate(t, i, s) {
        const n = this.getContent();
        if (n?.componentInstance != null && !n.reload && n.componentInstance !== this.getNextContent()?.componentInstance) {
            return n.deactivateComponent(t, i, s, this.connectedCE, this.router.statefulHistory || this.options.stateful);
        }
    }
    unload(t, i) {
        return Runner.run(i, (i => this.getContent().connectedScope.unload(t, i)), (() => this.getContent().componentInstance != null ? this.getContent().unload(t.navigation ?? null) : void 0));
    }
    dispose() {
        if (this.getContent().componentInstance !== null && !this.getContent().reload && this.getContent().componentInstance !== this.getNextContent()?.componentInstance) {
            this.getContent().disposeComponent(this.connectedCE, this.historyCache, this.router.statefulHistory || this.options.stateful);
        }
    }
    finalizeContentChange(t, i) {
        const s = this.contents.findIndex((i => i.navigation === t.navigation));
        let n = this.contents[s];
        const e = this.contents[s - 1];
        if (this.clear) {
            const t = new ViewportContent(this.router, this, this.owningScope, this.scope.hasScope, void 0, n.navigation);
            this.contents.splice(s, 1, t);
            n.delete();
            n = t;
        } else {
            n.reload = false;
        }
        e.delete();
        n.completed = true;
        this.transitionAction = "";
        n.contentStates.delete("checkedUnload");
        n.contentStates.delete("checkedLoad");
        this.previousViewportState = null;
        const r = this.router.configuration.options.indicators.viewportNavigating;
        this.connectedCE?.setActivity?.(r, false);
        this.connectedCE?.setActivity?.(t.navigation.navigation, false);
        let o = 0;
        for (let t = 0, i = s; t < i; t++) {
            if (!(this.contents[0].navigation.completed ?? false)) {
                break;
            }
            o++;
        }
        this.contents.splice(0, o);
        arrayRemove(this.coordinators, (i => i === t));
    }
    cancelContentChange(t, i = null) {
        [ ...new Set(this.scope.children.map((t => t.endpoint))) ].forEach((s => s.cancelContentChange(t, i)));
        const s = this.contents.findIndex((i => i.navigation === t.navigation));
        if (s < 0) {
            return;
        }
        const n = t.getEndpointStep(this)?.current ?? null;
        const e = this.contents[s];
        const r = this.contents[s - 1];
        e.instruction.cancelled = true;
        return Runner.run(n, (t => e.freeContent(t, this.connectedCE, e.navigation, this.historyCache, this.router.statefulHistory || this.options.stateful)), (() => {
            if (this.previousViewportState) {
                Object.assign(this, this.previousViewportState);
            }
            e?.delete();
            if (e !== null) {
                this.contents.splice(this.contents.indexOf(e), 1);
            }
            this.transitionAction = "";
            r?.contentStates.delete("checkedUnload");
            r?.contentStates.delete("checkedLoad");
            const i = this.router.configuration.options.indicators.viewportNavigating;
            this.connectedCE?.setActivity?.(i, false);
            this.connectedCE?.setActivity?.(t.navigation.navigation, false);
            t.removeEndpoint(this);
            arrayRemove(this.coordinators, (i => i === t));
        }), (() => {
            if (n !== i) {
                return n?.exit();
            }
        }));
    }
    wantComponent(t) {
        return this.options.usedBy.includes(t);
    }
    acceptComponent(t) {
        if (t === "-" || t === null) {
            return true;
        }
        const i = this.options.usedBy;
        if (i.length === 0) {
            return true;
        }
        if (i.includes(t)) {
            return true;
        }
        if (i.filter((t => t.includes("*"))).length) {
            return true;
        }
        return false;
    }
    freeContent(t, i) {
        const s = this.historyCache.find((t => t.componentInstance === i));
        if (s !== void 0) {
            return Runner.run(t, (t => {
                this.forceRemove = true;
                return s.freeContent(t, null, null, this.historyCache, false);
            }), (() => {
                this.forceRemove = false;
                arrayRemove(this.historyCache, (t => t === s));
            }));
        }
    }
    getRoutes() {
        const t = [];
        let i = this.getComponentType();
        if (i != null) {
            i = i.constructor === i.constructor.constructor ? i : i.constructor;
            t.push(...V.getConfiguration(i) ?? []);
        }
        return t;
    }
    getTitle(t) {
        if (this.options.noTitle) {
            return "";
        }
        const i = this.getComponentType();
        if (i === null) {
            return "";
        }
        let s = "";
        const n = i.title;
        if (n !== void 0) {
            if (typeof n === "string") {
                s = n;
            } else {
                const i = this.getComponentInstance();
                s = n.call(i, i, t);
            }
        } else if (this.router.configuration.options.title.useComponentNames) {
            let t = this.getContentInstruction().component.name ?? "";
            const i = this.router.configuration.options.title.componentPrefix ?? "";
            if (t.startsWith(i)) {
                t = t.slice(i.length);
            }
            t = t.replace("-", " ");
            s = t.slice(0, 1).toLocaleUpperCase() + t.slice(1);
        }
        return s;
    }
    getComponentType() {
        let t = this.getContentInstruction().component.type ?? null;
        if (t === null) {
            const i = a.for(this.connectedCE.element);
            t = i.container.componentType;
        }
        return t ?? null;
    }
    getComponentInstance() {
        return this.getContentInstruction().component.instance ?? null;
    }
    getContentInstruction() {
        return this.getNextContent()?.instruction ?? this.getContent().instruction ?? null;
    }
    clearState() {
        this.options = ViewportOptions.create();
        const t = this.owningScope;
        const i = this.scope.hasScope;
        this.getContent().delete();
        this.contents.shift();
        if (this.contents.length < 1) {
            throw new Error("no content!");
        }
        this.contents.push(new ViewportContent(this.router, this, t, i));
        this.cache = [];
    }
    waitForConnected() {
        if (this.connectedCE === null) {
            return new Promise((t => {
                this.connectionResolve = t;
            }));
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
            return "Viewport";
        }
        if (this.instance instanceof ViewportScope) {
            return "ViewportScope";
        }
        return null;
    }
    static create(t) {
        const i = new InstructionEndpoint;
        i.set(t);
        return i;
    }
    static isName(t) {
        return typeof t === "string";
    }
    static isInstance(t) {
        return t instanceof P;
    }
    static getName(t) {
        if (InstructionEndpoint.isName(t)) {
            return t;
        } else {
            return t ? t.name : null;
        }
    }
    static getInstance(t) {
        if (InstructionEndpoint.isName(t)) {
            return null;
        } else {
            return t;
        }
    }
    set(t) {
        if (t === undefined || t === "") {
            t = null;
        }
        if (typeof t === "string") {
            this.name = t;
            this.instance = null;
        } else {
            this.instance = t;
            if (t !== null) {
                this.name = t.name;
                this.scope = t.owningScope;
            }
        }
    }
    toInstance(t) {
        if (this.instance !== null) {
            return this.instance;
        }
        return t.getEndpoint(this.endpointType, this.name);
    }
    same(t, i) {
        if (this.instance !== null && t.instance !== null) {
            return this.instance === t.instance;
        }
        return this.endpointType !== null && t.endpointType !== null && this.endpointType === t.endpointType && (!i || this.scope === t.scope) && (this.instance !== null ? this.instance.name : this.name) === (t.instance !== null ? t.instance.name : t.name);
    }
}

const A = {
    excludeEndpoint: false,
    endpointContext: false,
    fullState: false
};

class RoutingInstruction {
    constructor(t, i, s) {
        this.ownsScope = true;
        this.nextScopeInstructions = null;
        this.scope = null;
        this.scopeModifier = "";
        this.needsEndpointDescribed = false;
        this.route = null;
        this.routeStart = false;
        this.default = false;
        this.topInstruction = false;
        this.unparsed = null;
        this.cancelled = false;
        this.component = InstructionComponent.create(t);
        this.endpoint = InstructionEndpoint.create(i);
        this.parameters = InstructionParameters.create(s);
    }
    static create(t, i, s, n = true, e = null) {
        const r = new RoutingInstruction(t, i, s);
        r.ownsScope = n;
        r.nextScopeInstructions = e;
        return r;
    }
    static createClear(t, i) {
        const s = RoutingInstruction.create(RoutingInstruction.clear(t), i);
        s.scope = i.scope;
        return s;
    }
    static from(t, i) {
        if (!Array.isArray(i)) {
            i = [ i ];
        }
        const s = [];
        for (const n of i) {
            if (typeof n === "string") {
                s.push(...RoutingInstruction.parse(t, n));
            } else if (n instanceof RoutingInstruction) {
                s.push(n);
            } else if (n instanceof Promise) {
                s.push(RoutingInstruction.create(n));
            } else if (InstructionComponent.isAppelation(n)) {
                s.push(RoutingInstruction.create(n));
            } else if (InstructionComponent.isDefinition(n)) {
                s.push(RoutingInstruction.create(n.Type));
            } else if ("component" in n || "id" in n) {
                const i = n;
                const e = RoutingInstruction.create(i.component, i.viewport, i.parameters);
                e.route = n.id ?? null;
                if (i.children !== void 0 && i.children !== null) {
                    e.nextScopeInstructions = RoutingInstruction.from(t, i.children);
                }
                s.push(e);
            } else if (typeof n === "object" && n !== null) {
                const t = a.define(n);
                s.push(RoutingInstruction.create(t));
            } else {
                s.push(RoutingInstruction.create(n));
            }
        }
        return s;
    }
    static clear(t) {
        return Separators.for(t).clear;
    }
    static add(t) {
        return Separators.for(t).add;
    }
    static parse(t, i) {
        const s = Separators.for(t);
        let n = "";
        const e = /^[./]+/.exec(i);
        if (Array.isArray(e) && e.length > 0) {
            n = e[0];
            i = i.slice(n.length);
        }
        const r = InstructionParser.parse(s, i, true, true).instructions;
        for (const t of r) {
            t.scopeModifier = n;
        }
        return r;
    }
    static stringify(t, i, s = {}, n = false) {
        if (typeof s === "boolean") {
            console.warn(`[Deprecated] Boolean passed to RoutingInstruction.stringify. Please use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }`);
            s = {
                excludeEndpoint: s,
                endpointContext: n
            };
        }
        s = {
            ...A,
            ...s
        };
        return typeof i === "string" ? i : i.map((i => i.stringify(t, s))).filter((t => t.length > 0)).join(Separators.for(t).sibling);
    }
    static resolve(t) {
        const i = t.filter((t => t.isUnresolved)).map((t => t.resolve())).filter((t => t instanceof Promise));
        if (i.length > 0) {
            return Promise.all(i);
        }
    }
    static containsSiblings(t, i) {
        if (i === null) {
            return false;
        }
        if (i.filter((i => !i.isClear(t) && !i.isClearAll(t))).length > 1) {
            return true;
        }
        return i.some((i => RoutingInstruction.containsSiblings(t, i.nextScopeInstructions)));
    }
    static flat(t) {
        const i = [];
        for (const s of t) {
            i.push(s);
            if (s.hasNextScopeInstructions) {
                i.push(...RoutingInstruction.flat(s.nextScopeInstructions));
            }
        }
        return i;
    }
    static clone(t, i = false, s = false) {
        return t.map((t => t.clone(i, s)));
    }
    static contains(t, i, s, n) {
        return s.every((s => s.isIn(t, i, n)));
    }
    get viewport() {
        return this.endpoint.instance instanceof Viewport || this.endpoint.endpointType === null ? this.endpoint : null;
    }
    get viewportScope() {
        return this.endpoint.instance instanceof ViewportScope || this.endpoint.endpointType === null ? this.endpoint : null;
    }
    get previous() {
        return this.endpoint.instance?.getContent()?.instruction;
    }
    isAdd(t) {
        return this.component.name === Separators.for(t).add;
    }
    isClear(t) {
        return this.component.name === Separators.for(t).clear;
    }
    isAddAll(t) {
        return this.isAdd(t) && (this.endpoint.name?.length ?? 0) === 0;
    }
    isClearAll(t) {
        return this.isClear(t) && (this.endpoint.name?.length ?? 0) === 0;
    }
    get hasNextScopeInstructions() {
        return (this.nextScopeInstructions?.length ?? 0) > 0;
    }
    get dynasty() {
        const t = [ this ];
        if (this.hasNextScopeInstructions) {
            t.push(...this.nextScopeInstructions.map((t => t.dynasty)).flat());
        }
        return t;
    }
    get isUnresolved() {
        return this.component.isFunction() || this.component.isPromise();
    }
    resolve() {
        return this.component.resolve(this);
    }
    typeParameters(t) {
        return this.parameters.toSpecifiedParameters(t, this.component.type?.parameters ?? []);
    }
    sameRoute(t) {
        const i = this.route?.match;
        const s = t.route?.match;
        if (i == null || s == null) {
            return false;
        }
        if (typeof i === "string" || typeof s === "string") {
            return i === s;
        }
        return i.id === s.id;
    }
    sameComponent(t, i, s = false, n = false) {
        if (s && !this.sameParameters(t, i, n)) {
            return false;
        }
        return this.component.same(i.component, n);
    }
    sameEndpoint(t, i) {
        return this.endpoint.same(t.endpoint, i);
    }
    sameParameters(t, i, s = false) {
        if (!this.component.same(i.component, s)) {
            return false;
        }
        return this.parameters.same(t, i.parameters, this.component.type);
    }
    stringify(t, i = {}, s = false, n = false) {
        if (typeof i === "boolean") {
            console.warn(`[Deprecated] Boolean passed to RoutingInstruction.stringify. Please use the new interface instead: { excludeEndpoint: boolean; endpointContext: boolean; }`);
            i = {
                excludeEndpoint: i,
                endpointContext: s
            };
        } else {
            n = s;
        }
        i = {
            ...A,
            ...i
        };
        const e = Separators.for(t);
        let r = i.excludeEndpoint;
        let o = false;
        if (i.endpointContext) {
            const t = this.viewport?.instance ?? null;
            if (t?.options.noLink ?? false) {
                return "";
            }
            if (!this.needsEndpointDescribed && (!(t?.options.forceDescription ?? false) || this.viewportScope?.instance != null)) {
                r = true;
            }
            if (t?.options.fallback === this.component.name) {
                o = true;
            }
            if (t?.options.default === this.component.name) {
                o = true;
            }
        }
        const h = this.nextScopeInstructions;
        let u = this.scopeModifier;
        if (this.route instanceof FoundRoute && !this.routeStart) {
            return !n && Array.isArray(h) ? RoutingInstruction.stringify(t, h, i) : "";
        }
        const a = this.stringifyShallow(t, r, o, i.fullState);
        u += a.endsWith(e.scope) ? a.slice(0, -e.scope.length) : a;
        if (!n && Array.isArray(h) && h.length > 0) {
            const s = RoutingInstruction.stringify(t, h, i);
            if (s.length > 0) {
                u += e.scope;
                u += h.length === 1 ? s : `${e.groupStart}${s}${e.groupEnd}`;
            }
        }
        return u;
    }
    clone(t = false, i = false, s = false) {
        const n = RoutingInstruction.create(this.component.func ?? this.component.promise ?? this.component.type ?? this.component.name, this.endpoint.name, this.parameters.typedParameters ?? void 0);
        if (t) {
            n.component.set(this.component.instance ?? this.component.type ?? this.component.name);
            n.endpoint.set(this.endpoint.instance ?? this.endpoint.name);
        }
        n.component.name = this.component.name;
        n.needsEndpointDescribed = this.needsEndpointDescribed;
        n.route = this.route;
        n.routeStart = this.routeStart;
        n.default = this.default;
        if (i) {
            n.scopeModifier = this.scopeModifier;
        }
        n.scope = t ? this.scope : null;
        if (this.hasNextScopeInstructions && !s) {
            n.nextScopeInstructions = RoutingInstruction.clone(this.nextScopeInstructions, t, i);
        }
        return n;
    }
    isIn(t, i, s) {
        const n = i.filter((i => {
            if (this.route != null || i.route != null) {
                if (!i.sameRoute(this)) {
                    return false;
                }
            } else {
                if (!i.sameComponent(t, this)) {
                    return false;
                }
            }
            const s = i.component.type ?? this.component.type;
            const n = this.component.type ?? i.component.type;
            const e = i.parameters.toSpecifiedParameters(t, s?.parameters);
            const r = this.parameters.toSpecifiedParameters(t, n?.parameters);
            if (!InstructionParameters.contains(e, r)) {
                return false;
            }
            return this.endpoint.none || i.sameEndpoint(this, false);
        }));
        if (n.length === 0) {
            return false;
        }
        if (!s || !this.hasNextScopeInstructions) {
            return true;
        }
        if (n.some((i => RoutingInstruction.contains(t, i.nextScopeInstructions ?? [], this.nextScopeInstructions, s)))) {
            return true;
        }
        return false;
    }
    getTitle(t) {
        if (this.route instanceof FoundRoute) {
            const i = this.route.match?.title;
            if (i != null) {
                if (this.routeStart) {
                    return typeof i === "string" ? i : i(this, t);
                } else {
                    return "";
                }
            }
        }
        return this.endpoint.instance.getTitle(t);
    }
    toJSON() {
        return {
            component: this.component.name ?? undefined,
            viewport: this.endpoint.name ?? undefined,
            parameters: this.parameters.parametersRecord ?? undefined,
            children: this.hasNextScopeInstructions ? this.nextScopeInstructions : undefined
        };
    }
    stringifyShallow(t, i = false, s = false, n = false) {
        if (!n && this.route != null) {
            const i = this.route instanceof FoundRoute ? this.route.matching : this.route;
            return i.split("/").map((i => i.startsWith(":") ? this.parameters.get(t, i.slice(1)) : i)).join("/");
        }
        const e = Separators.for(t);
        let r = !s || n ? this.component.name ?? "" : "";
        const o = this.component.type ? this.component.type.parameters : null;
        const h = InstructionParameters.stringify(t, this.parameters.toSortedParameters(t, o));
        if (h.length > 0) {
            r += !s || n ? `${e.parameters}${h}${e.parametersEnd}` : h;
        }
        if (this.endpoint.name != null && (!i || n)) {
            r += `${e.viewport}${this.endpoint.name}`;
        }
        if (!this.ownsScope) {
            r += e.noScope;
        }
        return r || "";
    }
}

class NavigatorNavigateEvent {
    constructor(t, i) {
        this.eventName = t;
        this.navigation = i;
    }
    static create(t) {
        return new NavigatorNavigateEvent(NavigatorNavigateEvent.eventName, t);
    }
}

NavigatorNavigateEvent.eventName = "au:router:navigation-navigate";

class Navigator {
    constructor() {
        this.lastNavigationIndex = -1;
        this.navigations = [];
        this.options = {
            statefulHistoryLength: 0
        };
        this.isActive = false;
        this.uninitializedNavigation = Navigation.create({
            instruction: "NAVIGATOR UNINITIALIZED",
            fullStateInstruction: "",
            index: 0,
            completed: true
        });
        this.ea = s(n);
        this.container = s(e);
    }
    start(t) {
        if (this.isActive) {
            throw createMappedError(2010);
        }
        this.isActive = true;
        this.options = {
            ...t
        };
    }
    stop() {
        if (!this.isActive) {
            throw createMappedError(2011);
        }
        this.isActive = false;
    }
    navigate(t) {
        if (!(t instanceof Navigation)) {
            t = Navigation.create(t);
        }
        const i = new NavigationFlags;
        if (this.lastNavigationIndex === -1) {
            this.loadState();
            if (this.lastNavigationIndex !== -1) {
                i.refresh = true;
            } else {
                i.first = true;
                i.new = true;
                this.lastNavigationIndex = 0;
                this.navigations = [ Navigation.create({
                    index: 0,
                    instruction: "",
                    fullStateInstruction: ""
                }) ];
            }
        }
        if (t.index !== void 0 && !(t.replacing ?? false) && !(t.refreshing ?? false)) {
            t.historyMovement = t.index - Math.max(this.lastNavigationIndex, 0);
            t.instruction = this.navigations[t.index] != null ? this.navigations[t.index].fullStateInstruction : t.fullStateInstruction;
            t.replacing = true;
            if (t.historyMovement > 0) {
                i.forward = true;
            } else if (t.historyMovement < 0) {
                i.back = true;
            }
        } else if ((t.refreshing ?? false) || i.refresh) {
            t = this.navigations[this.lastNavigationIndex];
            t.replacing = true;
            t.refreshing = true;
        } else if (t.replacing ?? false) {
            i.replace = true;
            i.new = true;
            t.index = this.lastNavigationIndex;
        } else {
            i.new = true;
            t.index = this.lastNavigationIndex + 1;
            this.navigations[t.index] = t;
        }
        t.navigation = i;
        t.previous = this.navigations[Math.max(this.lastNavigationIndex, 0)];
        t.process = new OpenPromise(`navigation: ${t.path}`);
        this.lastNavigationIndex = t.index;
        this.notifySubscribers(t);
        return t.process.promise;
    }
    async finalize(t, i) {
        if (t.untracked ?? false) {
            if ((t.fromBrowser ?? false) && this.options.store != null) {
                await this.options.store.popNavigatorState();
            }
        } else if (t.replacing ?? false) {
            if ((t.historyMovement ?? 0) === 0) {
                this.navigations[t.previous.index] = t;
            }
            await this.saveState(t.index, false);
        } else {
            const s = t.index;
            if (i) {
                this.navigations = this.navigations.slice(0, s);
            }
            this.navigations[s] = t;
            if ((this.options.statefulHistoryLength ?? 0) > 0) {
                const t = this.navigations.length - (this.options.statefulHistoryLength ?? 0);
                for (const i of this.navigations.slice(s)) {
                    if (typeof i.instruction !== "string" || typeof i.fullStateInstruction !== "string") {
                        await this.serializeNavigation(i, this.navigations.slice(t, s));
                    }
                }
            }
            await this.saveState(t.index, !(t.fromBrowser ?? false));
        }
    }
    async cancel(t) {
        if (this.options.store != null) {
            if (t.navigation?.new) {
                if (t.fromBrowser ?? false) {
                    await this.options.store.popNavigatorState();
                }
            } else if ((t.historyMovement ?? 0) !== 0) {
                await this.options.store.go(-t.historyMovement, true);
            }
        }
    }
    async go(t) {
        let i = this.lastNavigationIndex + t;
        i = Math.min(i, this.navigations.length - 1);
        await this.options.store.go(t, true);
        const s = this.navigations[i];
        return this.navigate(s);
    }
    getState() {
        const t = this.options.store != null ? {
            ...this.options.store.state
        } : {};
        const i = t?.navigations ?? [];
        const s = t?.navigationIndex ?? -1;
        return {
            navigations: i,
            navigationIndex: s
        };
    }
    loadState() {
        const {navigations: t, navigationIndex: i} = this.getState();
        this.navigations = t.map((t => Navigation.create(t)));
        this.lastNavigationIndex = i;
    }
    async saveState(t, i) {
        for (let t = 0; t < this.navigations.length; t++) {
            this.navigations[t] = Navigation.create(this.navigations[t].toStoredNavigation());
        }
        if ((this.options.statefulHistoryLength ?? 0) > 0) {
            const t = this.navigations.length - (this.options.statefulHistoryLength ?? 0);
            for (let i = 0; i < t; i++) {
                const s = this.navigations[i];
                if (typeof s.instruction !== "string" || typeof s.fullStateInstruction !== "string") {
                    await this.serializeNavigation(s, this.navigations.slice(t));
                }
            }
        }
        if (this.options.store == null) {
            return Promise.resolve();
        }
        const s = {
            navigations: (this.navigations ?? []).map((t => this.toStoreableNavigation(t))),
            navigationIndex: t
        };
        if (i) {
            return this.options?.store?.pushNavigatorState(s);
        } else {
            return this.options.store.replaceNavigatorState(s);
        }
    }
    async refresh() {
        if (this.lastNavigationIndex === -1) {
            return Promise.reject();
        }
        const t = this.navigations[this.lastNavigationIndex];
        t.replacing = true;
        t.refreshing = true;
        return this.navigate(t);
    }
    notifySubscribers(t) {
        this.ea.publish(NavigatorNavigateEvent.eventName, NavigatorNavigateEvent.create(t));
    }
    toStoreableNavigation(t) {
        const i = t instanceof Navigation ? t.toStoredNavigation() : t;
        i.instruction = RoutingInstruction.stringify(this.container, i.instruction);
        i.fullStateInstruction = RoutingInstruction.stringify(this.container, i.fullStateInstruction, {
            endpointContext: true,
            fullState: true
        });
        if (typeof i.scope !== "string") {
            i.scope = null;
        }
        return i;
    }
    async serializeNavigation(t, i) {
        let s = [];
        for (const t of i) {
            if (typeof t.instruction !== "string") {
                s.push(...RoutingInstruction.flat(t.instruction).filter((t => t.endpoint.instance !== null)).map((t => t.component.instance)));
            }
            if (typeof t.fullStateInstruction !== "string") {
                s.push(...RoutingInstruction.flat(t.fullStateInstruction).filter((t => t.endpoint.instance !== null)).map((t => t.component.instance)));
            }
        }
        s = arrayUnique(s);
        let n = [];
        if (typeof t.fullStateInstruction !== "string") {
            n.push(...t.fullStateInstruction);
            t.fullStateInstruction = RoutingInstruction.stringify(this.container, t.fullStateInstruction, {
                endpointContext: true,
                fullState: true
            });
        }
        if (typeof t.instruction !== "string") {
            n.push(...t.instruction);
            t.instruction = RoutingInstruction.stringify(this.container, t.instruction);
        }
        n = n.filter(((t, i, s) => t.component.instance != null && s.indexOf(t) === i));
        const e = [];
        for (const t of n) {
            await this.freeInstructionComponents(t, s, e);
        }
    }
    freeInstructionComponents(t, i, s) {
        const n = t.component.instance;
        const e = t.viewport?.instance ?? null;
        if (n === null || e === null || s.some((t => t === n))) {
            return;
        }
        if (!i.some((t => t === n))) {
            return Runner.run("freeInstructionComponents", (t => e.freeContent(t, n)), (() => {
                s.push(n);
            }));
        }
        if (t.hasNextScopeInstructions) {
            for (const n of t.nextScopeInstructions) {
                return this.freeInstructionComponents(n, i, s);
            }
        }
    }
}

const O = S;

const T = N;

const x = b;

const U = k;

class Collection extends Array {
    constructor() {
        super(...arguments);
        this.currentIndex = -1;
    }
    next() {
        if (this.length > this.currentIndex + 1) {
            return this[++this.currentIndex];
        } else {
            this.currentIndex = -1;
            return null;
        }
    }
    removeCurrent() {
        this.splice(this.currentIndex--, 1);
    }
    remove(t) {
        arrayRemove(this, (i => i === t));
    }
}

class EndpointMatcher {
    static matchEndpoints(t, i, s, n = false) {
        const e = [];
        const r = t.getOwnedRoutingScopes(Infinity);
        const o = r.map((t => t.endpoint));
        const h = o.filter((i => i !== null && !s.some((s => i === s.endpoint.instance && !s.cancelled && !s.isClear(t.router)))));
        const u = new Collection(...i.slice());
        let a = null;
        EndpointMatcher.matchKnownEndpoints(t.router, "ViewportScope", u, h, e, false);
        if (!n) {
            EndpointMatcher.matchKnownEndpoints(t.router, "Viewport", u, h, e, false);
        }
        EndpointMatcher.matchViewportScopeSegment(t.router, t, u, h, e);
        while ((a = u.next()) !== null) {
            a.needsEndpointDescribed = true;
        }
        EndpointMatcher.matchViewportConfiguration(u, h, e);
        if (!n) {
            EndpointMatcher.matchSpecifiedViewport(u, h, e, false);
        }
        EndpointMatcher.matchLastViewport(u, h, e);
        if (n) {
            EndpointMatcher.matchSpecifiedViewport(u, h, e, false);
        }
        return {
            matchedInstructions: e,
            remainingInstructions: [ ...u ]
        };
    }
    static matchKnownEndpoints(t, i, s, n, e, r = false) {
        let o;
        while ((o = s.next()) !== null) {
            if (o.endpoint.instance !== null && !o.isAdd(t) && o.endpoint.endpointType === i) {
                EndpointMatcher.matchEndpoint(o, o.endpoint.instance, r);
                e.push(o);
                arrayRemove(n, (t => t === o.endpoint.instance));
                s.removeCurrent();
            }
        }
    }
    static matchViewportScopeSegment(t, i, s, n, e) {
        let r;
        while ((r = s.next()) !== null) {
            for (let o of n) {
                if (!(o instanceof ViewportScope)) {
                    continue;
                }
                if (o.acceptSegment(r.component.name)) {
                    if (Array.isArray(o.source)) {
                        let s = n.find((t => t instanceof ViewportScope && t.name === o.name));
                        if (s === void 0 || r.isAdd(t)) {
                            const t = o.addSourceItem();
                            s = i.getOwnedScopes().filter((t => t.isViewportScope)).map((t => t.endpoint)).find((i => i.sourceItem === t));
                        }
                        o = s;
                    }
                    EndpointMatcher.matchEndpoint(r, o, false);
                    e.push(r);
                    arrayRemove(n, (t => t === r.endpoint.instance));
                    s.removeCurrent();
                    break;
                }
            }
        }
    }
    static matchViewportConfiguration(t, i, s) {
        let n;
        while ((n = t.next()) !== null) {
            for (const e of i) {
                if (!(e instanceof Viewport)) {
                    continue;
                }
                if (e?.wantComponent(n.component.name)) {
                    EndpointMatcher.matchEndpoint(n, e, true);
                    s.push(n);
                    arrayRemove(i, (t => t === n.endpoint.instance));
                    t.removeCurrent();
                    break;
                }
            }
        }
    }
    static matchSpecifiedViewport(t, i, s, n) {
        let e;
        while ((e = t.next()) !== null) {
            let r = e.endpoint.instance;
            if (r == null) {
                const t = e.endpoint.name;
                if ((t?.length ?? 0) === 0) {
                    continue;
                }
                for (const s of i) {
                    if (!(s instanceof Viewport)) {
                        continue;
                    }
                    if (t === s.name) {
                        r = s;
                        break;
                    }
                }
            }
            if (r?.acceptComponent(e.component.name)) {
                EndpointMatcher.matchEndpoint(e, r, n);
                s.push(e);
                arrayRemove(i, (t => t === e.endpoint.instance));
                t.removeCurrent();
            }
        }
    }
    static matchLastViewport(t, i, s) {
        let n;
        while ((n = t.next()) !== null) {
            const e = [];
            for (const t of i) {
                if (!(t instanceof Viewport)) {
                    continue;
                }
                if (t.acceptComponent(n.component.name)) {
                    e.push(t);
                }
            }
            if (e.length === 1) {
                const r = e[0];
                EndpointMatcher.matchEndpoint(n, r, true);
                s.push(n);
                arrayRemove(i, (t => t === n.endpoint.instance));
                t.removeCurrent();
            }
        }
    }
    static matchEndpoint(t, i, s) {
        t.endpoint.set(i);
        if (s) {
            t.needsEndpointDescribed = false;
        }
        if (t.hasNextScopeInstructions) {
            t.nextScopeInstructions.forEach((t => {
                if (t.scope === null) {
                    t.scope = i instanceof Viewport ? i.scope : i.scope.scope;
                }
            }));
        }
    }
}

class RoutingScope {
    constructor(t, i, s, n) {
        this.id = ++RoutingScope.lastId;
        this.parent = null;
        this.children = [];
        this.router = t;
        this.hasScope = i;
        this.owningScope = s ?? this;
        this.endpointContent = n;
    }
    static for(t, i) {
        if (t == null) {
            return {
                scope: null,
                instruction: i
            };
        }
        if (t instanceof RoutingScope || t instanceof Viewport || t instanceof ViewportScope) {
            return {
                scope: t.scope,
                instruction: i
            };
        }
        let s;
        if ("res" in t) {
            s = t;
        } else {
            if ("container" in t) {
                s = t.container;
            } else if ("$controller" in t) {
                s = t.$controller.container;
            } else {
                const i = a.for(t, {
                    searchParents: true
                });
                s = i?.container;
            }
        }
        if (s == null) {
            return {
                scope: null,
                instruction: i
            };
        }
        const n = s.has(Router.closestEndpointKey, true) ? s.get(Router.closestEndpointKey) : null;
        let e = n?.scope ?? null;
        if (e === null || i === undefined) {
            const t = i ?? "";
            return {
                scope: e,
                instruction: t.startsWith("/") ? t.slice(1) : i
            };
        }
        if (i.startsWith("/")) {
            return {
                scope: null,
                instruction: i.slice(1)
            };
        }
        while (i.startsWith(".")) {
            if (i.startsWith("./")) {
                i = i.slice(2);
            } else if (i.startsWith("../")) {
                e = e.parent ?? e;
                i = i.slice(3);
            } else {
                break;
            }
        }
        return {
            scope: e,
            instruction: i
        };
    }
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
        return this.isViewport ? "Viewport" : "ViewportScope";
    }
    get enabled() {
        return this.endpointContent.isActive;
    }
    get passThroughScope() {
        return this.isViewportScope && this.endpoint.passThroughScope;
    }
    get pathname() {
        return `${this.owningScope !== this ? this.owningScope.pathname : ""}/${this.endpoint.name}`;
    }
    get path() {
        const t = this.parent?.path ?? "";
        const i = this.routingInstruction?.stringify(this.router, {
            endpointContext: true
        }, true) ?? "";
        const s = this.routingInstruction ? Separators.for(this.router).scope : "";
        return `${t}${i}${s}`;
    }
    toString(t = false) {
        return `${this.owningScope !== this ? this.owningScope.toString() : ""}/${!this.enabled ? "(" : ""}${this.endpoint.toString()}#${this.id}${!this.enabled ? ")" : ""}` + `${t ? `\n` + this.children.map((t => t.toString(true))).join("") : ""}`;
    }
    toStringOwning(t = false) {
        return `${this.owningScope !== this ? this.owningScope.toString() : ""}/${!this.enabled ? "(" : ""}${this.endpoint.toString()}#${this.id}${!this.enabled ? ")" : ""}` + `${t ? `\n` + this.ownedScopes.map((t => t.toStringOwning(true))).join("") : ""}`;
    }
    get enabledChildren() {
        return this.children.filter((t => t.enabled));
    }
    get hoistedChildren() {
        const t = this.enabledChildren;
        while (t.some((t => t.passThroughScope))) {
            for (const i of t.slice()) {
                if (i.passThroughScope) {
                    const s = t.indexOf(i);
                    t.splice(s, 1, ...i.enabledChildren);
                }
            }
        }
        return t;
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
    getOwnedScopes(t = false) {
        const i = this.allScopes(t).filter((t => t.owningScope === this));
        for (const t of i.slice()) {
            if (t.passThroughScope) {
                const s = i.indexOf(t);
                i.splice(s, 1, ...t.getOwnedScopes());
            }
        }
        return i;
    }
    findInstructions(t, i, s) {
        const n = this.router;
        let e = new FoundRoute;
        if (s && !RoutingInstruction.containsSiblings(n, t)) {
            let s = t.filter((t => t.isClear(n) || t.isClearAll(n)));
            const r = t.filter((t => !t.isClear(n) && !t.isClearAll(n)));
            if (r.length > 0) {
                for (const o of r) {
                    const r = typeof o.route === "string" ? o.route : o.unparsed ?? RoutingInstruction.stringify(n, [ o ]);
                    const h = this.findMatchingRoute(r, o.parameters.parametersRecord ?? {});
                    if (h.foundConfiguration) {
                        e = h;
                        e.instructions = [ ...s, ...e.instructions ];
                        s = [];
                    } else if (i) {
                        e.instructions = [ ...s, ...e.instructions, o ];
                        s = [];
                        e.remaining = RoutingInstruction.stringify(n, o.nextScopeInstructions ?? []);
                    } else {
                        throw new Error(`No route found for: ${RoutingInstruction.stringify(n, t)}!`);
                    }
                }
            } else {
                e.instructions = [ ...s ];
            }
        } else if (i) {
            e.instructions.push(...t);
        } else {
            throw new Error(`No way to process sibling viewport routes with direct routing disabled: ${RoutingInstruction.stringify(n, t)}!`);
        }
        e.instructions = e.instructions.filter((t => t.component.name !== ""));
        for (const t of e.instructions) {
            if (t.scope === null) {
                t.scope = this;
            }
        }
        return e;
    }
    matchEndpoints(t, i, s = false) {
        const n = [];
        const e = t.filter((t => (t.scope ?? this) === this));
        const r = t.filter((t => (t.scope ?? this) !== this));
        const {matchedInstructions: o, remainingInstructions: h} = EndpointMatcher.matchEndpoints(this, e, i, s);
        n.push(...o);
        r.push(...h);
        return {
            matchedInstructions: n,
            remainingInstructions: r
        };
    }
    addEndpoint(t, i, s, n = {}) {
        let e = this.getOwnedScopes().find((s => s.type === t && s.endpoint.name === i))?.endpoint ?? null;
        if (s != null && e?.connectedCE != null && e.connectedCE !== s) {
            e = this.getOwnedScopes(true).find((n => n.type === t && n.endpoint.name === i && n.endpoint.connectedCE === s))?.endpoint ?? null;
        }
        if (e == null) {
            e = t === "Viewport" ? new Viewport(this.router, i, s, this.scope, !!n.scope, n) : new ViewportScope(this.router, i, s, this.scope, true, null, n);
            this.addChild(e.connectedScope);
        }
        if (s != null) {
            e.setConnectedCE(s, n);
        }
        return e;
    }
    removeEndpoint(t, i, s) {
        if ((s ?? null) !== null || i.removeEndpoint(t, s)) {
            this.removeChild(i.connectedScope);
            return true;
        }
        return false;
    }
    addChild(t) {
        if (!this.children.some((i => i === t))) {
            if (t.parent !== null) {
                t.parent.removeChild(t);
            }
            this.children.push(t);
            t.parent = this;
        }
    }
    removeChild(t) {
        const i = this.children.indexOf(t);
        if (i >= 0) {
            this.children.splice(i, 1);
            t.parent = null;
        }
    }
    allScopes(t = false) {
        const i = t ? this.children.slice() : this.enabledChildren;
        for (const s of i.slice()) {
            i.push(...s.allScopes(t));
        }
        return i;
    }
    reparentRoutingInstructions() {
        const t = this.hoistedChildren.filter((t => t.routingInstruction !== null && t.routingInstruction.component.name));
        if (!t.length) {
            return null;
        }
        for (const i of t) {
            const t = i.reparentRoutingInstructions();
            i.routingInstruction.nextScopeInstructions = t !== null && t.length > 0 ? t : null;
        }
        return t.map((t => t.routingInstruction));
    }
    getChildren(t) {
        const i = this.children.map((i => i.endpoint.getTimeContent(t))).filter((t => t !== null));
        return i.map((t => t.connectedScope));
    }
    getAllRoutingScopes(t) {
        const i = this.getChildren(t);
        for (const s of i.slice()) {
            i.push(...s.getAllRoutingScopes(t));
        }
        return i;
    }
    getOwnedRoutingScopes(t) {
        const i = this.getAllRoutingScopes(t).filter((t => t.owningScope === this));
        for (const s of i.slice()) {
            if (s.passThroughScope) {
                const n = i.indexOf(s);
                i.splice(n, 1, ...s.getOwnedRoutingScopes(t));
            }
        }
        return arrayUnique(i);
    }
    getRoutingInstructions(t) {
        const i = arrayUnique(this.getOwnedRoutingScopes(t).map((t => t.endpoint))).map((i => i.getTimeContent(t))).filter((t => t !== null));
        const s = [];
        for (const n of i) {
            const i = n.instruction.clone(true, false, false);
            if ((i.component.name ?? "") !== "") {
                i.nextScopeInstructions = n.connectedScope.getRoutingInstructions(t);
                s.push(i);
            }
        }
        return s;
    }
    canUnload(t, i) {
        return Runner.run(i, (i => Runner.runParallel(i, ...this.children.map((i => i.endpoint !== null ? s => i.endpoint.canUnload(t, s) : s => i.canUnload(t, s))))), (t => t.previousValue.every((t => t ?? true))));
    }
    unload(t, i) {
        return Runner.runParallel(i, ...this.children.map((i => i.endpoint !== null ? s => i.endpoint.unload(t, s) : s => i.unload(t, s))));
    }
    matchScope(t, i = false) {
        const s = [];
        for (const n of t) {
            if (n.scope === this) {
                s.push(n);
            } else if (i && n.hasNextScopeInstructions) {
                s.push(...this.matchScope(n.nextScopeInstructions, i));
            }
        }
        return s;
    }
    findMatchingRoute(t, i) {
        let s = new FoundRoute;
        if (this.isViewportScope && !this.passThroughScope) {
            s = this.findMatchingRouteInRoutes(t, this.endpoint.getRoutes(), i);
        } else if (this.isViewport) {
            s = this.findMatchingRouteInRoutes(t, this.endpoint.getRoutes(), i);
        } else {
            for (const n of this.enabledChildren) {
                s = n.findMatchingRoute(t, i);
                if (s.foundConfiguration) {
                    break;
                }
            }
        }
        if (s.foundConfiguration) {
            return s;
        }
        if (this.parent != null) {
            return this.parent.findMatchingRoute(t, i);
        }
        return s;
    }
    findMatchingRouteInRoutes(t, i, s) {
        const n = new FoundRoute;
        if (i.length === 0) {
            return n;
        }
        i = i.map((t => this.ensureProperRoute(t)));
        const e = [];
        for (const t of i) {
            const i = Array.isArray(t.path) ? t.path : [ t.path ];
            for (const s of i) {
                e.push({
                    ...t,
                    path: s,
                    handler: t
                });
                if (s !== "") {
                    e.push({
                        ...t,
                        path: `${s}/*remainingPath`,
                        handler: t
                    });
                }
            }
        }
        if (t.startsWith("/") || t.startsWith("+")) {
            t = t.slice(1);
        }
        const r = i.find((i => i.id === t));
        let o = {
            params: {},
            endpoint: {}
        };
        if (r != null) {
            o.endpoint = {
                route: {
                    handler: r
                }
            };
            t = Array.isArray(r.path) ? r.path[0] : r.path;
            const i = t.split("/").map((t => {
                if (t.startsWith(":")) {
                    const i = t.slice(1).replace(/\?$/, "");
                    const n = s[i];
                    o.params[i] = n;
                    return n;
                } else {
                    return t;
                }
            }));
            t = i.join("/");
        } else {
            const i = new O;
            i.add(e);
            o = i.recognize(t);
        }
        if (o != null) {
            n.match = o.endpoint.route.handler;
            n.matching = t;
            const e = {
                ...o.params
            };
            if (e.remainingPath != null) {
                n.remaining = e.remainingPath;
                Reflect.deleteProperty(e, "remainingPath");
                n.matching = n.matching.slice(0, n.matching.indexOf(n.remaining));
            }
            n.params = e;
            if (n.match?.redirectTo != null) {
                let t = n.match?.redirectTo;
                if ((n.remaining ?? "").length > 0) {
                    t += `/${n.remaining}`;
                }
                return this.findMatchingRouteInRoutes(t, i, s);
            }
        }
        if (n.foundConfiguration) {
            n.instructions = RoutingInstruction.clone(n.match.instructions, false, true);
            const t = n.instructions.slice();
            while (t.length > 0) {
                const i = t.shift();
                i.parameters.addParameters(n.params);
                i.route = n;
                if (i.hasNextScopeInstructions) {
                    t.unshift(...i.nextScopeInstructions);
                }
            }
            if (n.instructions.length > 0) {
                n.instructions[0].routeStart = true;
            }
            const i = RoutingInstruction.parse(this.router, n.remaining);
            if (i.length > 0) {
                let t = n.instructions[0];
                while (t.hasNextScopeInstructions) {
                    t = t.nextScopeInstructions[0];
                }
                t.nextScopeInstructions = i;
            }
        }
        return n;
    }
    ensureProperRoute(t) {
        if (t.id === void 0) {
            t.id = Array.isArray(t.path) ? t.path.join(",") : t.path;
        }
        if (t.instructions === void 0) {
            t.instructions = [ {
                component: t.component,
                viewport: t.viewport,
                parameters: t.parameters,
                children: t.children
            } ];
        }
        if (t.redirectTo === null) {
            t.instructions = RoutingInstruction.from(this.router, t.instructions);
        }
        return t;
    }
}

RoutingScope.lastId = 0;

class QueueTask {
    constructor(t, i, s = 0) {
        this.taskQueue = t;
        this.item = i;
        this.cost = s;
        this.done = false;
        this.promise = new Promise(((t, i) => {
            this.resolve = () => {
                this.taskQueue.resolve(this, t);
            };
            this.reject = t => {
                this.taskQueue.reject(this, i, t);
            };
        }));
    }
    async execute() {
        if ("execute" in this.item) {
            await this.item.execute(this);
        } else {
            await this.item(this);
        }
    }
    wait() {
        return this.promise;
    }
}

class TaskQueue {
    get isActive() {
        return this.task !== null;
    }
    constructor(t) {
        this.callback = t;
        this.pending = [];
        this.processing = null;
        this.allowedExecutionCostWithinTick = null;
        this.currentExecutionCostInCurrentTick = 0;
        this.platform = null;
        this.task = null;
        this.dequeue = t => {
            if (this.processing !== null) {
                return;
            }
            if (t !== undefined) {
                this.currentExecutionCostInCurrentTick = 0;
            }
            if (this.pending.length === 0) {
                return;
            }
            if (this.allowedExecutionCostWithinTick !== null && t === undefined && this.currentExecutionCostInCurrentTick + (this.pending[0].cost || 0) > this.allowedExecutionCostWithinTick) {
                return;
            }
            this.processing = this.pending.shift() || null;
            if (this.processing) {
                this.currentExecutionCostInCurrentTick += this.processing.cost ?? 0;
                if (this.callback !== void 0) {
                    this.callback(this.processing);
                } else {
                    this.processing.execute().catch((t => {
                        throw t;
                    }));
                }
            }
        };
    }
    get length() {
        return this.pending.length;
    }
    start(t) {
        this.platform = t.platform;
        this.allowedExecutionCostWithinTick = t.allowedExecutionCostWithinTick;
        this.task = this.platform.domQueue.queueTask(this.dequeue, {
            persistent: true
        });
    }
    stop() {
        this.task.cancel();
        this.task = null;
        this.allowedExecutionCostWithinTick = null;
        this.clear();
    }
    enqueue(t, i) {
        const s = Array.isArray(t);
        const n = s ? t : [ t ];
        const e = n.map(((t, s) => !Array.isArray(i) ? i : i[s])).map((t => t !== undefined ? t : 1));
        const r = [];
        for (const t of n) {
            r.push(t instanceof QueueTask ? t : this.createQueueTask(t, e.shift()));
        }
        this.pending.push(...r);
        this.dequeue();
        return s ? r : r[0];
    }
    createQueueTask(t, i) {
        return new QueueTask(this, t, i);
    }
    clear() {
        this.pending.length = 0;
    }
    resolve(t, i) {
        i();
        this.processing = null;
        this.dequeue();
    }
    reject(t, i, s) {
        i(s);
        this.processing = null;
        this.dequeue();
    }
}

class BrowserViewerStore {
    constructor() {
        this.allowedExecutionCostWithinTick = 2;
        this.pendingCalls = new TaskQueue;
        this.isActive = false;
        this.options = {
            useUrlFragmentHash: true
        };
        this.forwardedState = {
            eventTask: null,
            suppressPopstate: false
        };
        this.platform = s(c);
        this.window = s(p);
        this.history = s(g);
        this.location = s(v);
        this.ea = s(n);
    }
    start(t) {
        if (this.isActive) {
            throw createMappedError(2007);
        }
        this.isActive = true;
        if (t.useUrlFragmentHash != void 0) {
            this.options.useUrlFragmentHash = t.useUrlFragmentHash;
        }
        this.pendingCalls.start({
            platform: this.platform,
            allowedExecutionCostWithinTick: this.allowedExecutionCostWithinTick
        });
        this.window.addEventListener("popstate", this);
    }
    stop() {
        if (!this.isActive) {
            throw createMappedError(2008);
        }
        this.window.removeEventListener("popstate", this);
        this.pendingCalls.stop();
        this.options = {
            useUrlFragmentHash: true
        };
        this.isActive = false;
    }
    get length() {
        return this.history.length;
    }
    get state() {
        return this.history.state;
    }
    get viewerState() {
        const {pathname: t, search: i, hash: s} = this.location;
        const n = this.options.useUrlFragmentHash ?? false ? s.slice(1) : `${t}${i}`;
        const e = this.options.useUrlFragmentHash ?? false ? s.slice(1).includes("#") ? s.slice(s.slice(1).indexOf("#", 1)) : "" : s.slice(1);
        return new NavigatorViewerState(t, i.slice(1), e, n);
    }
    async go(t, i = false) {
        const s = this.pendingCalls.createQueueTask((t => t.resolve()), 1);
        this.pendingCalls.enqueue([ t => {
            const n = s;
            const e = i;
            this.forwardState({
                eventTask: n,
                suppressPopstate: e
            });
            t.resolve();
        }, i => {
            const s = this.history;
            const n = t;
            s.go(n);
            i.resolve();
        } ], [ 0, 1 ]);
        return s.wait();
    }
    async pushNavigatorState(t) {
        const {title: i, path: s} = t.navigations[t.navigationIndex];
        const n = this.options.useUrlFragmentHash ? "#/" : "";
        return this.pendingCalls.enqueue((e => {
            const r = this.history;
            const o = t;
            const h = i || "";
            const u = `${n}${s}`;
            try {
                r.pushState(o, h, u);
                this.setTitle(h);
            } catch (t) {
                const i = this.tryCleanState(o, "push", t);
                r.pushState(i, h, u);
                this.setTitle(h);
            }
            e.resolve();
        }), 1).wait();
    }
    async replaceNavigatorState(t, i, s) {
        const n = t.navigations[t.navigationIndex];
        i ??= n.title;
        s ??= n.path;
        const e = this.options.useUrlFragmentHash ? "#/" : "";
        return this.pendingCalls.enqueue((n => {
            const r = this.history;
            const o = t;
            const h = i || "";
            const u = `${e}${s}`;
            try {
                r.replaceState(o, h, u);
                this.setTitle(h);
            } catch (t) {
                const i = this.tryCleanState(o, "replace", t);
                r.replaceState(i, h, u);
                this.setTitle(h);
            }
            n.resolve();
        }), 1).wait();
    }
    async popNavigatorState() {
        const t = this.pendingCalls.createQueueTask((t => t.resolve()), 1);
        this.pendingCalls.enqueue((async i => {
            const s = t;
            await this.popState(s);
            i.resolve();
        }), 1);
        return t.wait();
    }
    setTitle(t) {
        this.window.document.title = t;
    }
    handleEvent(t) {
        this.handlePopStateEvent(t);
    }
    handlePopStateEvent(t) {
        const {eventTask: i, suppressPopstate: s} = this.forwardedState;
        this.forwardedState = {
            eventTask: null,
            suppressPopstate: false
        };
        this.pendingCalls.enqueue((async n => {
            if (!s) {
                this.notifySubscribers(t);
            }
            if (i !== null) {
                await i.execute();
            }
            n.resolve();
        }), 1);
    }
    notifySubscribers(t) {
        this.ea.publish(NavigatorStateChangeEvent.eventName, NavigatorStateChangeEvent.create(this.viewerState, t, this.history.state));
    }
    async popState(t) {
        await this.go(-1, true);
        const i = this.history.state;
        const s = i?.navigations?.[i?.navigationIndex ?? 0];
        if (s != null && !s.firstEntry) {
            await this.go(-1, true);
            await this.pushNavigatorState(i);
        }
        await t.execute();
    }
    forwardState(t) {
        this.forwardedState = t;
    }
    tryCleanState(t, i, s) {
        try {
            return JSON.parse(JSON.stringify(t));
        } catch (t) {
            throw createMappedError(2009, i, t, s);
        }
    }
}

class NavigatorViewerState {
    constructor(t, i, s, n) {
        this.path = t;
        this.query = i;
        this.hash = s;
        this.instruction = n;
    }
}

class NavigatorStateChangeEvent {
    constructor(t, i, s, n) {
        this.eventName = t;
        this.viewerState = i;
        this.event = s;
        this.state = n;
    }
    static create(t, i, s) {
        return new NavigatorStateChangeEvent(NavigatorStateChangeEvent.eventName, t, i, s);
    }
}

NavigatorStateChangeEvent.eventName = "au:router:navigation-state-change";

class Entity {
    constructor(t) {
        this.endpoint = t;
        this.running = false;
        this.states = new Map;
        this.checkedStates = [];
        this.syncingState = null;
        this.syncPromise = null;
        this.step = null;
    }
    hasReachedState(t) {
        return this.states.has(t) && this.states.get(t) === null;
    }
}

class NavigationCoordinator {
    constructor(t, i) {
        this.router = t;
        this.navigation = i;
        this.instructions = [];
        this.matchedInstructions = [];
        this.processedInstructions = [];
        this.changedEndpoints = [];
        this.running = false;
        this.completed = false;
        this.cancelled = false;
        this.hasAllEndpoints = false;
        this.appendedInstructions = [];
        this.closed = false;
        this.entities = [];
        this.syncStates = new Map;
        this.checkedSyncStates = new Set;
    }
    static create(t, i, s) {
        const n = new NavigationCoordinator(t, i);
        s.syncStates.forEach((t => n.addSyncState(t)));
        return n;
    }
    appendInstructions(t) {
        this.instructions.push(...t);
        this.manageDefaults();
    }
    removeInstructions(t) {
        this.instructions = this.instructions.filter((i => !t.includes(i)));
        this.matchedInstructions = this.matchedInstructions.filter((i => !t.includes(i)));
    }
    manageDefaults() {
        const t = this.router;
        this.instructions = [ ...this.instructions.filter((t => !t.default)), ...this.instructions.filter((t => t.default)) ];
        this.instructions.forEach((t => {
            if (t.scope == null) {
                t.scope = this.navigation.scope ?? this.router.rootScope?.scope ?? null;
            }
        }));
        const i = this.instructions.filter((i => !i.isClear(t)));
        while (i.length > 0) {
            const s = i.shift();
            const n = this.processedInstructions.some((i => !i.isClear(t) && !i.cancelled && i.sameEndpoint(s, true)));
            const e = this.matchedInstructions.find((i => !i.isClear(t) && i.sameEndpoint(s, true)));
            const r = this.instructions.find((i => !i.isClear(t) && i.sameEndpoint(s, true) && i !== s));
            if (s.default && (n || e !== void 0 && !e.default || r !== void 0 && !r.default)) {
                arrayRemove(this.instructions, (t => t === s));
                continue;
            }
            if (e !== void 0) {
                arrayRemove(this.matchedInstructions, (t => t === e));
                continue;
            }
            if (r !== void 0) {
                arrayRemove(this.instructions, (t => t === r));
            }
        }
    }
    async processInstructions() {
        const t = [];
        let i = 100;
        while (this.instructions.length > 0) {
            if (!i--) {
                console.error("processInstructions endless loop", this.navigation, this.instructions);
                throw new Error("Endless loop");
            }
            this.instructions = [ ...this.instructions.filter((t => !t.default)), ...this.instructions.filter((t => t.default)) ];
            const s = this.instructions[0].scope;
            if (s == null) {
                throw new Error("No scope for instruction");
            }
            t.push(...await this.processInstructionsForScope(s));
        }
        return t;
    }
    async processInstructionsForScope(t) {
        const i = this.router;
        const s = i.configuration.options;
        const n = this.getClearAllEndpoints(t);
        const e = this.getInstructionsForScope(t).filter((t => !(t.route instanceof Route)));
        if (e.length > 0) {
            const i = t.findInstructions(e, s.useDirectRouting, s.useConfiguredRoutes);
            if (e.some((t => !t.component.none || t.route != null)) && !i.foundConfiguration && !i.foundInstructions) {
                throw this.createUnknownRouteError(e);
            }
            this.instructions.splice(this.instructions.indexOf(e[0]), e.length, ...i.instructions);
        }
        const r = RoutingInstruction.resolve(this.getInstructionsForScope(t));
        if (r instanceof Promise) {
            await r;
        }
        for (const s of this.getInstructionsForScope(t).filter((t => t.isAddAll(i)))) {
            s.endpoint.set(s.scope.endpoint.name);
            s.scope = s.scope.owningScope;
        }
        let o = 100;
        do {
            this.matchEndpoints(t);
            if (!o--) {
                i.unresolvedInstructionsError(this.navigation, this.instructions);
            }
            const s = [];
            const e = this.matchedInstructions.map((t => t.endpoint.instance));
            this.matchedInstructions.push(...n.filter((t => !e.includes(t))).map((t => RoutingInstruction.createClear(i, t))));
            const r = await RoutingHook.invokeBeforeNavigation(this.matchedInstructions, this.navigation);
            if (r === false) {
                i.cancelNavigation(this.navigation, this);
                return [];
            } else if (r !== true && r !== this.matchedInstructions) {
                this.matchedInstructions = r;
            }
            for (const t of this.matchedInstructions) {
                const e = t.endpoint.instance;
                if (e !== null) {
                    const r = e.setNextContent(t, this.navigation);
                    if (r !== "skip") {
                        s.push(e);
                        this.addEndpoint(e);
                    }
                    const o = [ e ];
                    if (r === "swap") {
                        o.push(...e.getContent().connectedScope.allScopes(true).map((t => t.endpoint)));
                    }
                    arrayRemove(n, (t => o.includes(t)));
                    arrayRemove(this.matchedInstructions, (s => s !== t && s.isClear(i) && o.includes(s.endpoint.instance)));
                    if (!t.isClear(i) && t.scope?.parent?.isViewportScope) {
                        arrayRemove(n, (i => i === t.scope.parent.endpoint));
                        arrayRemove(this.matchedInstructions, (s => s !== t && s.isClear(i) && s.endpoint.instance === t.scope.parent.endpoint));
                    }
                    if (t.hasNextScopeInstructions) {
                        this.instructions.push(...t.nextScopeInstructions);
                        if (r !== "skip") {
                            for (const i of t.nextScopeInstructions) {
                                i.scope = e.scope;
                                i.endpoint.instance = null;
                            }
                        }
                    } else {
                        n.push(...t.endpoint.instance.scope.children.map((t => t.endpoint)));
                    }
                }
            }
            const h = this.matchedInstructions.filter((t => t.endpoint.instance?.transitionAction === "skip"));
            const u = h.filter((t => t.hasNextScopeInstructions));
            if (h.length === 0 || u.length === 0) {
                if (!i.isRestrictedNavigation) {
                    this.finalEndpoint();
                }
                this.run();
                if (this.hasAllEndpoints) {
                    const t = this.waitForSyncState("guardedUnload");
                    if (t instanceof Promise) {
                        await t;
                    }
                }
            }
            if (this.cancelled) {
                i.cancelNavigation(this.navigation, this);
                return [];
            }
            arrayAddUnique(this.changedEndpoints, s);
            this.processedInstructions.push(...this.matchedInstructions.splice(0));
            if (!i.isRestrictedNavigation && (this.matchedInstructions.length > 0 || this.instructions.length > 0) && this.running) {
                const t = this.waitForSyncState("swapped");
                if (t instanceof Promise) {
                    await t;
                }
            }
            this.instructions.push(...n.map((t => RoutingInstruction.createClear(i, t))));
            const a = RoutingInstruction.resolve(this.matchedInstructions);
            if (a instanceof Promise) {
                await a;
            }
            this.changedEndpoints = this.changedEndpoints.filter((t => !([ ...this.processedInstructions ].reverse().find((i => i.endpoint.instance === t))?.cancelled ?? false)));
        } while (this.matchedInstructions.length > 0 || this.getInstructionsForScope(t).length > 0);
        return this.changedEndpoints;
    }
    getInstructionsForScope(t) {
        this.manageDefaults();
        const i = this.instructions.filter((i => i.scope === t && !i.default));
        if (i.length > 0) {
            return i;
        }
        return this.instructions.filter((i => i.scope === t));
    }
    ensureClearStateInstruction(t) {
        const i = this.router;
        if (!this.instructions.some((s => s.scope === t && s.isClearAll(i)))) {
            const s = RoutingInstruction.create(RoutingInstruction.clear(i));
            s.scope = t;
            this.instructions.unshift(s);
        }
    }
    matchEndpoints(t, i = false) {
        const s = this.getInstructionsForScope(t);
        const n = EndpointMatcher.matchEndpoints(t, s, [ ...this.processedInstructions, ...this.matchedInstructions ], i).matchedInstructions;
        this.matchedInstructions.push(...n);
        this.instructions = this.instructions.filter((t => !n.includes(t)));
    }
    run() {
        if (!this.running) {
            this.running = true;
            for (const t of this.entities) {
                if (!t.running) {
                    t.running = true;
                    t.endpoint.transition(this);
                }
            }
        }
    }
    addSyncState(t) {
        const i = new OpenPromise(`addSyncState: ${t}`);
        this.syncStates.set(t, i);
    }
    addEndpoint(t) {
        const i = new Entity(t);
        this.entities.push(i);
        this.recheckSyncStates();
        if (this.running) {
            i.endpoint.transition(this);
        }
        return i;
    }
    removeEndpoint(t) {
        const i = this.entities.map((t => t.endpoint));
        const s = [ t ];
        let n = [ t ];
        while (n.length > 0) {
            n = i.filter((t => t?.parentViewport != null && n.includes(t.parentViewport)));
            s.push(...n);
        }
        for (const t of s) {
            const i = this.entities.find((i => i.endpoint === t));
            if (i !== void 0) {
                arrayRemove(this.entities, (t => t === i));
            }
        }
        this.checkSyncState();
    }
    setEndpointStep(t, i) {
        let s = this.entities.find((i => i.endpoint === t));
        if (s === void 0) {
            s = this.addEndpoint(t);
        }
        s.step = i;
    }
    getEndpointStep(t) {
        const i = this.entities.find((i => i.endpoint === t));
        return i?.step ?? null;
    }
    addEndpointState(t, i) {
        let s = this.entities.find((i => i.endpoint === t));
        if (s === void 0) {
            s = this.addEndpoint(t);
        }
        const n = s.states.get(i);
        if (n instanceof OpenPromise) {
            n.resolve();
        }
        s.states.set(i, null);
        this.checkSyncState(i);
    }
    waitForSyncState(t, i = null) {
        if (this.entities.length === 0) {
            return;
        }
        const s = this.syncStates.get(t);
        if (s === void 0) {
            return;
        }
        if (i !== null) {
            const n = this.entities.find((t => t.endpoint === i));
            if (n?.syncPromise === null && s.isPending) {
                n.syncingState = t;
                n.syncPromise = new OpenPromise(`waitForSyncState: ${t}`);
                n.checkedStates.push(t);
                this.checkedSyncStates.add(t);
                Promise.resolve().then((() => {
                    this.checkSyncState(t);
                })).catch((t => {
                    throw t;
                }));
                return n.syncPromise.promise;
            }
        }
        return s.isPending ? s.promise : void 0;
    }
    waitForEndpointState(t, i) {
        if (!this.syncStates.has(i)) {
            return;
        }
        let s = this.entities.find((i => i.endpoint === t));
        if (s == null) {
            s = this.addEndpoint(t);
        }
        if (s.hasReachedState(i)) {
            return;
        }
        let n = s.states.get(i);
        if (n == null) {
            n = new OpenPromise(`waitForEndpointState: ${i}`);
            s.states.set(i, n);
        }
        return n.promise;
    }
    finalEndpoint() {
        this.hasAllEndpoints = true;
        this.syncStates.forEach(((t, i) => this.checkSyncState(i)));
    }
    finalize() {
        this.entities.forEach((t => t.endpoint.finalizeContentChange(this, null)));
        this.completed = true;
        this.navigation.completed = true;
        this.syncStates.clear();
    }
    cancel() {
        this.cancelled = true;
        this.instructions = [];
        this.matchedInstructions = [];
        this.entities.forEach((t => {
            const i = t.endpoint.cancelContentChange(this);
            if (i instanceof Promise) {
                i.catch((t => {
                    throw t;
                }));
            }
        }));
        this.router.navigator.cancel(this.navigation).then((() => {
            this.navigation.process?.resolve(false);
        })).catch((t => {
            throw t;
        }));
        this.completed = true;
        this.navigation.completed = true;
        [ ...this.syncStates.values() ].forEach((t => {
            if (t.isPending) {
                t.resolve();
            }
        }));
        this.syncStates.clear();
    }
    checkSyncState(t) {
        if (t === void 0) {
            this.syncStates.forEach(((t, i) => this.checkSyncState(i)));
            return;
        }
        const i = this.syncStates.get(t);
        if (i === void 0) {
            return;
        }
        if (this.hasAllEndpoints && i.isPending && this.entities.every((i => i.hasReachedState(t))) && (!this.checkedSyncStates.has(t) || this.entities.every((i => i.checkedStates.includes(t))))) {
            for (const i of this.entities) {
                if (i.syncingState === t) {
                    i.syncPromise?.resolve();
                    i.syncPromise = null;
                    i.syncingState = null;
                }
            }
            i.resolve();
        }
    }
    recheckSyncStates() {
        this.syncStates.forEach(((t, i) => {
            if (!t.isPending && !this.entities.every((t => t.hasReachedState(i)))) {
                this.addSyncState(i);
            }
        }));
    }
    getClearAllEndpoints(t) {
        const i = this.router;
        let s = [];
        if (this.instructions.some((s => (s.scope ?? t) === t && s.isClearAll(i)))) {
            s = t.enabledChildren.filter((t => !t.endpoint.isEmpty)).map((t => t.endpoint));
            this.instructions = this.instructions.filter((s => !((s.scope ?? t) === t && s.isClearAll(i))));
        }
        return s;
    }
    createUnknownRouteError(t) {
        const i = this.router.configuration.options;
        const s = RoutingInstruction.stringify(this.router, t);
        if (t[0].route != null) {
            if (!i.useConfiguredRoutes) {
                return new Error(`Can not match '${s}' since the router is configured to not use configured routes.`);
            } else {
                return new Error(`No matching configured route found for '${s}'.`);
            }
        } else if (i.useConfiguredRoutes && i.useDirectRouting) {
            return new Error(`No matching configured route or component found for '${s}'.`);
        } else if (i.useConfiguredRoutes) {
            return new Error(`No matching configured route found for '${s}'.`);
        } else {
            return new Error(`No matching route/component found for '${s}'.`);
        }
    }
}

class RoutingHook {
    constructor(t, i, s) {
        this.hook = t;
        this.id = s;
        this.type = "beforeNavigation";
        this.includeTargets = [];
        this.excludeTargets = [];
        if (i.type !== void 0) {
            this.type = i.type;
        }
        for (const t of i.include ?? []) {
            this.includeTargets.push(new Target(t));
        }
        for (const t of i.exclude ?? []) {
            this.excludeTargets.push(new Target(t));
        }
    }
    static add(t, i) {
        const s = new RoutingHook(t, i ?? {}, ++this.lastIdentity);
        this.hooks[s.type].push(s);
        return this.lastIdentity;
    }
    static remove(t) {
        for (const i in this.hooks) {
            if (Object.prototype.hasOwnProperty.call(this.hooks, i)) {
                const s = this.hooks[i].findIndex((i => i.id === t));
                if (s >= 0) {
                    this.hooks[i].splice(s, 1);
                }
            }
        }
    }
    static removeAll() {
        for (const t in this.hooks) {
            this.hooks[t] = [];
        }
    }
    static async invokeBeforeNavigation(t, i) {
        return this.invoke("beforeNavigation", i, t);
    }
    static async invokeTransformFromUrl(t, i) {
        return this.invoke("transformFromUrl", i, t);
    }
    static async invokeTransformToUrl(t, i) {
        return this.invoke("transformToUrl", i, t);
    }
    static async invokeTransformTitle(t, i) {
        return this.invoke("transformTitle", i, t);
    }
    static async invoke(t, i, s) {
        let n = s;
        for (const e of this.hooks[t]) {
            if (!e.wantsMatch || e.matches(s)) {
                n = await e.invoke(i, s);
                if (typeof n === "boolean") {
                    if (!n) {
                        return false;
                    }
                } else {
                    s = n;
                }
            }
        }
        return n;
    }
    get wantsMatch() {
        return this.includeTargets.length > 0 || this.excludeTargets.length > 0;
    }
    matches(t) {
        if (this.includeTargets.length && !this.includeTargets.some((i => i.matches(t)))) {
            return false;
        }
        if (this.excludeTargets.length && this.excludeTargets.some((i => i.matches(t)))) {
            return false;
        }
        return true;
    }
    invoke(t, i) {
        return this.hook(i, t);
    }
}

RoutingHook.hooks = {
    beforeNavigation: [],
    transformFromUrl: [],
    transformToUrl: [],
    transformTitle: []
};

RoutingHook.lastIdentity = 0;

class Target {
    constructor(t) {
        this.componentType = null;
        this.componentName = null;
        this.viewport = null;
        this.viewportName = null;
        if (typeof t === "string") {
            this.componentName = t;
        } else if (InstructionComponent.isType(t)) {
            this.componentType = t;
            this.componentName = InstructionComponent.getName(t);
        } else {
            const i = t;
            if (i.component != null) {
                this.componentType = InstructionComponent.isType(i.component) ? InstructionComponent.getType(i.component) : null;
                this.componentName = InstructionComponent.getName(i.component);
            }
            if (i.viewport != null) {
                this.viewport = InstructionEndpoint.isInstance(i.viewport) ? i.viewport : null;
                this.viewportName = InstructionEndpoint.getName(i.viewport);
            }
        }
    }
    matches(t) {
        const i = t.slice();
        if (!i.length) {
            i.push(RoutingInstruction.create(""));
        }
        for (const t of i) {
            if (this.componentName !== null && this.componentName === t.component.name || this.componentType !== null && this.componentType === t.component.type || this.viewportName !== null && this.viewportName === t.endpoint.name || this.viewport !== null && this.viewport === t.endpoint.instance) {
                return true;
            }
        }
        return false;
    }
}

class Title {
    static async getTitle(t, i, s) {
        let n = await RoutingHook.invokeTransformTitle(t, i);
        if (typeof n !== "string") {
            const t = Title.stringifyTitles(n, i, s);
            n = s.appTitle;
            n = n.replace(/\${componentTitles}/g, t);
            n = n.replace(/\${appTitleSeparator}/g, t !== "" ? s.appTitleSeparator : "");
        }
        n = await RoutingHook.invokeTransformTitle(n, i);
        return n;
    }
    static stringifyTitles(t, i, s) {
        const n = t.map((t => Title.stringifyTitle(t, i, s))).filter((t => (t?.length ?? 0) > 0));
        return n.join(" + ");
    }
    static stringifyTitle(t, i, s) {
        const n = t.nextScopeInstructions;
        let e = Title.resolveTitle(t, i, s);
        if (Array.isArray(n) && n.length > 0) {
            let t = Title.stringifyTitles(n, i, s);
            if (t.length > 0) {
                if (n.length !== 1) {
                    t = `[ ${t} ]`;
                }
                if (e.length > 0) {
                    e = s.componentTitleOrder === "top-down" ? e + s.componentTitleSeparator + t : t + s.componentTitleSeparator + e;
                } else {
                    e = t;
                }
            }
        }
        return e;
    }
    static resolveTitle(t, i, s) {
        let n = t.getTitle(i);
        if (s.transformTitle != null) {
            n = s.transformTitle(n, t, i);
        }
        return n;
    }
}

const F = /*@__PURE__*/ o.createInterface("IRouter", (t => t.singleton(Router)));

class Router {
    constructor() {
        this.rootScope = null;
        this.activeComponents = [];
        this.appendedInstructions = [];
        this.isActive = false;
        this.coordinators = [];
        this.loadedFirst = false;
        this.C = false;
        this.I = s(h);
        this.container = s(e);
        this.ea = s(n);
        this.navigator = s(Navigator);
        this.viewer = s(BrowserViewerStore);
        this.store = s(BrowserViewerStore);
        this.configuration = s(q);
        this.handleNavigatorNavigateEvent = t => {
            void this.N(t);
        };
        this.handleNavigatorStateChangeEvent = t => {
            if (t.state?.navigationIndex != null) {
                const i = Navigation.create(t.state.navigations[t.state.navigationIndex]);
                i.instruction = t.viewerState.instruction;
                i.fromBrowser = true;
                this.navigator.navigate(i).catch((t => {
                    throw t;
                }));
            } else {
                this.load(t.viewerState.instruction, {
                    fromBrowser: true
                }).catch((t => {
                    throw t;
                }));
            }
        };
        this.processNavigation = async t => {
            this.loadedFirst = true;
            const i = this.configuration.options;
            const s = NavigationCoordinator.create(this, t, {
                syncStates: this.configuration.options.navigationSyncStates
            });
            this.coordinators.push(s);
            s.appendInstructions(this.appendedInstructions.splice(0));
            this.ea.publish(RouterNavigationStartEvent.eventName, RouterNavigationStartEvent.create(t));
            let n;
            if (t.useFullStateInstruction) {
                n = t.fullStateInstruction;
                let i = {};
                ({instructions: n, options: i} = this.$(n, i));
                t.fragment = i.fragment ?? t.fragment;
                t.query = i.query ?? t.query;
                t.parameters = i.parameters ?? t.parameters;
            } else {
                n = typeof t.instruction === "string" ? await RoutingHook.invokeTransformFromUrl(t.instruction, s.navigation) : t.instruction;
            }
            const e = i.basePath;
            if (e !== null && typeof n === "string" && n.startsWith(e) && !i.useUrlFragmentHash) {
                n = n.slice(e.length);
            }
            if (n === "/") {
                n = "";
            }
            if (typeof n === "string") {
                if (n === "") {
                    n = [ new RoutingInstruction("") ];
                    n[0].default = true;
                } else if (n === "-") {
                    n = [ new RoutingInstruction("-"), new RoutingInstruction("") ];
                    n[1].default = true;
                } else {
                    n = RoutingInstruction.parse(this, n);
                }
            }
            t.scope ??= this.rootScope.scope;
            s.appendInstructions(n);
            if (i.completeStateNavigations) {
                arrayUnique(n, false).map((t => t.scope)).forEach((t => s.ensureClearStateInstruction(t)));
            }
            let r = 100;
            do {
                if (!r--) {
                    this.unresolvedInstructionsError(t, s.instructions);
                }
                await s.processInstructions();
            } while (s.instructions.length > 0);
            return Runner.run("processNavigation", (() => {
                s.closed = true;
                s.finalEndpoint();
                return s.waitForSyncState("completed");
            }), (() => {
                s.finalize();
                return this.updateNavigation(t);
            }), (() => {
                if (t.navigation.new && !t.navigation.first && !t.repeating && s.changedEndpoints.every((t => t.options.noHistory))) {
                    t.untracked = true;
                }
            }), (async () => {
                while (this.coordinators.length > 0 && this.coordinators[0].completed) {
                    const t = this.coordinators.shift();
                    await this.navigator.finalize(t.navigation, false);
                    this.ea.publish(RouterNavigationCompleteEvent.eventName, RouterNavigationCompleteEvent.create(t.navigation));
                    this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(t.navigation));
                    t.navigation.process?.resolve(true);
                }
            }));
        };
    }
    get isNavigating() {
        return this.coordinators.length > 0;
    }
    get hasOpenNavigation() {
        return this.coordinators.filter((t => !t.closed)).length > 0;
    }
    get isRestrictedNavigation() {
        const t = this.configuration.options.navigationSyncStates;
        return t.includes("guardedLoad") || t.includes("unloaded") || t.includes("loaded") || t.includes("guarded") || t.includes("routed");
    }
    get statefulHistory() {
        return this.configuration.options.statefulHistoryLength !== void 0 && this.configuration.options.statefulHistoryLength > 0;
    }
    start() {
        if (this.isActive) {
            throw createMappedError(2e3);
        }
        this.isActive = true;
        const t = this.container.get(m);
        this.rootScope = new ViewportScope(this, "rootScope", t.controller.viewModel, null, true, t.config.component);
        const i = this.configuration.options;
        if (i.basePath === null) {
            const s = new URL(t.host.baseURI);
            i.basePath = s.pathname;
        }
        if (i.basePath.endsWith("/")) {
            i.basePath = i.basePath.slice(0, -1);
        }
        this.navigator.start({
            store: this.store,
            viewer: this.viewer,
            statefulHistoryLength: this.configuration.options.statefulHistoryLength
        });
        this.P = this.ea.subscribe(NavigatorStateChangeEvent.eventName, this.handleNavigatorStateChangeEvent);
        this.V = this.ea.subscribe(NavigatorNavigateEvent.eventName, this.handleNavigatorNavigateEvent);
        this.viewer.start({
            useUrlFragmentHash: this.configuration.options.useUrlFragmentHash
        });
        this.ea.publish(RouterStartEvent.eventName, RouterStartEvent.create());
    }
    stop() {
        if (!this.isActive) {
            throw createMappedError(2001);
        }
        this.ea.publish(RouterStopEvent.eventName, RouterStopEvent.create());
        this.navigator.stop();
        this.viewer.stop();
        this.P.dispose();
        this.V.dispose();
    }
    async initialLoad() {
        const {instruction: t, hash: i} = this.viewer.viewerState;
        const s = this.load(t, {
            fragment: i,
            replacing: true,
            fromBrowser: false
        });
        this.loadedFirst = true;
        return s;
    }
    async N(t) {
        if (this.C) {
            if (this.A) {
                this.A.navigation.process?.resolve(false);
            }
            this.A = t;
            return;
        }
        this.C = true;
        try {
            await this.processNavigation(t.navigation);
        } catch (i) {
            t.navigation.process?.reject(i);
        } finally {
            this.C = false;
        }
        if (this.A) {
            const t = this.A;
            this.A = undefined;
            await this.N(t);
        }
    }
    get isProcessingNav() {
        return this.C || this.A != null;
    }
    getEndpoint(t, i) {
        return this.allEndpoints(t).find((t => t.name === i)) ?? null;
    }
    allEndpoints(t, i = false) {
        return this.rootScope.scope.allScopes(i).filter((i => t === null || i.type === t)).map((t => t.endpoint));
    }
    addEndpoint(t, ...i) {
        throw createMappedError(99, "addEndPoint");
    }
    connectEndpoint(t, i, s, n, e) {
        const r = s.container;
        const o = r.has(Router.closestEndpointKey, true) ? r.get(Router.closestEndpointKey) : this.rootScope;
        const h = o.connectedScope;
        if (t === null) {
            t = h.addEndpoint(i, n, s, e);
            u.instance(Router.closestEndpointKey, t).register(r);
        }
        return t;
    }
    disconnectEndpoint(t, i, s) {
        if (!i.connectedScope.parent.removeEndpoint(t, i, s)) {
            throw createMappedError(2002, i.name);
        }
    }
    async load(t, i) {
        ({instructions: t, options: i} = this.$(t, i ?? {}));
        let s = null;
        ({instructions: t, scope: s} = this.applyLoadOptions(t, i));
        const n = i.append ?? false;
        if (n !== false) {
            if (n instanceof NavigationCoordinator) {
                if (!n.closed) {
                    t = RoutingInstruction.from(this, t);
                    this.appendInstructions(t, s, n);
                    return Promise.resolve();
                }
            } else {
                if (!this.loadedFirst || this.hasOpenNavigation) {
                    t = RoutingInstruction.from(this, t);
                    this.appendInstructions(t, s);
                    return Promise.resolve();
                }
            }
        }
        const e = Navigation.create({
            instruction: t,
            fullStateInstruction: "",
            scope: s,
            title: i.title,
            data: i.data,
            query: i.query,
            fragment: i.fragment,
            parameters: i.parameters,
            replacing: (i.replacing ?? false) || i.replace,
            repeating: (i.append ?? false) !== false,
            fromBrowser: i.fromBrowser ?? false,
            origin: i.origin,
            completed: false
        });
        return this.navigator.navigate(e);
    }
    applyLoadOptions(t, i, s = true) {
        i = i ?? {};
        if ("origin" in i && !("context" in i)) {
            i.context = i.origin;
        }
        const {scope: n, instruction: e} = RoutingScope.for(i.context ?? null, typeof t === "string" ? t : undefined);
        if (typeof t === "string") {
            if (!s) {
                t = RoutingInstruction.from(this, e);
                for (const i of t) {
                    if (i.scope === null) {
                        i.scope = n;
                    }
                }
            } else {
                t = e;
            }
        } else {
            t = RoutingInstruction.from(this, t);
            for (const i of t) {
                if (i.scope === null) {
                    i.scope = n;
                }
            }
        }
        return {
            instructions: t,
            scope: n
        };
    }
    refresh() {
        return this.navigator.refresh();
    }
    back() {
        return this.navigator.go(-1);
    }
    forward() {
        return this.navigator.go(1);
    }
    go(t) {
        return this.navigator.go(t);
    }
    checkActive(t, i) {
        if (typeof t === "string") {
            throw createMappedError(2003, t);
        }
        i = i ?? {};
        ({instructions: t} = this.applyLoadOptions(t, i));
        t.forEach((t => t.scope ??= this.rootScope.scope));
        const s = arrayUnique(t.map((t => t.scope)));
        for (const i of s) {
            const s = i.matchScope(t, false);
            const n = i.matchScope(this.activeComponents, true);
            if (!RoutingInstruction.contains(this, n, s, true)) {
                return false;
            }
        }
        return true;
    }
    unresolvedInstructionsError(t, i) {
        this.ea.publish(RouterNavigationErrorEvent.eventName, RouterNavigationErrorEvent.create(t));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(t));
        throw createUnresolvedinstructionsError(i, this.I);
    }
    cancelNavigation(t, i) {
        i.cancel();
        this.ea.publish(RouterNavigationCancelEvent.eventName, RouterNavigationCancelEvent.create(t));
        this.ea.publish(RouterNavigationEndEvent.eventName, RouterNavigationEndEvent.create(t));
    }
    appendInstructions(t, i = null, s = null) {
        if (i === null) {
            i = this.rootScope.scope;
        }
        for (const s of t) {
            if (s.scope === null) {
                s.scope = i;
            }
        }
        if (s === null) {
            for (let t = this.coordinators.length - 1; t >= 0; t--) {
                if (!this.coordinators[t].closed) {
                    s = this.coordinators[t];
                    break;
                }
            }
        }
        if (s === null) {
            if (!this.loadedFirst) {
                this.appendedInstructions.push(...t);
            } else {
                throw createMappedError(2004);
            }
        }
        s?.appendInstructions(t);
    }
    async updateNavigation(t) {
        this.rootScope.scope.reparentRoutingInstructions();
        const i = this.rootScope.scope.getRoutingInstructions(t.timestamp);
        let {matchedInstructions: s} = this.rootScope.scope.matchEndpoints(i, [], true);
        let n = 100;
        while (s.length > 0) {
            if (n-- === 0) {
                throw createMappedError(2005);
            }
            s = s.map((t => {
                const {matchedInstructions: i} = t.endpoint.instance.scope.matchEndpoints(t.nextScopeInstructions ?? [], [], true);
                return i;
            })).flat();
        }
        if (t.timestamp >= (this.activeNavigation?.timestamp ?? 0)) {
            this.activeNavigation = t;
            this.activeComponents = i;
        }
        let e = await RoutingHook.invokeTransformToUrl(i, t);
        if (typeof e !== "string") {
            e = RoutingInstruction.stringify(this, e, {
                endpointContext: true
            });
        }
        e = await RoutingHook.invokeTransformToUrl(e, t);
        if (t.query == null && t.parameters != null) {
            const i = new URLSearchParams;
            for (let [s, n] of Object.entries(t.parameters)) {
                s = encodeURIComponent(s);
                if (!Array.isArray(n)) {
                    n = [ n ];
                }
                for (const t of n) {
                    i.append(s, encodeURIComponent(t));
                }
            }
            t.query = i.toString();
        }
        let r = `${this.configuration.options.basePath}/`;
        if (r === null || e !== "" && e[0] === "/" || this.configuration.options.useUrlFragmentHash) {
            r = "";
        }
        const o = (t.query?.length ?? 0) > 0 ? "?" + t.query : "";
        const h = (t.fragment?.length ?? 0) > 0 ? "#" + t.fragment : "";
        t.path = r + e + o + h;
        const u = t.path.slice(r.length);
        t.fullStateInstruction = RoutingInstruction.clear(this) + (u.length > 0 ? Separators.for(this).sibling : "") + u;
        if ((t.title ?? null) === null) {
            const s = await Title.getTitle(i, t, this.configuration.options.title);
            if (s !== null) {
                t.title = s;
            }
        }
        return Promise.resolve();
    }
    $(t, i) {
        i = {
            ...i
        };
        if (typeof t === "string" && i.fragment == null) {
            const [s, n] = t.split("#");
            t = s;
            i.fragment = n;
        }
        if (typeof t === "string" && i.query == null) {
            const [s, n] = t.split("?");
            t = s;
            i.query = n;
        }
        if (typeof i.parameters === "string" && i.query == null) {
            i.query = i.parameters;
            i.parameters = void 0;
        }
        if (typeof i.query === "string" && i.query.length > 0) {
            i.parameters ??= {};
            const t = new URLSearchParams(i.query);
            t.forEach(((t, s) => {
                s = decodeURIComponent(s);
                t = decodeURIComponent(t);
                if (s in i.parameters) {
                    if (!Array.isArray(i.parameters[s])) {
                        i.parameters[s] = [ i.parameters[s] ];
                    }
                    i.parameters[s].push(t);
                } else {
                    i.parameters[s] = t;
                }
            }));
        }
        return {
            instructions: t,
            options: i
        };
    }
}

Router.closestEndpointKey = r.annotation.keyFor("closest-endpoint");

function createUnresolvedinstructionsError(t, i) {
    const s = createMappedError(2006, t.length);
    s.remainingInstructions = t;
    i.warn(s, s.remainingInstructions);
    return s;
}

class RouterEvent {
    constructor(t) {
        this.eventName = t;
    }
}

class RouterStartEvent extends RouterEvent {
    static create() {
        return new RouterStartEvent(this.eventName);
    }
}

RouterStartEvent.eventName = "au:router:router-start";

class RouterStopEvent extends RouterEvent {
    static create() {
        return new RouterStopEvent(this.eventName);
    }
}

RouterStopEvent.eventName = "au:router:router-stop";

class RouterNavigationEvent {
    constructor(t, i) {
        this.eventName = t;
        this.navigation = i;
    }
}

class RouterNavigationStartEvent extends RouterNavigationEvent {
    static create(t) {
        return new RouterNavigationStartEvent(this.eventName, t);
    }
}

RouterNavigationStartEvent.eventName = "au:router:navigation-start";

class RouterNavigationEndEvent extends RouterNavigationEvent {
    static create(t) {
        return new RouterNavigationEndEvent(this.eventName, t);
    }
}

RouterNavigationEndEvent.eventName = "au:router:navigation-end";

class RouterNavigationCancelEvent extends RouterNavigationEvent {
    static create(t) {
        return new RouterNavigationCancelEvent(this.eventName, t);
    }
}

RouterNavigationCancelEvent.eventName = "au:router:navigation-cancel";

class RouterNavigationCompleteEvent extends RouterNavigationEvent {
    static create(t) {
        return new RouterNavigationCompleteEvent(this.eventName, t);
    }
}

RouterNavigationCompleteEvent.eventName = "au:router:navigation-complete";

class RouterNavigationErrorEvent extends RouterNavigationEvent {
    static create(t) {
        return new RouterNavigationErrorEvent(this.eventName, t);
    }
}

RouterNavigationErrorEvent.eventName = "au:router:navigation-error";

const H = /*@__PURE__*/ o.createInterface("ILinkHandler", (t => t.singleton(LinkHandler)));

class LinkHandler {
    constructor() {
        this.window = s(p);
        this.router = s(F);
    }
    handleEvent(t) {
        this.handleClick(t);
    }
    handleClick(t) {
        if (t.button !== 0 || t.altKey || t.ctrlKey || t.metaKey || t.shiftKey) {
            return;
        }
        const i = t.currentTarget;
        if (i.hasAttribute("external")) {
            return;
        }
        const s = i.getAttribute("target") ?? "";
        if (s.length > 0 && s !== this.window.name && s !== "_self") {
            return;
        }
        const n = w.for(i, "load");
        const e = n !== void 0 ? n.viewModel.value : null;
        const r = this.router.configuration.options.useHref && i.hasAttribute("href") ? i.getAttribute("href") : null;
        if ((e === null || e.length === 0) && (r === null || r.length === 0)) {
            return;
        }
        t.preventDefault();
        let o = e ?? r ?? "";
        if (typeof o === "string" && o.startsWith("#")) {
            o = o.slice(1);
            if (!o.startsWith("/")) {
                o = `/${o}`;
            }
        }
        this.router.load(o, {
            origin: i
        }).catch((t => {
            throw t;
        }));
    }
}

function route(t) {
    return function(i, s) {
        s.addInitializer((function() {
            Route.configure(t, i);
        }));
        return i;
    };
}

function getValueOrAttribute(t, i, s, n, e = false) {
    if (e) {
        return i === "";
    }
    if (s) {
        return i;
    }
    const r = n.getAttribute(t) ?? "";
    return r.length > 0 ? r : i;
}

function waitForRouterStart(t, i) {
    if (t.isActive) {
        return;
    }
    return new Promise((t => {
        const s = i.subscribe(RouterStartEvent.eventName, (() => {
            t();
            s.dispose();
        }));
    }));
}

function getConsideredActiveInstructions(t, i, s, n) {
    let e = w.for(s, "considered-active")?.viewModel?.value;
    if (e === void 0) {
        e = n;
    }
    const r = t.applyLoadOptions(e, {
        context: i
    });
    const o = RoutingInstruction.from(t, r.instructions);
    for (const t of o) {
        if (t.scope === null) {
            t.scope = r.scope;
        }
    }
    return o;
}

function getLoadIndicator(t) {
    let i = t.parentElement;
    while (i != null) {
        if (i.tagName === "AU-VIEWPORT") {
            i = null;
            break;
        }
        if (i.hasAttribute("load-active")) {
            break;
        }
        i = i.parentElement;
    }
    i ??= t;
    return i;
}

const M = R.toView;

const L = a.createInjectable();

class ViewportCustomElement {
    constructor() {
        this.name = "default";
        this.usedBy = "";
        this.default = "";
        this.fallback = "";
        this.fallbackAction = "";
        this.noScope = false;
        this.noLink = false;
        this.noTitle = false;
        this.noHistory = false;
        this.stateful = false;
        this.endpoint = null;
        this.pendingChildren = [];
        this.pendingPromise = null;
        this.isBound = false;
        this.router = s(F);
        this.element = s(C);
        this.container = s(e);
        this.ea = s(n);
        this.parentViewport = s(L);
        this.instruction = s($);
    }
    hydrated(t) {
        this.controller = t;
        const i = this.instruction.props.filter((t => t.to === "default")).length > 0;
        if (i && this.parentViewport != null) {
            this.parentViewport.pendingChildren.push(this);
            if (this.parentViewport.pendingPromise === null) {
                this.parentViewport.pendingPromise = new OpenPromise(`hydrated: ViewportCustomElement`);
            }
        }
        Runner.run(null, (() => waitForRouterStart(this.router, this.ea)), (() => {
            if (this.router.isRestrictedNavigation) {
                this.connect();
            }
        }));
    }
    binding(t, i) {
        this.isBound = true;
        return Runner.run("binding", (() => waitForRouterStart(this.router, this.ea)), (() => {
            if (!this.router.isRestrictedNavigation) {
                this.connect();
            }
        }), (() => {
            if (this.endpoint?.activeResolve != null) {
                this.endpoint.activeResolve();
                this.endpoint.activeResolve = null;
            }
        }), (() => {
            if (this.endpoint !== null && this.endpoint.getNextContent() === null) {
                return this.endpoint.activate(null, t, this.controller, void 0)?.asValue;
            }
        }));
    }
    detaching(t, i) {
        if (this.endpoint !== null) {
            this.isBound = false;
            return this.endpoint.deactivate(null, t, i);
        }
    }
    unbinding(t, i) {
        if (this.endpoint !== null) {
            return this.disconnect(null);
        }
    }
    dispose() {
        this.endpoint?.dispose();
        this.endpoint = null;
    }
    connect() {
        const {isBound: t, element: i} = this;
        const s = getValueOrAttribute("name", this.name, t, i);
        const n = {};
        n.scope = !getValueOrAttribute("no-scope", this.noScope, false, i, true);
        n.usedBy = getValueOrAttribute("used-by", this.usedBy, t, i);
        n.default = getValueOrAttribute("default", this.default, t, i);
        n.fallback = getValueOrAttribute("fallback", this.fallback, t, i);
        n.fallbackAction = getValueOrAttribute("fallback-action", this.fallbackAction, t, i);
        n.noLink = getValueOrAttribute("no-link", this.noLink, t, i, true);
        n.noTitle = getValueOrAttribute("no-title", this.noTitle, t, i, true);
        n.noHistory = getValueOrAttribute("no-history", this.noHistory, t, i, true);
        n.stateful = getValueOrAttribute("stateful", this.stateful, t, i, true);
        Object.keys(n).forEach((t => {
            if (n[t] === undefined) {
                delete n[t];
            }
        }));
        this.endpoint = this.router.connectEndpoint(this.endpoint, "Viewport", this, s, n);
        const e = this.parentViewport;
        if (e != null) {
            arrayRemove(e.pendingChildren, (t => t === this));
            if (e.pendingChildren.length === 0 && e.pendingPromise !== null) {
                e.pendingPromise.resolve();
                e.pendingPromise = null;
            }
        }
    }
    disconnect(t) {
        if (this.endpoint !== null) {
            this.router.disconnectEndpoint(t, this.endpoint, this);
        }
    }
    setActivity(t, i) {
        const s = this.router.configuration.options.indicators.viewportNavigating;
        if (typeof t === "string") {
            this.element.classList.toggle(t, i);
        } else {
            for (const n in t) {
                this.element.classList.toggle(`${s}-${n}`, i && t[n]);
            }
        }
    }
}

a.define({
    name: "au-viewport",
    injectable: L,
    bindables: [ "name", "usedBy", "default", "fallback", "fallbackAction", "noScope", "noLink", "noTitle", "noHistory", "stateful" ]
}, ViewportCustomElement);

const j = a.createInjectable();

class ViewportScopeCustomElement {
    constructor() {
        this.name = "default";
        this.catches = "";
        this.collection = false;
        this.source = null;
        this.viewportScope = null;
        this.isBound = false;
        this.router = s(F);
        this.element = s(C);
        this.container = s(e);
        this.parent = s(j);
        this.parentController = s(y);
    }
    hydrated(t) {
        this.controller = t;
    }
    bound(t, i) {
        this.isBound = true;
        this.$controller.scope = this.parentController.scope;
        this.connect();
        if (this.viewportScope !== null) {
            this.viewportScope.binding();
        }
    }
    unbinding(t, i) {
        if (this.viewportScope !== null) {
            this.viewportScope.unbinding();
        }
        return Promise.resolve();
    }
    connect() {
        if (this.router.rootScope === null) {
            return;
        }
        const t = this.getAttribute("name", this.name);
        const i = {};
        let s = this.getAttribute("catches", this.catches);
        if (s !== void 0) {
            i.catches = s;
        }
        s = this.getAttribute("collection", this.collection, true);
        if (s !== void 0) {
            i.collection = s;
        }
        i.source = this.source ?? null;
        this.viewportScope = this.router.connectEndpoint(this.viewportScope, "ViewportScope", this, t, i);
    }
    disconnect() {
        if (this.viewportScope) {
            this.router.disconnectEndpoint(null, this.viewportScope, this);
        }
        this.viewportScope = null;
    }
    getAttribute(t, i, s = false) {
        if (this.isBound) {
            return i;
        } else {
            if (this.element.hasAttribute(t)) {
                if (s) {
                    return true;
                } else {
                    i = this.element.getAttribute(t);
                    if (i.length > 0) {
                        return i;
                    }
                }
            }
        }
        return void 0;
    }
}

a.define({
    name: "au-viewport-scope",
    template: "<template></template>",
    containerless: false,
    injectable: j,
    bindables: [ "name", "catches", "collection", "source" ]
}, ViewportScopeCustomElement);

class LoadCustomAttribute {
    constructor() {
        this.O = false;
        this.hasHref = null;
        this.element = s(C);
        this.router = s(F);
        this.linkHandler = s(H);
        this.ea = s(n);
        this.activeClass = this.router.configuration.options.indicators.loadActive;
        this.navigationEndHandler = t => {
            void this.updateActive();
        };
    }
    binding() {
        if (this.value == null) {
            this.O = true;
        }
        this.element.addEventListener("click", this.linkHandler);
        this.updateValue();
        void this.updateActive();
        this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
    }
    unbinding() {
        this.element.removeEventListener("click", this.linkHandler);
        this.routerNavigationSubscription.dispose();
    }
    valueChanged(t) {
        this.updateValue();
        void this.updateActive();
    }
    updateValue() {
        if (this.O) {
            this.value = {
                component: this.component,
                parameters: this.parameters,
                viewport: this.viewport,
                id: this.id
            };
        }
        if (this.hasHref === null) {
            this.hasHref = this.element.hasAttribute("href");
        }
        if (!this.hasHref) {
            let t = this.value;
            if (typeof t !== "string") {
                const i = RoutingInstruction.from(this.router, t).shift();
                const s = this.T(t);
                if (s.foundConfiguration) {
                    i.route = s.matching;
                }
                t = RoutingInstruction.stringify(this.router, [ i ]);
            }
            const {scope: i, instruction: s} = RoutingScope.for(this.element, t);
            const n = i?.path ?? "";
            t = `${n}${s ?? ""}`;
            if (this.router.configuration.options.useUrlFragmentHash && !t.startsWith("#")) {
                t = `#/${t}`;
            }
            this.element.setAttribute("href", t);
        }
    }
    async updateActive() {
        const t = w.for(this.element, "load").parent;
        const i = typeof this.value === "string" ? {
            id: this.value,
            path: this.value
        } : this.value;
        const s = this.T(i);
        const n = s.foundConfiguration ? s.instructions : getConsideredActiveInstructions(this.router, t, this.element, this.value);
        const e = getLoadIndicator(this.element);
        e.classList.toggle(this.activeClass, this.router.checkActive(n, {
            context: t
        }));
    }
    T(t) {
        if (typeof t === "string") {
            return new FoundRoute;
        }
        const i = RoutingScope.for(this.element).scope ?? this.router.rootScope.scope;
        if (t.id != null) {
            return i.findMatchingRoute(t.id, t.parameters ?? {});
        }
        const s = t.path;
        if (s != null) {
            return i.findMatchingRoute(s, t.parameters ?? {});
        }
        return new FoundRoute;
    }
}

w.define({
    name: "load",
    bindables: {
        value: {
            mode: M
        },
        component: {},
        parameters: {},
        viewport: {},
        id: {}
    }
}, LoadCustomAttribute);

class HrefCustomAttribute {
    constructor() {
        this.element = s(C);
        this.router = s(F);
        this.linkHandler = s(H);
        this.ea = s(n);
        this.activeClass = this.router.configuration.options.indicators.loadActive;
        this.navigationEndHandler = t => {
            this.updateActive();
        };
    }
    binding() {
        if (this.router.configuration.options.useHref && !this.hasLoad() && !this.element.hasAttribute("external")) {
            this.element.addEventListener("click", this.linkHandler);
            this.routerNavigationSubscription = this.ea.subscribe(RouterNavigationEndEvent.eventName, this.navigationEndHandler);
        }
        this.updateValue();
        this.updateActive();
    }
    unbinding() {
        this.element.removeEventListener("click", this.linkHandler);
        this.routerNavigationSubscription?.dispose();
    }
    valueChanged() {
        this.updateValue();
        this.updateActive();
    }
    updateValue() {
        this.element.setAttribute("href", this.value);
    }
    updateActive() {
        if (this.router.configuration.options.useHref && !this.hasLoad() && !this.element.hasAttribute("external")) {
            const t = w.for(this.element, "href").parent;
            const i = getConsideredActiveInstructions(this.router, t, this.element, this.value);
            const s = getLoadIndicator(this.element);
            s.classList.toggle(this.activeClass, this.router.checkActive(i, {
                context: t
            }));
        }
    }
    hasLoad() {
        const t = this.$controller.parent;
        const i = t.children;
        return i?.some((t => t.vmKind === "customAttribute" && t.viewModel instanceof LoadCustomAttribute)) ?? false;
    }
}

HrefCustomAttribute.$au = {
    type: "custom-attribute",
    name: "href",
    noMultiBindings: true,
    bindables: {
        value: {
            mode: M
        }
    }
};

class ConsideredActiveCustomAttribute {}

w.define({
    name: "considered-active",
    bindables: {
        value: {
            mode: M
        }
    }
}, ConsideredActiveCustomAttribute);

const q = /*@__PURE__*/ o.createInterface("IRouterConfiguration", (t => t.singleton(RouterConfiguration)));

const B = F;

const D = [ B ];

const z = ViewportCustomElement;

const _ = ViewportScopeCustomElement;

const Q = LoadCustomAttribute;

const J = HrefCustomAttribute;

const W = [ ViewportCustomElement, ViewportScopeCustomElement, LoadCustomAttribute, HrefCustomAttribute, ConsideredActiveCustomAttribute ];

class RouterConfiguration {
    static register(t) {
        const i = t.get(q);
        i.options = RouterConfiguration.options;
        i.options.setRouterConfiguration(i);
        RouterConfiguration.options = RouterOptions.create();
        return t.register(...D, ...W, I.activating(F, RouterConfiguration.configurationCall), I.activated(F, (t => t.initialLoad())), I.deactivated(F, (t => t.stop())));
    }
    static customize(t) {
        if (t === undefined) {
            RouterConfiguration.options = RouterOptions.create();
            RouterConfiguration.configurationCall = t => {
                t.start();
            };
        } else if (t instanceof Function) {
            RouterConfiguration.configurationCall = t;
        } else {
            RouterConfiguration.options = RouterOptions.create();
            RouterConfiguration.options.apply(t);
        }
        return RouterConfiguration;
    }
    static createContainer() {
        return this.register(o.createContainer());
    }
    static for(t) {
        if (t instanceof Router) {
            return t.configuration;
        }
        return t.get(q);
    }
    apply(t, i = false) {
        if (i) {
            this.options = RouterOptions.create();
        }
        this.options.apply(t);
    }
    addHook(t, i) {
        return RoutingHook.add(t, i);
    }
    removeHook(t) {
        return RoutingHook.remove(t);
    }
    removeAllHooks() {
        return RoutingHook.removeAll();
    }
}

RouterConfiguration.options = RouterOptions.create();

RouterConfiguration.configurationCall = t => {
    t.start();
};

export { T as ConfigurableRoute, ConsideredActiveCustomAttribute, D as DefaultComponents, W as DefaultResources, P as Endpoint, EndpointContent, FoundRoute, HrefCustomAttribute, J as HrefCustomAttributeRegistration, H as ILinkHandler, F as IRouter, q as IRouterConfiguration, InstructionParameters, LinkHandler, LoadCustomAttribute, Q as LoadCustomAttributeRegistration, Navigation, NavigationCoordinator, NavigationFlags, Navigator, x as RecognizedRoute, U as RecognizerEndpoint, Route, O as RouteRecognizer, Router, RouterConfiguration, RouterNavigationCancelEvent, RouterNavigationCompleteEvent, RouterNavigationEndEvent, RouterNavigationErrorEvent, RouterNavigationStartEvent, RouterOptions, B as RouterRegistration, RouterStartEvent, RouterStopEvent, V as Routes, RoutingHook, RoutingInstruction, RoutingScope, Runner, Step, Viewport, ViewportContent, ViewportCustomElement, z as ViewportCustomElementRegistration, ViewportOptions, ViewportScope, ViewportScopeContent, ViewportScopeCustomElement, _ as ViewportScopeCustomElementRegistration, route, routes };
//# sourceMappingURL=index.mjs.map
