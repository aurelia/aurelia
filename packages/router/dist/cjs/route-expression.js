"use strict";
// The commented-out terminal symbols below are for reference / potential future need (should there be use cases to loosen up the syntax)
// These symbols are basically the minimum necessary terminals.
// const viewportTerminal = ['?', '#', '/', '+', ')', '!'];
// const actionTerminal = [...componentTerminal, '@', '('];
// const componentTerminal = [...actionTerminal, '.'];
// const paramTerminal = ['=', ',', ')'];
Object.defineProperty(exports, "__esModule", { value: true });
exports.AST = exports.ParameterExpression = exports.ParameterListExpression = exports.ViewportExpression = exports.ActionExpression = exports.ComponentExpression = exports.SegmentExpression = exports.SegmentGroupExpression = exports.ScopedSegmentExpression = exports.CompositeSegmentExpression = exports.RouteExpression = exports.ExpressionKind = void 0;
const instructions_js_1 = require("./instructions.js");
// These are the currently used terminal symbols.
// We're deliberately having every "special" (including the not-in-use '&', ''', '~', ';') as a terminal symbol,
// so as to make the syntax maximally restrictive for consistency and to minimize the risk of us having to introduce breaking changes in the future.
const terminal = ['?', '#', '/', '+', '(', ')', '.', '@', '!', '=', ',', '&', '\'', '~', ';'];
class ParserState {
    constructor(input) {
        this.input = input;
        this.buffers = [];
        this.bufferIndex = 0;
        this.index = 0;
        this.rest = input;
    }
    get done() {
        return this.rest.length === 0;
    }
    startsWith(...values) {
        const rest = this.rest;
        return values.some(function (value) {
            return rest.startsWith(value);
        });
    }
    consumeOptional(str) {
        if (this.startsWith(str)) {
            this.rest = this.rest.slice(str.length);
            this.index += str.length;
            this.append(str);
            return true;
        }
        return false;
    }
    consume(str) {
        if (!this.consumeOptional(str)) {
            this.expect(`'${str}'`);
        }
    }
    expect(msg) {
        throw new Error(`Expected ${msg} at index ${this.index} of '${this.input}', but got: '${this.rest}' (rest='${this.rest}')`);
    }
    ensureDone() {
        if (!this.done) {
            throw new Error(`Unexpected '${this.rest}' at index ${this.index} of '${this.input}'`);
        }
    }
    advance() {
        const char = this.rest[0];
        this.rest = this.rest.slice(1);
        ++this.index;
        this.append(char);
    }
    record() {
        this.buffers[this.bufferIndex++] = '';
    }
    playback() {
        const bufferIndex = --this.bufferIndex;
        const buffers = this.buffers;
        const buffer = buffers[bufferIndex];
        buffers[bufferIndex] = '';
        return buffer;
    }
    discard() {
        this.buffers[--this.bufferIndex] = '';
    }
    append(str) {
        const bufferIndex = this.bufferIndex;
        const buffers = this.buffers;
        for (let i = 0; i < bufferIndex; ++i) {
            buffers[i] += str;
        }
    }
}
var ExpressionKind;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["Route"] = 0] = "Route";
    ExpressionKind[ExpressionKind["CompositeSegment"] = 1] = "CompositeSegment";
    ExpressionKind[ExpressionKind["ScopedSegment"] = 2] = "ScopedSegment";
    ExpressionKind[ExpressionKind["SegmentGroup"] = 3] = "SegmentGroup";
    ExpressionKind[ExpressionKind["Segment"] = 4] = "Segment";
    ExpressionKind[ExpressionKind["Component"] = 5] = "Component";
    ExpressionKind[ExpressionKind["Action"] = 6] = "Action";
    ExpressionKind[ExpressionKind["Viewport"] = 7] = "Viewport";
    ExpressionKind[ExpressionKind["ParameterList"] = 8] = "ParameterList";
    ExpressionKind[ExpressionKind["Parameter"] = 9] = "Parameter";
})(ExpressionKind = exports.ExpressionKind || (exports.ExpressionKind = {}));
const fragmentRouteExpressionCache = new Map();
const routeExpressionCache = new Map();
class RouteExpression {
    constructor(raw, isAbsolute, root, queryParams, fragment, fragmentIsRoute) {
        this.raw = raw;
        this.isAbsolute = isAbsolute;
        this.root = root;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.fragmentIsRoute = fragmentIsRoute;
    }
    get kind() { return 0 /* Route */; }
    static parse(path, fragmentIsRoute) {
        const cache = fragmentIsRoute ? fragmentRouteExpressionCache : routeExpressionCache;
        let result = cache.get(path);
        if (result === void 0) {
            cache.set(path, result = RouteExpression.$parse(path, fragmentIsRoute));
        }
        return result;
    }
    static $parse(path, fragmentIsRoute) {
        // First strip off the fragment (and if fragment should be used as route, set it as the path)
        let fragment;
        const fragmentStart = path.indexOf('#');
        if (fragmentStart >= 0) {
            const rawFragment = path.slice(fragmentStart + 1);
            fragment = decodeURIComponent(rawFragment);
            if (fragmentIsRoute) {
                path = fragment;
            }
            else {
                path = path.slice(0, fragmentStart);
            }
        }
        else {
            if (fragmentIsRoute) {
                path = '';
            }
            fragment = null;
        }
        // Strip off and parse the query string using built-in URLSearchParams.
        const queryParams = {};
        const queryStart = path.indexOf('?');
        if (queryStart >= 0) {
            const queryString = path.slice(queryStart + 1);
            path = path.slice(0, queryStart);
            const searchParams = new URLSearchParams(queryString);
            searchParams.forEach(function (value, key) {
                queryParams[key] = value;
            });
        }
        Object.freeze(queryParams);
        if (path === '') {
            return new RouteExpression('', false, SegmentExpression.EMPTY, queryParams, fragment, fragmentIsRoute);
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
        state.record();
        const isAbsolute = state.consumeOptional('/');
        const root = CompositeSegmentExpression.parse(state);
        state.ensureDone();
        const raw = state.playback();
        return new RouteExpression(raw, isAbsolute, root, queryParams, fragment, fragmentIsRoute);
    }
    toInstructionTree(options) {
        return new instructions_js_1.ViewportInstructionTree(options, this.isAbsolute, this.root.toInstructions(options.append), this.queryParams, this.fragment);
    }
    toString() {
        return this.raw;
    }
}
exports.RouteExpression = RouteExpression;
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
    constructor(raw, siblings, append) {
        this.raw = raw;
        this.siblings = siblings;
        this.append = append;
    }
    get kind() { return 1 /* CompositeSegment */; }
    static parse(state) {
        state.record();
        // If a segment starts with '+', e.g. '/+a' / '/+a@vp' / '/a/+b' / '/+a+b' etc, then its siblings
        // are considered to be "append"
        const append = state.consumeOptional('+');
        const siblings = [];
        do {
            siblings.push(ScopedSegmentExpression.parse(state));
        } while (state.consumeOptional('+'));
        if (!append && siblings.length === 1) {
            state.discard();
            return siblings[0];
        }
        const raw = state.playback();
        return new CompositeSegmentExpression(raw, siblings, append);
    }
    toInstructions(append) {
        return this.siblings.flatMap(function (x) {
            return x.toInstructions(append);
        });
    }
    toString() {
        return this.raw;
    }
}
exports.CompositeSegmentExpression = CompositeSegmentExpression;
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
    constructor(raw, left, right) {
        this.raw = raw;
        this.left = left;
        this.right = right;
    }
    get kind() { return 2 /* ScopedSegment */; }
    static parse(state) {
        state.record();
        const left = SegmentGroupExpression.parse(state);
        if (state.consumeOptional('/')) {
            const right = ScopedSegmentExpression.parse(state);
            const raw = state.playback();
            return new ScopedSegmentExpression(raw, left, right);
        }
        state.discard();
        return left;
    }
    toInstructions(append) {
        const leftInstructions = this.left.toInstructions(append);
        const rightInstructions = this.right.toInstructions(false);
        leftInstructions[leftInstructions.length - 1].children.unshift(...rightInstructions);
        return leftInstructions;
    }
    toString() {
        return this.raw;
    }
}
exports.ScopedSegmentExpression = ScopedSegmentExpression;
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
    constructor(raw, expression) {
        this.raw = raw;
        this.expression = expression;
    }
    get kind() { return 3 /* SegmentGroup */; }
    static parse(state) {
        state.record();
        if (state.consumeOptional('(')) {
            const expression = CompositeSegmentExpression.parse(state);
            state.consume(')');
            const raw = state.playback();
            return new SegmentGroupExpression(raw, expression);
        }
        state.discard();
        return SegmentExpression.parse(state);
    }
    toInstructions(append) {
        return this.expression.toInstructions(append);
    }
    toString() {
        return this.raw;
    }
}
exports.SegmentGroupExpression = SegmentGroupExpression;
/**
 * A (non-composite) segment specifying a single component and (optional) viewport / action.
 */
