import { DI as e, Protocol as t, Metadata as s, toArray as i, ILogger as r, IServiceLocator as n, Registration as a, noop as o } from "@aurelia/kernel";

import * as u from "@aurelia/runtime";

import { IExpressionParser as l, Scope as c, PrimitiveLiteralExpression as h } from "@aurelia/runtime";

const d = e.createInterface("IValidationExpressionHydrator");

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ function $(e, t, s, i) {
    var r = arguments.length, n = r < 3 ? t : null === i ? i = Object.getOwnPropertyDescriptor(t, s) : i, a;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) n = Reflect.decorate(e, t, s, i); else for (var o = e.length - 1; o >= 0; o--) if (a = e[o]) n = (r < 3 ? a(n) : r > 3 ? a(t, s, n) : a(t, s)) || n;
    return r > 3 && n && Object.defineProperty(t, s, n), n;
}

function m(e, t) {
    return function(s, i) {
        t(s, i, e);
    };
}

const f = e.createInterface("IValidationMessageProvider");

const p = Object.freeze({
    aliasKey: t.annotation.keyFor("validation-rule-alias-message"),
    define(e, t) {
        p.setDefaultMessage(e, t);
        return e;
    },
    setDefaultMessage(e, {aliases: t}, r = true) {
        const n = r ? s.getOwn(this.aliasKey, e.prototype) : void 0;
        if (void 0 !== n) {
            const e = {
                ...Object.fromEntries(n.map((({name: e, defaultMessage: t}) => [ e, t ]))),
                ...Object.fromEntries(t.map((({name: e, defaultMessage: t}) => [ e, t ])))
            };
            t = i(Object.entries(e)).map((([e, t]) => ({
                name: e,
                defaultMessage: t
            })));
        }
        s.define(p.aliasKey, t, e instanceof Function ? e.prototype : e);
    },
    getDefaultMessages(e) {
        return s.get(this.aliasKey, e instanceof Function ? e.prototype : e);
    }
});

function v(e) {
    return function(t) {
        return p.define(t, e);
    };
}

let w = class BaseValidationRule {
    constructor(e = void 0) {
        this.messageKey = e;
        this.tag = void 0;
    }
    canExecute(e) {
        return true;
    }
    execute(e, t) {
        throw new Error("No base implementation of execute. Did you forget to implement the execute method?");
    }
    accept(e) {
        throw new Error("No base implementation of accept. Did you forget to implement the accept method?");
    }
};

w.$TYPE = "";

w = $([ v({
    aliases: [ {
        name: void 0,
        defaultMessage: `\${$displayName} is invalid.`
    } ]
}) ], w);

let y = class RequiredRule extends w {
    constructor() {
        super("required");
    }
    execute(e) {
        return null !== e && void 0 !== e && !("string" === typeof e && !/\S/.test(e));
    }
    accept(e) {
        return e.visitRequiredRule(this);
    }
};

y.$TYPE = "RequiredRule";

y = $([ v({
    aliases: [ {
        name: "required",
        defaultMessage: `\${$displayName} is required.`
    } ]
}) ], y);

let g = class RegexRule extends w {
    constructor(e, t = "matches") {
        super(t);
        this.pattern = e;
    }
    execute(e) {
        return null === e || void 0 === e || 0 === e.length || this.pattern.test(e);
    }
    accept(e) {
        return e.visitRegexRule(this);
    }
};

g.$TYPE = "RegexRule";

g = $([ v({
    aliases: [ {
        name: "matches",
        defaultMessage: `\${$displayName} is not correctly formatted.`
    }, {
        name: "email",
        defaultMessage: `\${$displayName} is not a valid email.`
    } ]
}) ], g);

let x = class LengthRule extends w {
    constructor(e, t) {
        super(t ? "maxLength" : "minLength");
        this.length = e;
        this.isMax = t;
    }
    execute(e) {
        return null === e || void 0 === e || 0 === e.length || (this.isMax ? e.length <= this.length : e.length >= this.length);
    }
    accept(e) {
        return e.visitLengthRule(this);
    }
};

x.$TYPE = "LengthRule";

x = $([ v({
    aliases: [ {
        name: "minLength",
        defaultMessage: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`
    }, {
        name: "maxLength",
        defaultMessage: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`
    } ]
}) ], x);

let R = class SizeRule extends w {
    constructor(e, t) {
        super(t ? "maxItems" : "minItems");
        this.count = e;
        this.isMax = t;
    }
    execute(e) {
        return null === e || void 0 === e || (this.isMax ? e.length <= this.count : e.length >= this.count);
    }
    accept(e) {
        return e.visitSizeRule(this);
    }
};

R.$TYPE = "SizeRule";

R = $([ v({
    aliases: [ {
        name: "minItems",
        defaultMessage: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`
    }, {
        name: "maxItems",
        defaultMessage: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`
    } ]
}) ], R);

