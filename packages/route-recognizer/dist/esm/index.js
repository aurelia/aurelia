class ConfigurableRoute {
    constructor(t, s, n) {
        this.path = t;
        this.caseSensitive = s;
        this.handler = n;
    }
}

class Endpoint {
    constructor(t, s) {
        this.route = t;
        this.paramNames = s;
    }
}

class RecognizedRoute {
    constructor(t, s) {
        this.endpoint = t;
        this.params = s;
    }
}

class Candidate {
    constructor(t, s, n, e) {
        var i;
        this.chars = t;
        this.states = s;
        this.skippedStates = n;
        this.result = e;
        this.head = s[s.length - 1];
        this.endpoint = null === (i = this.head) || void 0 === i ? void 0 : i.endpoint;
    }
    advance(t) {
        const {chars: s, states: n, skippedStates: e, result: i} = this;
        let o = null;
        let r = 0;
        const l = n[n.length - 1];
        function u(c, h) {
            if (c.isMatch(t)) if (1 === ++r) o = c; else i.add(new Candidate(s.concat(t), n.concat(c), null === h ? e : e.concat(h), i));
            if (null === l.segment && c.isOptional && null !== c.nextStates) {
                if (c.nextStates.length > 1) throw new Error(`${c.nextStates.length} nextStates`);
                const t = c.nextStates[0];
                if (!t.isSeparator) throw new Error(`Not a separator`);
                if (null !== t.nextStates) for (const s of t.nextStates) u(s, c);
            }
        }
        if (l.isDynamic) u(l, null);
        if (null !== l.nextStates) for (const t of l.nextStates) u(t, null);
        if (null !== o) {
            n.push(this.head = o);
            s.push(t);
            if (null !== o.endpoint) this.endpoint = o.endpoint;
        }
        if (0 === r) i.remove(this);
    }
    finalize() {
        function t(s, n) {
            const e = n.nextStates;
            if (null !== e) if (1 === e.length && null === e[0].segment) t(s, e[0]); else for (const n of e) if (n.isOptional && null !== n.endpoint) {
                s.push(n);
                if (null !== n.nextStates) for (const e of n.nextStates) t(s, e);
                break;
            }
        }
        t(this.skippedStates, this.head);
    }
    getParams() {
        const {states: t, chars: s, endpoint: n} = this;
        const e = {};
        for (const t of n.paramNames) e[t] = void 0;
        for (let n = 0, i = t.length; n < i; ++n) {
            const i = t[n];
            if (i.isDynamic) {
                const t = i.segment.name;
                if (void 0 === e[t]) e[t] = s[n]; else e[t] += s[n];
            }
        }
        return e;
    }
    compareTo(t) {
        const s = this.states;
        const n = t.states;
        for (let t = 0, e = 0, i = Math.max(s.length, n.length); t < i; ++t) {
            let i = s[t];
            if (void 0 === i) return 1;
            let o = n[e];
            if (void 0 === o) return -1;
            let r = i.segment;
            let l = o.segment;
            if (null === r) {
                if (null === l) {
                    ++e;
                    continue;
                }
                if (void 0 === (i = s[++t])) return 1;
                r = i.segment;
            } else if (null === l) {
                if (void 0 === (o = n[++e])) return -1;
                l = o.segment;
            }
            if (r.kind < l.kind) return 1;
            if (r.kind > l.kind) return -1;
            ++e;
        }
        const e = this.skippedStates;
        const i = t.skippedStates;
        const o = e.length;
        const r = i.length;
        if (o < r) return 1;
        if (o > r) return -1;
        for (let t = 0; t < o; ++t) {
            const s = e[t];
            const n = i[t];
            if (s.length < n.length) return 1;
            if (s.length > n.length) return -1;
        }
        return 0;
    }
}

function t(t) {
    return null !== t.head.endpoint;
}

function s(t, s) {
    return t.compareTo(s);
}

class RecognizeResult {
    constructor(t) {
        this.candidates = [];
        this.candidates = [ new Candidate([ "" ], [ t ], [], this) ];
    }
    get isEmpty() {
        return 0 === this.candidates.length;
    }
    getSolution() {
        const n = this.candidates.filter(t);
        if (0 === n.length) return null;
        for (const t of n) t.finalize();
        n.sort(s);
        return n[0];
    }
    add(t) {
        this.candidates.push(t);
    }
    remove(t) {
        this.candidates.splice(this.candidates.indexOf(t), 1);
    }
    advance(t) {
        const s = this.candidates.slice();
        for (const n of s) n.advance(t);
    }
}