class SegmentExpression {
    constructor(raw, component, action, viewport, scoped) {
        this.raw = raw;
        this.component = component;
        this.action = action;
        this.viewport = viewport;
        this.scoped = scoped;
    }
    get kind() { return 4 /* Segment */; }
    static get EMPTY() { return new SegmentExpression('', ComponentExpression.EMPTY, ActionExpression.EMPTY, ViewportExpression.EMPTY, true); }
    static parse(state) {
        state.record();
        const component = ComponentExpression.parse(state);
        const action = ActionExpression.parse(state);
        const viewport = ViewportExpression.parse(state);
        const scoped = !state.consumeOptional('!');
        const raw = state.playback();
        return new SegmentExpression(raw, component, action, viewport, scoped);
    }
    toInstructions(append) {
        return [
            instructions_js_1.ViewportInstruction.create({
                component: this.component.name,
                params: this.component.parameterList.toObject(),
                viewport: this.viewport.name,
                append,
            }),
        ];
    }
    toString() {
        return this.raw;
    }
}
exports.SegmentExpression = SegmentExpression;
class ComponentExpression {
    constructor(raw, name, parameterList) {
        this.raw = raw;
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
    get kind() { return 5 /* Component */; }
    static get EMPTY() { return new ComponentExpression('', '', ParameterListExpression.EMPTY); }
    static parse(state) {
        state.record();
        state.record();
        if (!state.done) {
            if (state.startsWith('./')) {
                state.advance();
            }
            else if (state.startsWith('../')) {
                state.advance();
                state.advance();
            }
            else {
                while (!state.done && !state.startsWith(...terminal)) {
                    state.advance();
                }
            }
        }
        const name = decodeURIComponent(state.playback());
        if (name.length === 0) {
            state.expect('component name');
        }
        const parameterList = ParameterListExpression.parse(state);
        const raw = state.playback();
        return new ComponentExpression(raw, name, parameterList);
    }
    toString() {
        return this.raw;
    }
}
exports.ComponentExpression = ComponentExpression;
class ActionExpression {
    constructor(raw, name, parameterList) {
        this.raw = raw;
        this.name = name;
        this.parameterList = parameterList;
    }
    get kind() { return 6 /* Action */; }
    static get EMPTY() { return new ActionExpression('', '', ParameterListExpression.EMPTY); }
    static parse(state) {
        state.record();
        let name = '';
        if (state.consumeOptional('.')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            name = decodeURIComponent(state.playback());
            if (name.length === 0) {
                state.expect('method name');
            }
        }
        const parameterList = ParameterListExpression.parse(state);
        const raw = state.playback();
        return new ActionExpression(raw, name, parameterList);
    }
    toString() {
        return this.raw;
    }
}
exports.ActionExpression = ActionExpression;
class ViewportExpression {
    constructor(raw, name) {
        this.raw = raw;
        this.name = name;
    }
    get kind() { return 7 /* Viewport */; }
    static get EMPTY() { return new ViewportExpression('', ''); }
    static parse(state) {
        state.record();
        let name = '';
        if (state.consumeOptional('@')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            name = decodeURIComponent(state.playback());
            if (name.length === 0) {
                state.expect('viewport name');
            }
        }
        const raw = state.playback();
        return new ViewportExpression(raw, name);
    }
    toString() {
        return this.raw;
    }
}
exports.ViewportExpression = ViewportExpression;
class ParameterListExpression {
    constructor(raw, expressions) {
        this.raw = raw;
        this.expressions = expressions;
    }
    get kind() { return 8 /* ParameterList */; }
    static get EMPTY() { return new ParameterListExpression('', []); }
    static parse(state) {
        state.record();
        const expressions = [];
        if (state.consumeOptional('(')) {
            do {
                expressions.push(ParameterExpression.parse(state, expressions.length));
                if (!state.consumeOptional(',')) {
                    break;
                }
            } while (!state.done && !state.startsWith(')'));
            state.consume(')');
        }
        const raw = state.playback();
        return new ParameterListExpression(raw, expressions);
    }
    toObject() {
        return {}; // TODO
    }
    toString() {
        return this.raw;
    }
}
exports.ParameterListExpression = ParameterListExpression;
class ParameterExpression {
    constructor(raw, key, value) {
        this.raw = raw;
        this.key = key;
        this.value = value;
    }
    get kind() { return 9 /* Parameter */; }
    static get EMPTY() { return new ParameterExpression('', '', ''); }
    static parse(state, index) {
        state.record();
        state.record();
        while (!state.done && !state.startsWith(...terminal)) {
            state.advance();
        }
        let key = decodeURIComponent(state.playback());
        if (key.length === 0) {
            state.expect('parameter key');
        }
        let value;
        if (state.consumeOptional('=')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            value = decodeURIComponent(state.playback());
            if (value.length === 0) {
                state.expect('parameter value');
            }
        }
        else {
            value = key;
            key = index.toString();
        }
        const raw = state.playback();
        return new ParameterExpression(raw, key, value);
    }
    toString() {
        return this.raw;
    }
}
exports.ParameterExpression = ParameterExpression;
exports.AST = Object.freeze({
    RouteExpression,
    CompositeSegmentExpression,
    ScopedSegmentExpression,
    SegmentGroupExpression,
    SegmentExpression,
    ComponentExpression,
    ActionExpression,
    ViewportExpression,
    ParameterListExpression,
    ParameterExpression,
});
//# sourceMappingURL=route-expression.js.map