let E = class RangeRule extends w {
    constructor(e, {min: t, max: s}) {
        super(void 0 !== t && void 0 !== s ? e ? "range" : "between" : void 0 !== t ? "min" : "max");
        this.isInclusive = e;
        this.min = Number.NEGATIVE_INFINITY;
        this.max = Number.POSITIVE_INFINITY;
        this.min = null !== t && void 0 !== t ? t : this.min;
        this.max = null !== s && void 0 !== s ? s : this.max;
    }
    execute(e, t) {
        return null === e || void 0 === e || (this.isInclusive ? e >= this.min && e <= this.max : e > this.min && e < this.max);
    }
    accept(e) {
        return e.visitRangeRule(this);
    }
};

E.$TYPE = "RangeRule";

E = $([ v({
    aliases: [ {
        name: "min",
        defaultMessage: `\${$displayName} must be at least \${$rule.min}.`
    }, {
        name: "max",
        defaultMessage: `\${$displayName} must be at most \${$rule.max}.`
    }, {
        name: "range",
        defaultMessage: `\${$displayName} must be between or equal to \${$rule.min} and \${$rule.max}.`
    }, {
        name: "between",
        defaultMessage: `\${$displayName} must be between but not equal to \${$rule.min} and \${$rule.max}.`
    } ]
}) ], E);

let P = class EqualsRule extends w {
    constructor(e) {
        super("equals");
        this.expectedValue = e;
    }
    execute(e) {
        return null === e || void 0 === e || "" === e || e === this.expectedValue;
    }
    accept(e) {
        return e.visitEqualsRule(this);
    }
};

P.$TYPE = "EqualsRule";

P = $([ v({
    aliases: [ {
        name: "equals",
        defaultMessage: `\${$displayName} must be \${$rule.expectedValue}.`
    } ]
}) ], P);

const b = e.createInterface("ICustomMessages");

class RuleProperty {
    constructor(e, t = void 0, s = void 0) {
        this.expression = e;
        this.name = t;
        this.displayName = s;
    }
    accept(e) {
        return e.visitRuleProperty(this);
    }
}

RuleProperty.$TYPE = "RuleProperty";

const M = Object.freeze({
    name: "validation-rules",
    defaultRuleSetName: "__default",
    set(e, i, r) {
        const n = `${M.name}:${null !== r && void 0 !== r ? r : M.defaultRuleSetName}`;
        s.define(t.annotation.keyFor(n), i, e);
        const a = s.getOwn(t.annotation.name, e);
        if (void 0 === a) s.define(t.annotation.name, [ n ], e); else a.push(n);
    },
    get(e, i) {
        var r;
        const n = t.annotation.keyFor(M.name, null !== i && void 0 !== i ? i : M.defaultRuleSetName);
        return null !== (r = s.get(n, e)) && void 0 !== r ? r : s.getOwn(n, e.constructor);
    },
    unset(e, i) {
        const r = s.getOwn(t.annotation.name, e);
        for (const n of r.slice(0)) if (n.startsWith(M.name) && (void 0 === i || n.endsWith(i))) {
            s.delete(t.annotation.keyFor(n), e);
            const i = r.indexOf(n);
            if (i > -1) r.splice(i, 1);
        }
    },
    isValidationRulesSet(e) {
        const i = s.getOwn(t.annotation.name, e);
        return void 0 !== i && i.some((e => e.startsWith(M.name)));
    }
});

class ValidationMessageEvaluationContext {
    constructor(e, t, s, i, r, n) {
        this.messageProvider = e;
        this.$displayName = t;
        this.$propertyName = s;
        this.$value = i;
        this.$rule = r;
        this.$object = n;
    }
    $getDisplayName(e, t) {
        return this.messageProvider.getDisplayName(e, t);
    }
}

