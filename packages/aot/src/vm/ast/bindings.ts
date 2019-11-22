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
  $$DestructurableBinding,
  getContainsExpression,
  getHasInitializer,
  getIsSimpleParameterList,
} from './_shared';
import {
  ExportEntryRecord,
  $SourceFile,
} from './modules';
import {
  $Identifier,
  $PropertyAssignment,
  $ShorthandPropertyAssignment,
  $SpreadAssignment,
  $NodeWithSpreadElements,
  $ArrayLiteralExpression,
  $NewExpression,
  $CallExpression,
} from './expressions';
import {
  $HeritageClause,
  $PropertyDeclaration,
} from './classes';
import {
  $GetAccessorDeclaration,
  $SetAccessorDeclaration,
  $MethodDeclaration,
} from './methods';
import {
  $EnumMember,
} from './types';

const {
  emptyArray,
  emptyObject,
} = PLATFORM;

export type $$NamedDeclaration = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $MethodDeclaration |
  $PropertyAssignment |
  $ShorthandPropertyAssignment |
  $SpreadAssignment |
  $BindingElement |
  $EnumMember |
  $PropertyDeclaration
);

export class $ComputedPropertyName implements I$Node {
  public readonly $kind = SyntaxKind.ComputedPropertyName;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-static-semantics-propname
  public readonly PropName: $String | $Empty;

  public constructor(
    public readonly node: ComputedPropertyName,
    public readonly parent: $$NamedDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('ComputedPropertyName'),
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    this.PropName = new $Empty(realm, void 0, void 0, this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
  public Evaluate(
    ctx: ExecutionContext,
  ): $String | $Error {
    // ComputedPropertyName : [ AssignmentExpression ]

    // 1. Let exprValue be the result of evaluating AssignmentExpression.
    const exprValue = this.$expression.Evaluate(ctx);

    // 2. Let propName be ? GetValue(exprValue).
    const propName = exprValue.GetValue(ctx);
    if (propName.isAbrupt) { return propName; }

    // 3. Return ? ToPropertyKey(propName).
    return propName.ToPropertyKey(ctx);
  }

  // based on http://www.ecma-international.org/ecma-262/#sec-object-initializer-runtime-semantics-evaluation
  public EvaluatePropName(
    ctx: ExecutionContext,
  ): $String | $Error {
    return this.Evaluate(ctx);
  }
}


export class $ObjectBindingPattern implements I$Node {
  public readonly $kind = SyntaxKind.ObjectBindingPattern;
  public readonly id: number;

  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $elements: readonly $BindingElement[];

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: ObjectBindingPattern,
    public readonly parent: $$DestructurableBinding,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('ObjectBindingPattern'),
  ) {
    this.id = realm.registerNode(this);

    this.combinedModifierFlags = parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx |= Context.InBindingPattern;

    const $elements = this.$elements = node.elements.map(x => new $BindingElement(x, this, ctx));

    this.BoundNames = $elements.flatMap(getBoundNames);
    this.ContainsExpression = $elements.some(getContainsExpression);
    this.HasInitializer = $elements.some(getHasInitializer);
    this.IsSimpleParameterList = $elements.every(getIsSimpleParameterList);
  }

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-bindinginitialization
  public InitializeBinding(
    ctx: ExecutionContext,
    value: $AnyNonEmpty,
    environment: $EnvRec | undefined,
  ): $Any {
    this.logger.debug(`InitializeBinding(#${ctx.id})`);

    const realm = ctx.Realm;

    // BindingPattern : ObjectBindingPattern

    // 1. Perform ? RequireObjectCoercible(value).
    if (value.isNil) {
      return new $TypeError(realm);
    }

    // 2. Return the result of performing BindingInitialization for ObjectBindingPattern using value and environment as arguments.

    // ObjectBindingPattern : { }

    // 1. Return NormalCompletion(empty).

    // ObjectBindingPattern : { BindingPropertyList } { BindingPropertyList , }

    // 1. Perform ? PropertyBindingInitialization for BindingPropertyList using value and environment as the arguments.
    // 2. Return NormalCompletion(empty).

    // ObjectBindingPattern : { BindingRestProperty }

    // 1. Let excludedNames be a new empty List.
    // 2. Return the result of performing RestBindingInitialization of BindingRestProperty with value, environment, and excludedNames as the arguments.

    // ObjectBindingPattern : { BindingPropertyList , BindingRestProperty }

    // 1. Let excludedNames be the result of performing ? PropertyBindingInitialization of BindingPropertyList using value and environment as arguments.
    // 2. Return the result of performing RestBindingInitialization of BindingRestProperty with value, environment, and excludedNames as the arguments.

    // TODO: implement rest element thingy

    const excludedNames: $String[] = [];
    const elements = this.$elements;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      const el = elements[i];
      const result = el.InitializePropertyBinding(ctx, value, environment);
      if (i + 1 === ii) {
        // return result;
      }
    }

    return new $Empty(realm);
  }
}

