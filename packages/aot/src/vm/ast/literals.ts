/* eslint-disable */
import {
  ArrayBindingElement,
  ArrayBindingPattern,
  ArrayLiteralExpression,
  ArrowFunction,
  AsExpression,
  AwaitExpression,
  BigIntLiteral,
  BinaryExpression,
  BindingElement,
  BindingName,
  Block,
  BooleanLiteral,
  BreakStatement,
  CallExpression,
  CaseBlock,
  CaseClause,
  CatchClause,
  ClassDeclaration,
  ClassExpression,
  CompilerOptions,
  ComputedPropertyName,
  ConditionalExpression,
  ConstructorDeclaration,
  ContinueStatement,
  createIdentifier,
  createSourceFile,
  DebuggerStatement,
  Decorator,
  DefaultClause,
  DeleteExpression,
  DoStatement,
  ElementAccessExpression,
  EmptyStatement,
  EnumDeclaration,
  EnumMember,
  ExportAssignment,
  ExportDeclaration,
  ExportSpecifier,
  ExpressionStatement,
  ExpressionWithTypeArguments,
  ExternalModuleReference,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  GetAccessorDeclaration,
  HeritageClause,
  Identifier,
  IfStatement,
  ImportClause,
  ImportDeclaration,
  ImportEqualsDeclaration,
  ImportSpecifier,
  InterfaceDeclaration,
  JsxAttribute,
  JsxAttributes,
  JsxChild,
  JsxClosingElement,
  JsxClosingFragment,
  JsxElement,
  JsxExpression,
  JsxFragment,
  JsxOpeningElement,
  JsxOpeningFragment,
  JsxSelfClosingElement,
  JsxSpreadAttribute,
  JsxTagNameExpression,
  JsxText,
  LabeledStatement,
  MetaProperty,
  MethodDeclaration,
  Modifier,
  ModifierFlags,
  ModuleBlock,
  ModuleDeclaration,
  NamedExports,
  NamedImports,
  NamespaceExportDeclaration,
  NamespaceImport,
  NewExpression,
  Node,
  NodeArray,
  NodeFlags,
  NonNullExpression,
  NoSubstitutionTemplateLiteral,
  NullLiteral,
  NumericLiteral,
  ObjectBindingPattern,
  ObjectLiteralElementLike,
  ObjectLiteralExpression,
  OmittedExpression,
  ParameterDeclaration,
  ParenthesizedExpression,
  PostfixUnaryExpression,
  PrefixUnaryExpression,
  PropertyAccessExpression,
  PropertyAssignment,
  PropertyDeclaration,
  PropertyName,
  QualifiedName,
  RegularExpressionLiteral,
  ReturnStatement,
  ScriptTarget,
  SemicolonClassElement,
  SetAccessorDeclaration,
  ShorthandPropertyAssignment,
  SourceFile,
  SpreadAssignment,
  SpreadElement,
  StringLiteral,
  SuperExpression,
  SwitchStatement,
  SyntaxKind,
  TaggedTemplateExpression,
  TemplateExpression,
  TemplateHead,
  TemplateMiddle,
  TemplateSpan,
  TemplateTail,
  ThisExpression,
  ThrowStatement,
  tokenToString,
  TryStatement,
  TypeAliasDeclaration,
  TypeAssertion,
  TypeOfExpression,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  VoidExpression,
  WhileStatement,
  WithStatement,
  YieldExpression,
  Statement,
  Expression,
  createConstructor,
  createParameter,
  createToken,
  createBlock,
  createExpressionStatement,
  createCall,
  createSuper,
  createSpread,
} from 'typescript';
import {
  PLATFORM,
  Writable,
  ILogger,
} from '@aurelia/kernel';
import {
  IFile,
  $CompilerOptions,
} from '../../system/interfaces';
import {
  NPMPackage,
} from '../../system/npm-package-loader';
import {
  IModule,
  ResolveSet,
  ResolvedBindingRecord,
  Realm,
  ExecutionContext,
} from '../realm';
import {
  PatternMatcher,
} from '../../system/pattern-matcher';
import {
  $ModuleEnvRec,
  $EnvRec,
  $DeclarativeEnvRec,
  $FunctionEnvRec,
} from '../types/environment-record';
import {
  $AbstractRelationalComparison,
  $InstanceOfOperator,
  $AbstractEqualityComparison,
  $StrictEqualityComparison,
  $Call,
  $Construct,
  $DefinePropertyOrThrow,
} from '../operations';
import {
  $NamespaceExoticObject,
} from '../exotics/namespace';
import {
  $String,
} from '../types/string';
import {
  $Undefined,
} from '../types/undefined';
import {
  $Function,
} from '../types/function';
import {
  $Any,
  CompletionType,
  $AnyNonEmpty,
  $PropertyKey,
  $AnyObject,
  $AnyNonError,
} from '../types/_shared';
import {
  $Object,
} from '../types/object';
import {
  $Reference,
} from '../types/reference';
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
  $Empty,
  empty,
} from '../types/empty';
import {
  $CreateUnmappedArgumentsObject,
  $ArgumentsExoticObject,
} from '../exotics/arguments';
import {
  $CreateListIteratorRecord,
  $IteratorRecord,
  $IteratorStep,
  $IteratorValue,
  $GetIterator,
  $IteratorClose,
} from '../iteration';
import {
  IModuleResolver,
} from '../../service-host';
import {
  $TypeError,
  $Error,
  $SyntaxError,
} from '../types/error';
import {
  $ArrayExoticObject,
} from '../exotics/array';
import {
  $List,
} from '../types/list';
import {
  $PropertyDescriptor,
} from '../types/property-descriptor';
import {
  I$Node,
  Context,
  $$ESDeclaration,
  $NodeWithStatements,
  clearBit,
  modifiersToModifierFlags,
  hasBit,
  $identifier,
  $heritageClauseList,
  $$PropertyName,
  $$AssignmentExpressionOrHigher,
  $$propertyName,
  $assignmentExpression,
  $AssignmentExpressionNode,
  $$TSDeclaration,
  $$BindingName,
  $$bindingName,
  getBoundNames,
  getVarDeclaredNames,
  getVarScopedDeclarations,
  $$TSStatementListItem,
  $$tsStatementList,
  $StatementNode,
  blockDeclarationInstantiation,
  evaluateStatementList,
  $$ESStatement,
  $$esStatement,
  evaluateStatement,
  $$ESLabelledItem,
  $$esLabelledItem,
  getLexicallyDeclaredNames,
  getLexicallyScopedDeclarations,
  $AnyParentNode,
} from './_shared';
import {
  ExportEntryRecord,
  $SourceFile,
} from './modules';
import {
  $Identifier,
  $TemplateExpression,
} from './expressions';
import {
  $HeritageClause,
} from './classes';
import {
  $ObjectBindingPattern,
} from './bindings';

