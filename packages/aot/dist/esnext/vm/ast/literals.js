import { SyntaxKind, } from 'typescript';
import { $String, } from '../types/string.js';
import { $Number, } from '../types/number.js';
import { $Null, } from '../types/null.js';
import { $Boolean, } from '../types/boolean.js';
import { $assignmentExpression, $i, } from './_shared.js';
// #region Pseudo-literals
export class $TemplateHead {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.TemplateHead`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
    }
    get $kind() { return SyntaxKind.TemplateHead; }
    // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
    // 12.2.9.6 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
export class $TemplateMiddle {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.TemplateMiddle`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
    }
    get $kind() { return SyntaxKind.TemplateMiddle; }
    // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
    // 12.2.9.6 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics.undefined; // TODO: implement this
    }
}
export class $TemplateTail {
    constructor(node, parent, ctx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}.TemplateTail`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
    }
    get $kind() { return SyntaxKind.TemplateTail; }
    // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
    // 12.2.9.6 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // TemplateSpans : TemplateTail
        // 1. Let tail be the TV of TemplateTail as defined in 11.8.6.
        // 2. Return the String value consisting of the code units of tail.
        return intrinsics.undefined; // TODO: implement this
    }
}
export class $TemplateSpan {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.TemplateSpan`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        this.$expression = $assignmentExpression(node.expression, this, ctx, -1);
        if (node.literal.kind === SyntaxKind.TemplateMiddle) {
            this.$literal = new $TemplateMiddle(node.literal, this, ctx);
        }
        else {
            this.$literal = new $TemplateTail(node.literal, this, ctx);
        }
    }
    get $kind() { return SyntaxKind.TemplateSpan; }
    // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
    // 12.2.9.6 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        // TemplateSpans : TemplateMiddleList TemplateTail
        // 1. Let head be the result of evaluating TemplateMiddleList.
        // 2. ReturnIfAbrupt(head).
        // 3. Let tail be the TV of TemplateTail as defined in 11.8.6.
        // 4. Return the string-concatenation of head and tail.
        // TemplateMiddleList : TemplateMiddle Expression
        // 1. Let head be the TV of TemplateMiddle as defined in 11.8.6.
        // 2. Let subRef be the result of evaluating Expression.
        // 3. Let sub be ? GetValue(subRef).
        // 4. Let middle be ? ToString(sub).
        // 5. Return the sequence of code units consisting of the code units of head followed by the elements of middle.
        // TemplateMiddleList : TemplateMiddleList TemplateMiddle Expression
        // 1. Let rest be the result of evaluating TemplateMiddleList.
        // 2. ReturnIfAbrupt(rest).
        // 3. Let middle be the TV of TemplateMiddle as defined in 11.8.6.
        // 4. Let subRef be the result of evaluating Expression.
        // 5. Let sub be ? GetValue(subRef).
        // 6. Let last be ? ToString(sub).
        // 7. Return the sequence of code units consisting of the elements of rest followed by the code units of middle followed by the elements of last.
        return intrinsics.undefined; // TODO: implement this
    }
}
// #endregion
export class $NumericLiteral {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.NumericLiteral`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
        // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
        this.CoveredParenthesizedExpression = this;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
        // 12.2.1.2 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
        // 12.2.1.3 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
        // 12.2.1.4 Static Semantics: IsIdentifierRef
        this.IsIdentifierRef = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
        // 12.2.1.5 Static Semantics: AssignmentTargetType
        this.AssignmentTargetType = 'invalid';
        const num = Number(node.text);
        this.PropName = new $String(realm, num.toString(), void 0, void 0, this);
        this.Value = new $Number(realm, num, void 0, void 0, this);
    }
    get $kind() { return SyntaxKind.NumericLiteral; }
    // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
    // 12.2.4.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        // 1. Return the number whose value is MV of NumericLiteral as defined in 11.8.3.
        return this.Value;
    }
    // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
    EvaluatePropName(ctx) {
        ctx.checkTimeout();
        return this.PropName;
    }
}
export class $BigIntLiteral {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.BigIntLiteral`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
        // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
        this.CoveredParenthesizedExpression = this;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
        // 12.2.1.2 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
        // 12.2.1.3 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
        // 12.2.1.4 Static Semantics: IsIdentifierRef
        this.IsIdentifierRef = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
        // 12.2.1.5 Static Semantics: AssignmentTargetType
        this.AssignmentTargetType = 'invalid';
    }
    get $kind() { return SyntaxKind.BigIntLiteral; }
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);
        return intrinsics['0']; // TODO: implement this
    }
}
export class $StringLiteral {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.StringLiteral`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
        // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
        this.CoveredParenthesizedExpression = this;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
        // 12.2.1.2 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
        // 12.2.1.3 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
        // 12.2.1.4 Static Semantics: IsIdentifierRef
        this.IsIdentifierRef = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
        // 12.2.1.5 Static Semantics: AssignmentTargetType
        this.AssignmentTargetType = 'invalid';
        const StringValue = this.StringValue = new $String(realm, node.text, void 0, void 0, this);
        this.PropName = StringValue;
        this.Value = StringValue;
    }
    get $kind() { return SyntaxKind.StringLiteral; }
    // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
    // 12.2.4.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        // Literal : StringLiteral
        // 1. Return the StringValue of StringLiteral as defined in 11.8.4.1.
        return this.Value;
    }
    // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
    EvaluatePropName(ctx) {
        ctx.checkTimeout();
        return this.PropName;
    }
}
export class $RegularExpressionLiteral {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.RegularExpressionLiteral`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
        // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
        this.CoveredParenthesizedExpression = this;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
        // 12.2.1.2 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
        // 12.2.1.3 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
        // 12.2.1.4 Static Semantics: IsIdentifierRef
        this.IsIdentifierRef = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
        // 12.2.1.5 Static Semantics: AssignmentTargetType
        this.AssignmentTargetType = 'invalid';
        this.StringValue = node.text;
    }
    get $kind() { return SyntaxKind.RegularExpressionLiteral; }
    // http://www.ecma-international.org/ecma-262/#sec-regular-expression-literals-runtime-semantics-evaluation
    // 12.2.8.2 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // PrimaryExpression : RegularExpressionLiteral
        // 1. Let pattern be the String value consisting of the UTF16Encoding of each code point of BodyText of RegularExpressionLiteral.
        // 2. Let flags be the String value consisting of the UTF16Encoding of each code point of FlagText of RegularExpressionLiteral.
        // 3. Return RegExpCreate(pattern, flags).
        return intrinsics['%ObjectPrototype%']; // TODO: implement this
    }
}
export class $NoSubstitutionTemplateLiteral {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.NoSubstitutionTemplateLiteral`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
        // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
        this.CoveredParenthesizedExpression = this;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
        // 12.2.1.2 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
        // 12.2.1.3 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
        // 12.2.1.4 Static Semantics: IsIdentifierRef
        this.IsIdentifierRef = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
        // 12.2.1.5 Static Semantics: AssignmentTargetType
        this.AssignmentTargetType = 'invalid';
    }
    get $kind() { return SyntaxKind.NoSubstitutionTemplateLiteral; }
    // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
    // 12.2.9.6 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        const realm = ctx.Realm;
        const intrinsics = realm['[[Intrinsics]]'];
        // TemplateLiteral : NoSubstitutionTemplate
        // 1. Return the String value whose code units are the elements of the TV of NoSubstitutionTemplate as defined in 11.8.6.
        return intrinsics['']; // TODO: implement this
    }
}
export class $NullLiteral {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.NullLiteral`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
        // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
        this.CoveredParenthesizedExpression = this;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
        // 12.2.1.2 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
        // 12.2.1.3 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
        // 12.2.1.4 Static Semantics: IsIdentifierRef
        this.IsIdentifierRef = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
        // 12.2.1.5 Static Semantics: AssignmentTargetType
        this.AssignmentTargetType = 'invalid';
        this.Value = new $Null(realm, void 0, void 0, this);
    }
    get $kind() { return SyntaxKind.NullKeyword; }
    // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
    // 12.2.4.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        // Literal : NullLiteral
        // 1. Return null.
        return this.Value;
    }
}
export class $BooleanLiteral {
    constructor(node, parent, ctx, idx, mos = parent.mos, realm = parent.realm, depth = parent.depth + 1, logger = parent.logger, path = `${parent.path}${$i(idx)}.BooleanLiteral`) {
        this.node = node;
        this.parent = parent;
        this.ctx = ctx;
        this.idx = idx;
        this.mos = mos;
        this.realm = realm;
        this.depth = depth;
        this.logger = logger;
        this.path = path;
        // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
        // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
        this.CoveredParenthesizedExpression = this;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
        // 12.2.1.2 Static Semantics: HasName
        this.HasName = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
        // 12.2.1.3 Static Semantics: IsFunctionDefinition
        this.IsFunctionDefinition = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
        // 12.2.1.4 Static Semantics: IsIdentifierRef
        this.IsIdentifierRef = false;
        // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
        // 12.2.1.5 Static Semantics: AssignmentTargetType
        this.AssignmentTargetType = 'invalid';
        this.$kind = node.kind;
        this.Value = new $Boolean(realm, node.kind === SyntaxKind.TrueKeyword, void 0, void 0, this);
    }
    // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
    // 12.2.4.1 Runtime Semantics: Evaluation
    Evaluate(ctx) {
        ctx.checkTimeout();
        // Literal : BooleanLiteral
        // 1. If BooleanLiteral is the token false, return false.
        // 2. If BooleanLiteral is the token true, return true.
        return this.Value;
    }
}
//# sourceMappingURL=literals.js.map