export type $$ArrayBindingElement = (
  $BindingElement |
  $OmittedExpression
);

export function $$arrayBindingElement(
  node: ArrayBindingElement,
  parent: $ArrayBindingPattern,
  ctx: Context,
): $$ArrayBindingElement {
  switch (node.kind) {
    case SyntaxKind.BindingElement:
      return new $BindingElement(node, parent, ctx);
    case SyntaxKind.OmittedExpression:
      return new $OmittedExpression(node, parent, ctx);
  }
}

export function $$arrayBindingElementList(
  nodes: readonly ArrayBindingElement[],
  parent: $ArrayBindingPattern,
  ctx: Context,
): readonly $$ArrayBindingElement[] {
  const len = nodes.length;
  const $nodes: $$ArrayBindingElement[] = Array(len);

  for (let i = 0; i < len; ++i) {
    $nodes[i] = $$arrayBindingElement(nodes[i], parent, ctx);
  }

  return $nodes;
}

export class $ArrayBindingPattern implements I$Node {
  public readonly $kind = SyntaxKind.ArrayBindingPattern;
  public readonly id: number;

  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $elements: readonly $$ArrayBindingElement[];

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: ArrayBindingPattern,
    public readonly parent: $$DestructurableBinding,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('ArrayBindingPattern'),
  ) {
    this.id = realm.registerNode(this);

    this.combinedModifierFlags = parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx |= Context.InBindingPattern;

    const $elements = this.$elements = $$arrayBindingElementList(node.elements, this, ctx);

    this.BoundNames = $elements.flatMap(getBoundNames);
    this.ContainsExpression = $elements.some(getContainsExpression);
    this.HasInitializer = $elements.some(getHasInitializer);
    this.IsSimpleParameterList = $elements.every(getIsSimpleParameterList);
  }

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-bindinginitialization
  public InitializeBinding(
    ctx: ExecutionContext,
    value: $AnyObject,
    environment: $EnvRec | undefined,
  ): $Any {
    this.logger.debug(`InitializeBinding(#${ctx.id})`);

    // BindingPattern : ArrayBindingPattern

    // 1. Let iteratorRecord be ? GetIterator(value).
    const iteratorRecord = $GetIterator(ctx, value);
    if (iteratorRecord.isAbrupt) { return iteratorRecord; }

    // 2. Let result be IteratorBindingInitialization for ArrayBindingPattern using iteratorRecord and environment as arguments.
    const result = this.InitializeIteratorBinding(ctx, iteratorRecord, environment);
    if (result.isAbrupt) { return result; } // TODO: we sure about this? Spec doesn't say it

    // 3. If iteratorRecord.[[Done]] is false, return ? IteratorClose(iteratorRecord, result).
    if (iteratorRecord['[[Done]]'].isFalsey) {
      return $IteratorClose(ctx, iteratorRecord, result);
    }

    // 4. Return result.
    return result;
  }

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-iteratorbindinginitialization
  public InitializeIteratorBinding(
    ctx: ExecutionContext,
    iteratorRecord: $IteratorRecord,
    environment: $EnvRec | undefined,
  ): $Any {
    this.logger.debug(`InitializeIteratorBinding(#${ctx.id})`);

    const realm = ctx.Realm;

    const elements = this.$elements;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      const el = elements[i];
      switch (el.$kind) {
        case SyntaxKind.OmittedExpression:
          if (i + 1 === ii) {
            // If the last element is an elision, skip it as per the runtime semantics:

            // ArrayBindingPattern : [ BindingElementList , ]

            // 1. Return the result of performing IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.

            // ArrayBindingPattern : [ Elision ]

            // 1. Return the result of performing IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.
            break;
          }
          el.EvaluateDestructuringAssignmentIterator(ctx, iteratorRecord);
          break;
        case SyntaxKind.BindingElement: {
          // ArrayBindingPattern : [ Elision opt BindingRestElement ]

          // 1. If Elision is present, then
            // 1. a. Perform ? IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.
          // 2. Return the result of performing IteratorBindingInitialization for BindingRestElement with iteratorRecord and environment as arguments.

          // ArrayBindingPattern : [ BindingElementList ]

          // 1. Return the result of performing IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.


          // ArrayBindingPattern : [ BindingElementList , Elision ]

          // 1. Perform ? IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.
          // 2. Return the result of performing IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.

          // ArrayBindingPattern : [ BindingElementList , Elision opt BindingRestElement ]

          // 1. Perform ? IteratorBindingInitialization for BindingElementList with iteratorRecord and environment as arguments.
          // 2. If Elision is present, then
            // 2. a. Perform ? IteratorDestructuringAssignmentEvaluation of Elision with iteratorRecord as the argument.
          // 3. Return the result of performing IteratorBindingInitialization for BindingRestElement with iteratorRecord and environment as arguments.

          const result = el.InitializeIteratorBinding(ctx, iteratorRecord, environment);
          if (i + 1 === ii) {
            return result;
          }
        }
      }
    }

    // ArrayBindingPattern : [ ]

    // 1. Return NormalCompletion(empty).
    return new $Empty(realm);
  }
}

