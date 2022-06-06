import {
  BigIntLiteral,
  BooleanLiteral,
  NoSubstitutionTemplateLiteral,
  NullLiteral,
  NumericLiteral,
  RegularExpressionLiteral,
  StringLiteral,
  SyntaxKind,
  TemplateHead,
  TemplateMiddle,
  TemplateSpan,
  TemplateTail,
} from 'typescript';
import {
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $String,
} from '../types/string';
import {
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $Object,
} from '../types/object';
import {
  $Number,
} from '../types/number';
import {
  $Null,
} from '../types/null';
import {
  $Boolean,
} from '../types/boolean';
import {
  I$Node,
  Context,
  $$AssignmentExpressionOrHigher,
  $assignmentExpression,
  $AssignmentExpressionNode,
  $AnyParentNode,
  $i,
} from './_shared';
import {
  $$ESModuleOrScript,
} from './modules';
import {
  $TemplateExpression,
} from './expressions';

// #region Pseudo-literals

export class $TemplateHead implements I$Node {
  public get $kind(): SyntaxKind.TemplateHead { return SyntaxKind.TemplateHead; }

  public constructor(
    public readonly node: TemplateHead,
    public readonly parent: $TemplateExpression,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.TemplateHead`,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  // 12.2.9.6 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.undefined; // TODO: implement this
  }
}

export class $TemplateMiddle implements I$Node {
  public get $kind(): SyntaxKind.TemplateMiddle { return SyntaxKind.TemplateMiddle; }

  public constructor(
    public readonly node: TemplateMiddle,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.TemplateMiddle`,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  // 12.2.9.6 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics.undefined; // TODO: implement this
  }
}

export class $TemplateTail implements I$Node {
  public get $kind(): SyntaxKind.TemplateTail { return SyntaxKind.TemplateTail; }

  public constructor(
    public readonly node: TemplateTail,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}.TemplateTail`,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  // 12.2.9.6 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
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

export class $TemplateSpan implements I$Node {
  public get $kind(): SyntaxKind.TemplateSpan { return SyntaxKind.TemplateSpan; }

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $literal: $TemplateMiddle | $TemplateTail;

  public constructor(
    public readonly node: TemplateSpan,
    public readonly parent: $TemplateExpression,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.TemplateSpan`,
  ) {
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx, -1);
    if (node.literal.kind === SyntaxKind.TemplateMiddle) {
      this.$literal = new $TemplateMiddle(node.literal, this, ctx);
    } else {
      this.$literal = new $TemplateTail(node.literal, this, ctx);
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  // 12.2.9.6 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty  {
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

export class $NumericLiteral implements I$Node {
  public get $kind(): SyntaxKind.NumericLiteral { return SyntaxKind.NumericLiteral; }

  public readonly Value: $Number;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  // 12.2.6.5 Static Semantics: PropName
  public readonly PropName: $String;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
  public readonly CoveredParenthesizedExpression: $NumericLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  // 12.2.1.2 Static Semantics: HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  // 12.2.1.3 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  // 12.2.1.4 Static Semantics: IsIdentifierRef
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  // 12.2.1.5 Static Semantics: AssignmentTargetType
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NumericLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.NumericLiteral`,
  ) {
    const num = Number(node.text);
    this.PropName = new $String(realm, num.toString(), void 0, void 0, this);
    this.Value = new $Number(realm, num, void 0, void 0, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  // 12.2.4.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Number {
    ctx.checkTimeout();

    // 1. Return the number whose value is MV of NumericLiteral as defined in 11.8.3.
    return this.Value;
  }

  // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
  public EvaluatePropName(
    ctx: ExecutionContext,
  ): $String {
    ctx.checkTimeout();

    return this.PropName;
  }
}

export class $BigIntLiteral implements I$Node {
  public get $kind(): SyntaxKind.BigIntLiteral { return SyntaxKind.BigIntLiteral; }

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
  public readonly CoveredParenthesizedExpression: $BigIntLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  // 12.2.1.2 Static Semantics: HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  // 12.2.1.3 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  // 12.2.1.4 Static Semantics: IsIdentifierRef
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  // 12.2.1.5 Static Semantics: AssignmentTargetType
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: BigIntLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.BigIntLiteral`,
  ) {}

  public Evaluate(
    ctx: ExecutionContext,
  ): $Number {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`${this.path}.Evaluate(#${ctx.id})`);

    return intrinsics['0']; // TODO: implement this
  }
}

export class $StringLiteral implements I$Node {
  public get $kind(): SyntaxKind.StringLiteral { return SyntaxKind.StringLiteral; }

  public readonly Value: $String;

