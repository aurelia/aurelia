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
} from './_shared';
import {
  ExportEntryRecord,
  $SourceFile,
} from './modules';
import {
  $Identifier,
} from './expressions';
import {
  $HeritageClause,
} from './classes';

const {
  emptyArray,
  emptyObject,
} = PLATFORM;

export class $InterfaceDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.InterfaceDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$InterfaceDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;
  public readonly $heritageClauses: readonly $HeritageClause[];

  public constructor(
    public readonly node: InterfaceDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('InterfaceDeclaration'),
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    ctx = clearBit(ctx, Context.InTopLevel) | Context.InTypeElement;

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx);
    this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

export class $TypeAliasDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.TypeAliasDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$TypeAliasDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;

  public constructor(
    public readonly node: TypeAliasDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('TypeAliasDeclaration'),
  ) {
    this.id = realm.registerNode(this);
    const intrinsics = realm['[[Intrinsics]]'];

    ctx = clearBit(ctx, Context.InTopLevel) | Context.InTypeElement;

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

export function $enumMemberList(
  nodes: readonly EnumMember[],
  parent: $EnumDeclaration,
  ctx: Context,
): readonly $EnumMember[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $EnumMember[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $EnumMember(nodes[i], parent, ctx);
  }
  return $nodes;
}

export class $EnumDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.EnumDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly BoundNames: readonly [$String];
  public readonly VarDeclaredNames: readonly $String[] = emptyArray;
  public readonly VarScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;
  public readonly LexicallyDeclaredNames: readonly $String[] = emptyArray;
  public readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[] = emptyArray;

  public readonly ExportedBindings: readonly $String[];
  public readonly ExportedNames: readonly $String[];
  public readonly ExportEntries: readonly ExportEntryRecord[];

  public readonly TypeDeclarations: readonly [$EnumDeclaration];
  public readonly IsType: true = true;

  public readonly $name: $Identifier;
  public readonly $members: readonly $EnumMember[];

  public constructor(
    public readonly node: EnumDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('EnumDeclaration'),
  ) {
    this.id = realm.registerNode(this);

    ctx = clearBit(ctx, Context.InTopLevel);
    const intrinsics = realm['[[Intrinsics]]'];

    const modifierFlags = this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    if (hasBit(modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $name = this.$name = $identifier(node.name, this, ctx);
    this.$members = $enumMemberList(node.members, this, ctx);

    const BoundNames = this.BoundNames = $name.BoundNames;
    this.TypeDeclarations = [this];

    if (hasBit(ctx, Context.InExport)) {
      const [localName] = BoundNames;

      this.ExportedBindings = BoundNames;
      this.ExportedNames = BoundNames;
      this.ExportEntries = [
        new ExportEntryRecord(
          /* source */this,
          /* ExportName */localName,
          /* ModuleRequest */intrinsics.null,
          /* ImportName */intrinsics.null,
          /* LocalName */localName,
        ),
      ];
    } else {
      this.ExportedBindings = emptyArray;
      this.ExportedNames = emptyArray;
      this.ExportEntries = emptyArray;
    }
  }
}

export class $EnumMember implements I$Node {
  public readonly $kind = SyntaxKind.EnumMember;
  public readonly id: number;

  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: EnumMember,
    public readonly parent: $EnumDeclaration,
    public readonly ctx: Context,
    public readonly sourceFile: $SourceFile = parent.sourceFile,
    public readonly realm: Realm = parent.realm,
    public readonly depth: number = parent.depth + 1,
    public readonly logger: ILogger = parent.logger.scopeTo('EnumMember'),
  ) {
    this.id = realm.registerNode(this);

    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
  }
}
