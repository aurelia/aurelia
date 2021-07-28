"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var e = require("@aurelia/kernel");

var t = require("@aurelia/runtime");

function s(e) {
    if (e && e.__esModule) return e;
    var t = Object.create(null);
    if (e) Object.keys(e).forEach((function(s) {
        t[s] = e[s];
    }));
    t["default"] = e;
    return Object.freeze(t);
}

var r = s(t);

const i = e.DI.createInterface("IValidationExpressionHydrator");

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
***************************************************************************** */ function n(e, t, s, r) {
    var i = arguments.length, n = i < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, s) : r, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) n = Reflect.decorate(e, t, s, r); else for (var a = e.length - 1; a >= 0; a--) if (o = e[a]) n = (i < 3 ? o(n) : i > 3 ? o(t, s, n) : o(t, s)) || n;
    return i > 3 && n && Object.defineProperty(t, s, n), n;
}

function o(e, t) {
    return function(s, r) {
        t(s, r, e);
    };
}

const a = e.DI.createInterface("IValidationMessageProvider");

const u = Object.freeze({
    aliasKey: e.Protocol.annotation.keyFor("validation-rule-alias-message"),
    define(e, t) {
        u.setDefaultMessage(e, t);
        return e;
    },
    setDefaultMessage(t, {aliases: s}, r = true) {
        const i = r ? e.Metadata.getOwn(this.aliasKey, t.prototype) : void 0;
        if (void 0 !== i) {
            const t = {
                ...Object.fromEntries(i.map((({name: e, defaultMessage: t}) => [ e, t ]))),
                ...Object.fromEntries(s.map((({name: e, defaultMessage: t}) => [ e, t ])))
            };
            s = e.toArray(Object.entries(t)).map((([e, t]) => ({
                name: e,
                defaultMessage: t
            })));
        }
        e.Metadata.define(u.aliasKey, s, t instanceof Function ? t.prototype : t);
    },
    getDefaultMessages(t) {
        return e.Metadata.get(this.aliasKey, t instanceof Function ? t.prototype : t);
    }
});

function l(e) {
    return function(t) {
        return u.define(t, e);
    };
}