export type $$BindingPattern = (
  $ArrayBindingPattern |
  $ObjectBindingPattern
);

export class $BindingElement implements I$Node {
  public readonly $kind = SyntaxKind.BindingElement;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $propertyName: $$PropertyName | undefined;
  public readonly $name: $$BindingName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: BindingElement,
    public readonly parent: $$BindingPattern,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('BindingElement'),
  ) {
    this.id = realm.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);
    this.combinedModifierFlags = this.modifierFlags | parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx = clearBit(ctx, Context.IsBindingName);

    if (node.propertyName === void 0) {
      this.$propertyName = void 0;
      const $name = this.$name = $$bindingName(node.name, this, ctx | Context.IsBindingName);

      this.BoundNames = $name.BoundNames;

      if (node.initializer === void 0) {
        this.$initializer = void 0;

        this.ContainsExpression = $name.ContainsExpression;
        this.HasInitializer = false;
        this.IsSimpleParameterList = $name.$kind === SyntaxKind.Identifier;
      } else {
        this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

        this.ContainsExpression = true;
        this.HasInitializer = true;
        this.IsSimpleParameterList = false;
      }

    } else {
      const $propertyName = this.$propertyName = $$propertyName(node.propertyName, this, ctx);
      const $name = this.$name = $$bindingName(node.name, this, ctx | Context.IsBindingName);

      this.BoundNames = $name.BoundNames;

      if (node.initializer === void 0) {
        this.$initializer = void 0;

        this.ContainsExpression = $propertyName.$kind === SyntaxKind.ComputedPropertyName || $name.ContainsExpression;
        this.HasInitializer = false;
        this.IsSimpleParameterList = $name.$kind === SyntaxKind.Identifier;
      } else {
        this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

        this.ContainsExpression = true;
        this.HasInitializer = true;
        this.IsSimpleParameterList = false;
      }
    }
  }

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-propertybindinginitialization
  public InitializePropertyBinding(
    ctx: ExecutionContext,
    value: $AnyNonEmpty,
    environment: $EnvRec | undefined,
  ): readonly $String[] | $Any {
    this.logger.debug(`InitializePropertyBinding(#${ctx.id})`);

    const PropertyName = this.$propertyName;

    // BindingProperty : SingleNameBinding

    if (PropertyName === void 0) {
      // 1. Let name be the string that is the only element of BoundNames of SingleNameBinding.
      // 2. Perform ? KeyedBindingInitialization for SingleNameBinding using value, environment, and name as the arguments.
      // 3. Return a new List containing name.

      // Cast is safe because when propertyName is undefined, destructuring is syntactically not possible
      return (this.$name as $Identifier).InitializePropertyBinding(ctx, value, environment);
    }

    // BindingProperty : PropertyName : BindingElement

    // 1. Let P be the result of evaluating PropertyName.
    const P = PropertyName.Evaluate(ctx);

    // 2. ReturnIfAbrupt(P).
    if (P.isAbrupt) {
      return P;
    }

    // 3. Perform ? KeyedBindingInitialization of BindingElement with value, environment, and P as the arguments.
    this.InitializeKeyedBinding(ctx, value, environment, P as $String); // TODO: this cast is very wrong. Need to revisit later

    // 4. Return a new List containing P.
    return [P as $String]; // TODO: this cast is very wrong. Need to revisit later
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-keyedbindinginitialization
  public InitializeKeyedBinding(
    ctx: ExecutionContext,
    value: $AnyNonEmpty,
    environment: $EnvRec | undefined,
    propertyName: $String,
    initializer?: $$AssignmentExpressionOrHigher,
  ): $Any {
    this.logger.debug(`InitializeKeyedBinding(#${ctx.id})`);

    const realm = ctx.Realm;

    const BindingElement = this.$name;

    // SingleNameBinding : BindingIdentifier Initializer opt

    // 1. Let bindingId be StringValue of BindingIdentifier.
    // 2. Let lhs be ? ResolveBinding(bindingId, environment).
    // 3. Let v be ? GetV(value, propertyName).
    // 4. If Initializer is present and v is undefined, then
      // 4. a. If IsAnonymousFunctionDefinition(Initializer) is true, then
        // 4. a. i. Set v to the result of performing NamedEvaluation for Initializer with argument bindingId.
      // 4. b. Else,
        // 4. b. i. Let defaultValue be the result of evaluating Initializer.
        // 4. b. ii. Set v to ? GetValue(defaultValue).
    // 5. If environment is undefined, return ? PutValue(lhs, v).
    // 6. Return InitializeReferencedBinding(lhs, v).
    if (BindingElement.$kind === SyntaxKind.Identifier) {
      return BindingElement.InitializeKeyedBinding(ctx, value, environment, propertyName, initializer);
    }


    // BindingElement : BindingPattern Initializer opt

    // 1. Let v be ? GetV(value, propertyName).
    const obj = value.ToObject(ctx);
    if (obj.isAbrupt) { return obj; }
    let v = obj['[[Get]]'](ctx, propertyName, obj);
    if (v.isAbrupt) { return v; }

    // 2. If Initializer is present and v is undefined, then
    if (initializer !== void 0 && v.isUndefined) {
      // 2. a. Let defaultValue be the result of evaluating Initializer.
      const defaultValue = initializer.Evaluate(ctx);

      // 2. b. Set v to ? GetValue(defaultValue).
      v = defaultValue.GetValue(ctx);
    }

    // 3. Return the result of performing BindingInitialization for BindingPattern passing v and environment as arguments.
    return BindingElement.InitializeBinding(ctx, v as $Object, environment);
  }

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-runtime-semantics-iteratorbindinginitialization
  public InitializeIteratorBinding(
    ctx: ExecutionContext,
    iteratorRecord: $IteratorRecord,
    environment: $EnvRec | undefined,
  ): $Any {
    this.logger.debug(`InitializeIteratorBinding(#${ctx.id})`);

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    const BindingElement = this.$name;

    // BindingElement : SingleNameBinding

    // 1. Return the result of performing IteratorBindingInitialization for SingleNameBinding with iteratorRecord and environment as the arguments.

    // SingleNameBinding : BindingIdentifier Initializer opt

    // 1. Let bindingId be StringValue of BindingIdentifier.
    // 2. Let lhs be ? ResolveBinding(bindingId, environment).
    // 3. If iteratorRecord.[[Done]] is false, then
      // 3. a. Let next be IteratorStep(iteratorRecord).
      // 3. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
      // 3. c. ReturnIfAbrupt(next).
      // 3. d. If next is false, set iteratorRecord.[[Done]] to true.
      // 3. e. Else,
        // 3. e. i. Let v be IteratorValue(next).
        // 3. e. ii. If v is an abrupt completion, set iteratorRecord.[[Done]] to true.
        // 3. e. iii. ReturnIfAbrupt(v).
    // 4. If iteratorRecord.[[Done]] is true, let v be undefined.
    // 5. If Initializer is present and v is undefined, then
      // 5. a. If IsAnonymousFunctionDefinition(Initializer) is true, then
        // 5. a. i. Set v to the result of performing NamedEvaluation for Initializer with argument bindingId.
      // 5. b. Else,
        // 5. b. i. Let defaultValue be the result of evaluating Initializer.
        // 5. b. ii. Set v to ? GetValue(defaultValue).
    // 6. If environment is undefined, return ? PutValue(lhs, v).
    // 7. Return InitializeReferencedBinding(lhs, v).

    if (BindingElement.$kind === SyntaxKind.Identifier) {
      return BindingElement.InitializeIteratorBinding(ctx, iteratorRecord, environment, this.$initializer);
    }

    // NOTE: this section is duplicated in ParameterDeclaration
    // BindingElement : BindingPattern Initializer opt

    let v: $Any = intrinsics.undefined; // TODO: sure about this?

    // 1. If iteratorRecord.[[Done]] is false, then
    if (iteratorRecord['[[Done]]'].isFalsey) {
      // 1. a. Let next be IteratorStep(iteratorRecord).
      const next = $IteratorStep(ctx, iteratorRecord);

      // 1. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
      if (next.isAbrupt) {
        iteratorRecord['[[Done]]'] = intrinsics.true;

        // 1. c. ReturnIfAbrupt(next).
        if (next.isAbrupt) {
          return next;
        }
      }

      // 1. d. If next is false, set iteratorRecord.[[Done]] to true.
      if (next.isFalsey) {
        iteratorRecord['[[Done]]'] = intrinsics.true;
      }
      // 1. e. Else,
      else {
        // 1. e. i. Let v be IteratorValue(next).
        v = $IteratorValue(ctx, next);

        // 1. e. ii. If v is an abrupt completion, set iteratorRecord.[[Done]] to true.
        if (v.isAbrupt) {
          iteratorRecord['[[Done]]'] = intrinsics.true;

          // 1. e. iii. ReturnIfAbrupt(v).
          if (v.isAbrupt) {
            return v;
          }
        }
      }
    }

    // 2. If iteratorRecord.[[Done]] is true, let v be undefined.
    if (iteratorRecord['[[Done]]'].isTruthy) {
      v = intrinsics.undefined;
    }

    const initializer = this.$initializer;

    // 3. If Initializer is present and v is undefined, then
    if (initializer !== void 0 && v.isUndefined) {
      // 3. a. Let defaultValue be the result of evaluating Initializer.
      const defaultValue = initializer.Evaluate(ctx);

      // 3. b. Set v to ? GetValue(defaultValue).
      v = defaultValue.GetValue(ctx);
    }

    // 4. Return the result of performing BindingInitialization of BindingPattern with v and environment as the arguments.
    return BindingElement.InitializeBinding(ctx, v as $Object, environment);
  }
}

