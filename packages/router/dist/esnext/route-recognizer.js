import { buildQueryString, parseQueryString } from '@aurelia/kernel';
export class HandlerEntry {
    constructor(handler, names) {
        this.handler = handler;
        this.names = names;
    }
}
/*
* An object that is indexed and used for route generation, particularly for dynamic routes.
*/
export class RouteGenerator {
    constructor(segments, handlers) {
        this.segments = segments;
        this.handlers = handlers;
    }
}
export class TypesRecord {
    constructor() {
        this.statics = 0;
        this.dynamics = 0;
        this.stars = 0;
    }
}
export class RecognizeResult {
    constructor(handler, params, isDynamic) {
        this.handler = handler;
        this.params = params;
        this.isDynamic = isDynamic;
    }
}
export class CharSpec {
    constructor(invalidChars, validChars, repeat) {
        this.invalidChars = invalidChars;
        this.validChars = validChars;
        this.repeat = repeat;
    }
    equals(other) {
        return this.validChars === other.validChars && this.invalidChars === other.invalidChars;
    }
}
export class State {
    constructor(charSpec) {
        this.charSpec = charSpec;
        this.nextStates = [];
    }
    put(charSpec) {
        let state = this.nextStates.find(s => s.charSpec.equals(charSpec));
        if (state === undefined) {
            state = new State(charSpec);
            this.nextStates.push(state);
            if (charSpec.repeat) {
                state.nextStates.push(state);
            }
        }
        return state;
    }
}
const specials = [
    '/', '.', '*', '+', '?', '|',
    '(', ')', '[', ']', '{', '}', '\\'
];
const escapeRegex = new RegExp(`(\\${specials.join('|\\')})`, 'g');
// A Segment represents a segment in the original route description.
// Each Segment type provides an `eachChar` and `regex` method.
//
// The `eachChar` method invokes the callback with one or more character
// specifications. A character specification consumes one or more input
// characters.
//
// The `regex` method returns a regex fragment for the segment. If the
// segment is a dynamic or star segment, the regex fragment also includes
// a capture.
//
// A character specification contains:
//
// * `validChars`: a String with a list of all valid characters, or
// * `invalidChars`: a String with a list of all invalid characters
// * `repeat`: true if the character specification can repeat
export class StaticSegment {
    constructor(str, caseSensitive) {
        this.caseSensitive = caseSensitive;
        this.optional = false;
        this.name = str;
        this.string = str;
    }
    eachChar(callback) {
        const s = this.string;
        const len = s.length;
        let i = 0;
        let ch = '';
        if (this.caseSensitive) {
            for (; i < len; ++i) {
                ch = s.charAt(i);
                callback(new CharSpec(null, ch, false));
            }
        }
        else {
            for (; i < len; ++i) {
                ch = s.charAt(i);
                callback(new CharSpec(null, ch.toUpperCase() + ch.toLowerCase(), false));
            }
        }
    }
    regex() {
        return this.string.replace(escapeRegex, '\\$1');
    }
    generate(params, consumed) {
        return this.string;
    }
}
export class DynamicSegment {
    constructor(name, optional) {
        this.name = name;
        this.optional = optional;
    }
    eachChar(callback) {
        callback(new CharSpec('/', null, true));
    }
    regex() {
        return '([^/]+)';
    }
    generate(params, consumed) {
        consumed[this.name] = true;
        return params[this.name];
    }
}
export class StarSegment {
    constructor(name) {
        this.name = name;
        this.optional = false;
    }
    eachChar(callback) {
        callback(new CharSpec('', null, true));
    }
    regex() {
        return '(.+)';
    }
    generate(params, consumed) {
        consumed[this.name] = true;
        return params[this.name];
    }
}
export class EpsilonSegment {
    eachChar(callback) {
        return;
    }
    regex() {
        return '';
    }
    generate(params, consumed) {
        return '';
    }
}
/**
 * Class that parses route patterns and matches path strings.
 */