  // http://www.ecma-international.org/ecma-262/#sec-string-literals-static-semantics-stringvalue
  // 11.8.4.1 Static Semantics: StringValue
  public readonly StringValue: $String;
  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  // 12.2.6.5 Static Semantics: PropName
  public readonly PropName: $String;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
  public readonly CoveredParenthesizedExpression: $StringLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  // 12.2.1.2 Static Semantics: HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  // 12.2.1.3 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  // 12.2.1.4 Static Semantics: IsIdentifierRef
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  // 12.2.1.5 Static Semantics: AssignmentTargetType
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: StringLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.StringLiteral`,
  ) {
    const StringValue = this.StringValue = new $String(realm, node.text, void 0, void 0, this);
    this.PropName = StringValue;
    this.Value = StringValue;
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  // 12.2.4.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $String {
    ctx.checkTimeout();

    // Literal : StringLiteral

    // 1. Return the StringValue of StringLiteral as defined in 11.8.4.1.
    return this.Value;
  }

  // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
  public EvaluatePropName(
    ctx: ExecutionContext,
  ): $String {
    ctx.checkTimeout();

    return this.PropName;
  }
}

export class $RegularExpressionLiteral implements I$Node {
  public get $kind(): SyntaxKind.RegularExpressionLiteral { return SyntaxKind.RegularExpressionLiteral; }

  // http://www.ecma-international.org/ecma-262/#sec-regexp-identifier-names-static-semantics-stringvalue
  // 21.2.1.6 Static Semantics: StringValue
  public readonly StringValue: string;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
  public readonly CoveredParenthesizedExpression: $RegularExpressionLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  // 12.2.1.2 Static Semantics: HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  // 12.2.1.3 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  // 12.2.1.4 Static Semantics: IsIdentifierRef
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  // 12.2.1.5 Static Semantics: AssignmentTargetType
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: RegularExpressionLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.RegularExpressionLiteral`,
  ) {
    this.StringValue = node.text;
  }

  // http://www.ecma-international.org/ecma-262/#sec-regular-expression-literals-runtime-semantics-evaluation
  // 12.2.8.2 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Object {
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

export class $NoSubstitutionTemplateLiteral implements I$Node {
  public get $kind(): SyntaxKind.NoSubstitutionTemplateLiteral { return SyntaxKind.NoSubstitutionTemplateLiteral; }

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
  public readonly CoveredParenthesizedExpression: $NoSubstitutionTemplateLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  // 12.2.1.2 Static Semantics: HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  // 12.2.1.3 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  // 12.2.1.4 Static Semantics: IsIdentifierRef
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  // 12.2.1.5 Static Semantics: AssignmentTargetType
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NoSubstitutionTemplateLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.NoSubstitutionTemplateLiteral`,
  ) {}

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  // 12.2.9.6 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $String {
    ctx.checkTimeout();

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // TemplateLiteral : NoSubstitutionTemplate

    // 1. Return the String value whose code units are the elements of the TV of NoSubstitutionTemplate as defined in 11.8.6.
    return intrinsics['']; // TODO: implement this
  }
}

export class $NullLiteral implements I$Node {
  public get $kind(): SyntaxKind.NullKeyword { return SyntaxKind.NullKeyword; }

  public readonly Value: $Null;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
  public readonly CoveredParenthesizedExpression: $NullLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  // 12.2.1.2 Static Semantics: HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  // 12.2.1.3 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  // 12.2.1.4 Static Semantics: IsIdentifierRef
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  // 12.2.1.5 Static Semantics: AssignmentTargetType
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NullLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.NullLiteral`,
  ) {
    this.Value = new $Null(realm, void 0, void 0, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  // 12.2.4.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Null {
    ctx.checkTimeout();

    // Literal : NullLiteral

    // 1. Return null.
    return this.Value;
  }
}

export class $BooleanLiteral implements I$Node {
  public readonly $kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;

  public readonly Value: $Boolean;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  // 12.2.1.1 Static Semantics: CoveredParenthesizedExpression
  public readonly CoveredParenthesizedExpression: $BooleanLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  // 12.2.1.2 Static Semantics: HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  // 12.2.1.3 Static Semantics: IsFunctionDefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  // 12.2.1.4 Static Semantics: IsIdentifierRef
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  // 12.2.1.5 Static Semantics: AssignmentTargetType
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: BooleanLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly idx: number,
    public readonly mos: $$ESModuleOrScript = parent.mos,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger,
    public readonly path: string = `${parent.path}${$i(idx)}.BooleanLiteral`,
  ) {
    this.$kind = node.kind;

    this.Value = new $Boolean(realm, node.kind === SyntaxKind.TrueKeyword, void 0, void 0, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  // 12.2.4.1 Runtime Semantics: Evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Boolean {
    ctx.checkTimeout();

    // Literal : BooleanLiteral

    // 1. If BooleanLiteral is the token false, return false.
    // 2. If BooleanLiteral is the token true, return true.
    return this.Value;
  }
}
