"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteRecognizer = exports.RecognizedRoute = exports.Endpoint = exports.ConfigurableRoute = void 0;
class ConfigurableRoute {
    constructor(path, caseSensitive, handler) {
        this.path = path;
        this.caseSensitive = caseSensitive;
        this.handler = handler;
    }
}
exports.ConfigurableRoute = ConfigurableRoute;
class Endpoint {
    constructor(route, paramNames) {
        this.route = route;
        this.paramNames = paramNames;
    }
}
exports.Endpoint = Endpoint;
class RecognizedRoute {
    constructor(endpoint, params) {
        this.endpoint = endpoint;
        this.params = params;
    }
}
exports.RecognizedRoute = RecognizedRoute;
class Candidate {
    constructor(chars, states, skippedStates, result) {
        var _a;
        this.chars = chars;
        this.states = states;
        this.skippedStates = skippedStates;
        this.result = result;
        this.head = states[states.length - 1];
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        this.endpoint = (_a = this.head) === null || _a === void 0 ? void 0 : _a.endpoint;
    }
    advance(ch) {
        const { chars, states, skippedStates, result } = this;
        let stateToAdd = null;
        let matchCount = 0;
        const state = states[states.length - 1];
        function $process(nextState, skippedState) {
            if (nextState.isMatch(ch)) {
                if (++matchCount === 1) {
                    stateToAdd = nextState;
                }
                else {
                    result.add(new Candidate(chars.concat(ch), states.concat(nextState), skippedState === null ? skippedStates : skippedStates.concat(skippedState), result));
                }
            }
            if (state.segment === null && nextState.isOptional && nextState.nextStates !== null) {
                if (nextState.nextStates.length > 1) {
                    throw new Error(`${nextState.nextStates.length} nextStates`);
                }
                const separator = nextState.nextStates[0];
                if (!separator.isSeparator) {
                    throw new Error(`Not a separator`);
                }
                if (separator.nextStates !== null) {
                    for (const $nextState of separator.nextStates) {
                        $process($nextState, nextState);
                    }
                }
            }
        }
        if (state.isDynamic) {
            $process(state, null);
        }
        if (state.nextStates !== null) {
            for (const nextState of state.nextStates) {
                $process(nextState, null);
            }
        }
        if (stateToAdd !== null) {
            states.push(this.head = stateToAdd);
            chars.push(ch);
            if (stateToAdd.endpoint !== null) {
                this.endpoint = stateToAdd.endpoint;
            }
        }
        if (matchCount === 0) {
            result.remove(this);
        }
    }
    finalize() {
        function collectSkippedStates(skippedStates, state) {
            const nextStates = state.nextStates;
            if (nextStates !== null) {
                if (nextStates.length === 1 && nextStates[0].segment === null) {
                    collectSkippedStates(skippedStates, nextStates[0]);
                }
                else {
                    for (const nextState of nextStates) {
                        if (nextState.isOptional && nextState.endpoint !== null) {
                            skippedStates.push(nextState);
                            if (nextState.nextStates !== null) {
                                for (const $nextState of nextState.nextStates) {
                                    collectSkippedStates(skippedStates, $nextState);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
        collectSkippedStates(this.skippedStates, this.head);
    }
    getParams() {
        const { states, chars, endpoint } = this;
        const params = {};
        // First initialize all properties with undefined so they all exist (even if they're not filled, e.g. non-matched optional params)
        for (const name of endpoint.paramNames) {
            params[name] = void 0;
        }
        for (let i = 0, ii = states.length; i < ii; ++i) {
            const state = states[i];
            if (state.isDynamic) {
                const name = state.segment.name;
                if (params[name] === void 0) {
                    params[name] = chars[i];
                }
                else {
                    params[name] += chars[i];
                }
            }
        }
        return params;
    }
    /**
     * Compares this candidate to another candidate to determine the correct sorting order.
     *
     * This algorithm is different from `sortSolutions` in v1's route-recognizer in that it compares
     * the candidates segment-by-segment, rather than merely comparing the cumulative of segment types
     *
     * This resolves v1's ambiguity in situations like `/foo/:id/bar` vs. `/foo/bar/:id`, which had the
     * same sorting value because they both consist of two static segments and one dynamic segment.
     *
     * With this algorithm, `/foo/bar/:id` would always be sorted first because the second segment is different,
     * and static wins over dynamic.
     *
     * ### NOTE
     * This algorithm violates some of the invariants of v1's algorithm,
     * but those invariants were arguably not very sound to begin with. Example:
     *
     * `/foo/*path/bar/baz` vs. `/foo/bar/*path1/*path2`
     * - in v1, the first would win because that match has fewer stars
     * - in v2, the second will win because there is a bigger static match at the start of the pattern
     *
     * The algorithm should be more logical and easier to reason about in v2, but it's important to be aware of
     * subtle difference like this which might surprise some users who happened to rely on this behavior from v1,
     * intentionally or unintentionally.
     *
     * @param b - The candidate to compare this to.
     * Parameter name is `b` because the method should be used like so: `states.sort((a, b) => a.compareTo(b))`.
     * This will bring the candidate with the highest score to the first position of the array.
     */
    compareTo(b) {
        const statesA = this.states;
        const statesB = b.states;
        for (let iA = 0, iB = 0, ii = Math.max(statesA.length, statesB.length); iA < ii; ++iA) {
            let stateA = statesA[iA];
            if (stateA === void 0) {
                return 1;
            }
            let stateB = statesB[iB];
            if (stateB === void 0) {
                return -1;
            }
            let segmentA = stateA.segment;
            let segmentB = stateB.segment;
            if (segmentA === null) {
                if (segmentB === null) {
                    ++iB;
                    continue;
                }
                if ((stateA = statesA[++iA]) === void 0) {
                    return 1;
                }
                segmentA = stateA.segment;
            }
            else if (segmentB === null) {
                if ((stateB = statesB[++iB]) === void 0) {
                    return -1;
                }
                segmentB = stateB.segment;
            }
            if (segmentA.kind < segmentB.kind) {
                return 1;
            }
            if (segmentA.kind > segmentB.kind) {
                return -1;
            }
            ++iB;
        }
        const skippedStatesA = this.skippedStates;
        const skippedStatesB = b.skippedStates;
        const skippedStatesALen = skippedStatesA.length;
        const skippedStatesBLen = skippedStatesB.length;
        if (skippedStatesALen < skippedStatesBLen) {
            return 1;
        }
        if (skippedStatesALen > skippedStatesBLen) {
            return -1;
        }
        for (let i = 0; i < skippedStatesALen; ++i) {
            const skippedStateA = skippedStatesA[i];
            const skippedStateB = skippedStatesB[i];
            if (skippedStateA.length < skippedStateB.length) {
                return 1;
            }
            if (skippedStateA.length > skippedStateB.length) {
                return -1;
            }
        }
        // This should only be possible with a single pattern with multiple consecutive star segments.
        // TODO: probably want to warn or even throw here, but leave it be for now.
        return 0;
    }
}
function hasEndpoint(candidate) {
    return candidate.head.endpoint !== null;
}
function compareChains(a, b) {
    return a.compareTo(b);
}
class RecognizeResult {
    constructor(rootState) {
        this.candidates = [];
        this.candidates = [new Candidate([''], [rootState], [], this)];
    }
    get isEmpty() {
        return this.candidates.length === 0;
    }
    getSolution() {
        const candidates = this.candidates.filter(hasEndpoint);
        if (candidates.length === 0) {
            return null;
        }
        for (const candidate of candidates) {
            candidate.finalize();
        }
        candidates.sort(compareChains);
        return candidates[0];
    }
    add(candidate) {
        this.candidates.push(candidate);
    }
    remove(candidate) {
        this.candidates.splice(this.candidates.indexOf(candidate), 1);
    }
    advance(ch) {
        const candidates = this.candidates.slice();
        for (const candidate of candidates) {
            candidate.advance(ch);
        }
    }
}
class RouteRecognizer {
    constructor() {
        this.rootState = new State(null, null, '');
        this.cache = new Map();
    }
    add(routeOrRoutes) {
        if (routeOrRoutes instanceof Array) {
            for (const route of routeOrRoutes) {
                this.$add(route);
            }
        }
        else {
            this.$add(routeOrRoutes);
        }
        // Clear the cache whenever there are state changes, because the recognizeResults could be arbitrarily different as a result
        this.cache.clear();
    }
    $add(route) {
        const path = route.path;
        const $route = new ConfigurableRoute(route.path, route.caseSensitive === true, route.handler);
        // Normalize leading, trailing and double slashes by ignoring empty segments
        const parts = path === '' ? [''] : path.split('/').filter(isNotEmpty);
        const paramNames = [];
        let state = this.rootState;
        for (const part of parts) {
            // Each segment always begins with a slash, so we represent this with a non-segment state
            state = state.append(null, '/');
            switch (part.charAt(0)) {
                case ':': { // route parameter
                    const isOptional = part.endsWith('?');
                    const name = isOptional ? part.slice(1, -1) : part.slice(1);
                    paramNames.push(name);
                    state = new DynamicSegment(name, isOptional).appendTo(state);
                    break;
                }
                case '*': { // dynamic route
                    const name = part.slice(1);
                    paramNames.push(name);
                    state = new StarSegment(name).appendTo(state);
                    break;
                }
                default: { // standard path route
                    state = new StaticSegment(part, $route.caseSensitive).appendTo(state);
                    break;
                }
            }
        }
        const endpoint = new Endpoint($route, paramNames);
        state.setEndpoint(endpoint);
    }
    recognize(path) {
        let result = this.cache.get(path);
        if (result === void 0) {
            this.cache.set(path, result = this.$recognize(path));
        }
        return result;
    }
    $recognize(path) {
        path = decodeURI(path);
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        const result = new RecognizeResult(this.rootState);
        for (let i = 0, ii = path.length; i < ii; ++i) {
            const ch = path.charAt(i);
            result.advance(ch);
            if (result.isEmpty) {
                return null;
            }
        }
        const candidate = result.getSolution();
        if (candidate === null) {
            return null;
        }
        const { endpoint } = candidate;
        const params = candidate.getParams();
        return new RecognizedRoute(endpoint, params);
    }
}
exports.RouteRecognizer = RouteRecognizer;
class State {
    constructor(prevState, segment, value) {
        this.prevState = prevState;
        this.segment = segment;
        this.value = value;
        this.nextStates = null;
        this.endpoint = null;
        switch (segment === null || segment === void 0 ? void 0 : segment.kind) {
            case 2 /* dynamic */:
                this.length = prevState.length + 1;
                this.isSeparator = false;
                this.isDynamic = true;
                this.isOptional = segment.optional;
                break;
            case 1 /* star */:
                this.length = prevState.length + 1;
                this.isSeparator = false;
                this.isDynamic = true;
                this.isOptional = false;
                break;
            case 3 /* static */:
                this.length = prevState.length + 1;
                this.isSeparator = false;
                this.isDynamic = false;
                this.isOptional = false;
                break;
            case undefined:
                this.length = prevState === null ? 0 : prevState.length;
                this.isSeparator = true;
                this.isDynamic = false;
                this.isOptional = false;
                break;
        }
    }
    append(segment, value) {
        let state;
        let nextStates = this.nextStates;
        if (nextStates === null) {
            state = void 0;
            nextStates = this.nextStates = [];
        }
        else if (segment === null) {
            state = nextStates.find(s => s.value === value);
        }
        else {
            state = nextStates.find(s => { var _a; return (_a = s.segment) === null || _a === void 0 ? void 0 : _a.equals(segment); });
        }
        if (state === void 0) {
            nextStates.push(state = new State(this, segment, value));
        }
        return state;
    }
    setEndpoint(endpoint) {
        if (this.endpoint !== null) {
            throw new Error(`Cannot add ambiguous route. The pattern '${endpoint.route.path}' clashes with '${this.endpoint.route.path}'`);
        }
        this.endpoint = endpoint;
        if (this.isOptional) {
            this.prevState.setEndpoint(endpoint);
            if (this.prevState.isSeparator && this.prevState.prevState !== null) {
                this.prevState.prevState.setEndpoint(endpoint);
            }
        }
    }
    isMatch(ch) {
        const segment = this.segment;
        switch (segment === null || segment === void 0 ? void 0 : segment.kind) {
            case 2 /* dynamic */:
                return !this.value.includes(ch);
            case 1 /* star */:
                return true;
            case 3 /* static */:
            case undefined:
                // segment separators (slashes) are non-segments. We could say return ch === '/' as well, technically.
                return this.value.includes(ch);
        }
    }
}
function isNotEmpty(segment) {
    return segment.length > 0;
}
var SegmentKind;
(function (SegmentKind) {
    SegmentKind[SegmentKind["star"] = 1] = "star";
    SegmentKind[SegmentKind["dynamic"] = 2] = "dynamic";
    SegmentKind[SegmentKind["static"] = 3] = "static";
})(SegmentKind || (SegmentKind = {}));
class StaticSegment {
    constructor(value, caseSensitive) {
        this.value = value;
        this.caseSensitive = caseSensitive;
    }
    get kind() { return 3 /* static */; }
    appendTo(state) {
        const { value, value: { length } } = this;
        if (this.caseSensitive) {
            for (let i = 0; i < length; ++i) {
                state = state.append(
                /* segment */ this, 
                /* value   */ value.charAt(i));
            }
        }
        else {
            for (let i = 0; i < length; ++i) {
                const ch = value.charAt(i);
                state = state.append(
                /* segment */ this, 
                /* value   */ ch.toUpperCase() + ch.toLowerCase());
            }
        }
        return state;
    }
    equals(b) {
        return (b.kind === 3 /* static */ &&
            b.caseSensitive === this.caseSensitive &&
            b.value === this.value);
    }
}
class DynamicSegment {
    constructor(name, optional) {
        this.name = name;
        this.optional = optional;
    }
    get kind() { return 2 /* dynamic */; }
    appendTo(state) {
        state = state.append(
        /* segment */ this, 
        /* value   */ '/');
        return state;
    }
    equals(b) {
        return (b.kind === 2 /* dynamic */ &&
            b.optional === this.optional &&
            b.name === this.name);
    }
}
class StarSegment {
    constructor(name) {
        this.name = name;
    }
    get kind() { return 1 /* star */; }
    appendTo(state) {
        state = state.append(
        /* segment */ this, 
        /* value   */ '');
        return state;
    }
    equals(b) {
        return (b.kind === 1 /* star */ &&
            b.name === this.name);
    }
}
//# sourceMappingURL=index.js.map