const {
  emptyArray,
  emptyObject,
} = PLATFORM;

// #region Pseudo-literals

export class $TemplateHead implements I$Node {
  public readonly $kind = SyntaxKind.TemplateHead;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateHead,
    public readonly parent: $TemplateExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('TemplateHead'),
  ) {
    this.id = realm.registerNode(this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`Evaluate(#${ctx.id})`);

    return intrinsics.undefined; // TODO: implement this
  }
}

export class $TemplateMiddle implements I$Node {
  public readonly $kind = SyntaxKind.TemplateMiddle;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateMiddle,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('TemplateMiddle'),
  ) {
    this.id = realm.registerNode(this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`Evaluate(#${ctx.id})`);

    return intrinsics.undefined; // TODO: implement this
  }
}

export class $TemplateTail implements I$Node {
  public readonly $kind = SyntaxKind.TemplateTail;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateTail,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('TemplateTail'),
  ) {
    this.id = realm.registerNode(this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`Evaluate(#${ctx.id})`);

    // TemplateSpans : TemplateTail

    // 1. Let tail be the TV of TemplateTail as defined in 11.8.6.
    // 2. Return the String value consisting of the code units of tail.

    return intrinsics.undefined; // TODO: implement this
  }
}

export class $TemplateSpan implements I$Node {
  public readonly $kind = SyntaxKind.TemplateSpan;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $literal: $TemplateMiddle | $TemplateTail;

