class Parameter {
    constructor(t, s, e, i) {
        this.name = t;
        this.isOptional = s;
        this.isStar = e;
        this.pattern = i;
    }
    satisfiesPattern(t) {
        if (this.pattern === null) return true;
        this.pattern.lastIndex = 0;
        return this.pattern.test(t);
    }
}

class ConfigurableRoute {
    constructor(t, s, e) {
        this.path = t;
        this.caseSensitive = s;
        this.handler = e;
    }
}

class Endpoint {
    get residualEndpoint() {
        return this.t;
    }
    set residualEndpoint(t) {
        if (this.t !== null) throw new Error("Residual endpoint is already set");
        this.t = t;
    }
    constructor(t, s) {
        this.route = t;
        this.params = s;
        this.t = null;
    }
    equalsOrResidual(t) {
        return t != null && this === t || this.t === t;
    }
}

class RecognizedRoute {
    constructor(t, s) {
        this.endpoint = t;
        const e = Object.create(null);
        for (const t in s) {
            const i = s[t];
            e[t] = i != null ? decodeURIComponent(i) : i;
        }
        this.params = Object.freeze(e);
    }
}

class Candidate {
    constructor(t, s, e, i) {
        this.chars = t;
        this.states = s;
        this.skippedStates = e;
        this.result = i;
        this.params = null;
        this.isConstrained = false;
        this.satisfiesConstraints = null;
        this.head = s[s.length - 1];
        this.endpoint = this.head?.endpoint;
    }
    advance(t) {
        const {chars: s, states: e, skippedStates: i, result: n} = this;
        let r = null;
        let o = 0;
        const l = e[e.length - 1];
        function $process(a, u) {
            if (a.isMatch(t)) {
                if (++o === 1) {
                    r = a;
                } else {
                    n.add(new Candidate(s.concat(t), e.concat(a), u === null ? i : i.concat(u), n));
                }
            }
            if (l.segment === null && a.isOptional && a.nextStates !== null) {
                if (a.nextStates.length > 1) {
                    throw createError(`${a.nextStates.length} nextStates`);
                }
                const t = a.nextStates[0];
                if (!t.isSeparator) {
                    throw createError(`Not a separator`);
                }
                if (t.nextStates !== null) {
                    for (const s of t.nextStates) {
                        $process(s, a);
                    }
                }
            }
        }
        if (l.isDynamic) {
            $process(l, null);
        }
        if (l.nextStates !== null) {
            for (const t of l.nextStates) {
                $process(t, null);
            }
        }
        if (r !== null) {
            e.push(this.head = r);
            s.push(t);
            this.isConstrained = this.isConstrained || r.isDynamic && r.segment.isConstrained;
            if (r.endpoint !== null) {
                this.endpoint = r.endpoint;
            }
        }
        if (o === 0) {
            n.remove(this);
        }
    }
    i() {
        function collectSkippedStates(t, s) {
            const e = s.nextStates;
            if (e !== null) {
                if (e.length === 1 && e[0].segment === null) {
                    collectSkippedStates(t, e[0]);
                } else {
                    for (const s of e) {
                        if (s.isOptional && s.endpoint !== null) {
                            t.push(s);
                            if (s.nextStates !== null) {
                                for (const e of s.nextStates) {
                                    collectSkippedStates(t, e);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
        collectSkippedStates(this.skippedStates, this.head);
        if (!this.isConstrained) return true;
        this.u();
        return this.satisfiesConstraints;
    }
    u() {
        let t = this.params;
        if (t != null) return t;
        const {states: s, chars: e, endpoint: i} = this;
        t = {};
        this.satisfiesConstraints = true;
        for (const s of i.params) {
            t[s.name] = void 0;
        }
        for (let i = 0, n = s.length; i < n; ++i) {
            const n = s[i];
            if (n.isDynamic) {
                const r = n.segment;
                const o = r.name;
                if (t[o] === void 0) {
                    t[o] = e[i];
                } else {
                    t[o] += e[i];
                }
                const l = n.isConstrained && !Object.is(s[i + 1]?.segment, r);
                if (!l) continue;
                this.satisfiesConstraints = this.satisfiesConstraints && n.satisfiesConstraint(t[o]);
            }
        }
        if (this.satisfiesConstraints) {
            this.params = t;
        }
        return t;
    }
    compareTo(t) {
        const s = this.states;
        const e = t.states;
        for (let t = 0, i = 0, n = Math.max(s.length, e.length); t < n; ++t) {
            let n = s[t];
            if (n === void 0) {
                return 1;
            }
            let r = e[i];
            if (r === void 0) {
                return -1;
            }
            let o = n.segment;
            let l = r.segment;
            if (o === null) {
                if (l === null) {
                    ++i;
                    continue;
                }
                if ((n = s[++t]) === void 0) {
                    return 1;
                }
                o = n.segment;
            } else if (l === null) {
                if ((r = e[++i]) === void 0) {
                    return -1;
                }
                l = r.segment;
            }
            if (o.kind < l.kind) {
                return 1;
            }
            if (o.kind > l.kind) {
                return -1;
            }
            ++i;
        }
        const i = this.skippedStates;
        const n = t.skippedStates;
        const r = i.length;
        const o = n.length;
        if (r < o) {
            return 1;
        }
        if (r > o) {
            return -1;
        }
        for (let t = 0; t < r; ++t) {
            const s = i[t];
            const e = n[t];
            if (s.length < e.length) {
                return 1;
            }
            if (s.length > e.length) {
                return -1;
            }
        }
        return 0;
    }
}

function hasEndpoint(t) {
    return t.head.endpoint !== null;
}

function compareChains(t, s) {
    return t.compareTo(s);
}

class RecognizeResult {
    get isEmpty() {
        return this.candidates.length === 0;
    }
    constructor(t) {
        this.candidates = [];
        this.candidates = [ new Candidate([ "" ], [ t ], [], this) ];
    }
    getSolution() {
        const t = this.candidates.filter((t => hasEndpoint(t) && t.i()));
        if (t.length === 0) {
            return null;
        }
        t.sort(compareChains);
        return t[0];
    }
    add(t) {
        this.candidates.push(t);
    }
    remove(t) {
        this.candidates.splice(this.candidates.indexOf(t), 1);
    }
    advance(t) {
        const s = this.candidates.slice();
        for (const e of s) {
            e.advance(t);
        }
    }
}

const t = "$$residue";

const s = /^:(?<name>[^?\s{}]+)(?:\{\{(?<constraint>.+)\}\})?(?<optional>\?)?$/g;

class RouteRecognizer {
    constructor() {
        this.rootState = new State(null, null, "");
        this.cache = new Map;
        this.endpointLookup = new Map;
    }
    add(s, e = false) {
        let i;
        let n;
        if (s instanceof Array) {
            for (const r of s) {
                n = this.$add(r, false);
                i = n.params;
                if (!e || (i[i.length - 1]?.isStar ?? false)) continue;
                n.residualEndpoint = this.$add({
                    ...r,
                    path: `${r.path}/*${t}`
                }, true);
            }
        } else {
            n = this.$add(s, false);
            i = n.params;
            if (e && !(i[i.length - 1]?.isStar ?? false)) {
                n.residualEndpoint = this.$add({
                    ...s,
                    path: `${s.path}/*${t}`
                }, true);
            }
        }
        this.cache.clear();
    }
    $add(e, i) {
        const n = e.path;
        const r = this.endpointLookup;
        if (r.has(n)) throw createError(`Cannot add duplicate path '${n}'.`);
        const o = new ConfigurableRoute(n, e.caseSensitive === true, e.handler);
        const l = n === "" ? [ "" ] : n.split("/").filter(isNotEmpty);
        const a = [];
        let u = this.rootState;
        for (const e of l) {
            u = u.append(null, "/");
            switch (e.charAt(0)) {
              case ":":
                {
                    s.lastIndex = 0;
                    const i = s.exec(e);
                    const {name: n, optional: r} = i?.groups ?? {};
                    const o = r === "?";
                    if (n === t) throw new Error(`Invalid parameter name; usage of the reserved parameter name '${t}' is used.`);
                    const l = i?.groups?.constraint;
                    const h = l != null ? new RegExp(l) : null;
                    a.push(new Parameter(n, o, false, h));
                    u = new DynamicSegment(n, o, h).appendTo(u);
                    break;
                }

              case "*":
                {
                    const s = e.slice(1);
                    let n;
                    if (s === t) {
                        if (!i) throw new Error(`Invalid parameter name; usage of the reserved parameter name '${t}' is used.`);
                        n = 1;
                    } else {
                        n = 2;
                    }
                    a.push(new Parameter(s, true, true, null));
                    u = new StarSegment(s, n).appendTo(u);
                    break;
                }

              default:
                {
                    u = new StaticSegment(e, o.caseSensitive).appendTo(u);
                    break;
                }
            }
        }
        const h = new Endpoint(o, a);
        u.setEndpoint(h);
        r.set(n, h);
        return h;
    }
    recognize(t) {
        let s = this.cache.get(t);
        if (s === void 0) {
            this.cache.set(t, s = this.$recognize(t));
        }
        return s;
    }
    $recognize(t) {
        if (!t.startsWith("/")) {
            t = `/${t}`;
        }
        if (t.length > 1 && t.endsWith("/")) {
            t = t.slice(0, -1);
        }
        const s = new RecognizeResult(this.rootState);
        for (let e = 0, i = t.length; e < i; ++e) {
            const i = t.charAt(e);
            s.advance(i);
            if (s.isEmpty) {
                return null;
            }
        }
        const e = s.getSolution();
        if (e === null) {
            return null;
        }
        const {endpoint: i} = e;
        const n = e.u();
        return new RecognizedRoute(i, n);
    }
    getEndpoint(t) {
        return this.endpointLookup.get(t) ?? null;
    }
}

class State {
    constructor(t, s, e) {
        this.prevState = t;
        this.segment = s;
        this.value = e;
        this.nextStates = null;
        this.endpoint = null;
        this.isConstrained = false;
        switch (s?.kind) {
          case 3:
            this.length = t.length + 1;
            this.isSeparator = false;
            this.isDynamic = true;
            this.isOptional = s.optional;
            this.isConstrained = s.isConstrained;
            break;

          case 2:
          case 1:
            this.length = t.length + 1;
            this.isSeparator = false;
            this.isDynamic = true;
            this.isOptional = false;
            break;

          case 4:
            this.length = t.length + 1;
            this.isSeparator = false;
            this.isDynamic = false;
            this.isOptional = false;
            break;

          case undefined:
            this.length = t === null ? 0 : t.length;
            this.isSeparator = true;
            this.isDynamic = false;
            this.isOptional = false;
            break;
        }
    }
    append(t, s) {
        let e;
        let i = this.nextStates;
        if (i === null) {
            e = void 0;
            i = this.nextStates = [];
        } else if (t === null) {
            e = i.find((t => t.value === s));
        } else {
            e = i.find((s => s.segment?.equals(t)));
        }
        if (e === void 0) {
            i.push(e = new State(this, t, s));
        }
        return e;
    }
    setEndpoint(t) {
        if (this.endpoint !== null) {
            throw createError(`Cannot add ambiguous route. The pattern '${t.route.path}' clashes with '${this.endpoint.route.path}'`);
        }
        this.endpoint = t;
        if (this.isOptional) {
            this.prevState.setEndpoint(t);
            if (this.prevState.isSeparator && this.prevState.prevState !== null) {
                this.prevState.prevState.setEndpoint(t);
            }
        }
    }
    isMatch(t) {
        const s = this.segment;
        switch (s?.kind) {
          case 3:
            return !this.value.includes(t);

          case 2:
          case 1:
            return true;

          case 4:
          case undefined:
            return this.value.includes(t);
        }
    }
    satisfiesConstraint(t) {
        return this.isConstrained ? this.segment.satisfiesPattern(t) : true;
    }
}

function isNotEmpty(t) {
    return t.length > 0;
}

class StaticSegment {
    get kind() {
        return 4;
    }
    constructor(t, s) {
        this.value = t;
        this.caseSensitive = s;
    }
    appendTo(t) {
        const {value: s, value: {length: e}} = this;
        if (this.caseSensitive) {
            for (let i = 0; i < e; ++i) {
                t = t.append(this, s.charAt(i));
            }
        } else {
            for (let i = 0; i < e; ++i) {
                const e = s.charAt(i);
                t = t.append(this, e.toUpperCase() + e.toLowerCase());
            }
        }
        return t;
    }
    equals(t) {
        return t.kind === 4 && t.caseSensitive === this.caseSensitive && t.value === this.value;
    }
}

class DynamicSegment {
    get kind() {
        return 3;
    }
    constructor(t, s, e) {
        this.name = t;
        this.optional = s;
        this.pattern = e;
        if (e === void 0) throw new Error(`Pattern is undefined`);
        this.isConstrained = e !== null;
    }
    appendTo(t) {
        t = t.append(this, "/");
        return t;
    }
    equals(t) {
        return t.kind === 3 && t.optional === this.optional && t.name === this.name;
    }
    satisfiesPattern(t) {
        if (this.pattern === null) return true;
        this.pattern.lastIndex = 0;
        return this.pattern.test(t);
    }
}

class StarSegment {
    constructor(t, s) {
        this.name = t;
        this.kind = s;
    }
    appendTo(t) {
        t = t.append(this, "");
        return t;
    }
    equals(t) {
        return (t.kind === 2 || t.kind === 1) && t.name === this.name;
    }
}

const createError = t => new Error(t);

export { ConfigurableRoute, Endpoint, Parameter, t as RESIDUE, RecognizedRoute, RouteRecognizer };

