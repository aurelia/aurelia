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
  $decoratorList,
  $parameterDeclarationList,
  GetExpectedArgumentCount,
} from './_shared';
import {
  ExportEntryRecord,
  $SourceFile,
} from './modules';
import {
  $Identifier,
  $Decorator,
  $ObjectLiteralExpression,
} from './expressions';
import {
  $HeritageClause,
  $ClassDeclaration,
  $ClassExpression,
} from './classes';
import {
  $ObjectBindingPattern,
} from './bindings';
import {
  $ParameterDeclaration,
  MethodDefinitionRecord
} from './functions';
import {
  $Block,
} from './statements';

const {
  emptyArray,
  emptyObject,
} = PLATFORM;

export class $MethodDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.MethodDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: MethodDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('MethodDeclaration'),
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);

    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-definemethod
  public DefineMethod(
    ctx: ExecutionContext,
    object: $Object,
  ): MethodDefinitionRecord | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];
    // NOTE: this logic and signature is adapted to the fact that this is never a constructor method (that's what $ConstructorDeclaration is for)

    // MethodDefinition : PropertyName ( UniqueFormalParameters ) { FunctionBody }

    // 1. Let propKey be the result of evaluating PropertyName.
    const propKey = this.$name.EvaluatePropName(ctx);

    // 2. ReturnIfAbrupt(propKey).
    if (propKey.isAbrupt) { return propKey; }

    // 3. If the function code for this MethodDefinition is strict mode code, let strict be true. Otherwise let strict be false.
    const strict = intrinsics.true; // TODO: use static semantics

    // 4. Let scope be the running execution context's LexicalEnvironment.
    const scope = ctx.LexicalEnvironment;

    // 5. If functionPrototype is present as a parameter, then
      // 5. a. Let kind be Normal.
      // 5. b. Let prototype be functionPrototype.
    // 6. Else,
      // 6. a. Let kind be Method.
      // 6. b. Let prototype be the intrinsic object %FunctionPrototype%.

    const functionPrototype = intrinsics['%FunctionPrototype%'];

    // 7. Let closure be FunctionCreate(kind, UniqueFormalParameters, FunctionBody, scope, strict, prototype).
    const closure = $Function.FunctionCreate(ctx, 'method', this, scope, strict, functionPrototype);

    // 8. Perform MakeMethod(closure, object).
    closure['[[HomeObject]]'] = object;

    // 9. Set closure.[[SourceText]] to the source text matched by MethodDefinition.
    closure['[[SourceText]]'] = new $String(realm, this.node.getText(this.sourceFile.node));

    // 10. Return the Record { [[Key]]: propKey, [[Closure]]: closure }.
    return new MethodDefinitionRecord(propKey, closure);
  }

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
  public EvaluatePropertyDefinition(
    ctx: ExecutionContext,
    object: $Object,
    enumerable: $Boolean,
  ): $Boolean | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // MethodDefinition : PropertyName ( UniqueFormalParameters ) { FunctionBody }

    // 1. Let methodDef be DefineMethod of MethodDefinition with argument object.
    const methodDef = this.DefineMethod(ctx, object);

    // 2. ReturnIfAbrupt(methodDef).
    if (methodDef.isAbrupt) { return methodDef; }

    // 3. Perform SetFunctionName(methodDef.[[Closure]], methodDef.[[Key]]).
    methodDef['[[Closure]]'].SetFunctionName(ctx, methodDef['[[Key]]']);

    // 4. Let desc be the PropertyDescriptor { [[Value]]: methodDef.[[Closure]], [[Writable]]: true, [[Enumerable]]: enumerable, [[Configurable]]: true }.
    const desc = new $PropertyDescriptor(
      realm,
      methodDef['[[Key]]'],
      {
        '[[Value]]': methodDef['[[Closure]]'],
        '[[Writable]]': intrinsics.true,
        '[[Enumerable]]': enumerable,
        '[[Configurable]]': intrinsics.true,
      },
    );

    // 5. Return ? DefinePropertyOrThrow(object, methodDef.[[Key]], desc).
    return $DefinePropertyOrThrow(ctx, object, methodDef['[[Key]]'], desc);
  }
}