  public constructor(
    public readonly node: TemplateSpan,
    public readonly parent: $TemplateExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('TemplateSpan'),
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    if (node.literal.kind === SyntaxKind.TemplateMiddle) {
      this.$literal = new $TemplateMiddle(node.literal, this, ctx);
    } else {
      this.$literal = new $TemplateTail(node.literal, this, ctx);
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`Evaluate(#${ctx.id})`);
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
  public readonly $kind = SyntaxKind.NumericLiteral;
  public readonly id: number;

  public readonly Value: $Number;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $NumericLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NumericLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('NumericLiteral'),
  ) {
    this.id = realm.registerNode(this);

    const num = Number(node.text);
    this.PropName = new $String(realm, num.toString(), void 0, void 0, this);
    this.Value = new $Number(realm, num, void 0, void 0, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Number {
    // 1. Return the number whose value is MV of NumericLiteral as defined in 11.8.3.
    return this.Value;
  }

  // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
  public EvaluatePropName(
    ctx: ExecutionContext,
  ): $String {
    return this.PropName;
  }
}

export class $BigIntLiteral implements I$Node {
  public readonly $kind = SyntaxKind.BigIntLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $BigIntLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: BigIntLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('BigIntLiteral'),
  ) {
    this.id = realm.registerNode(this);
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $Number {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    this.logger.debug(`Evaluate(#${ctx.id})`);

    return intrinsics['0']; // TODO: implement this
  }
}

export class $StringLiteral implements I$Node {
  public readonly $kind = SyntaxKind.StringLiteral;
  public readonly id: number;

  public readonly Value: $String;

  // http://www.ecma-international.org/ecma-262/#sec-string-literals-static-semantics-stringvalue
  public readonly StringValue: $String;
  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $StringLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: StringLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('StringLiteral'),
  ) {
    this.id = realm.registerNode(this);

    const StringValue = this.StringValue = new $String(realm, node.text, void 0, void 0, this);
    this.PropName = StringValue;
    this.Value = StringValue;
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $String {
    // Literal : StringLiteral

    // 1. Return the StringValue of StringLiteral as defined in 11.8.4.1.
    return this.Value;
  }

  // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
  public EvaluatePropName(
    ctx: ExecutionContext,
  ): $String {
    return this.PropName;
  }
}

export class $RegularExpressionLiteral implements I$Node {
  public readonly $kind = SyntaxKind.RegularExpressionLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-regexp-identifier-names-static-semantics-stringvalue
  public readonly StringValue: string;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $RegularExpressionLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: RegularExpressionLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('RegularExpressionLiteral'),
  ) {
    this.id = realm.registerNode(this);

    this.StringValue = node.text;
  }

  // http://www.ecma-international.org/ecma-262/#sec-regular-expression-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Object {
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
  public readonly $kind = SyntaxKind.NoSubstitutionTemplateLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $NoSubstitutionTemplateLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NoSubstitutionTemplateLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('NoSubstitutionTemplateLiteral'),
  ) {
    this.id = realm.registerNode(this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-template-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $String {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // TemplateLiteral : NoSubstitutionTemplate

    // 1. Return the String value whose code units are the elements of the TV of NoSubstitutionTemplate as defined in 11.8.6.
    return intrinsics['']; // TODO: implement this
  }
}

export class $NullLiteral implements I$Node {
  public readonly $kind = SyntaxKind.NullKeyword;
  public readonly id: number;

  public readonly Value: $Null;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $NullLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: NullLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('NullLiteral'),
  ) {
    this.id = realm.registerNode(this);

    this.Value = new $Null(realm, void 0, void 0, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Null {
    // Literal : NullLiteral

    // 1. Return null.
    return this.Value;
  }
}

export class $BooleanLiteral implements I$Node {
  public readonly $kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
  public readonly id: number;

  public readonly Value: $Boolean;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $BooleanLiteral = this;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: BooleanLiteral,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('BooleanLiteral'),
  ) {
    this.id = realm.registerNode(this);
    this.$kind = node.kind;

    this.Value = new $Boolean(realm, node.kind === SyntaxKind.TrueKeyword, void 0, void 0, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-literals-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $Boolean {
    // Literal : BooleanLiteral

    // 1. If BooleanLiteral is the token false, return false.
    // 2. If BooleanLiteral is the token true, return true.
    return this.Value;
  }
}