export class $SpreadElement implements I$Node {
  public readonly $kind = SyntaxKind.SpreadElement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: SpreadElement,
    public readonly parent: $NodeWithSpreadElements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('SpreadElement'),
  ) {
    this.id = realm.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty | $Error {
    return null as any; // TODO: implement this;
  }
}

export class $OmittedExpression implements I$Node {
  public readonly $kind = SyntaxKind.OmittedExpression;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly $String[] = emptyArray;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: false = false;

  public constructor(
    public readonly node: OmittedExpression,
    public readonly parent: $ArrayBindingPattern | $ArrayLiteralExpression | $NewExpression | $CallExpression,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('OmittedExpression'),
  ) {
    this.id = realm.registerNode(this);
  }

  // http://www.ecma-international.org/ecma-262/#sec-runtime-semantics-iteratordestructuringassignmentevaluation
  public EvaluateDestructuringAssignmentIterator(
    ctx: ExecutionContext,
    iteratorRecord: $IteratorRecord,
  ): $Any {
    this.logger.debug(`EvaluateDestructuringAssignmentIterator(#${ctx.id})`);

    const realm = ctx.Realm;
    const intrinsics = realm['[[Intrinsics]]'];

    // Elision : ,

    // 1. If iteratorRecord.[[Done]] is false, then
    if (iteratorRecord['[[Done]]'].isFalsey) {
      // 1. a. Let next be IteratorStep(iteratorRecord).
      const next = $IteratorStep(ctx, iteratorRecord);

      // 1. b. If next is an abrupt completion, set iteratorRecord.[[Done]] to true.
      if (next.isAbrupt) {
        iteratorRecord['[[Done]]'] = intrinsics.true;

        // 1. c. ReturnIfAbrupt(next).
        return next;
      }

      // 1. d. If next is false, set iteratorRecord.[[Done]] to true.
      if (next.isFalsey) {
        iteratorRecord['[[Done]]'] = intrinsics.true;
      }
    }

    // 2. Return NormalCompletion(empty).
    return new $Empty(realm);
  }

  public Evaluate(
    ctx: ExecutionContext,
  ): $AnyNonEmpty | $Error {
    return null as any; // TODO: implement this;
  }
}

// #endregion