exports.BaseValidationRule = class BaseValidationRule {
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

exports.BaseValidationRule.$TYPE = "";

exports.BaseValidationRule = n([ l({
    aliases: [ {
        name: void 0,
        defaultMessage: `\${$displayName} is invalid.`
    } ]
}) ], exports.BaseValidationRule);

exports.RequiredRule = class RequiredRule extends exports.BaseValidationRule {
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

exports.RequiredRule.$TYPE = "RequiredRule";

exports.RequiredRule = n([ l({
    aliases: [ {
        name: "required",
        defaultMessage: `\${$displayName} is required.`
    } ]
}) ], exports.RequiredRule);

exports.RegexRule = class RegexRule extends exports.BaseValidationRule {
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

exports.RegexRule.$TYPE = "RegexRule";

exports.RegexRule = n([ l({
    aliases: [ {
        name: "matches",
        defaultMessage: `\${$displayName} is not correctly formatted.`
    }, {
        name: "email",
        defaultMessage: `\${$displayName} is not a valid email.`
    } ]
}) ], exports.RegexRule);

exports.LengthRule = class LengthRule extends exports.BaseValidationRule {
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

exports.LengthRule.$TYPE = "LengthRule";

exports.LengthRule = n([ l({
    aliases: [ {
        name: "minLength",
        defaultMessage: `\${$displayName} must be at least \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`
    }, {
        name: "maxLength",
        defaultMessage: `\${$displayName} cannot be longer than \${$rule.length} character\${$rule.length === 1 ? '' : 's'}.`
    } ]
}) ], exports.LengthRule);

exports.SizeRule = class SizeRule extends exports.BaseValidationRule {
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

exports.SizeRule.$TYPE = "SizeRule";

exports.SizeRule = n([ l({
    aliases: [ {
        name: "minItems",
        defaultMessage: `\${$displayName} must contain at least \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`
    }, {
        name: "maxItems",
        defaultMessage: `\${$displayName} cannot contain more than \${$rule.count} item\${$rule.count === 1 ? '' : 's'}.`
    } ]
}) ], exports.SizeRule);

exports.RangeRule = class RangeRule extends exports.BaseValidationRule {
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

exports.RangeRule.$TYPE = "RangeRule";

exports.RangeRule = n([ l({
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
}) ], exports.RangeRule);

exports.EqualsRule = class EqualsRule extends exports.BaseValidationRule {
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

exports.EqualsRule.$TYPE = "EqualsRule";

exports.EqualsRule = n([ l({
    aliases: [ {
        name: "equals",
        defaultMessage: `\${$displayName} must be \${$rule.expectedValue}.`
    } ]
}) ], exports.EqualsRule);

const c = e.DI.createInterface("ICustomMessages");

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

const h = Object.freeze({
    name: "validation-rules",
    defaultRuleSetName: "__default",
    set(t, s, r) {
        const i = `${h.name}:${null !== r && void 0 !== r ? r : h.defaultRuleSetName}`;
        e.Metadata.define(e.Protocol.annotation.keyFor(i), s, t);
        const n = e.Metadata.getOwn(e.Protocol.annotation.name, t);
        if (void 0 === n) e.Metadata.define(e.Protocol.annotation.name, [ i ], t); else n.push(i);
    },
    get(t, s) {
        var r;
        const i = e.Protocol.annotation.keyFor(h.name, null !== s && void 0 !== s ? s : h.defaultRuleSetName);
        return null !== (r = e.Metadata.get(i, t)) && void 0 !== r ? r : e.Metadata.getOwn(i, t.constructor);
    },
    unset(t, s) {
        const r = e.Metadata.getOwn(e.Protocol.annotation.name, t);
        for (const i of r.slice(0)) if (i.startsWith(h.name) && (void 0 === s || i.endsWith(s))) {
            e.Metadata.delete(e.Protocol.annotation.keyFor(i), t);
            const s = r.indexOf(i);
            if (s > -1) r.splice(s, 1);
        }
    },
    isValidationRulesSet(t) {
        const s = e.Metadata.getOwn(e.Protocol.annotation.name, t);
        return void 0 !== s && s.some((e => e.startsWith(h.name)));
    }
});

class ValidationMessageEvaluationContext {
    constructor(e, t, s, r, i, n) {
        this.messageProvider = e;
        this.$displayName = t;
        this.$propertyName = s;
        this.$value = r;
        this.$rule = i;
        this.$object = n;
    }
    $getDisplayName(e, t) {
        return this.messageProvider.getDisplayName(e, t);
    }
}

class PropertyRule {
    constructor(e, t, s, r, i = [ [] ]) {
        this.locator = e;
        this.validationRules = t;
        this.messageProvider = s;
        this.property = r;
        this.$rules = i;
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
    async validate(e, s, r, i) {
        if (void 0 === r) r = 0;
        if (void 0 === i) i = t.Scope.create({
            [x]: e
        });
        const n = this.property.expression;
        let o;
        if (void 0 === n) o = e; else o = n.evaluate(r, i, this.locator, null);
        let a = true;
        const u = async i => {
            const n = async s => {
                let i = s.execute(o, e);
                if (i instanceof Promise) i = await i;
                a = a && i;
                const {displayName: n, name: u} = this.property;
                let l;
                if (!i) {
                    const i = t.Scope.create(new ValidationMessageEvaluationContext(this.messageProvider, this.messageProvider.getDisplayName(u, n), u, o, s, e));
                    l = this.messageProvider.getMessage(s).evaluate(r, i, null, null);
                }
                return new ValidationResult(i, l, u, e, s, this);
            };
            const u = [];
            for (const t of i) if (t.canExecute(e) && (void 0 === s || t.tag === s)) u.push(n(t));
            return Promise.all(u);
        };
        const l = async (e, t) => {
            const s = await u(t);
            e.push(...s);
            return e;
        };
        return this.$rules.reduce((async (e, t) => e.then((async e => a ? l(e, t) : Promise.resolve(e)))), Promise.resolve([]));
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
        const t = new class extends exports.BaseValidationRule {
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
        return this.addRule(new exports.RequiredRule);
    }
    matches(e) {
        return this.addRule(new exports.RegexRule(e));
    }
    email() {
        const e = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return this.addRule(new exports.RegexRule(e, "email"));
    }
    minLength(e) {
        return this.addRule(new exports.LengthRule(e, false));
    }
    maxLength(e) {
        return this.addRule(new exports.LengthRule(e, true));
    }
    minItems(e) {
        return this.addRule(new exports.SizeRule(e, false));
    }
    maxItems(e) {
        return this.addRule(new exports.SizeRule(e, true));
    }
    min(e) {
        return this.addRule(new exports.RangeRule(true, {
            min: e
        }));
    }
    max(e) {
        return this.addRule(new exports.RangeRule(true, {
            max: e
        }));
    }
    range(e, t) {
        return this.addRule(new exports.RangeRule(true, {
            min: e,
            max: t
        }));
    }
    between(e, t) {
        return this.addRule(new exports.RangeRule(false, {
            min: e,
            max: t
        }));
    }
    equals(e) {
        return this.addRule(new exports.EqualsRule(e));
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
    constructor(e, t = h.defaultRuleSetName) {
        this.ruleset = e;
        this.tag = t;
    }
}

const p = e.DI.createInterface("IValidationRules");

exports.ValidationRules = class ValidationRules {
    constructor(e, t, s, r) {
        this.locator = e;
        this.parser = t;
        this.messageProvider = s;
        this.deserializer = r;
        this.rules = [];
        this.targets = new Set;
    }
    ensure(e) {
        const [t, s] = f(e, this.parser);
        let r = this.rules.find((e => e.property.name == t));
        if (void 0 === r) {
            r = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty(s, t));
            this.rules.push(r);
        }
        return r;
    }
    ensureObject() {
        const e = new PropertyRule(this.locator, this, this.messageProvider, new RuleProperty);
        this.rules.push(e);
        return e;
    }
    on(e, t) {
        const s = h.get(e, t);
        if (Object.is(s, this.rules)) return this;
        this.rules = null !== s && void 0 !== s ? s : [];
        h.set(e, this.rules, t);
        this.targets.add(e);
        return this;
    }
    off(e, t) {
        const s = void 0 !== e ? [ e ] : Array.from(this.targets);
        for (const e of s) {
            h.unset(e, t);
            if (!h.isValidationRulesSet(e)) this.targets.delete(e);
        }
    }
    applyModelBasedRules(e, t) {
        const s = new Set;
        for (const r of t) {
            const t = r.tag;
            if (s.has(t)) console.warn(`A ruleset for tag ${t} is already defined which will be overwritten`);
            const i = this.deserializer.hydrateRuleset(r.ruleset, this);
            h.set(e, i, t);
            s.add(t);
        }
    }
};

exports.ValidationRules = n([ o(0, e.IServiceLocator), o(1, t.IExpressionParser), o(2, a), o(3, i) ], exports.ValidationRules);

const d = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*["']{1}use strict["']{1};)?(?:[$_\s\w\d\/\*.['"\]+;]+)?\s*return\s+[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)\s*;?\s*\}$/;

const $ = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+((\.[$_\w\d]+|\[['"$_\w\d]+\])+)$/;

const x = "$root";

function f(e, t) {
    var s;
    switch (typeof e) {
      case "string":
        break;

      case "function":
        {
            const t = e.toString();
            const r = null !== (s = $.exec(t)) && void 0 !== s ? s : d.exec(t);
            if (null === r) throw new Error(`Unable to parse accessor function:\n${t}`);
            e = r[1].substring(1);
            break;
        }

      default:
        throw new Error(`Unable to parse accessor function:\n${e}`);
    }
    return [ e, t.parse(`${x}.${e}`, 53) ];
}

class ValidationResult {
    constructor(e, t, s, r, i, n, o = false) {
        this.valid = e;
        this.message = t;
        this.propertyName = s;
        this.object = r;
        this.rule = i;
        this.propertyRule = n;
        this.isManual = o;
        this.id = ValidationResult.nextId++;
    }
    toString() {
        return this.valid ? "Valid." : this.message;
    }
}

ValidationResult.nextId = 0;

const m = new Set([ "displayName", "propertyName", "value", "object", "config", "getDisplayName" ]);

exports.ValidationMessageProvider = class ValidationMessageProvider {
    constructor(e, t, s) {
        this.parser = e;
        this.registeredMessages = new WeakMap;
        this.logger = t.scopeTo(ValidationMessageProvider.name);
        for (const {rule: e, aliases: t} of s) u.setDefaultMessage(e, {
            aliases: t
        });
    }
    getMessage(e) {
        var t;
        const s = this.registeredMessages.get(e);
        if (void 0 !== s) return s;
        const r = u.getDefaultMessages(e);
        const i = e.messageKey;
        let n;
        const o = r.length;
        if (1 === o && void 0 === i) n = r[0].defaultMessage; else n = null === (t = r.find((e => e.name === i))) || void 0 === t ? void 0 : t.defaultMessage;
        if (!n) n = u.getDefaultMessages(exports.BaseValidationRule)[0].defaultMessage;
        return this.setMessage(e, n);
    }
    setMessage(e, t) {
        const s = this.parseMessage(t);
        this.registeredMessages.set(e, s);
        return s;
    }
    parseMessage(e) {
        const s = this.parser.parse(e, 2048);
        if (24 === (null === s || void 0 === s ? void 0 : s.$kind)) {
            for (const t of s.expressions) {
                const s = t.name;
                if (m.has(s)) this.logger.warn(`Did you mean to use "$${s}" instead of "${s}" in this validation message template: "${e}"?`);
                if (1793 === t.$kind || t.ancestor > 0) throw new Error("$parent is not permitted in validation message expressions.");
            }
            return s;
        }
        return new t.PrimitiveLiteralExpression(e);
    }
    getDisplayName(e, t) {
        if (null !== t && void 0 !== t) return t instanceof Function ? t() : t;
        if (void 0 === e) return;
        const s = e.toString().split(/(?=[A-Z])/).join(" ");
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
};

exports.ValidationMessageProvider = n([ o(0, t.IExpressionParser), o(1, e.ILogger), o(2, c) ], exports.ValidationMessageProvider);

var v;

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
})(v || (v = {}));

class Deserializer {
    static deserialize(e) {
        const t = new Deserializer;
        const s = JSON.parse(e);
        return t.hydrate(s);
    }
    hydrate(e) {
        switch (e.$TYPE) {
          case v.AccessMemberExpression:
            {
                const t = e;
                return new r.AccessMemberExpression(this.hydrate(t.object), t.name);
            }

          case v.AccessKeyedExpression:
            {
                const t = e;
                return new r.AccessKeyedExpression(this.hydrate(t.object), this.hydrate(t.key));
            }

          case v.AccessThisExpression:
            {
                const t = e;
                return new r.AccessThisExpression(t.ancestor);
            }

          case v.AccessScopeExpression:
            {
                const t = e;
                return new r.AccessScopeExpression(t.name, t.ancestor);
            }

          case v.ArrayLiteralExpression:
            {
                const t = e;
                return new r.ArrayLiteralExpression(this.hydrate(t.elements));
            }

          case v.ObjectLiteralExpression:
            {
                const t = e;
                return new r.ObjectLiteralExpression(this.hydrate(t.keys), this.hydrate(t.values));
            }

          case v.PrimitiveLiteralExpression:
            {
                const t = e;
                return new r.PrimitiveLiteralExpression(this.hydrate(t.value));
            }

          case v.CallFunctionExpression:
            {
                const t = e;
                return new r.CallFunctionExpression(this.hydrate(t.func), this.hydrate(t.args));
            }

          case v.CallMemberExpression:
            {
                const t = e;
                return new r.CallMemberExpression(this.hydrate(t.object), t.name, this.hydrate(t.args));
            }

          case v.CallScopeExpression:
            {
                const t = e;
                return new r.CallScopeExpression(t.name, this.hydrate(t.args), t.ancestor);
            }

          case v.TemplateExpression:
            {
                const t = e;
                return new r.TemplateExpression(this.hydrate(t.cooked), this.hydrate(t.expressions));
            }

          case v.TaggedTemplateExpression:
            {
                const t = e;
                return new r.TaggedTemplateExpression(this.hydrate(t.cooked), this.hydrate(t.raw), this.hydrate(t.func), this.hydrate(t.expressions));
            }

          case v.UnaryExpression:
            {
                const t = e;
                return new r.UnaryExpression(t.operation, this.hydrate(t.expression));
            }

          case v.BinaryExpression:
            {
                const t = e;
                return new r.BinaryExpression(t.operation, this.hydrate(t.left), this.hydrate(t.right));
            }

          case v.ConditionalExpression:
            {
                const t = e;
                return new r.ConditionalExpression(this.hydrate(t.condition), this.hydrate(t.yes), this.hydrate(t.no));
            }

          case v.AssignExpression:
            {
                const t = e;
                return new r.AssignExpression(this.hydrate(t.target), this.hydrate(t.value));
            }

          case v.ValueConverterExpression:
            {
                const t = e;
                return new r.ValueConverterExpression(this.hydrate(t.expression), t.name, this.hydrate(t.args));
            }

          case v.BindingBehaviorExpression:
            {
                const t = e;
                return new r.BindingBehaviorExpression(this.hydrate(t.expression), t.name, this.hydrate(t.args));
            }

          case v.ArrayBindingPattern:
            {
                const t = e;
                return new r.ArrayBindingPattern(this.hydrate(t.elements));
            }

          case v.ObjectBindingPattern:
            {
                const t = e;
                return new r.ObjectBindingPattern(this.hydrate(t.keys), this.hydrate(t.values));
            }

          case v.BindingIdentifier:
            {
                const t = e;
                return new r.BindingIdentifier(t.name);
            }

          case v.ForOfStatement:
            {
                const t = e;
                return new r.ForOfStatement(this.hydrate(t.declaration), this.hydrate(t.iterable));
            }

          case v.Interpolation:
            {
                const t = e;
                return new r.Interpolation(this.hydrate(t.cooked), this.hydrate(t.expressions));
            }

          default:
            if (Array.isArray(e)) if ("object" === typeof e[0]) return this.deserializeExpressions(e); else return e.map(E); else if ("object" !== typeof e) return E(e);
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
        return `{"$TYPE":"${v.AccessMemberExpression}","name":"${e.name}","object":${e.object.accept(this)}}`;
    }
    visitAccessKeyed(e) {
        return `{"$TYPE":"${v.AccessKeyedExpression}","object":${e.object.accept(this)},"key":${e.key.accept(this)}}`;
    }
    visitAccessThis(e) {
        return `{"$TYPE":"${v.AccessThisExpression}","ancestor":${e.ancestor}}`;
    }
    visitAccessScope(e) {
        return `{"$TYPE":"${v.AccessScopeExpression}","name":"${e.name}","ancestor":${e.ancestor}}`;
    }
    visitArrayLiteral(e) {
        return `{"$TYPE":"${v.ArrayLiteralExpression}","elements":${this.serializeExpressions(e.elements)}}`;
    }
    visitObjectLiteral(e) {
        return `{"$TYPE":"${v.ObjectLiteralExpression}","keys":${w(e.keys)},"values":${this.serializeExpressions(e.values)}}`;
    }
    visitPrimitiveLiteral(e) {
        return `{"$TYPE":"${v.PrimitiveLiteralExpression}","value":${y(e.value)}}`;
    }
    visitCallFunction(e) {
        return `{"$TYPE":"${v.CallFunctionExpression}","func":${e.func.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitCallMember(e) {
        return `{"$TYPE":"${v.CallMemberExpression}","name":"${e.name}","object":${e.object.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitCallScope(e) {
        return `{"$TYPE":"${v.CallScopeExpression}","name":"${e.name}","ancestor":${e.ancestor},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitTemplate(e) {
        return `{"$TYPE":"${v.TemplateExpression}","cooked":${w(e.cooked)},"expressions":${this.serializeExpressions(e.expressions)}}`;
    }
    visitTaggedTemplate(e) {
        return `{"$TYPE":"${v.TaggedTemplateExpression}","cooked":${w(e.cooked)},"raw":${w(e.cooked.raw)},"func":${e.func.accept(this)},"expressions":${this.serializeExpressions(e.expressions)}}`;
    }
    visitUnary(e) {
        return `{"$TYPE":"${v.UnaryExpression}","operation":"${e.operation}","expression":${e.expression.accept(this)}}`;
    }
    visitBinary(e) {
        return `{"$TYPE":"${v.BinaryExpression}","operation":"${e.operation}","left":${e.left.accept(this)},"right":${e.right.accept(this)}}`;
    }
    visitConditional(e) {
        return `{"$TYPE":"${v.ConditionalExpression}","condition":${e.condition.accept(this)},"yes":${e.yes.accept(this)},"no":${e.no.accept(this)}}`;
    }
    visitAssign(e) {
        return `{"$TYPE":"${v.AssignExpression}","target":${e.target.accept(this)},"value":${e.value.accept(this)}}`;
    }
    visitValueConverter(e) {
        return `{"$TYPE":"${v.ValueConverterExpression}","name":"${e.name}","expression":${e.expression.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitBindingBehavior(e) {
        return `{"$TYPE":"${v.BindingBehaviorExpression}","name":"${e.name}","expression":${e.expression.accept(this)},"args":${this.serializeExpressions(e.args)}}`;
    }
    visitArrayBindingPattern(e) {
        return `{"$TYPE":"${v.ArrayBindingPattern}","elements":${this.serializeExpressions(e.elements)}}`;
    }
    visitObjectBindingPattern(e) {
        return `{"$TYPE":"${v.ObjectBindingPattern}","keys":${w(e.keys)},"values":${this.serializeExpressions(e.values)}}`;
    }
    visitBindingIdentifier(e) {
        return `{"$TYPE":"${v.BindingIdentifier}","name":"${e.name}"}`;
    }
    visitHtmlLiteral(e) {
        throw new Error("visitHtmlLiteral");
    }
    visitForOfStatement(e) {
        return `{"$TYPE":"${v.ForOfStatement}","declaration":${e.declaration.accept(this)},"iterable":${e.iterable.accept(this)}}`;
    }
    visitInterpolation(e) {
        return `{"$TYPE":"${v.Interpolation}","cooked":${w(e.parts)},"expressions":${this.serializeExpressions(e.expressions)}}`;
    }
    serializeExpressions(e) {
        let t = "[";
        for (let s = 0, r = e.length; s < r; ++s) {
            if (0 !== s) t += ",";
            t += e[s].accept(this);
        }
        t += "]";
        return t;
    }
}

function w(e) {
    let t = "[";
    for (let s = 0, r = e.length; s < r; ++s) {
        if (0 !== s) t += ",";
        t += y(e[s]);
    }
    t += "]";
    return t;
}

function y(e) {
    if ("string" === typeof e) return `"\\"${g(e)}\\""`; else if (null == e) return `"${e}"`; else return `${e}`;
}

function g(e) {
    let t = "";
    for (let s = 0, r = e.length; s < r; ++s) t += R(e.charAt(s));
    return t;
}

function R(e) {
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

function E(e) {
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
        return `{"$TYPE":"${exports.RequiredRule.$TYPE}","messageKey":"${e.messageKey}","tag":${y(e.tag)}}`;
    }
    visitRegexRule(e) {
        const t = e.pattern;
        return `{"$TYPE":"${exports.RegexRule.$TYPE}","messageKey":"${e.messageKey}","tag":${y(e.tag)},"pattern":{"source":${y(t.source)},"flags":"${t.flags}"}}`;
    }
    visitLengthRule(e) {
        return `{"$TYPE":"${exports.LengthRule.$TYPE}","messageKey":"${e.messageKey}","tag":${y(e.tag)},"length":${y(e.length)},"isMax":${y(e.isMax)}}`;
    }
    visitSizeRule(e) {
        return `{"$TYPE":"${exports.SizeRule.$TYPE}","messageKey":"${e.messageKey}","tag":${y(e.tag)},"count":${y(e.count)},"isMax":${y(e.isMax)}}`;
    }
    visitRangeRule(e) {
        return `{"$TYPE":"${exports.RangeRule.$TYPE}","messageKey":"${e.messageKey}","tag":${y(e.tag)},"isInclusive":${e.isInclusive},"min":${this.serializeNumber(e.min)},"max":${this.serializeNumber(e.max)}}`;
    }
    visitEqualsRule(e) {
        const t = e.expectedValue;
        let s;
        if ("object" !== typeof t || null === t) s = y(t); else s = JSON.stringify(t);
        return `{"$TYPE":"${exports.EqualsRule.$TYPE}","messageKey":"${e.messageKey}","tag":${y(e.tag)},"expectedValue":${s}}`;
    }
    visitRuleProperty(e) {
        const t = e.displayName;
        if (void 0 !== t && "string" !== typeof t) throw new Error("Serializing a non-string displayName for rule property is not supported.");
        const s = e.expression;
        return `{"$TYPE":"${RuleProperty.$TYPE}","name":${y(e.name)},"expression":${s ? Serializer.serialize(s) : null},"displayName":${y(t)}}`;
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

exports.ValidationDeserializer = class ValidationDeserializer {
    constructor(e, t, s) {
        this.locator = e;
        this.messageProvider = t;
        this.parser = s;
        this.astDeserializer = new Deserializer;
    }
    static register(e) {
        this.container = e;
    }
    static deserialize(e, s) {
        const r = this.container.get(a);
        const i = this.container.get(t.IExpressionParser);
        const n = new ValidationDeserializer(this.container, r, i);
        const o = JSON.parse(e);
        return n.hydrate(o, s);
    }
    hydrate(e, t) {
        var s, r;
        switch (e.$TYPE) {
          case exports.RequiredRule.$TYPE:
            {
                const t = e;
                const s = new exports.RequiredRule;
                s.messageKey = t.messageKey;
                s.tag = this.astDeserializer.hydrate(t.tag);
                return s;
            }

          case exports.RegexRule.$TYPE:
            {
                const t = e;
                const s = t.pattern;
                const r = this.astDeserializer;
                const i = new exports.RegexRule(new RegExp(r.hydrate(s.source), s.flags), t.messageKey);
                i.tag = r.hydrate(t.tag);
                return i;
            }

          case exports.LengthRule.$TYPE:
            {
                const t = e;
                const s = new exports.LengthRule(t.length, t.isMax);
                s.messageKey = t.messageKey;
                s.tag = this.astDeserializer.hydrate(t.tag);
                return s;
            }

          case exports.SizeRule.$TYPE:
            {
                const t = e;
                const s = new exports.SizeRule(t.count, t.isMax);
                s.messageKey = t.messageKey;
                s.tag = this.astDeserializer.hydrate(t.tag);
                return s;
            }

          case exports.RangeRule.$TYPE:
            {
                const t = e;
                const i = new exports.RangeRule(t.isInclusive, {
                    min: null !== (s = t.min) && void 0 !== s ? s : Number.NEGATIVE_INFINITY,
                    max: null !== (r = t.max) && void 0 !== r ? r : Number.POSITIVE_INFINITY
                });
                i.messageKey = t.messageKey;
                i.tag = this.astDeserializer.hydrate(t.tag);
                return i;
            }

          case exports.EqualsRule.$TYPE:
            {
                const t = e;
                const s = this.astDeserializer;
                const r = new exports.EqualsRule("object" !== typeof t.expectedValue ? s.hydrate(t.expectedValue) : t.expectedValue);
                r.messageKey = t.messageKey;
                r.tag = s.hydrate(t.tag);
                return r;
            }

          case RuleProperty.$TYPE:
            {
                const t = e;
                const s = this.astDeserializer;
                let r = t.name;
                r = "undefined" === r ? void 0 : s.hydrate(r);
                let i = t.expression;
                if (null !== i && void 0 !== i) i = s.hydrate(i); else if (void 0 !== r) [, i] = f(r, this.parser); else i = void 0;
                let n = t.displayName;
                n = "undefined" === n ? void 0 : s.hydrate(n);
                return new RuleProperty(i, r, n);
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

exports.ValidationDeserializer = n([ o(0, e.IServiceLocator), o(1, a), o(2, t.IExpressionParser) ], exports.ValidationDeserializer);

exports.ModelValidationExpressionHydrator = class ModelValidationExpressionHydrator {
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
        const r = (e, i = []) => {
            for (const [n, o] of e) if (this.isModelPropertyRule(o)) {
                const e = o.rules.map((e => Object.entries(e).map((([e, t]) => this.hydrateRule(e, t)))));
                const r = i.join(".");
                const a = this.hydrateRuleProperty({
                    name: "" !== r ? `${r}.${n}` : n,
                    displayName: o.displayName
                });
                s.push(new PropertyRule(this.locator, t, this.messageProvider, a, e));
            } else r(Object.entries(o), [ ...i, n ]);
        };
        r(Object.entries(e));
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
    setCommonRuleProperties(e, s) {
        const r = e.messageKey;
        if (void 0 !== r && null !== r) s.messageKey = r;
        s.tag = e.tag;
        const i = e.when;
        if (i) if ("string" === typeof i) {
            const e = this.parser.parse(i, 0);
            s.canExecute = s => {
                const r = 0;
                return e.evaluate(r, t.Scope.create({
                    $object: s
                }), this.locator, null);
            };
        } else if ("function" === typeof i) s.canExecute = i;
    }
    isModelPropertyRule(e) {
        return "object" === typeof e && "rules" in e;
    }
    hydrateRequiredRule(e) {
        const t = new exports.RequiredRule;
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateRegexRule(e) {
        const t = e.pattern;
        const s = new exports.RegexRule(new RegExp(t.source, t.flags), e.messageKey);
        s.tag = e.tag;
        return s;
    }
    hydrateLengthRule(e) {
        const t = new exports.LengthRule(e.length, e.isMax);
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateSizeRule(e) {
        const t = new exports.SizeRule(e.count, e.isMax);
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateRangeRule(e) {
        const t = new exports.RangeRule(e.isInclusive, {
            min: e.min,
            max: e.max
        });
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateEqualsRule(e) {
        const t = new exports.EqualsRule(e.expectedValue);
        this.setCommonRuleProperties(e, t);
        return t;
    }
    hydrateRuleProperty(e) {
        const t = e.name;
        if (!t || "string" !== typeof t) throw new Error("The property name needs to be a non-empty string");
        const [s, r] = f(t, this.parser);
        return new RuleProperty(r, s, e.displayName);
    }
};

exports.ModelValidationExpressionHydrator = n([ o(0, e.IServiceLocator), o(1, a), o(2, t.IExpressionParser) ], exports.ModelValidationExpressionHydrator);

class ValidateInstruction {
    constructor(e = void 0, t = void 0, s = void 0, r = void 0, i = void 0, n = 0) {
        this.object = e;
        this.propertyName = t;
        this.rules = s;
        this.objectTag = r;
        this.propertyTag = i;
        this.flags = n;
    }
}

const b = e.DI.createInterface("IValidator");

class StandardValidator {
    async validate(e) {
        var s, r, i, n;
        const o = e.object;
        const a = e.propertyName;
        const u = e.propertyTag;
        const l = e.flags;
        const c = null !== (r = null !== (s = e.rules) && void 0 !== s ? s : h.get(o, e.objectTag)) && void 0 !== r ? r : [];
        const p = t.Scope.create({
            [x]: o
        });
        if (void 0 !== a) return null !== (n = await (null === (i = c.find((e => e.property.name === a))) || void 0 === i ? void 0 : i.validate(o, u, l, p))) && void 0 !== n ? n : [];
        return (await Promise.all(c.map((async e => e.validate(o, u, l, p))))).flat();
    }
}

function P() {
    return {
        ValidatorType: StandardValidator,
        MessageProviderType: exports.ValidationMessageProvider,
        CustomMessages: [],
        HydratorType: exports.ModelValidationExpressionHydrator
    };
}

function M(t) {
    return {
        optionsProvider: t,
        register(s) {
            const r = P();
            t(r);
            s.register(e.Registration.instance(c, r.CustomMessages), e.Registration.singleton(b, r.ValidatorType), e.Registration.singleton(a, r.MessageProviderType), e.Registration.singleton(i, r.HydratorType), e.Registration.transient(p, exports.ValidationRules), exports.ValidationDeserializer);
            return s;
        },
        customize(e) {
            return M(null !== e && void 0 !== e ? e : t);
        }
    };
}

const T = M(e.noop);

exports.Deserializer = Deserializer;

exports.ICustomMessages = c;

exports.IValidationExpressionHydrator = i;

exports.IValidationMessageProvider = a;

exports.IValidationRules = p;

exports.IValidator = b;

exports.ModelBasedRule = ModelBasedRule;

exports.PropertyRule = PropertyRule;

exports.RuleProperty = RuleProperty;

exports.Serializer = Serializer;

exports.StandardValidator = StandardValidator;

exports.ValidateInstruction = ValidateInstruction;

exports.ValidationConfiguration = T;

exports.ValidationResult = ValidationResult;

exports.ValidationRuleAliasMessage = u;

exports.ValidationSerializer = ValidationSerializer;

exports.deserializePrimitive = E;

exports.getDefaultValidationConfiguration = P;

exports.parsePropertyName = f;

exports.rootObjectSymbol = x;

exports.serializePrimitive = y;

exports.serializePrimitives = w;

exports.validationRule = l;

exports.validationRulesRegistrar = h;
//# sourceMappingURL=index.js.map