class RouteRecognizer {
    constructor() {
        this.rootState = new State(null, null, "");
        this.cache = new Map;
    }
    add(t) {
        if (t instanceof Array) for (const s of t) this.$add(s); else this.$add(t);
        this.cache.clear();
    }
    $add(t) {
        const s = t.path;
        const e = new ConfigurableRoute(t.path, true === t.caseSensitive, t.handler);
        const i = "" === s ? [ "" ] : s.split("/").filter(n);
        const o = [];
        let r = this.rootState;
        for (const t of i) {
            r = r.append(null, "/");
            switch (t.charAt(0)) {
              case ":":
                {
                    const s = t.endsWith("?");
                    const n = s ? t.slice(1, -1) : t.slice(1);
                    o.push(n);
                    r = new DynamicSegment(n, s).appendTo(r);
                    break;
                }

              case "*":
                {
                    const s = t.slice(1);
                    o.push(s);
                    r = new StarSegment(s).appendTo(r);
                    break;
                }

              default:
                r = new StaticSegment(t, e.caseSensitive).appendTo(r);
                break;
            }
        }
        const l = new Endpoint(e, o);
        r.setEndpoint(l);
    }
    recognize(t) {
        let s = this.cache.get(t);
        if (void 0 === s) this.cache.set(t, s = this.$recognize(t));
        return s;
    }
    $recognize(t) {
        t = decodeURI(t);
        if (!t.startsWith("/")) t = `/${t}`;
        if (t.length > 1 && t.endsWith("/")) t = t.slice(0, -1);
        const s = new RecognizeResult(this.rootState);
        for (let n = 0, e = t.length; n < e; ++n) {
            const e = t.charAt(n);
            s.advance(e);
            if (s.isEmpty) return null;
        }
        const n = s.getSolution();
        if (null === n) return null;
        const {endpoint: e} = n;
        const i = n.getParams();
        return new RecognizedRoute(e, i);
    }
}

class State {
    constructor(t, s, n) {
        this.prevState = t;
        this.segment = s;
        this.value = n;
        this.nextStates = null;
        this.endpoint = null;
        switch (null === s || void 0 === s ? void 0 : s.kind) {
          case 2:
            this.length = t.length + 1;
            this.isSeparator = false;
            this.isDynamic = true;
            this.isOptional = s.optional;
            break;

          case 1:
            this.length = t.length + 1;
            this.isSeparator = false;
            this.isDynamic = true;
            this.isOptional = false;
            break;

          case 3:
            this.length = t.length + 1;
            this.isSeparator = false;
            this.isDynamic = false;
            this.isOptional = false;
            break;

          case void 0:
            this.length = null === t ? 0 : t.length;
            this.isSeparator = true;
            this.isDynamic = false;
            this.isOptional = false;
            break;
        }
    }
    append(t, s) {
        let n;
        let e = this.nextStates;
        if (null === e) {
            n = void 0;
            e = this.nextStates = [];
        } else if (null === t) n = e.find((t => t.value === s)); else n = e.find((s => {
            var n;
            return null === (n = s.segment) || void 0 === n ? void 0 : n.equals(t);
        }));
        if (void 0 === n) e.push(n = new State(this, t, s));
        return n;
    }
    setEndpoint(t) {
        if (null !== this.endpoint) throw new Error(`Cannot add ambiguous route. The pattern '${t.route.path}' clashes with '${this.endpoint.route.path}'`);
        this.endpoint = t;
        if (this.isOptional) {
            this.prevState.setEndpoint(t);
            if (this.prevState.isSeparator && null !== this.prevState.prevState) this.prevState.prevState.setEndpoint(t);
        }
    }
    isMatch(t) {
        const s = this.segment;
        switch (null === s || void 0 === s ? void 0 : s.kind) {
          case 2:
            return !this.value.includes(t);

          case 1:
            return true;

          case 3:
          case void 0:
            return this.value.includes(t);
        }
    }
}

function n(t) {
    return t.length > 0;
}

var e;

(function(t) {
    t[t["star"] = 1] = "star";
    t[t["dynamic"] = 2] = "dynamic";
    t[t["static"] = 3] = "static";
})(e || (e = {}));

class StaticSegment {
    constructor(t, s) {
        this.value = t;
        this.caseSensitive = s;
    }
    get kind() {
        return 3;
    }
    appendTo(t) {
        const {value: s, value: {length: n}} = this;
        if (this.caseSensitive) for (let e = 0; e < n; ++e) t = t.append(this, s.charAt(e)); else for (let e = 0; e < n; ++e) {
            const n = s.charAt(e);
            t = t.append(this, n.toUpperCase() + n.toLowerCase());
        }
        return t;
    }
    equals(t) {
        return 3 === t.kind && t.caseSensitive === this.caseSensitive && t.value === this.value;
    }
}

class DynamicSegment {
    constructor(t, s) {
        this.name = t;
        this.optional = s;
    }
    get kind() {
        return 2;
    }
    appendTo(t) {
        t = t.append(this, "/");
        return t;
    }
    equals(t) {
        return 2 === t.kind && t.optional === this.optional && t.name === this.name;
    }
}

class StarSegment {
    constructor(t) {
        this.name = t;
    }
    get kind() {
        return 1;
    }
    appendTo(t) {
        t = t.append(this, "");
        return t;
    }
    equals(t) {
        return 1 === t.kind && t.name === this.name;
    }
}

export { ConfigurableRoute, Endpoint, RecognizedRoute, RouteRecognizer };
//# sourceMappingURL=index.js.map