export class RouteRecognizer {
    constructor() {
        this.names = {};
        this.routes = new Map();
        this.rootState = new State();
    }
    /**
     * Parse a route pattern and add it to the collection of recognized routes.
     *
     * @param route - The route to add.
     */
    add(route) {
        if (Array.isArray(route)) {
            route.forEach(r => {
                this.add(r);
            });
            return;
        }
        let currentState = this.rootState;
        const skippableStates = [];
        let regex = '^';
        const types = new TypesRecord();
        const names = [];
        const routeName = route.handler.name;
        let isEmpty = true;
        let normalizedRoute = route.path;
        if (normalizedRoute.startsWith('/')) {
            normalizedRoute = normalizedRoute.slice(1);
        }
        const segments = [];
        const splitRoute = normalizedRoute.split('/');
        let part;
        let segment;
        for (let i = 0, ii = splitRoute.length; i < ii; ++i) {
            part = splitRoute[i];
            // Try to parse a parameter :param?
            let match = /^:([^?]+)(\?)?$/.exec(part);
            if (match) {
                const [, name, optional] = match;
                if (name.includes('=')) {
                    throw new Error(`Parameter ${name} in route ${route} has a default value, which is not supported.`);
                }
                segments.push(segment = new DynamicSegment(name, !!optional));
                names.push(name);
                types.dynamics++;
            }
            else {
                // Try to parse a star segment *whatever
                match = /^\*(.+)$/.exec(part);
                if (match) {
                    segments.push(segment = new StarSegment(match[1]));
                    names.push(match[1]);
                    types.stars++;
                }
                else if (part === '') {
                    segments.push(new EpsilonSegment());
                    continue;
                }
                else {
                    segments.push(segment = new StaticSegment(part, route.caseSensitive === true));
                    types.statics++;
                }
            }
            // Add a representation of the segment to the NFA and regex
            const firstState = currentState.put(new CharSpec(null, '/', false));
            let nextState = firstState;
            segment.eachChar(ch => {
                nextState = nextState.put(ch);
            });
            // add the first part of the next segment to the end of any skipped states
            for (let j = 0, jj = skippableStates.length; j < jj; j++) {
                skippableStates[j].nextStates.push(firstState);
            }
            // If the segment was optional we don't fast forward to the end of the
            // segment, but we do hold on to a reference to the end of the segment
            // for adding future segments. Multiple consecutive optional segments
            // will accumulate.
            if (segment.optional) {
                skippableStates.push(nextState);
                regex += `(?:/${segment.regex()})?`;
                // Otherwise, we fast forward to the end of the segment and remove any
                // references to skipped segments since we don't need them anymore.
            }
            else {
                currentState = nextState;
                regex += `/${segment.regex()}`;
                skippableStates.length = 0;
                isEmpty = false;
            }
        }
        // An "all optional" path is technically empty since currentState is this.rootState
        if (isEmpty) {
            currentState = currentState.put(new CharSpec(null, '/', false));
            regex += '/?';
        }
        const handlers = [new HandlerEntry(route.handler, names)];
        this.routes.set(route.handler, new RouteGenerator(segments, handlers));
        if (routeName) {
            const routeNames = Array.isArray(routeName) ? routeName : [routeName];
            for (let i = 0; i < routeNames.length; i++) {
                if (!(routeNames[i] in this.names)) {
                    this.names[routeNames[i]] = new RouteGenerator(segments, handlers);
                }
            }
        }
        // Any trailing skipped states need to be endpoints and need to have
        // handlers attached.
        for (let i = 0; i < skippableStates.length; i++) {
            const state = skippableStates[i];
            state.handlers = handlers;
            state.regex = new RegExp(`${regex}$`, route.caseSensitive ? '' : 'i');
            state.types = types;
        }
        currentState.handlers = handlers;
        currentState.regex = new RegExp(`${regex}$`, route.caseSensitive ? '' : 'i');
        currentState.types = types;
        return currentState;
    }
    /**
     * Retrieve a RouteGenerator for a route by name or RouteConfig (RouteHandler).
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @returns The RouteGenerator for that route.
     */
    getRoute(nameOrRoute) {
        return typeof nameOrRoute === 'string' ? this.names[nameOrRoute] : this.routes.get(nameOrRoute);
    }
    /**
     * Retrieve the handlers registered for the route by name or RouteConfig (RouteHandler).
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @returns The handlers.
     */
    handlersFor(nameOrRoute) {
        const route = this.getRoute(nameOrRoute);
        if (!route) {
            throw new Error(`There is no route named ${nameOrRoute}`);
        }
        return [...route.handlers];
    }
    /**
     * Check if this RouteRecognizer recognizes a route by name or RouteConfig (RouteHandler).
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @returns True if the named route is recognized.
     */
    hasRoute(nameOrRoute) {
        return !!this.getRoute(nameOrRoute);
    }
    /**
     * Generate a path and query string from a route name or RouteConfig (RouteHandler) and params object.
     *
     * @param nameOrRoute - The name of the route or RouteConfig object.
     * @param params - The route params to use when populating the pattern.
     * Properties not required by the pattern will be appended to the query string.
     * @returns The generated absolute path and query string.
     */
    generate(nameOrRoute, params) {
        const route = this.getRoute(nameOrRoute);
        if (!route) {
            throw new Error(`There is no route named ${nameOrRoute}`);
        }
        const handler = route.handlers[0].handler;
        if (handler.generationUsesHref) {
            return handler.href;
        }
        const routeParams = { ...params };
        const segments = route.segments;
        const consumed = {};
        let output = '';
        for (let i = 0, l = segments.length; i < l; i++) {
            const segment = segments[i];
            if (segment instanceof EpsilonSegment) {
                continue;
            }
            const segmentValue = segment.generate(routeParams, consumed);
            if (segmentValue == null) {
                if (!segment.optional) {
                    throw new Error(`A value is required for route parameter '${segment.name}' in route '${nameOrRoute}'.`);
                }
            }
            else {
                output += '/';
                output += segmentValue;
            }
        }
        if (!output.startsWith('/')) {
            output = `/${output}`;
        }
        // remove params used in the path and add the rest to the querystring
        for (const param in consumed) {
            Reflect.deleteProperty(routeParams, param);
        }
        const queryString = buildQueryString(routeParams);
        output += queryString ? `?${queryString}` : '';
        return output;
    }
    /**
     * Match a path string against registered route patterns.
     *
     * @param path - The path to attempt to match.
     * @returns Array of objects containing `handler`, `params`, and
     * `isDynamic` values for the matched route(s), or undefined if no match
     * was found.
     */
    recognize(path) {
        let states = [this.rootState];
        let queryParams = {};
        let isSlashDropped = false;
        let normalizedPath = path;
        const queryStart = normalizedPath.indexOf('?');
        if (queryStart !== -1) {
            const queryString = normalizedPath.slice(queryStart + 1);
            normalizedPath = normalizedPath.slice(0, queryStart);
            queryParams = parseQueryString(queryString);
        }
        normalizedPath = decodeURI(normalizedPath);
        if (!normalizedPath.startsWith('/')) {
            normalizedPath = `/${normalizedPath}`;
        }
        let pathLen = normalizedPath.length;
        if (pathLen > 1 && normalizedPath.charAt(pathLen - 1) === '/') {
            normalizedPath = normalizedPath.slice(0, -1);
            isSlashDropped = true;
            --pathLen;
        }
        for (let i = 0; i < pathLen; ++i) {
            const nextStates = [];
            const ch = normalizedPath.charAt(i);
            states.forEach(state => {
                state.nextStates.forEach(nextState => {
                    if (nextState.charSpec.validChars !== null) {
                        if (nextState.charSpec.validChars.includes(ch)) {
                            nextStates.push(nextState);
                        }
                    }
                    else if (nextState.charSpec.invalidChars !== null
                        && !nextState.charSpec.invalidChars.includes(ch)) {
                        nextStates.push(nextState);
                    }
                });
            });
            states = nextStates;
            if (states.length === 0) {
                break;
            }
        }
        const solutions = [];
        for (let i = 0, l = states.length; i < l; i++) {
            if (states[i].handlers) {
                solutions.push(states[i]);
            }
        }
        // This is a somewhat naive strategy, but should work in a lot of cases
        // A better strategy would properly resolve /posts/:id/new and /posts/edit/:id.
        //
        // This strategy generally prefers more static and less dynamic matching.
        // Specifically, it
        //
        //  * prefers fewer stars to more, then
        //  * prefers using stars for less of the match to more, then
        //  * prefers fewer dynamic segments to more, then
        //  * prefers more static segments to more
        solutions.sort((a, b) => {
            if (a.types.stars !== b.types.stars) {
                return a.types.stars - b.types.stars;
            }
            if (a.types.stars) {
                if (a.types.statics !== b.types.statics) {
                    return b.types.statics - a.types.statics;
                }
                if (a.types.dynamics !== b.types.dynamics) {
                    return b.types.dynamics - a.types.dynamics;
                }
            }
            if (a.types.dynamics !== b.types.dynamics) {
                return a.types.dynamics - b.types.dynamics;
            }
            if (a.types.statics !== b.types.statics) {
                return b.types.statics - a.types.statics;
            }
            return 0;
        });
        const solution = solutions[0];
        if (solution && solution.handlers) {
            // if a trailing slash was dropped and a star segment is the last segment
            // specified, put the trailing slash back
            if (isSlashDropped && solution.regex.source.endsWith('(.+)$')) {
                normalizedPath = `${normalizedPath}/`;
            }
            // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
            const captures = normalizedPath.match(solution.regex);
            let currentCapture = 1;
            const result = [];
            result.queryParams = queryParams;
            solution.handlers.forEach(handler => {
                const params = {};
                handler.names.forEach(name => {
                    params[name] = captures[currentCapture++];
                });
                result.push(new RecognizeResult(handler.handler, params, handler.names.length > 0));
            });
            return result;
        }
        return void 0;
    }
}
//# sourceMappingURL=route-recognizer.js.map