export class $GetAccessorDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.GetAccessor;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number = 0;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: GetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('GetAccessorDeclaration'),
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);

    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
  public EvaluatePropertyDefinition(
    ctx: ExecutionContext,
    object: $Object,
    enumerable: $Boolean,
  ): $Boolean | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // MethodDefinition : get PropertyName ( ) { FunctionBody }

    // 1. Let propKey be the result of evaluating PropertyName.
    const propKey = this.$name.EvaluatePropName(ctx);

    // 2. ReturnIfAbrupt(propKey).
    if (propKey.isAbrupt) { return propKey; }

    // 3. If the function code for this MethodDefinition is strict mode code, let strict be true. Otherwise let strict be false.
    const strict = intrinsics.true; // TODO: use static semantics

    // 4. Let scope be the running execution context's LexicalEnvironment.
    const scope = ctx.LexicalEnvironment;

    // 5. Let formalParameterList be an instance of the production FormalParameters:[empty] .
    // 6. Let closure be FunctionCreate(Method, formalParameterList, FunctionBody, scope, strict).
    const closure = $Function.FunctionCreate(ctx, 'method', this, scope, strict);

    // 7. Perform MakeMethod(closure, object).
    closure['[[HomeObject]]'] = object;

    // 8. Perform SetFunctionName(closure, propKey, "get").
    closure.SetFunctionName(ctx, propKey, intrinsics.$get);

    // 9. Set closure.[[SourceText]] to the source text matched by MethodDefinition.
    closure['[[SourceText]]'] = new $String(realm, this.node.getText(this.sourceFile.node));

    // 10. Let desc be the PropertyDescriptor { [[Get]]: closure, [[Enumerable]]: enumerable, [[Configurable]]: true }.
    const desc = new $PropertyDescriptor(
      realm,
      propKey,
      {
        '[[Get]]': closure,
        '[[Enumerable]]': enumerable,
        '[[Configurable]]': intrinsics.true,
      },
    );

    // 11. Return ? DefinePropertyOrThrow(object, propKey, desc).
    return $DefinePropertyOrThrow(ctx, object, propKey, desc);
  }
}

export class $SetAccessorDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.SetAccessor;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number = 1;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: SetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('SetAccessorDeclaration'),
  ) {
    this.id = realm.registerNode(this);

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);

    this.PropName = $name.PropName;
    this.IsStatic = hasBit(modifierFlags, ModifierFlags.Static);
  }

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-runtime-semantics-propertydefinitionevaluation
  public EvaluatePropertyDefinition(
    ctx: ExecutionContext,
    object: $Object,
    enumerable: $Boolean,
  ): $Boolean | $Error {
    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // MethodDefinition : set PropertyName ( PropertySetParameterList ) { FunctionBody }

    // 1. Let propKey be the result of evaluating PropertyName.
    const propKey = this.$name.EvaluatePropName(ctx);

    // 2. ReturnIfAbrupt(propKey).
    if (propKey.isAbrupt) { return propKey; }

    // 3. If the function code for this MethodDefinition is strict mode code, let strict be true. Otherwise let strict be false.
    const strict = intrinsics.true; // TODO: use static semantics

    // 4. Let scope be the running execution context's LexicalEnvironment.
    const scope = ctx.LexicalEnvironment;

    // 5. Let closure be FunctionCreate(Method, PropertySetParameterList, FunctionBody, scope, strict).
    const closure = $Function.FunctionCreate(ctx, 'method', this, scope, strict);

    // 6. Perform MakeMethod(closure, object).
    closure['[[HomeObject]]'] = object;

    // 7. Perform SetFunctionName(closure, propKey, "set").
    closure.SetFunctionName(ctx, propKey, intrinsics.$set);

    // 8. Set closure.[[SourceText]] to the source text matched by MethodDefinition.
    closure['[[SourceText]]'] = new $String(realm, this.node.getText(this.sourceFile.node));

    // 9. Let desc be the PropertyDescriptor { [[Set]]: closure, [[Enumerable]]: enumerable, [[Configurable]]: true }.
    const desc = new $PropertyDescriptor(
      realm,
      propKey,
      {
        '[[Set]]': closure,
        '[[Enumerable]]': enumerable,
        '[[Configurable]]': intrinsics.true,
      },
    );

    // 10. Return ? DefinePropertyOrThrow(object, propKey, desc).
    return $DefinePropertyOrThrow(ctx, object, propKey, desc);
  }
}