class PropertyRule {
    constructor(e, t, s, i, r = [ [] ]) {
        this.locator = e;
        this.validationRules = t;
        this.messageProvider = s;
        this.property = i;
        this.$rules = r;
    }
    accept(e) {
        return e.visitPropertyRule(this);
    }
    addRule(e) {
        const t = this.getLeafRules();
        t.push(this.latestRule = e);
        return this;
    }
    getLeafRules() {
        const e = this.$rules.length - 1;
        return this.$rules[e];
    }
    async validate(e, t, s, i) {
        if (void 0 === s) s = 0;
        if (void 0 === i) i = c.create({
            [S]: e
        });
        const r = this.property.expression;
        let n;
        if (void 0 === r) n = e; else n = r.evaluate(s, i, this.locator, null);
        let a = true;
        const o = async i => {
            const r = async t => {
                let i = t.execute(n, e);
                if (i instanceof Promise) i = await i;
                a = a && i;
                const {displayName: r, name: o} = this.property;
                let u;
                if (!i) {
                    const i = c.create(new ValidationMessageEvaluationContext(this.messageProvider, this.messageProvider.getDisplayName(o, r), o, n, t, e));
                    u = this.messageProvider.getMessage(t).evaluate(s, i, null, null);
                }
                return new ValidationResult(i, u, o, e, t, this);
            };
            const o = [];
            for (const s of i) if (s.canExecute(e) && (void 0 === t || s.tag === t)) o.push(r(s));
            return Promise.all(o);
        };
        const u = async (e, t) => {
            const s = await o(t);
            e.push(...s);
            return e;
        };
        return this.$rules.reduce((async (e, t) => e.then((async e => a ? u(e, t) : Promise.resolve(e)))), Promise.resolve([]));
    }
    then() {
        this.$rules.push([]);
        return this;
    }
    withMessageKey(e) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.messageKey = e;
        return this;
    }
    withMessage(e) {
        const t = this.latestRule;
        this.assertLatestRule(t);
        this.messageProvider.setMessage(t, e);
        return this;
    }
    when(e) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.canExecute = e;
        return this;
    }
    tag(e) {
        this.assertLatestRule(this.latestRule);
        this.latestRule.tag = e;
        return this;
    }
    assertLatestRule(e) {
        if (void 0 === e) throw new Error("No rule has been added");
    }
    displayName(e) {
        this.property.displayName = e;
        return this;
    }
    satisfies(e) {
        const t = new class extends w {
            constructor() {
                super(...arguments);
                this.execute = e;
            }
        };
        return this.addRule(t);
    }
    satisfiesRule(e) {
        return this.addRule(e);
    }
    required() {
        return this.addRule(new y);
    }
    matches(e) {
        return this.addRule(new g(e));
    }
    email() {
        const e = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return this.addRule(new g(e, "email"));
    }
    minLength(e) {
        return this.addRule(new x(e, false));
    }
    maxLength(e) {
        return this.addRule(new x(e, true));
    }
    minItems(e) {
        return this.addRule(new R(e, false));
    }
    maxItems(e) {
        return this.addRule(new R(e, true));
    }
    min(e) {
        return this.addRule(new E(true, {
            min: e
        }));
    }
    max(e) {
        return this.addRule(new E(true, {
            max: e
        }));
    }
    range(e, t) {
        return this.addRule(new E(true, {
            min: e,
            max: t
        }));
    }
    between(e, t) {
        return this.addRule(new E(false, {
            min: e,
            max: t
        }));
    }
    equals(e) {
        return this.addRule(new P(e));
    }
    ensure(e) {
        this.latestRule = void 0;
        return this.validationRules.ensure(e);
    }
    ensureObject() {
        this.latestRule = void 0;
        return this.validationRules.ensureObject();
    }
    get rules() {
        return this.validationRules.rules;
    }
    on(e, t) {
        return this.validationRules.on(e, t);
    }
}

PropertyRule.$TYPE = "PropertyRule";

class ModelBasedRule {
    constructor(e, t = M.defaultRuleSetName) {
        this.ruleset = e;
        this.tag = t;
    }
}

const T = e.createInterface("IValidationRules");

let z = class ValidationRules {
    constructor(e, t, s, i) {
        this.locator = e;
        this.parser = t;
        this.messageProvider = s;
        this.deserializer = i;
        this.rules = [];
        this.targets = new Set;
    }
    ensure(e) {
        const [t, s] = Y(e, this.parser);
        let i = this.rules.find((e => e.property.name == t));
        if (void 0 === i) {
            i = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty(s, t));
            this.rules.push(i);
        }
        return i;
    }
    ensureObject() {
        const e = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty);
        this.rules.push(e);
        return e;
    }
    on(e, t) {
        const s = M.get(e, t);
        if (Object.is(s, this.rules)) return this;
        this.rules = null !== s && void 0 !== s ? s : [];
        M.set(e, this.rules, t);
        this.targets.add(e);
        return this;
    }
    off(e, t) {
        const s = void 0 !== e ? [ e ] : Array.from(this.targets);
        for (const e of s) {
            M.unset(e, t);
            if (!M.isValidationRulesSet(e)) this.targets.delete(e);
        }
    }
    applyModelBasedRules(e, t) {
        const s = new Set;
        for (const i of t) {
            const t = i.tag;
            if (s.has(t)) console.warn(`A ruleset for tag ${t} is already defined which will be overwritten`);
            const r = this.deserializer.hydrateRuleset(i.ruleset, this);
            M.set(e, r, t);
            s.add(t);
        }
    }
};

z = $([ m(0, n), m(1, l), m(2, f), m(3, d) ], z);

const N = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*["']{1}use strict["']{1};)?(?:[$_\s\w\d\/\*.['"\]+;]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)\s*;?\s*\}$/;

const V = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)$/;

const S = "$root";

function Y(e, t) {
    var s;
    switch (typeof e) {
      case "string":
        break;

      case "function":
        {
            const t = e.toString();
            const i = null !== (s = V.exec(t)) && void 0 !== s ? s : N.exec(t);
            if (null === i) throw new Error(`Unable to parse accessor function:\n${t}`);
            e = i[1].substring(1);
            break;
        }

      default:
        throw new Error(`Unable to parse accessor function:\n${e}`);
    }
    return [ e, t.parse(`${S}.${e}`, 8) ];
}

class ValidationResult {
    constructor(e, t, s, i, r, n, a = false) {
        this.valid = e;
        this.message = t;
        this.propertyName = s;
        this.object = i;
        this.rule = r;
        this.propertyRule = n;
        this.isManual = a;
        this.id = ValidationResult.nextId++;
    }
    toString() {
        return this.valid ? "Valid." : this.message;
    }
}

ValidationResult.nextId = 0;

const j = new Set([ "displayName", "propertyName", "value", "object", "config", "getDisplayName" ]);

let A = class ValidationMessageProvider {
    constructor(e, t, s) {
        this.parser = e;
        this.registeredMessages = new WeakMap;
        this.logger = t.scopeTo(ValidationMessageProvider.name);
        for (const {rule: e, aliases: t} of s) p.setDefaultMessage(e, {
            aliases: t
        });
    }
    getMessage(e) {
        var t;
        const s = this.registeredMessages.get(e);
        if (void 0 !== s) return s;
        const i = p.getDefaultMessages(e);
        const r = e.messageKey;
        let n;
        const a = i.length;
        if (1 === a && void 0 === r) n = i[0].defaultMessage; else n = null === (t = i.find((e => e.name === r))) || void 0 === t ? void 0 : t.defaultMessage;
        if (!n) n = p.getDefaultMessages(w)[0].defaultMessage;
        return this.setMessage(e, n);
    }
    setMessage(e, t) {
        const s = this.parseMessage(t);
        this.registeredMessages.set(e, s);
        return s;
    }
    parseMessage(e) {
        const t = this.parser.parse(e, 1);
        if (24 === (null === t || void 0 === t ? void 0 : t.$kind)) {
            for (const s of t.expressions) {
                const t = s.name;
                if (j.has(t)) this.logger.warn(`Did you mean to use "$${t}" instead of "${t}" in this validation message template: "${e}"?`);
                if (1793 === s.$kind || s.ancestor > 0) throw new Error("$parent is not permitted in validation message expressions.");
            }
            return t;
        }
        return new h(e);
    }
    getDisplayName(e, t) {
        if (null !== t && void 0 !== t) return t instanceof Function ? t() : t;
        if (void 0 === e) return;
        const s = e.toString().split(/(?=[A-Z])/).join(" ");
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
};

A = $([ m(0, l), m(1, r), m(2, b) ], A);

var I;

(function(e) {
    e["BindingBehaviorExpression"] = "BindingBehaviorExpression";
    e["ValueConverterExpression"] = "ValueConverterExpression";
    e["AssignExpression"] = "AssignExpression";
    e["ConditionalExpression"] = "ConditionalExpression";
    e["AccessThisExpression"] = "AccessThisExpression";
    e["AccessScopeExpression"] = "AccessScopeExpression";
    e["AccessMemberExpression"] = "AccessMemberExpression";
    e["AccessKeyedExpression"] = "AccessKeyedExpression";
    e["CallScopeExpression"] = "CallScopeExpression";
    e["CallMemberExpression"] = "CallMemberExpression";
    e["CallFunctionExpression"] = "CallFunctionExpression";
    e["BinaryExpression"] = "BinaryExpression";
    e["UnaryExpression"] = "UnaryExpression";
    e["PrimitiveLiteralExpression"] = "PrimitiveLiteralExpression";
    e["ArrayLiteralExpression"] = "ArrayLiteralExpression";
    e["ObjectLiteralExpression"] = "ObjectLiteralExpression";
    e["TemplateExpression"] = "TemplateExpression";
    e["TaggedTemplateExpression"] = "TaggedTemplateExpression";
    e["ArrayBindingPattern"] = "ArrayBindingPattern";
    e["ObjectBindingPattern"] = "ObjectBindingPattern";
    e["BindingIdentifier"] = "BindingIdentifier";
    e["ForOfStatement"] = "ForOfStatement";
    e["Interpolation"] = "Interpolation";
})(I || (I = {}));

class Deserializer {
    static deserialize(e) {
        const t = new Deserializer;
        const s = JSON.parse(e);
        return t.hydrate(s);
    }
    hydrate(e) {
        switch (e.$TYPE) {
          case I.AccessMemberExpression:
            {
                const t = e;
                return new u.AccessMemberExpression(this.hydrate(t.object), t.name);
            }

          case I.AccessKeyedExpression:
            {
                const t = e;
                return new u.AccessKeyedExpression(this.hydrate(t.object), this.hydrate(t.key));
            }

          case I.AccessThisExpression:
            {
                const t = e;
                return new u.AccessThisExpression(t.ancestor);
            }

          case I.AccessScopeExpression:
            {
                const t = e;
                return new u.AccessScopeExpression(t.name, t.ancestor);
            }

          case I.ArrayLiteralExpression:
            {
                const t = e;
                return new u.ArrayLiteralExpression(this.hydrate(t.elements));
            }

          case I.ObjectLiteralExpression:
            {
                const t = e;
                return new u.ObjectLiteralExpression(this.hydrate(t.keys), this.hydrate(t.values));
            }

          case I.PrimitiveLiteralExpression:
            {
                const t = e;
                return new u.PrimitiveLiteralExpression(this.hydrate(t.value));
            }

          case I.CallFunctionExpression:
            {
                const t = e;
                return new u.CallFunctionExpression(this.hydrate(t.func), this.hydrate(t.args));
            }

          case I.CallMemberExpression:
            {
                const t = e;
                return new u.CallMemberExpression(this.hydrate(t.object), t.name, this.hydrate(t.args));
            }

          case I.CallScopeExpression:
            {
                const t = e;
                return new u.CallScopeExpression(t.name, this.hydrate(t.args), t.ancestor);
            }

          case I.TemplateExpression:
            {
                const t = e;
                return new u.TemplateExpression(this.hydrate(t.cooked), this.hydrate(t.expressions));
            }

          case I.TaggedTemplateExpression:
            {
                const t = e;
                return new u.TaggedTemplateExpression(this.hydrate(t.cooked), this.hydrate(t.raw), this.hydrate(t.func), this.hydrate(t.expressions));
            }

          case I.UnaryExpression:
            {
                const t = e;
                return new u.UnaryExpression(t.operation, this.hydrate(t.expression));
            }

          case I.BinaryExpression:
            {
                const t = e;
                return new u.BinaryExpression(t.operation, this.hydrate(t.left), this.hydrate(t.right));
            }

          case I.ConditionalExpression:
            {
                const t = e;
                return new u.ConditionalExpression(this.hydrate(t.condition), this.hydrate(t.yes), this.hydrate(t.no));
            }

          case I.AssignExpression:
            {
                const t = e;
                return new u.AssignExpression(this.hydrate(t.target), this.hydrate(t.value));
            }

          case I.ValueConverterExpression:
            {
                const t = e;
                return new u.ValueConverterExpression(this.hydrate(t.expression), t.name, this.hydrate(t.args));
            }

          case I.BindingBehaviorExpression:
            {
                const t = e;
                return new u.BindingBehaviorExpression(this.hydrate(t.expression), t.name, this.hydrate(t.args));
            }

          case I.ArrayBindingPattern:
            {
                const t = e;
                return new u.ArrayBindingPattern(this.hydrate(t.elements));
            }

          case I.ObjectBindingPattern:
            {
                const t = e;
                return new u.ObjectBindingPattern(this.hydrate(t.keys), this.hydrate(t.values));
            }

          case I.BindingIdentifier:
            {
                const t = e;
                return new u.BindingIdentifier(t.name);
            }

          case I.ForOfStatement:
            {
                const t = e;
                return new u.ForOfStatement(this.hydrate(t.declaration), this.hydrate(t.iterable));
            }

          case I.Interpolation:
            {
                const t = e;
                return new u.Interpolation(this.hydrate(t.cooked), this.hydrate(t.expressions));
            }

          default:
            if (Array.isArray(e)) if ("object" === typeof e[0]) return this.deserializeExpressions(e); else return e.map(C); else if ("object" !== typeof e) return C(e);
            throw new Error(`unable to deserialize the expression: ${e}`);
        }
    }
    deserializeExpressions(e) {
        const t = [];
        for (const s of e) t.push(this.hydrate(s));
        return t;
    }
}

class Serializer {
    static serialize(e) {
        const t = new Serializer;
        if (null == e || "function" !== typeof e.accept) return `${e}`;
        return e.accept(t);
    }
    visitAccessMember(e) {
        return `{"$TYPE":"${I.AccessMemberExpression}","name":"${e.name}","object":${e.object.accept(this)}}`;
    }
    visitAccessKeyed(e) {
        return `{"$TYPE":"${I.AccessKeyedExpression}","object":${e.object.accept(this)},"key":${e.key.accept(this)}}`;
    }
    visitAccessThis(e) {
        return `{"$TYPE":"${I.AccessThisExpression}","ancestor":${e.ancestor}}`;
    }
    visitAccessScope(e) {
        return `{"$TYPE":"${I.AccessScopeExpression}","name":"${e.name}","ancestor":${e.ancestor}}`;
    }
    visitArrayLiteral(e) {
        return `{"$TYPE":"${I.ArrayLiteralExpression}","elements":${this.serializeExpressions(e.elements)}}`;
    }
    visitObjectLiteral(e) {
        return `{"$TYPE":"${I.ObjectLiteralExpression}","keys":${L(e.keys)},"values":${this.serializeExpressions(e.values)}}`;
    }
    visitPrimitiveLiteral(e) {
        return `{"$TYPE":"${I.PrimitiveLiteralExpression}","value":${O(e.value)}}`;
    }
    visitCallFunction(e) {
        return `{"$TYPE":"${I.CallFunctionExpression}","func":${e.func.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitCallMember(e) {
        return `{"$TYPE":"${I.CallMemberExpression}","name":"${e.name}","object":${e.object.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitCallScope(e) {
        return `{"$TYPE":"${I.CallScopeExpression}","name":"${e.name}","ancestor":${e.ancestor},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitTemplate(e) {
        return `{"$TYPE":"${I.TemplateExpression}","cooked":${L(e.cooked)},"expressions":${this.serializeExpressions(e.expressions)}}`;
    }
    visitTaggedTemplate(e) {
        return `{"$TYPE":"${I.TaggedTemplateExpression}","cooked":${L(e.cooked)},"raw":${L(e.cooked.raw)},"func":${e.func.accept(this)},"expressions":${this.serializeExpressions(e.expressions)}}`;
    }
    visitUnary(e) {
        return `{"$TYPE":"${I.UnaryExpression}","operation":"${e.operation}","expression":${e.expression.accept(this)}}`;
    }
    visitBinary(e) {
        return `{"$TYPE":"${I.BinaryExpression}","operation":"${e.operation}","left":${e.left.accept(this)},"right":${e.right.accept(this)}}`;
    }
    visitConditional(e) {
        return `{"$TYPE":"${I.ConditionalExpression}","condition":${e.condition.accept(this)},"yes":${e.yes.accept(this)},"no":${e.no.accept(this)}}`;
    }
    visitAssign(e) {
        return `{"$TYPE":"${I.AssignExpression}","target":${e.target.accept(this)},"value":${e.value.accept(this)}}`;
    }
    visitValueConverter(e) {
        return `{"$TYPE":"${I.ValueConverterExpression}","name":"${e.name}","expression":${e.expression.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitBindingBehavior(e) {
        return `{"$TYPE":"${I.BindingBehaviorExpression}","name":"${e.name}","expression":${e.expression.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitArrayBindingPattern(e) {
        return `{"$TYPE":"${I.ArrayBindingPattern}","elements":${this.serializeExpressions(e.elements)}}`;
    }
    visitObjectBindingPattern(e) {
        return `{"$TYPE":"${I.ObjectBindingPattern}","keys":${L(e.keys)},"values":${this.serializeExpressions(e.values)}}`;
    }
    visitBindingIdentifier(e) {
        return `{"$TYPE":"${I.BindingIdentifier}","name":"${e.name}"}`;
    }
    visitHtmlLiteral(e) {
        throw new Error("visitHtmlLiteral");
    }
    visitForOfStatement(e) {
        return `{"$TYPE":"${I.ForOfStatement}","declaration":${e.declaration.accept(this)},"iterable":${e.iterable.accept(this)}}`;
    }
    visitInterpolation(e) {
        return `{"$TYPE":"${I.Interpolation}","cooked":${L(e.parts)},"expressions":${this.serializeExpressions(e.expressions)}}`;
    }
    serializeExpressions(e) {
        let t = "[";
        for (let s = 0, i = e.length; s < i; ++s) {
            if (0 !== s) t += ",";
            t += e[s].accept(this);
        }
        t += "]";
        return t;
    }
}

function L(e) {
    let t = "[";
    for (let s = 0, i = e.length; s < i; ++s) {
        if (0 !== s) t += ",";
        t += O(e[s]);
    }
    t += "]";
    return t;
}

function O(e) {
    if ("string" === typeof e) return `"\\"${q(e)}\\""`; else if (null == e) return `"${e}"`; else return `${e}`;
}

function q(e) {
    let t = "";
    for (let s = 0, i = e.length; s < i; ++s) t += B(e.charAt(s));
    return t;
}

function B(e) {
    switch (e) {
      case "\b":
        return "\\b";

      case "\t":
        return "\\t";

      case "\n":
        return "\\n";

      case "\v":
        return "\\v";

      case "\f":
        return "\\f";

      case "\r":
        return "\\r";

      case '"':
        return '\\"';

      case "\\":
        return "\\\\";

      default:
        return e;
    }
}

function C(e) {
    if ("string" === typeof e) {
        if ("null" === e) return null;
        if ("undefined" === e) return;
        return e.substring(1, e.length - 1);
    } else return e;
}

class ValidationSerializer {
    static serialize(e) {
        if (null == e || "function" !== typeof e.accept) return `${e}`;
        const t = new ValidationSerializer;
        return e.accept(t);
    }
    visitRequiredRule(e) {
        return `{"$TYPE":"${y.$TYPE}","messageKey":"${e.messageKey}","tag":${O(e.tag)}}`;
    }
    visitRegexRule(e) {
        const t = e.pattern;
        return `{"$TYPE":"${g.$TYPE}","messageKey":"${e.messageKey}","tag":${O(e.tag)},"pattern":{"source":${O(t.source)},"flags":"${t.flags}"}}`;
    }
    visitLengthRule(e) {
        return `{"$TYPE":"${x.$TYPE}","messageKey":"${e.messageKey}","tag":${O(e.tag)},"length":${O(e.length)},"isMax":${O(e.isMax)}}`;
    }
    visitSizeRule(e) {
        return `{"$TYPE":"${R.$TYPE}","messageKey":"${e.messageKey}","tag":${O(e.tag)},"count":${O(e.count)},"isMax":${O(e.isMax)}}`;
    }
    visitRangeRule(e) {
        return `{"$TYPE":"${E.$TYPE}","messageKey":"${e.messageKey}","tag":${O(e.tag)},"isInclusive":${e.isInclusive},"min":${this.serializeNumber(e.min)},"max":${this.serializeNumber(e.max)}}`;
    }
    visitEqualsRule(e) {
        const t = e.expectedValue;
        let s;
        if ("object" !== typeof t || null === t) s = O(t); else s = JSON.stringify(t);
        return `{"$TYPE":"${P.$TYPE}","messageKey":"${e.messageKey}","tag":${O(e.tag)},"expectedValue":${s}}`;
    }
    visitRuleProperty(e) {
        const t = e.displayName;
        if (void 0 !== t && "string" !== typeof t) throw new Error("Serializing a non-string displayName for rule property is not supported.");
        const s = e.expression;
        return `{"$TYPE":"${RuleProperty.$TYPE}","name":${O(e.name)},"expression":${s ? Serializer.serialize(s) : null},"displayName":${O(t)}}`;
    }
    visitPropertyRule(e) {
        return `{"$TYPE":"${PropertyRule.$TYPE}","property":${e.property.accept(this)},"$rules":${this.serializeRules(e.$rules)}}`;
    }
    serializeNumber(e) {
        return e === Number.POSITIVE_INFINITY || e === Number.NEGATIVE_INFINITY ? null : e.toString();
    }
    serializeRules(e) {
        return `[${e.map((e => `[${e.map((e => e.accept(this))).join(",")}]`)).join(",")}]`;
    }
}

let D = class ValidationDeserializer {
    constructor(e, t, s) {
        this.locator = e;
        this.messageProvider = t;
        this.parser = s;
        this.astDeserializer = new Deserializer;
    }
    static register(e) {
        this.container = e;
    }
    static deserialize(e, t) {
        const s = this.container.get(f);
        const i = this.container.get(l);
        const r = new ValidationDeserializer(this.container, s, i);
        const n = JSON.parse(e);
        return r.hydrate(n, t);
    }
    hydrate(e, t) {
        var s, i;
        switch (e.$TYPE) {
          case y.$TYPE:
            {
                const t = e;
                const s = new y;
                s.messageKey = t.messageKey;
                s.tag = this.astDeserializer.hydrate(t.tag);
                return s;
            }

          case g.$TYPE:
            {
                const t = e;
                const s = t.pattern;
                const i = this.astDeserializer;
                const r = new g(new RegExp(i.hydrate(s.source), s.flags), t.messageKey);
                r.tag = i.hydrate(t.tag);
                return r;
            }

          case x.$TYPE:
            {
                const t = e;
                const s = new x(t.length, t.isMax);
                s.messageKey = t.messageKey;
                s.tag = this.astDeserializer.hydrate(t.tag);
                return s;
            }

          case R.$TYPE:
            {
                const t = e;
                const s = new R(t.count, t.isMax);
                s.messageKey = t.messageKey;
                s.tag = this.astDeserializer.hydrate(t.tag);
                return s;
            }

          case E.$TYPE:
            {
                const t = e;
                const r = new E(t.isInclusive, {
                    min: null !== (s = t.min) && void 0 !== s ? s : Number.NEGATIVE_INFINITY,
                    max: null !== (i = t.max) && void 0 !== i ? i : Number.POSITIVE_INFINITY
                });
                r.messageKey = t.messageKey;
                r.tag = this.astDeserializer.hydrate(t.tag);
                return r;
            }

          case P.$TYPE:
            {
                const t = e;
                const s = this.astDeserializer;
                const i = new P("object" !== typeof t.expectedValue ? s.hydrate(t.expectedValue) : t.expectedValue);
                i.messageKey = t.messageKey;
                i.tag = s.hydrate(t.tag);
                return i;
            }

          case RuleProperty.$TYPE:
            {
                const t = e;
                const s = this.astDeserializer;
                let i = t.name;
                i = "undefined" === i ? void 0 : s.hydrate(i);
                let r = t.expression;
                if (null !== r && void 0 !== r) r = s.hydrate(r); else if (void 0 !== i) [, r] = Y(i, this.parser); else r = void 0;
                let n = t.displayName;
                n = "undefined" === n ? void 0 : s.hydrate(n);
                return new RuleProperty(r, i, n);
            }

          case PropertyRule.$TYPE:
            {
                const s = e;
                return new PropertyRule(this.locator, t, this.messageProvider, this.hydrate(s.property, t), s.$rules.map((e => e.map((e => this.hydrate(e, t))))));
            }
        }
    }
    hydrateRuleset(e, t) {
        if (!Array.isArray(e)) throw new Error("The ruleset has to be an array of serialized property rule objects");
        return e.map((e => this.hydrate(e, t)));
    }
};

D = $([ m(0, n), m(1, f), m(2, l) ], D);

let _ = class ModelValidationExpressionHydrator {
    constructor(e, t, s) {
        this.locator = e;
        this.messageProvider = t;
        this.parser = s;
        this.astDeserializer = new Deserializer;
    }
    hydrate(e, t) {
        throw new Error("Method not implemented.");
    }
    hydrateRuleset(e, t) {
        const s = [];
        const i = (e, r = []) => {
            for (const [n, a] of e) if (this.isModelPropertyRule(a)) {
                const e = a.rules.map((e => Object.entries(e).map((([e, t]) => this.hydrateRule(e, t)))));
                const i = r.join(".");
                const o = this.hydrateRuleProperty({
                    name: "" !== i ? `${i}.${n}` : n,
                    displayName: a.displayName
                });
                s.push(new PropertyRule(this.locator, t, this.messageProvider, o, e));
            } else i(Object.entries(a), [ ...r, n ]);
        };
        i(Object.entries(e));
        return s;
    }
    hydrateRule(e, t) {
        switch (e) {
          case "required":
            return this.hydrateRequiredRule(t);

          case "regex":
            return this.hydrateRegexRule(t);

          case "maxLength":
            return this.hydrateLengthRule({
                ...t,
                isMax: true
            });

          case "minLength":
            return this.hydrateLengthRule({
                ...t,
                isMax: false
            });

          case "maxItems":
            return this.hydrateSizeRule({
                ...t,
                isMax: true
            });

          case "minItems":
            return this.hydrateSizeRule({
                ...t,
                isMax: false
            });

          case "range":
            return this.hydrateRangeRule({
                ...t,
                isInclusive: true
            });

          case "between":
            return this.hydrateRangeRule({
                ...t,
                isInclusive: false
            });

          case "equals":
            return this.hydrateEqualsRule(t);

          default:
            throw new Error(`Unsupported rule ${e}`);
        }
    }
    setCommonRuleProperties(e, t) {
        const s = e.messageKey;
        if (void 0 !== s && null !== s) t.messageKey = s;
        t.tag = e.tag;
        const i = e.when;
        if (i) if ("string" === typeof i) {
            const e = this.parser.parse(i, 0);
            t.canExecute = t => {
                const s = 0;
                return e.evaluate(s, c.create({
                    $object: t
                }), this.locator, null);
            };
        } else if ("function" === typeof i) t.canExecute = i;
    }
    isModelPropertyRule(e) {
        return "object" === typeof e && "rules" in e;
    }
    hydrateRequiredRule(e) {
        const t = new y;
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateRegexRule(e) {
        const t = e.pattern;
        const s = new g(new RegExp(t.source, t.flags), e.messageKey);
        s.tag = e.tag;
        return s;
    }
    hydrateLengthRule(e) {
        const t = new x(e.length, e.isMax);
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateSizeRule(e) {
        const t = new R(e.count, e.isMax);
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateRangeRule(e) {
        const t = new E(e.isInclusive, {
            min: e.min,
            max: e.max
        });
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateEqualsRule(e) {
        const t = new P(e.expectedValue);
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateRuleProperty(e) {
        const t = e.name;
        if (!t || "string" !== typeof t) throw new Error("The property name needs to be a non-empty string");
        const [s, i] = Y(t, this.parser);
        return new RuleProperty(i, s, e.displayName);
    }
};

_ = $([ m(0, n), m(1, f), m(2, l) ], _);

class ValidateInstruction {
    constructor(e = void 0, t = void 0, s = void 0, i = void 0, r = void 0, n = 0) {
        this.object = e;
        this.propertyName = t;
        this.rules = s;
        this.objectTag = i;
        this.propertyTag = r;
        this.flags = n;
    }
}

const k = e.createInterface("IValidator");

class StandardValidator {
    async validate(e) {
        var t, s, i, r;
        const n = e.object;
        const a = e.propertyName;
        const o = e.propertyTag;
        const u = e.flags;
        const l = null !== (s = null !== (t = e.rules) && void 0 !== t ? t : M.get(n, e.objectTag)) && void 0 !== s ? s : [];
        const h = c.create({
            [S]: n
        });
        if (void 0 !== a) return null !== (r = await (null === (i = l.find((e => e.property.name === a))) || void 0 === i ? void 0 : i.validate(n, o, u, h))) && void 0 !== r ? r : [];
        return (await Promise.all(l.map((async e => e.validate(n, o, u, h))))).flat();
    }
}

function K() {
    return {
        ValidatorType: StandardValidator,
        MessageProviderType: A,
        CustomMessages: [],
        HydratorType: _
    };
}

function Z(e) {
    return {
        optionsProvider: e,
        register(t) {
            const s = K();
            e(s);
            t.register(a.instance(b, s.CustomMessages), a.singleton(k, s.ValidatorType), a.singleton(f, s.MessageProviderType), a.singleton(d, s.HydratorType), a.transient(T, z), D);
            return t;
        },
        customize(t) {
            return Z(null !== t && void 0 !== t ? t : e);
        }
    };
}

const F = Z(o);

export { w as BaseValidationRule, Deserializer, P as EqualsRule, b as ICustomMessages, d as IValidationExpressionHydrator, f as IValidationMessageProvider, T as IValidationRules, k as IValidator, x as LengthRule, ModelBasedRule, _ as ModelValidationExpressionHydrator, PropertyRule, E as RangeRule, g as RegexRule, y as RequiredRule, RuleProperty, Serializer, R as SizeRule, StandardValidator, ValidateInstruction, F as ValidationConfiguration, D as ValidationDeserializer, A as ValidationMessageProvider, ValidationResult, p as ValidationRuleAliasMessage, z as ValidationRules, ValidationSerializer, C as deserializePrimitive, K as getDefaultValidationConfiguration, Y as parsePropertyName, S as rootObjectSymbol, O as serializePrimitive, L as serializePrimitives, v as validationRule, M as validationRulesRegistrar };
//# sourceMappingURL=index.js.map
