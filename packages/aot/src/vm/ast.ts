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
} from 'typescript';
import {
  PLATFORM,
  Writable,
  ILogger,
} from '@aurelia/kernel';
import { IFile } from '../system/interfaces';
import { NPMPackage } from '../system/npm-package-loader';
import { Project } from '../project';
const {
  emptyArray,
  emptyObject,
} = PLATFORM;

function hasBit(flag: number, bit: number): boolean {
  return (flag & bit) > 0;
}

function clearBit(flag: number, bit: number): number {
  return (flag | bit) ^ bit;
}

const enum Context {
  None                      = 0b00000000000000000,
  InTopLevel                = 0b00000000000000001,
  InExpressionStatement     = 0b00000000000000010,
  InVariableStatement       = 0b00000000000000100,
  IsBindingName             = 0b00000000000001000,
  InParameterDeclaration    = 0b00000000000010000,
  InCatchClause             = 0b00000000000100000,
  InBindingPattern          = 0b00000000001000000,
  InTypeElement             = 0b00000000010000000,
  IsPropertyAccessName      = 0b00000000100000000,
  IsMemberName              = 0b00000001000000000,
  IsLabel                   = 0b00000010000000000,
  IsLabelReference          = 0b00000100000000000,
  InExport                  = 0b00001000000000000,
  IsConst                   = 0b00010000000000000,
  IsLet                     = 0b00100000000000000,
  IsBlockScoped             = 0b00110000000000000,
  IsVar                     = 0b01000000000000000,
  IsFunctionScoped          = 0b01000000000000000,
  HasMetadata               = 0b10000000000000000,
}

const modifiersToModifierFlags = (function () {
  const lookup = Object.assign(Object.create(null) as {}, {
    [SyntaxKind.ConstKeyword]: ModifierFlags.Const,
    [SyntaxKind.DefaultKeyword]: ModifierFlags.Default,
    [SyntaxKind.ExportKeyword]: ModifierFlags.Export,
    [SyntaxKind.AsyncKeyword]: ModifierFlags.Async,
    [SyntaxKind.PrivateKeyword]: ModifierFlags.Private,
    [SyntaxKind.ProtectedKeyword]: ModifierFlags.Protected,
    [SyntaxKind.PublicKeyword]: ModifierFlags.Public,
    [SyntaxKind.StaticKeyword]: ModifierFlags.Static,
    [SyntaxKind.AbstractKeyword]: ModifierFlags.Abstract,
    [SyntaxKind.DeclareKeyword]: ModifierFlags.Ambient,
    [SyntaxKind.ReadonlyKeyword]: ModifierFlags.Readonly,
  } as const);

  return function (mods: readonly Modifier[] | undefined): ModifierFlags {
    if (mods === void 0) {
      return ModifierFlags.None;
    }
    const len = mods.length;
    if (len === 1) {
      return lookup[mods[0].kind];
    } else if (len === 2) {
      return lookup[mods[0].kind] + lookup[mods[1].kind];
    } else if (len === 3) {
      return lookup[mods[0].kind] + lookup[mods[1].kind] + lookup[mods[2].kind];
    } else {
      // More than 4 modifiers is not possible
      return lookup[mods[0].kind] + lookup[mods[1].kind] + lookup[mods[2].kind] + lookup[mods[3].kind];
    }
  }
})();

export interface I$Node<
  TRoot extends object = object,
  TNode extends object = object,
  > {
  readonly depth: number;
  readonly root: TRoot;
  readonly parent: I$Node;
  readonly node: TNode;
  readonly ctx: Context;
}
// #region TS AST unions

type $PrimaryExpressionNode = (
  $LiteralNode |
  ArrayLiteralExpression |
  ClassExpression |
  FunctionExpression |
  Identifier |
  NewExpression |
  ObjectLiteralExpression |
  ParenthesizedExpression |
  TemplateExpression |
  ThisExpression |
  SuperExpression
);

type $MemberExpressionNode = (
  $PrimaryExpressionNode |
  ElementAccessExpression |
  NonNullExpression |
  PropertyAccessExpression |
  TaggedTemplateExpression
);

type $CallExpressionNode = (
  $MemberExpressionNode |
  CallExpression
);

type $LHSExpressionNode = (
  $CallExpressionNode |
  MetaProperty
);

type $UpdateExpressionNode = (
  $LHSExpressionNode |
  JsxElement |
  JsxFragment |
  JsxSelfClosingElement |
  PostfixUnaryExpression |
  PrefixUnaryExpression
);

type $UnaryExpressionNode = (
  $UpdateExpressionNode |
  AwaitExpression |
  DeleteExpression |
  PrefixUnaryExpression |
  TypeAssertion |
  TypeOfExpression |
  VoidExpression
);

type $BinaryExpressionNode = (
  $UnaryExpressionNode |
  AsExpression |
  BinaryExpression
);

type $AssignmentExpressionNode = (
  $BinaryExpressionNode |
  ArrowFunction |
  ConditionalExpression |
  YieldExpression
);

type $ArgumentOrArrayLiteralElementNode = (
  $AssignmentExpressionNode |
  SpreadElement |
  OmittedExpression
);

type $DeclarationNode = (
  $ModuleStatementNode |
  VariableStatement |
  FunctionDeclaration |
  ClassDeclaration |
  InterfaceDeclaration |
  TypeAliasDeclaration |
  EnumDeclaration
);

type $LiteralNode = (
  NumericLiteral |
  BigIntLiteral |
  StringLiteral |
  RegularExpressionLiteral |
  NoSubstitutionTemplateLiteral |
  NullLiteral |
  BooleanLiteral
);

type $ModuleStatementNode = (
  ModuleDeclaration |
  NamespaceExportDeclaration |
  ImportEqualsDeclaration |
  ImportDeclaration |
  ExportAssignment |
  ExportDeclaration
);

type $StatementNode = (
  Block |
  VariableStatement |
  EmptyStatement |
  ExpressionStatement |
  IfStatement |
  DoStatement |
  WhileStatement |
  ForStatement |
  ForInStatement |
  ForOfStatement |
  ContinueStatement |
  BreakStatement |
  ReturnStatement |
  WithStatement |
  SwitchStatement |
  LabeledStatement |
  ThrowStatement |
  TryStatement |
  DebuggerStatement |
  FunctionDeclaration |
  ClassDeclaration |
  InterfaceDeclaration |
  TypeAliasDeclaration |
  EnumDeclaration |
  ModuleDeclaration |
  NamespaceExportDeclaration |
  ImportEqualsDeclaration |
  ImportDeclaration |
  ExportAssignment |
  ExportDeclaration
);

// #endregion

// #region $Node type unions

type $$BindingPattern = (
  $ArrayBindingPattern |
  $ObjectBindingPattern
);

type $$DestructurableBinding = (
  $VariableDeclaration |
  $ParameterDeclaration |
  $BindingElement
);

type $NodeWithSpreadElements = (
  $ArrayLiteralExpression |
  $CallExpression |
  $NewExpression
);

type $$BindingName = (
  $ArrayBindingPattern |
  $Identifier |
  $ObjectBindingPattern
);

type $$ObjectLiteralElementLike = (
  $PropertyAssignment |
  $ShorthandPropertyAssignment |
  $SpreadAssignment |
  $MethodDeclaration |
  $GetAccessorDeclaration |
  $SetAccessorDeclaration
);

type $$ArrayBindingElement = (
  $BindingElement |
  $OmittedExpression
);

type $$SignatureDeclaration = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $ArrowFunction |
  $ConstructorDeclaration |
  $FunctionDeclaration |
  $FunctionExpression |
  $MethodDeclaration
);

type $$EntityName = (
  $Identifier |
  $QualifiedName
);

type $$NodeWithQualifiedName = (
  $ImportEqualsDeclaration |
  $QualifiedName
);

type $$NamedDeclaration = (
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

type $$PropertyName = (
  $ComputedPropertyName |
  $Identifier |
  $NumericLiteral |
  $StringLiteral
);

type $$ModuleDeclaration = (
  $ExportAssignment |
  $ExportDeclaration |
  $ImportDeclaration |
  $ImportEqualsDeclaration |
  $ModuleDeclaration |
  $NamespaceExportDeclaration
);

type $$ModuleDeclarationParent = (
  $SourceFile |
  $ModuleBlock |
  $ModuleDeclaration
);

type $$ModuleBody = (
  $ModuleBlock |
  $ModuleDeclaration
);

type $$ModuleName = (
  $Identifier |
  $StringLiteral
);

type $$ModuleReference = (
  $$EntityName |
  $ExternalModuleReference
);

type $$ClassElement = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $ConstructorDeclaration |
  $MethodDeclaration |
  $SemicolonClassElement |
  $PropertyDeclaration
);

type $$NodeWithHeritageClauses = (
  $ClassDeclaration |
  $ClassExpression |
  $InterfaceDeclaration
);

type $ClassElementNode = (
  GetAccessorDeclaration |
  SetAccessorDeclaration |
  ConstructorDeclaration |
  MethodDeclaration |
  SemicolonClassElement |
  PropertyDeclaration
);

type $$Declaration = (
  $$ModuleDeclaration |
  $VariableStatement |
  $FunctionDeclaration |
  $ClassDeclaration |
  $InterfaceDeclaration |
  $TypeAliasDeclaration |
  $EnumDeclaration
);

type $$MethodDeclaration = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $MethodDeclaration
);

type $$HasMetadata = (
  $ClassDeclaration |
  $VariableDeclaration
);

type $$NamedModuleItem = (
  $ClassDeclaration |
  $FunctionDeclaration |
  $VariableStatement |
  $EnumDeclaration
);

type $NodeWithDecorators = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $ClassDeclaration |
  $ConstructorDeclaration |
  $EnumDeclaration |
  $ExportAssignment |
  $ExportDeclaration |
  $FunctionDeclaration |
  $ImportDeclaration |
  $ImportEqualsDeclaration |
  $InterfaceDeclaration |
  $MethodDeclaration |
  $ModuleDeclaration |
  $ParameterDeclaration |
  $PropertyDeclaration |
  $TypeAliasDeclaration
);

type $$Literal = (
  $BigIntLiteral |
  $BooleanLiteral |
  $NoSubstitutionTemplateLiteral |
  $NullLiteral |
  $NumericLiteral |
  $RegularExpressionLiteral |
  $StringLiteral
);

type $$PrimaryExpression = (
  $ArrayLiteralExpression |
  $ClassExpression |
  $FunctionExpression |
  $Identifier |
  $NewExpression |
  $ObjectLiteralExpression |
  $ParenthesizedExpression |
  $TemplateExpression |
  $ThisExpression |
  $SuperExpression
);

type $$PrimaryExpressionOrHigher = (
  $$Literal |
  $$PrimaryExpression
);

type $$MemberExpression = (
  $ElementAccessExpression |
  $NonNullExpression |
  $PropertyAccessExpression |
  $TaggedTemplateExpression
);

type $$MemberExpressionOrHigher = (
  $$PrimaryExpressionOrHigher |
  $$MemberExpression
);

type $$CallExpressionOrHigher = (
  $$MemberExpressionOrHigher |
  $CallExpression
);

type $$LHSExpression = (
  $MetaProperty
);

type $$LHSExpressionOrHigher = (
  $$CallExpressionOrHigher |
  $$LHSExpression
);

type $$CoverCallExpressionAndAsyncArrowHead = $$LHSExpressionOrHigher;

type $$UpdateExpression = (
  $JsxElement |
  $JsxFragment |
  $JsxSelfClosingElement |
  $PostfixUnaryExpression |
  $PrefixUnaryExpression
);

type $$UpdateExpressionOrHigher = (
  $$LHSExpressionOrHigher |
  $$UpdateExpression
);

type $$UnaryExpression = (
  $AwaitExpression |
  $DeleteExpression |
  $PrefixUnaryExpression |
  $TypeAssertion |
  $TypeOfExpression |
  $VoidExpression
);

type $$UnaryExpressionOrHigher = (
  $$UpdateExpressionOrHigher |
  $$UnaryExpression
);

type $$BinaryExpression = (
  $AsExpression |
  $BinaryExpression
);

type $$BinaryExpressionOrHigher = (
  $$UnaryExpressionOrHigher |
  $$BinaryExpression
);

type $$AssignmentExpression = (
  $ArrowFunction |
  $ConditionalExpression |
  $YieldExpression
);

type $$AssignmentExpressionOrHigher = (
  $$BinaryExpressionOrHigher |
  $$AssignmentExpression
);

type $$StringLiteralLike = (
  $NoSubstitutionTemplateLiteral |
  $StringLiteral
);

type $$ArgumentOrArrayLiteralElement = (
  $$AssignmentExpressionOrHigher |
  $SpreadElement |
  $OmittedExpression
);

type $$TemplateLiteral = (
  $NoSubstitutionTemplateLiteral |
  $TemplateExpression
);

type $$IterationStatement = (
  $DoStatement |
  $ForInStatement |
  $ForOfStatement |
  $ForStatement |
  $WhileStatement
);

type $$BreakableStatement = (
  $$IterationStatement |
  $SwitchStatement
);

// http://www.ecma-international.org/ecma-262/#prod-Statement
type $$ESStatement = (
  $Block |
  $VariableStatement | // Note, technically only "var declaration" belongs here but TS clumps them up
  $EmptyStatement |
  $ExpressionStatement |
  $IfStatement |
  $$BreakableStatement |
  $ContinueStatement |
  $BreakStatement |
  $ReturnStatement |
  $WithStatement |
  $LabeledStatement |
  $ThrowStatement |
  $TryStatement |
  $DebuggerStatement
);

type $$ESDeclaration = (
  $FunctionDeclaration |
  $ClassDeclaration |
  $VariableStatement
);

type $$StatementListItem = (
  $$ESStatement |
  $$ESDeclaration
);

type $$ModuleItem = (
  $$StatementListItem |
  $$ModuleDeclaration
);

type $$Statement = (
  $$BreakableStatement |
  $$Declaration |
  $Block |
  $BreakStatement |
  $ContinueStatement |
  $DebuggerStatement |
  $EmptyStatement |
  $ExpressionStatement |
  $IfStatement |
  $LabeledStatement |
  $ReturnStatement |
  $ThrowStatement |
  $TryStatement |
  $WithStatement |
  // SourceFile is not technically a statement, but we define it as an "owning statement" as it is the highest
  // level owner of other statements.
  $SourceFile
);

type $$LabelledItem = (
  $$ESStatement |
  $FunctionDeclaration
);

type $NodeWithStatements = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $$IterationStatement |
  $Block |
  $CaseClause |
  $CatchClause |
  $ConstructorDeclaration |
  $DefaultClause |
  $FunctionDeclaration |
  $LabeledStatement |
  $MethodDeclaration |
  $ModuleBlock |
  $SourceFile |
  $TryStatement |
  $WithStatement |
  $FunctionExpression |
  $ArrowFunction |
  $IfStatement
);

type $$Initializer = (
  $$AssignmentExpressionOrHigher |
  $VariableDeclarationList
);

type $AnyParentNode = (
  $$Declaration |
  $ArrayBindingPattern |
  $ArrayLiteralExpression |
  $ArrowFunction |
  $AsExpression |
  $AwaitExpression |
  $BinaryExpression |
  $BindingElement |
  $Block |
  $BreakStatement |
  $CallExpression |
  $CaseBlock |
  $CaseClause |
  $CatchClause |
  $ClassExpression |
  $ComputedPropertyName |
  $ConditionalExpression |
  $ConstructorDeclaration |
  $ContinueStatement |
  $Decorator |
  $DefaultClause |
  $DeleteExpression |
  $DoStatement |
  $ElementAccessExpression |
  $EnumMember |
  $ExportSpecifier |
  $ExpressionStatement |
  $ExpressionWithTypeArguments |
  $ExternalModuleReference |
  $ForInStatement |
  $ForOfStatement |
  $ForStatement |
  $FunctionExpression |
  $GetAccessorDeclaration |
  $HeritageClause |
  $IfStatement |
  $ImportClause |
  $ImportSpecifier |
  $JsxAttribute |
  $JsxAttributes |
  $JsxClosingElement |
  $JsxElement |
  $JsxExpression |
  $JsxFragment |
  $JsxOpeningElement |
  $JsxSelfClosingElement |
  $JsxSpreadAttribute |
  $LabeledStatement |
  $MetaProperty |
  $MethodDeclaration |
  $ModuleBlock |
  $NamedImports |
  $NamespaceImport |
  $NewExpression |
  $NonNullExpression |
  $ObjectBindingPattern |
  $ObjectLiteralExpression |
  $ParameterDeclaration |
  $ParenthesizedExpression |
  $PostfixUnaryExpression |
  $PrefixUnaryExpression |
  $PropertyAccessExpression |
  $PropertyAssignment |
  $PropertyDeclaration |
  $QualifiedName |
  $ReturnStatement |
  $SetAccessorDeclaration |
  $ShorthandPropertyAssignment |
  $SourceFile |
  $SpreadAssignment |
  $SpreadElement |
  $SwitchStatement |
  $TaggedTemplateExpression |
  $TemplateExpression |
  $TemplateSpan |
  $ThrowStatement |
  $TryStatement |
  $TypeAssertion |
  $TypeOfExpression |
  $VariableDeclaration |
  $VariableDeclarationList |
  $VoidExpression |
  $WhileStatement |
  $WithStatement |
  $YieldExpression
);

type $$JsxOpeningLikeElement = (
  $JsxSelfClosingElement |
  $JsxOpeningElement
);

type $$JsxAttributeLike = (
  $JsxAttribute |
  $JsxSpreadAttribute
);

type $$JsxNamed = (
  $JsxOpeningElement |
  $JsxClosingElement |
  $JsxSelfClosingElement
);

type $$JsxTagNameExpression = (
  $Identifier |
  $ThisExpression |
  $$JsxTagNamePropertyAccess
);

type $$JsxChild = (
  $JsxText |
  $JsxExpression |
  $JsxElement |
  $JsxSelfClosingElement |
  $JsxFragment
);

type $$JsxParent = (
  $JsxElement |
  $JsxFragment
);

type $$JsxTagNamePropertyAccess = $PropertyAccessExpression & {
  expression: $$JsxTagNameExpression;
};

// #endregion

// #region Builders

function $heritageClauseList(
  nodes: readonly HeritageClause[] | undefined,
  parent: $$NodeWithHeritageClauses,
  ctx: Context,
): readonly $HeritageClause[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $HeritageClause[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $HeritageClause(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $expressionWithTypeArgumentsList(
  nodes: readonly ExpressionWithTypeArguments[],
  parent: $HeritageClause,
  ctx: Context,
): readonly $ExpressionWithTypeArguments[] {
  if (nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $ExpressionWithTypeArguments[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $ExpressionWithTypeArguments(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $$declaration(
  node: $DeclarationNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$Declaration {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx);
    case SyntaxKind.ClassDeclaration:
      return new $ClassDeclaration(node, parent, ctx);
    case SyntaxKind.InterfaceDeclaration:
      return new $InterfaceDeclaration(node, parent, ctx);
    case SyntaxKind.TypeAliasDeclaration:
      return new $TypeAliasDeclaration(node, parent, ctx);
    case SyntaxKind.EnumDeclaration:
      return new $EnumDeclaration(node, parent, ctx);
    default:
      return $$moduleDeclaration(node, parent as $$ModuleDeclarationParent, ctx);
  }
}

function $$esDeclaration(
  node: $DeclarationNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$ESDeclaration {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx);
    case SyntaxKind.ClassDeclaration:
      return new $ClassDeclaration(node, parent, ctx);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as any).kind]}.`);
  }
}

function $enumMemberList(
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

function $variableDeclarationList(
  nodes: readonly VariableDeclaration[],
  parent: $VariableDeclarationList,
  ctx: Context,
): readonly $VariableDeclaration[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $VariableDeclaration[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $VariableDeclaration(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $decoratorList(
  nodes: readonly Decorator[] | undefined,
  parent: $NodeWithDecorators,
  ctx: Context,
): readonly $Decorator[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  if (nodes.length === 1) {
    return [new $Decorator(nodes[0], parent, ctx)];
  }

  const len = nodes.length;
  const $nodes: $Decorator[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $Decorator(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $LHSExpression(
  node: $LHSExpressionNode,
  parent: $AnyParentNode,
  ctx: Context,
): $$LHSExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.ArrayLiteralExpression:
      return new $ArrayLiteralExpression(node, parent, ctx);
    case SyntaxKind.ClassExpression:
      return new $ClassExpression(node, parent, ctx);
    case SyntaxKind.FunctionExpression:
      return new $FunctionExpression(node, parent, ctx);
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx);
    case SyntaxKind.NewExpression:
      return new $NewExpression(node, parent, ctx);
    case SyntaxKind.ObjectLiteralExpression:
      return new $ObjectLiteralExpression(node, parent, ctx);
    case SyntaxKind.ParenthesizedExpression:
      return new $ParenthesizedExpression(node, parent, ctx);
    case SyntaxKind.TemplateExpression:
      return new $TemplateExpression(node, parent, ctx);
    case SyntaxKind.ElementAccessExpression:
      return new $ElementAccessExpression(node, parent, ctx);
    case SyntaxKind.NonNullExpression:
      return new $NonNullExpression(node, parent, ctx);
    case SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, parent, ctx);
    case SyntaxKind.TaggedTemplateExpression:
      return new $TaggedTemplateExpression(node, parent, ctx);
    case SyntaxKind.CallExpression:
      return new $CallExpression(node, parent, ctx);
    case SyntaxKind.MetaProperty:
      return new $MetaProperty(node, parent, ctx);
    case SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, parent, ctx);
    case SyntaxKind.SuperKeyword:
      return new $SuperExpression(node, parent, ctx);
    default:
      return $literal(node, parent, ctx);
  }
}

function $unaryExpression(
  node: $UnaryExpressionNode,
  parent: $AnyParentNode,
  ctx: Context,
): $$UnaryExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.JsxElement:
      return new $JsxElement(node, parent as $$JsxParent, ctx);
    case SyntaxKind.JsxFragment:
      return new $JsxFragment(node, parent as $$JsxParent, ctx);
    case SyntaxKind.JsxSelfClosingElement:
      return new $JsxSelfClosingElement(node, parent as $$JsxParent, ctx);
    case SyntaxKind.PostfixUnaryExpression:
      return new $PostfixUnaryExpression(node, parent, ctx);
    case SyntaxKind.PrefixUnaryExpression:
      return new $PrefixUnaryExpression(node, parent, ctx);
    case SyntaxKind.AwaitExpression:
      return new $AwaitExpression(node, parent, ctx);
    case SyntaxKind.DeleteExpression:
      return new $DeleteExpression(node, parent, ctx);
    case SyntaxKind.TypeAssertionExpression:
      return new $TypeAssertion(node, parent, ctx);
    case SyntaxKind.TypeOfExpression:
      return new $TypeOfExpression(node, parent, ctx);
    case SyntaxKind.VoidExpression:
      return new $VoidExpression(node, parent, ctx);
    default:
      return $LHSExpression(node, parent, ctx);
  }
}

function $assignmentExpression(
  node: undefined,
  parent: $AnyParentNode,
  ctx: Context,
): undefined;
function $assignmentExpression(
  node: $AssignmentExpressionNode,
  parent: $AnyParentNode,
  ctx: Context,
): $$AssignmentExpressionOrHigher;
function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $$AssignmentExpressionOrHigher | undefined;
function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $$AssignmentExpressionOrHigher | undefined {
  if (node === void 0) {
    return void 0;
  }

  switch (node.kind) {
    case SyntaxKind.AsExpression:
      return new $AsExpression(node, parent, ctx);
    case SyntaxKind.BinaryExpression:
      return new $BinaryExpression(node, parent, ctx);
    case SyntaxKind.ArrowFunction:
      return new $ArrowFunction(node, parent, ctx);
    case SyntaxKind.ConditionalExpression:
      return new $ConditionalExpression(node, parent, ctx);
    case SyntaxKind.YieldExpression:
      return new $YieldExpression(node, parent, ctx);
    default:
      return $unaryExpression(node, parent, ctx);
  }
}

function $assignmentExpressionList(
  nodes: readonly $AssignmentExpressionNode[] | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): readonly $$AssignmentExpressionOrHigher[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$AssignmentExpressionOrHigher[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = $assignmentExpression(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $argumentOrArrayLiteralElement(
  node: $ArgumentOrArrayLiteralElementNode,
  parent: $NodeWithSpreadElements,
  ctx: Context,
): $$ArgumentOrArrayLiteralElement {
  switch (node.kind) {
    case SyntaxKind.SpreadElement:
      return new $SpreadElement(node, parent, ctx);
    case SyntaxKind.OmittedExpression:
      return new $OmittedExpression(node, parent, ctx);
    default:
      return $assignmentExpression(node, parent, ctx);
  }
}

function $argumentOrArrayLiteralElementList(
  nodes: readonly $ArgumentOrArrayLiteralElementNode[] | undefined,
  parent: $NodeWithSpreadElements,
  ctx: Context,
): readonly $$ArgumentOrArrayLiteralElement[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$ArgumentOrArrayLiteralElement[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = $argumentOrArrayLiteralElement(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $$objectLiteralElementLikeList(
  nodes: readonly ObjectLiteralElementLike[],
  parent: $ObjectLiteralExpression,
  ctx: Context,
): readonly $$ObjectLiteralElementLike[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$ObjectLiteralElementLike[] = Array(len);
  let el: ObjectLiteralElementLike;

  for (let i = 0; i < len; ++i) {
    el = nodes[i];
    switch (el.kind) {
      case SyntaxKind.PropertyAssignment:
        $nodes[i] = new $PropertyAssignment(el, parent, ctx);
        break;
      case SyntaxKind.ShorthandPropertyAssignment:
        $nodes[i] = new $ShorthandPropertyAssignment(el, parent, ctx);
        break;
      case SyntaxKind.SpreadAssignment:
        $nodes[i] = new $SpreadAssignment(el, parent, ctx);
        break;
      case SyntaxKind.MethodDeclaration:
        $nodes[i] = new $MethodDeclaration(el, parent, ctx);
        break;
      case SyntaxKind.GetAccessor:
        $nodes[i] = new $GetAccessorDeclaration(el, parent, ctx);
        break;
      case SyntaxKind.SetAccessor:
        $nodes[i] = new $SetAccessorDeclaration(el, parent, ctx);
        break;
    }
  }
  return $nodes;
}

function $$templateSpanList(
  nodes: readonly TemplateSpan[],
  parent: $TemplateExpression,
  ctx: Context,
): readonly $TemplateSpan[] {
  if (nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $TemplateSpan[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $TemplateSpan(nodes[i], parent, ctx);
  }
  return $nodes;
}

function $identifier(
  node: undefined,
  parent: $AnyParentNode,
  ctx: Context,
): undefined;
function $identifier(
  node: Identifier,
  parent: $AnyParentNode,
  ctx: Context,
): $Identifier;
function $identifier(
  node: Identifier | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $Identifier | undefined;
function $identifier(
  node: Identifier | undefined,
  parent: $AnyParentNode,
  ctx: Context,
): $Identifier | undefined {
  if (node === void 0) {
    return void 0;
  }
  return new $Identifier(node, parent, ctx);
}

function $$jsxChildList(
  nodes: readonly JsxChild[],
  parent: $$JsxParent,
  ctx: Context,
): readonly $$JsxChild[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$JsxChild[] = Array(len);
  for (let i = 0; i < len; ++i) {
    switch (nodes[i].kind) {
      case SyntaxKind.JsxText:
        $nodes[i] = new $JsxText(nodes[i] as JsxText, parent, ctx);
        break;
      case SyntaxKind.JsxExpression:
        $nodes[i] = new $JsxExpression(nodes[i] as JsxExpression, parent, ctx);
        break;
      case SyntaxKind.JsxElement:
        $nodes[i] = new $JsxElement(nodes[i] as JsxElement, parent, ctx);
        break;
      case SyntaxKind.JsxSelfClosingElement:
        $nodes[i] = new $JsxSelfClosingElement(nodes[i] as JsxSelfClosingElement, parent, ctx);
        break;
      case SyntaxKind.JsxFragment:
        $nodes[i] = new $JsxFragment(nodes[i] as JsxFragment, parent, ctx);
        break;
    }
  }
  return $nodes;
}

function $$jsxTagNameExpression(
  node: JsxTagNameExpression,
  parent: $$JsxNamed,
  ctx: Context,
): $$JsxTagNameExpression {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx);
    case SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, parent, ctx);
    case SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, parent, ctx) as $$JsxTagNamePropertyAccess;
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
  }
}

function $literal(
  node: $LiteralNode,
  parent: $AnyParentNode,
  ctx: Context,
): $$Literal {
  switch (node.kind) {
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, parent, ctx);
    case SyntaxKind.BigIntLiteral:
      return new $BigIntLiteral(node, parent, ctx);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, parent, ctx);
    case SyntaxKind.RegularExpressionLiteral:
      return new $RegularExpressionLiteral(node, parent, ctx);
    case SyntaxKind.NoSubstitutionTemplateLiteral:
      return new $NoSubstitutionTemplateLiteral(node, parent, ctx);
    case SyntaxKind.NullKeyword:
      return new $NullLiteral(node, parent, ctx);
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
      return new $BooleanLiteral(node, parent, ctx);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as any).kind]}.`);
  }
}

function $$classElementList(
  nodes: readonly $ClassElementNode[] | undefined,
  parent: $ClassDeclaration | $ClassExpression,
  ctx: Context,
): readonly $$ClassElement[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $$ClassElement[] = [];
  let $node: $$ClassElement | undefined;
  let node: $ClassElementNode;
  for (let i = 0; i < len; ++i) {
    node = nodes[i];
    if ((node as { body?: Block }).body !== void 0) {
      $node = $$classElement(nodes[i], parent, ctx);
      if ($node !== void 0) {
        $nodes.push($node);
      }
    }
  }
  return $nodes;
}

function $$classElement(
  node: $ClassElementNode,
  parent: $ClassDeclaration | $ClassExpression,
  ctx: Context,
): $$ClassElement | undefined {
  switch (node.kind) {
    case SyntaxKind.PropertyDeclaration:
      return new $PropertyDeclaration(node, parent, ctx);
    case SyntaxKind.SemicolonClassElement:
      return new $SemicolonClassElement(node, parent, ctx);
    case SyntaxKind.MethodDeclaration:
      return new $MethodDeclaration(node, parent, ctx);
    case SyntaxKind.Constructor:
      return new $ConstructorDeclaration(node, parent, ctx);
    case SyntaxKind.GetAccessor:
      return new $GetAccessorDeclaration(node, parent, ctx);
    case SyntaxKind.SetAccessor:
      return new $SetAccessorDeclaration(node, parent, ctx);
    default:
      return void 0;
  }
}

function $$moduleDeclaration(
  node: $ModuleStatementNode,
  parent: $$ModuleDeclarationParent,
  ctx: Context,
): $$ModuleDeclaration {
  switch (node.kind) {
    case SyntaxKind.ModuleDeclaration:
      return new $ModuleDeclaration(node, parent, ctx);
    case SyntaxKind.NamespaceExportDeclaration:
      return new $NamespaceExportDeclaration(node, parent, ctx);
    case SyntaxKind.ImportEqualsDeclaration:
      return new $ImportEqualsDeclaration(node, parent as $SourceFile | $ModuleBlock, ctx);
    case SyntaxKind.ImportDeclaration:
      return new $ImportDeclaration(node, parent as $SourceFile | $ModuleBlock, ctx);
    case SyntaxKind.ExportAssignment:
      return new $ExportAssignment(node, parent as $SourceFile, ctx);
    case SyntaxKind.ExportDeclaration:
      return new $ExportDeclaration(node, parent as $SourceFile | $ModuleBlock, ctx);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
  }
}

function $$propertyName(
  node: PropertyName,
  parent: $AnyParentNode,
  ctx: Context,
): $$PropertyName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, parent, ctx);
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, parent, ctx);
    case SyntaxKind.ComputedPropertyName:
      return new $ComputedPropertyName(node, parent as $$NamedDeclaration, ctx);
  }
}

function $parameterDeclarationList(
  nodes: readonly ParameterDeclaration[] | undefined,
  parent: $$SignatureDeclaration,
  ctx: Context,
): readonly $ParameterDeclaration[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $ParameterDeclaration[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $ParameterDeclaration(nodes[i], parent, ctx);
  }
  return $nodes;
}

function ParameterDeclarationsToBoundNames(params: readonly $ParameterDeclaration[]): readonly string[] {
  const len = params.length;
  if (len === 0) {
    return PLATFORM.emptyArray;
  }

  const BoundNames: string[] = [];
  for (let i = 0; i < len; ++i) {
    BoundNames.push(...params[i].BoundNames);
  }
  return BoundNames;
}

function ParameterDeclarationToContainsExpression(params: readonly $ParameterDeclaration[]): boolean {
  const len = params.length;
  for (let i = 0; i < len; ++i) {
    if (params[i].ContainsExpression) {
      return true;
    }
  }
  return false;
}

function ParameterDeclarationToHasInitializer(params: readonly $ParameterDeclaration[]): boolean {
  const len = params.length;
  for (let i = 0; i < len; ++i) {
    if (params[i].HasInitializer) {
      return true;
    }
  }
  return false;
}

function ParameterDeclarationToIsSimpleParameterList(params: readonly $ParameterDeclaration[]): boolean {
  const len = params.length;
  for (let i = 0; i < len; ++i) {
    if (params[i].IsSimpleParameterList) {
      return true;
    }
  }
  return false;
}

function $$bindingName(
  node: BindingName,
  parent: $$DestructurableBinding,
  ctx: Context,
): $$BindingName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx | Context.IsBindingName);
    case SyntaxKind.ObjectBindingPattern:
      return new $ObjectBindingPattern(node, parent, ctx);
    case SyntaxKind.ArrayBindingPattern:
      return new $ArrayBindingPattern(node, parent, ctx);
  }
}

function $$arrayBindingElement(
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


function $$arrayBindingElementList(
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

function $$statement(
  node: $StatementNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$Statement {
  switch (node.kind) {
    case SyntaxKind.Block:
      return new $Block(node, parent, ctx);
    case SyntaxKind.EmptyStatement:
      return new $EmptyStatement(node, parent, ctx);
    case SyntaxKind.ExpressionStatement:
      return new $ExpressionStatement(node, parent, ctx);
    case SyntaxKind.IfStatement:
      return new $IfStatement(node, parent, ctx);
    case SyntaxKind.DoStatement:
      return new $DoStatement(node, parent, ctx);
    case SyntaxKind.WhileStatement:
      return new $WhileStatement(node, parent, ctx);
    case SyntaxKind.ForStatement:
      return new $ForStatement(node, parent, ctx);
    case SyntaxKind.ForInStatement:
      return new $ForInStatement(node, parent, ctx);
    case SyntaxKind.ForOfStatement:
      return new $ForOfStatement(node, parent, ctx);
    case SyntaxKind.ContinueStatement:
      return new $ContinueStatement(node, parent, ctx);
    case SyntaxKind.BreakStatement:
      return new $BreakStatement(node, parent, ctx);
    case SyntaxKind.ReturnStatement:
      return new $ReturnStatement(node, parent, ctx);
    case SyntaxKind.WithStatement:
      return new $WithStatement(node, parent, ctx);
    case SyntaxKind.SwitchStatement:
      return new $SwitchStatement(node, parent, ctx);
    case SyntaxKind.LabeledStatement:
      return new $LabeledStatement(node, parent, ctx);
    case SyntaxKind.ThrowStatement:
      return new $ThrowStatement(node, parent, ctx);
    case SyntaxKind.TryStatement:
      return new $TryStatement(node, parent, ctx);
    case SyntaxKind.DebuggerStatement:
      return new $DebuggerStatement(node, parent, ctx);
    default:
      return $$declaration(node, parent, ctx);
  }
}

function $$esStatement(
  node: $StatementNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$ESStatement {
  switch (node.kind) {
    case SyntaxKind.Block:
      return new $Block(node, parent, ctx);
    case SyntaxKind.EmptyStatement:
      return new $EmptyStatement(node, parent, ctx);
    case SyntaxKind.ExpressionStatement:
      return new $ExpressionStatement(node, parent, ctx);
    case SyntaxKind.IfStatement:
      return new $IfStatement(node, parent, ctx);
    case SyntaxKind.DoStatement:
      return new $DoStatement(node, parent, ctx);
    case SyntaxKind.WhileStatement:
      return new $WhileStatement(node, parent, ctx);
    case SyntaxKind.ForStatement:
      return new $ForStatement(node, parent, ctx);
    case SyntaxKind.ForInStatement:
      return new $ForInStatement(node, parent, ctx);
    case SyntaxKind.ForOfStatement:
      return new $ForOfStatement(node, parent, ctx);
    case SyntaxKind.ContinueStatement:
      return new $ContinueStatement(node, parent, ctx);
    case SyntaxKind.BreakStatement:
      return new $BreakStatement(node, parent, ctx);
    case SyntaxKind.ReturnStatement:
      return new $ReturnStatement(node, parent, ctx);
    case SyntaxKind.WithStatement:
      return new $WithStatement(node, parent, ctx);
    case SyntaxKind.SwitchStatement:
      return new $SwitchStatement(node, parent, ctx);
    case SyntaxKind.LabeledStatement:
      return new $LabeledStatement(node, parent, ctx);
    case SyntaxKind.ThrowStatement:
      return new $ThrowStatement(node, parent, ctx);
    case SyntaxKind.TryStatement:
      return new $TryStatement(node, parent, ctx);
    case SyntaxKind.DebuggerStatement:
      return new $DebuggerStatement(node, parent, ctx);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
  }
}

function $$esStatementListItem(
  node: $StatementNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$StatementListItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx);
    case SyntaxKind.ClassDeclaration:
      return new $ClassDeclaration(node, parent, ctx);
    default:
      return $$esStatement(node, parent, ctx);
  }
}

function $$esLabelledItem(
  node: $StatementNode,
  parent: $NodeWithStatements,
  ctx: Context,
): $$LabelledItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx);
    default:
      return $$esStatement(node, parent, ctx);
  }
}

function $$esStatementList(
  nodes: readonly $StatementNode[],
  parent: $NodeWithStatements,
  ctx: Context,
): readonly $$StatementListItem[] {
  const len = nodes.length;
  let node: $StatementNode;
  const $nodes: $$StatementListItem[] = [];


  for (let i = 0; i < len; ++i) {
    node = nodes[i];
    if (node.kind === SyntaxKind.FunctionDeclaration && node.body === void 0) {
      continue;
    }
    $nodes.push($$esStatementListItem(node, parent, ctx));
  }
  return $nodes;
}

function $$statementList(
  nodes: readonly $StatementNode[],
  parent: $NodeWithStatements,
  ctx: Context,
): readonly $$Statement[] {
  const len = nodes.length;
  let node: $StatementNode;
  const $nodes: $$Statement[] = [];


  for (let i = 0; i < len; ++i) {
    node = nodes[i];
    if (node.kind === SyntaxKind.FunctionDeclaration && node.body === void 0) {
      continue;
    }
    $nodes.push($$statement(node, parent, ctx));
  }
  return $nodes;
}

// #endregion

// #region AST helpers

function GetDirectivePrologue(statements: readonly $$Statement[]): $DirectivePrologue {
  let directivePrologue: $ExpressionStatement_T<$StringLiteral>[] = emptyArray;

  let statement: $ExpressionStatement_T<$StringLiteral>;
  const len = statements.length;
  for (let i = 0; i < len; ++i) {
    statement = statements[i] as $ExpressionStatement_T<$StringLiteral>;
    if (
      statement.$kind === SyntaxKind.ExpressionStatement
      && statement.$expression.$kind === SyntaxKind.StringLiteral
    ) {
      if (directivePrologue === emptyArray) {
        directivePrologue = [statement];
      } else {
        directivePrologue.push(statement);
      }
      if (statement.$expression.node.text === 'use strict') {
        (directivePrologue as Writable<$DirectivePrologue>).ContainsUseStrict = true;
      }
    } else {
      break;
    }
  }

  return directivePrologue;
}

function GetExpectedArgumentCount(params: readonly $ParameterDeclaration[]): number {
  const len = params.length;
  for (let i = 0; i < len; ++i) {
    if (params[i].HasInitializer) {
      return i;
    }
  }

  return len;
}

const SyntheticAnonymousBoundNames = ['*default*'] as const;

// http://www.ecma-international.org/ecma-262/#sec-isanonymousfunctiondefinition
function IsAnonymousFunctionDefinition(expr: $$AssignmentExpressionOrHigher | $FunctionDeclaration | $FunctionExpression): expr is $FunctionDeclaration | $FunctionExpression {
  // 1. If IsFunctionDefinition of expr is false, return false.
  // 2. Let hasName be the result of HasName of expr.
  // 3. If hasName is true, return false.
  // 4. Return true.

  return (expr instanceof $FunctionDeclaration || expr instanceof $FunctionExpression) && !expr.HasName;
}

function VariableDeclarationsToBoundNames(declarations: readonly $VariableDeclaration[]): readonly string[] {
  const BoundNames: string[] = [];
  const len = declarations.length;
  for (let i = 0; i < len; ++i) {
    BoundNames.push(...declarations[i].BoundNames);
  }
  return BoundNames;
}

function VariableDeclarationsToVarDeclaredNames(declarations: readonly $VariableDeclaration[]): readonly string[] {
  const VarDeclaredNames: string[] = [];
  const len = declarations.length;
  for (let i = 0; i < len; ++i) {
    VarDeclaredNames.push(...declarations[i].VarDeclaredNames);
  }
  return VarDeclaredNames;
}

function VariableDeclarationsToVarScopedDeclarations(declarations: readonly $VariableDeclaration[]): readonly $VariableDeclaration[] {
  const VarScopedDeclarations: $VariableDeclaration[] = [];
  const len = declarations.length;
  for (let i = 0; i < len; ++i) {
    VarScopedDeclarations.push(...declarations[i].VarScopedDeclarations);
  }
  return VarScopedDeclarations;
}

function isIIFE(expr: $FunctionExpression | $ArrowFunction): boolean {
  let prev = expr as I$Node;
  let parent = expr.parent as I$Node;
  while ((parent.node as Node).kind === SyntaxKind.ParenthesizedExpression) {
    prev = parent;
    parent = parent.parent;
  }

  // Compare node.expression instead of expression because expression is not set yet (that's what we're initializing right now)
  return (parent.node as Node).kind === SyntaxKind.CallExpression && (parent as $CallExpression).node.expression === prev.node;
}

function SpecifiersToBoundNames(elements: readonly $ImportSpecifier[]): readonly string[] {
  const BoundNames: string[] = [];
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    BoundNames.push(...elements[i].BoundNames);
  }
  return BoundNames;
}

function BindingElementsToBoundNames(elements: readonly $BindingElement[]): readonly string[] {
  const BoundNames: string[] = [];
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    BoundNames.push(...elements[i].BoundNames);
  }
  return BoundNames;
}

function BindingElementsToContainsExpression(elements: readonly $BindingElement[]): boolean {
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    if (elements[i].ContainsExpression) {
      return true;
    }
  }
  return false;
}

function BindingElementsToHasInitializer(elements: readonly $BindingElement[]): boolean {
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    if (elements[i].HasInitializer) {
      return true;
    }
  }
  return false;
}

function BindingElementsToIsSimpleParameterList(elements: readonly $BindingElement[]): boolean {
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    if (!elements[i].IsSimpleParameterList) {
      return false;
    }
  }
  return true;
}

function ArrayBindingElementsToBoundNames(elements: readonly $$ArrayBindingElement[]): readonly string[] {
  const BoundNames: string[] = [];
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    BoundNames.push(...elements[i].BoundNames);
  }
  return BoundNames;
}

function ArrayBindingElementsToContainsExpression(elements: readonly $$ArrayBindingElement[]): boolean {
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    if (elements[i].ContainsExpression) {
      return true;
    }
  }
  return false;
}

function ArrayBindingElementsToHasInitializer(elements: readonly $$ArrayBindingElement[]): boolean {
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    if (elements[i].HasInitializer) {
      return true;
    }
  }
  return false;
}

function ArrayBindingElementsToIsSimpleParameterList(elements: readonly $$ArrayBindingElement[]): boolean {
  const len = elements.length;
  for (let i = 0; i < len; ++i) {
    if (!elements[i].IsSimpleParameterList) {
      return false;
    }
  }
  return true;
}


// #endregion

// Just to make the build pass without having to implement everything at once. Easy way to find all places that need to be implemented.
const placeholder = null as any;

// #region AST

// #region Declaration statements

export class $VariableStatement implements I$Node {
  public readonly $kind = SyntaxKind.VariableStatement;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;

  public readonly $declarationList: $VariableDeclarationList;

  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  public readonly BoundNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-vardeclarednames
  public readonly VarDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $VariableDeclaration[];

  public constructor(
    public readonly node: VariableStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);
    this.nodeFlags = node.flags;

    ctx |= Context.InVariableStatement;

    if (hasBit(this.modifierFlags, ModifierFlags.Export)) {
      ctx |= Context.InExport;
    }

    const $declarationList = this.$declarationList = new $VariableDeclarationList(
      node.declarationList,
      this,
      ctx,
    );

    this.BoundNames = $declarationList.BoundNames;
    this.VarDeclaredNames = $declarationList.VarDeclaredNames;
    this.VarScopedDeclarations = $declarationList.VarScopedDeclarations;
  }
}

export class $FunctionDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.FunctionDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier | undefined;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-BoundNames
  public readonly BoundNames: readonly [string | '*default*'] | readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsusestrict
  public readonly ContainsUseStrict: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-HasName
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isconstantdeclaration
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-isconstantdeclaration
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-isconstantdeclaration
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-IsConstantDeclaration
  public readonly IsConstantDeclaration: boofalselean = false;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isfunctiondefinition
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-isfunctiondefinition
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-isfunctiondefinition
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-IsFunctionDefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallydeclarednames
  public readonly LexicallyDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-vardeclarednames
  public readonly VarDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly string[];

  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-hasdirectsuper
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-hasdirectsuper
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-HasDirectSuper
  public readonly HasDirectSuper: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-generator-function-definitions-static-semantics-propname
  // http://www.ecma-international.org/ecma-262/#sec-async-generator-function-definitions-static-semantics-propname
  // http://www.ecma-international.org/ecma-262/#sec-async-function-definitions-static-semantics-PropName
  public readonly PropName: string;

  public readonly DirectivePrologue: $DirectivePrologue;

  public constructor(
    public readonly node: FunctionDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    ctx = clearBit(ctx, Context.InTopLevel);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $identifier(node.name, this, ctx);
    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    const $body = this.$body = new $Block(node.body!, this, ctx);

    this.DirectivePrologue = GetDirectivePrologue($body.$statements);

    if (this.$name === void 0) {
      this.BoundNames = SyntheticAnonymousBoundNames;
    } else {
      if ((this.modifierFlags & ModifierFlags.ExportDefault) === ModifierFlags.ExportDefault) {
        this.BoundNames = [...this.$name.BoundNames, '*default*'];
      } else {
        this.BoundNames = this.$name.BoundNames;
      }
    }

    this.ContainsExpression = $parameters.length === 0 || $parameters.some(p => p.ContainsExpression);
    this.ContainsUseStrict = this.DirectivePrologue.ContainsUseStrict === true;
    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
    this.HasInitializer = $parameters.some(p => p.HasInitializer);
    this.HasName = $name !== void 0;
    this.IsSimpleParameterList = $parameters.every(p => p.IsSimpleParameterList);
  }
}

export class $ClassDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ClassDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier | undefined;
  public readonly $heritageClauses: readonly $HeritageClause[];
  public readonly $members: readonly $$ClassElement[];


  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-boundnames
  public readonly BoundNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-constructormethod
  public readonly ConstructorMethod: any;
  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-hasname
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-nonconstructormethoddefinitions
  public readonly NonConstructorMethodDefinitions: any[];
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-prototypepropertynamelist
  public readonly PrototypePropertyNameList: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-propname
  public readonly PropName: string;

  public constructor(
    public readonly node: ClassDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InTopLevel) | Context.HasMetadata;

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $identifier(node.name, this, ctx);
    this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
    this.$members = $$classElementList(node.members as NodeArray<$ClassElementNode>, this, ctx);

    if (this.$name === void 0) {
      this.BoundNames = SyntheticAnonymousBoundNames;
    } else {
      if ((this.modifierFlags & ModifierFlags.ExportDefault) === ModifierFlags.ExportDefault) {
        this.BoundNames = [...this.$name.BoundNames, '*default*'];
      } else {
        this.BoundNames = this.$name.BoundNames;
      }
    }

    this.HasName = $name !== void 0;
  }
}

export class $InterfaceDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.InterfaceDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier;
  public readonly $heritageClauses: readonly $HeritageClause[];

  public constructor(
    public readonly node: InterfaceDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InTopLevel) | Context.InTypeElement;

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $identifier(node.name, this, ctx);
    this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
  }
}

export class $TypeAliasDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.TypeAliasDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier;

  public constructor(
    public readonly node: TypeAliasDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InTopLevel) | Context.InTypeElement;

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $identifier(node.name, this, ctx);
  }
}

export class $EnumDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.EnumDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $Identifier;
  public readonly $members: readonly $EnumMember[];

  public constructor(
    public readonly node: EnumDeclaration,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InTopLevel);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $identifier(node.name, this, ctx);
    this.$members = $enumMemberList(node.members, this, ctx);
  }
}

// #endregion

// #region Declaration members

export class $VariableDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.VariableDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $name: $$BindingName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-boundnames
  public readonly BoundNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-vardeclarednames
  public readonly VarDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $VariableDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: boolean;

  public constructor(
    public readonly node: VariableDeclaration,
    public readonly parent: $VariableDeclarationList | $CatchClause,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);
    this.nodeFlags = node.flags;

    if (hasBit(ctx, Context.InVariableStatement)) {
      this.combinedNodeFlags = node.flags | (parent as $VariableDeclarationList).combinedNodeFlags;
      this.combinedModifierFlags = this.modifierFlags | (parent as $VariableDeclarationList).combinedModifierFlags;
    } else {
      this.combinedNodeFlags = node.flags;
      this.combinedModifierFlags = this.modifierFlags;
    }

    this.$name = $$bindingName(node.name, this, ctx);

    // Clear this flag because it's used inside $Identifier to declare locals/exports
    // and we don't want to do that on the identifiers in types/initializers.
    ctx = clearBit(ctx, Context.InVariableStatement);

    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

    this.BoundNames = this.$name.BoundNames;
    if (hasBit(ctx, Context.IsVar)) { // TODO: what about parameter and for declarations?
      this.VarDeclaredNames = this.BoundNames;
      this.VarScopedDeclarations = [this];
      this.IsConstantDeclaration = false;
    } else {
      this.VarDeclaredNames = emptyArray;
      this.VarScopedDeclarations = emptyArray;
      this.IsConstantDeclaration = hasBit(ctx, Context.IsConst);
    }
  }
}

export class $VariableDeclarationList implements I$Node {
  public readonly $kind = SyntaxKind.VariableDeclarationList;
  public readonly id: number;

  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $declarations: readonly $VariableDeclaration[];

  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-boundnames
  public readonly BoundNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-vardeclarednames
  public readonly VarDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-variable-statement-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly $VariableDeclaration[];

  public constructor(
    public readonly node: VariableDeclarationList,
    public readonly parent: $VariableStatement | $ForStatement | $ForOfStatement | $ForInStatement,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.nodeFlags = node.flags;

    if (hasBit(ctx, Context.InVariableStatement)) {
      this.combinedNodeFlags = node.flags | (parent as $VariableStatement).nodeFlags;
      this.combinedModifierFlags = (parent as $VariableStatement).modifierFlags;
    } else {
      this.combinedNodeFlags = node.flags;
      this.combinedModifierFlags = ModifierFlags.None;
    }

    if (hasBit(node.flags, NodeFlags.Const)) {
      ctx |= Context.IsConst;
    } else if (hasBit(node.flags, NodeFlags.Let)) {
      ctx |= Context.IsLet;
    } else {
      ctx |= Context.IsVar;
    }

    const $declarations = this.$declarations = $variableDeclarationList(node.declarations, this, ctx);

    this.BoundNames = VariableDeclarationsToBoundNames($declarations);
    this.VarDeclaredNames = VariableDeclarationsToVarDeclaredNames($declarations);
    this.VarScopedDeclarations = VariableDeclarationsToVarScopedDeclarations($declarations);
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
  }
}

export class $HeritageClause implements I$Node {
  public readonly $kind = SyntaxKind.HeritageClause;
  public readonly id: number;

  public readonly $types: readonly $ExpressionWithTypeArguments[];

  public constructor(
    public readonly node: HeritageClause,
    public readonly parent: $$NodeWithHeritageClauses,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$types = $expressionWithTypeArgumentsList(node.types, this, ctx);
  }
}

export class $ExpressionWithTypeArguments implements I$Node {
  public readonly $kind = SyntaxKind.ExpressionWithTypeArguments;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: ExpressionWithTypeArguments,
    public readonly parent: $HeritageClause,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
  }
}

// #endregion

export class $Decorator implements I$Node {
  public readonly $kind = SyntaxKind.Decorator;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: Decorator,
    public readonly parent: $NodeWithDecorators,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
  }
}

// #region LHS

export class $ThisExpression implements I$Node {
  public readonly $kind = SyntaxKind.ThisKeyword;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: ThisExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $SuperExpression implements I$Node {
  public readonly $kind = SyntaxKind.SuperKeyword;
  public readonly id: number;

  public constructor(
    public readonly node: SuperExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $ArrayLiteralExpression implements I$Node {
  public readonly $kind = SyntaxKind.ArrayLiteralExpression;
  public readonly id: number;

  public readonly $elements: readonly $$ArgumentOrArrayLiteralElement[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: ArrayLiteralExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$elements = $argumentOrArrayLiteralElementList(node.elements as NodeArray<$ArgumentOrArrayLiteralElementNode>, this, ctx);
  }
}

export class $ObjectLiteralExpression implements I$Node {
  public readonly $kind = SyntaxKind.ObjectLiteralExpression;
  public readonly id: number;

  public readonly $properties: readonly $$ObjectLiteralElementLike[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: ObjectLiteralExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$properties = $$objectLiteralElementLikeList(node.properties, this, ctx);
  }
}

export class $PropertyAccessExpression implements I$Node {
  public readonly $kind = SyntaxKind.PropertyAccessExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $name: $Identifier;

  public constructor(
    public readonly node: PropertyAccessExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$name = $identifier(node.name, this, ctx | Context.IsPropertyAccessName);
  }
}

export class $ElementAccessExpression implements I$Node {
  public readonly $kind = SyntaxKind.ElementAccessExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $argumentExpression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: ElementAccessExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$argumentExpression = $assignmentExpression(node.argumentExpression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $CallExpression implements I$Node {
  public readonly $kind = SyntaxKind.CallExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $arguments: readonly $$ArgumentOrArrayLiteralElement[];

  // http://www.ecma-international.org/ecma-262/#sec-left-hand-side-expressions-static-semantics-coveredcallexpression
  public readonly CoveredCallExpression: $$CoverCallExpressionAndAsyncArrowHead;

  public constructor(
    public readonly node: CallExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$arguments = $argumentOrArrayLiteralElementList(node.arguments as NodeArray<$ArgumentOrArrayLiteralElementNode>, this, ctx);
  }
}

export class $NewExpression implements I$Node {
  public readonly $kind = SyntaxKind.NewExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;
  public readonly $arguments: readonly $$ArgumentOrArrayLiteralElement[];

  public constructor(
    public readonly node: NewExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
    this.$arguments = $argumentOrArrayLiteralElementList(node.arguments as NodeArray<$ArgumentOrArrayLiteralElementNode>, this, ctx);
  }
}

export class $TaggedTemplateExpression implements I$Node {
  public readonly $kind = SyntaxKind.TaggedTemplateExpression;
  public readonly id: number;

  public readonly $tag: $$LHSExpressionOrHigher;
  public readonly $template: $$TemplateLiteral;

  public constructor(
    public readonly node: TaggedTemplateExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$tag = $LHSExpression(node.tag as $LHSExpressionNode, this, ctx)
    this.$template = node.template.kind === SyntaxKind.NoSubstitutionTemplateLiteral
      ? new $NoSubstitutionTemplateLiteral(node.template, this, ctx)
      : new $TemplateExpression(node.template, this, ctx);
  }
}

export class $FunctionExpression implements I$Node {
  public readonly $kind = SyntaxKind.FunctionExpression;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly isIIFE: boolean;

  public readonly $name: $Identifier | undefined;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-boundnames
  public readonly BoundNames: readonly [string | '*default*'] | readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-containsusestrict
  public readonly ContainsUseStrict: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-hasname
  public readonly HasName: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: true = true;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallydeclarednames
  public readonly LexicallyDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-lexicallyscopeddeclarations
  public readonly LexicallyScopedDeclarations: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-vardeclarednames
  public readonly VarDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-function-definitions-static-semantics-varscopeddeclarations
  public readonly VarScopedDeclarations: readonly string[];

  public readonly DirectivePrologue: $DirectivePrologue;

  public constructor(
    public readonly node: FunctionExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    if (this.isIIFE = isIIFE(this)) {
      ctx = clearBit(ctx, Context.InExpressionStatement);
    } else {
      ctx = clearBit(ctx, Context.InExpressionStatement | Context.InTopLevel);
    }

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const $name = this.$name = $identifier(node.name, this, ctx);
    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    const $body = this.$body = new $Block(node.body, this, ctx);

    this.DirectivePrologue = GetDirectivePrologue($body.$statements);

    this.BoundNames = ParameterDeclarationsToBoundNames(this.$parameters);
    this.ContainsExpression = $parameters.length === 0 || $parameters.some(p => p.ContainsExpression);
    this.ContainsUseStrict = this.DirectivePrologue.ContainsUseStrict === true;
    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
    this.HasInitializer = $parameters.some(p => p.HasInitializer);
    this.HasName = $name !== void 0;
    this.IsSimpleParameterList = $parameters.every(p => p.IsSimpleParameterList);
  }
}

export class $TemplateExpression implements I$Node {
  public readonly $kind = SyntaxKind.TemplateExpression;
  public readonly id: number;

  public readonly $head: $TemplateHead;
  public readonly $templateSpans: readonly $TemplateSpan[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'invalid' = 'invalid';

  public constructor(
    public readonly node: TemplateExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$head = new $TemplateHead(node.head, this, ctx)
    this.$templateSpans = $$templateSpanList(node.templateSpans, this, ctx);
  }
}

export class $ParenthesizedExpression implements I$Node {
  public readonly $kind = SyntaxKind.ParenthesizedExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: ParenthesizedExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $ClassExpression implements I$Node {
  public readonly $kind = SyntaxKind.ClassExpression;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier | undefined;
  public readonly $heritageClauses: readonly $HeritageClause[];
  public readonly $members: readonly $$ClassElement[];

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-boundnames
  public readonly BoundNames: readonly string[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-constructormethod
  public readonly ConstructorMethod: any;

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-hasname
  public readonly HasName: boolean;

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isconstantdeclaration
  public readonly IsConstantDeclaration: boolean;

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: true = true;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-isstatic
  public readonly IsStatic: boolean;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-nonconstructormethoddefinitions
  public readonly NonConstructorMethodDefinitions: any[];

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-prototypepropertynamelist
  public readonly PrototypePropertyNameList: readonly string[];

  // http://www.ecma-international.org/ecma-262/#sec-class-definitions-static-semantics-propname
  public readonly PropName: string;


  public constructor(
    public readonly node: ClassExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement | Context.InTopLevel);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = $identifier(node.name, this, ctx);
    this.$heritageClauses = $heritageClauseList(node.heritageClauses, this, ctx);
    this.$members = $$classElementList(node.members as NodeArray<$ClassElementNode>, this, ctx);
  }
}

export class $NonNullExpression implements I$Node {
  public readonly $kind = SyntaxKind.NonNullExpression;
  public readonly id: number;

  public readonly $expression: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: NonNullExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $LHSExpression(node.expression as $LHSExpressionNode, this, ctx);
  }
}

export class $MetaProperty implements I$Node {
  public readonly $kind = SyntaxKind.MetaProperty;
  public readonly id: number;

  public readonly $name: $Identifier;

  public constructor(
    public readonly node: MetaProperty,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$name = $identifier(node.name, this, ctx);
  }
}

// #endregion

// #region Unary

export class $DeleteExpression implements I$Node {
  public readonly $kind = SyntaxKind.DeleteExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: DeleteExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $TypeOfExpression implements I$Node {
  public readonly $kind = SyntaxKind.TypeOfExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: TypeOfExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $VoidExpression implements I$Node {
  public readonly $kind = SyntaxKind.VoidExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: VoidExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $AwaitExpression implements I$Node {
  public readonly $kind = SyntaxKind.AwaitExpression;
  public readonly id: number;

  public readonly $expression: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: AwaitExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $unaryExpression(node.expression as $UnaryExpressionNode, this, ctx);
  }
}

export class $PrefixUnaryExpression implements I$Node {
  public readonly $kind = SyntaxKind.PrefixUnaryExpression;
  public readonly id: number;

  public readonly $operand: $$UnaryExpressionOrHigher;

  public constructor(
    public readonly node: PrefixUnaryExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$operand = $unaryExpression(node.operand as $UnaryExpressionNode, this, ctx);
  }
}

export class $PostfixUnaryExpression implements I$Node {
  public readonly $kind = SyntaxKind.PostfixUnaryExpression;
  public readonly id: number;

  public readonly $operand: $$LHSExpressionOrHigher;

  public constructor(
    public readonly node: PostfixUnaryExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$operand = $LHSExpression(node.operand as $LHSExpressionNode, this, ctx);
  }
}

export class $TypeAssertion implements I$Node {
  public readonly $kind = SyntaxKind.TypeAssertionExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: TypeAssertion,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx)
  }
}

// #endregion

// #region Assignment

export class $BinaryExpression implements I$Node {
  public readonly $kind = SyntaxKind.BinaryExpression;
  public readonly id: number;

  public readonly $left: $$BinaryExpressionOrHigher;
  public readonly $right: $$BinaryExpressionOrHigher;

  public constructor(
    public readonly node: BinaryExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    const inExpressionStatement = hasBit(ctx, Context.InExpressionStatement);
    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$left = $assignmentExpression(node.left as $BinaryExpressionNode, this, ctx) as $$BinaryExpressionOrHigher
    this.$right = $assignmentExpression(node.right as $BinaryExpressionNode, this, ctx) as $$BinaryExpressionOrHigher
  }
}

export class $ConditionalExpression implements I$Node {
  public readonly $kind = SyntaxKind.ConditionalExpression;
  public readonly id: number;

  public readonly $condition: $$BinaryExpressionOrHigher;
  public readonly $whenTrue: $$AssignmentExpressionOrHigher;
  public readonly $whenFalse: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: ConditionalExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$condition = node.condition.kind === SyntaxKind.BinaryExpression
      ? new $BinaryExpression(node.condition as BinaryExpression, this, ctx)
      : $unaryExpression(node.condition as $UnaryExpressionNode, this, ctx);
    this.$whenTrue = $assignmentExpression(node.whenTrue as $AssignmentExpressionNode, this, ctx)
    this.$whenFalse = $assignmentExpression(node.whenFalse as $AssignmentExpressionNode, this, ctx)
  }
}

export class $ArrowFunction implements I$Node {
  public readonly $kind = SyntaxKind.ArrowFunction;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly isIIFE: boolean;

  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block | $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-boundnames
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-BoundNames
  public readonly BoundNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-containsexpression
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-ContainsExpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-containsusestrict
  public readonly ContainsUseStrict: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-expectedargumentcount
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-ExpectedArgumentCount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-hasname
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-HasName
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-issimpleparameterlist
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-IsSimpleParameterList
  public readonly IsSimpleParameterList: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredformalslist
  public readonly CoveredFormalsList: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-lexicallydeclarednames
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-LexicallyDeclaredNames
  public readonly LexicallyDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-lexicallyscopeddeclarations
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-LexicallyScopedDeclarations
  public readonly LexicallyScopedDeclarations: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-vardeclarednames
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-VarDeclaredNames
  public readonly VarDeclaredNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-arrow-function-definitions-static-semantics-varscopeddeclarations
  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-VarScopedDeclarations
  public readonly VarScopedDeclarations: readonly string[];

  // http://www.ecma-international.org/ecma-262/#sec-async-arrow-function-definitions-static-semantics-CoveredAsyncArrowHead
  public readonly CoveredAsyncArrowHead: readonly $ParameterDeclaration[];

  public readonly DirectivePrologue: $DirectivePrologue;

  public constructor(
    public readonly node: ArrowFunction,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    if (this.isIIFE = isIIFE(this)) {
      ctx = clearBit(ctx, Context.InExpressionStatement);
    } else {
      ctx = clearBit(ctx, Context.InExpressionStatement | Context.InTopLevel);
    }

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx)
    const $body = this.$body = node.body.kind === SyntaxKind.Block
      ? new $Block(node.body as Block, this, ctx)
      : $assignmentExpression(node.body as $AssignmentExpressionNode, this, ctx);

    this.DirectivePrologue = $body.$kind === SyntaxKind.Block ? GetDirectivePrologue($body.$statements) : emptyArray;

    this.BoundNames = ParameterDeclarationsToBoundNames(this.$parameters);
    this.ContainsExpression = false;
    this.ContainsUseStrict = this.DirectivePrologue.ContainsUseStrict === true;
    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
    this.IsSimpleParameterList = $parameters.every(p => p.IsSimpleParameterList);
  }
}

export class $YieldExpression implements I$Node {
  public readonly $kind = SyntaxKind.YieldExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: YieldExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx)
  }
}

export class $AsExpression implements I$Node {
  public readonly $kind = SyntaxKind.AsExpression;
  public readonly id: number;

  public readonly $expression: $$UpdateExpressionOrHigher;

  public constructor(
    public readonly node: AsExpression,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$expression = $assignmentExpression(node.expression as $UpdateExpressionNode, this, ctx) as $$UpdateExpressionOrHigher
  }
}

// #endregion

// #region Pseudo-literals

export class $TemplateHead implements I$Node {
  public readonly $kind = SyntaxKind.TemplateHead;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateHead,
    public readonly parent: $TemplateExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $TemplateMiddle implements I$Node {
  public readonly $kind = SyntaxKind.TemplateMiddle;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateMiddle,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $TemplateTail implements I$Node {
  public readonly $kind = SyntaxKind.TemplateTail;
  public readonly id: number;

  public constructor(
    public readonly node: TemplateTail,
    public readonly parent: $TemplateExpression | $TemplateSpan,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx)
    this.$literal = node.literal.kind === SyntaxKind.TemplateMiddle
      ? new $TemplateMiddle(node.literal, this, ctx)
      : new $TemplateTail(node.literal, this, ctx);
  }
}

// #endregion

export class $Identifier implements I$Node {
  public readonly $kind = SyntaxKind.Identifier;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-identifiers-static-semantics-boundnames
  public readonly BoundNames: readonly [string];
  // http://www.ecma-international.org/ecma-262/#sec-identifiers-static-semantics-assignmenttargettype
  public readonly AssignmentTargetType: 'strict' | 'simple';
  // http://www.ecma-international.org/ecma-262/#sec-identifiers-static-semantics-stringvalue
  public readonly StringValue: string;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-hasname
  public readonly HasName: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isfunctiondefinition
  public readonly IsFunctionDefinition: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-semantics-static-semantics-isidentifierref
  public readonly IsIdentifierRef: true = true;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: false = false;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: true = true;

  public constructor(
    public readonly node: Identifier,
    public readonly parent: $AnyParentNode,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.BoundNames = [node.text] as const;
  }
}

export class $JsxElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxElement;
  public readonly id: number;

  public readonly $openingElement: $JsxOpeningElement;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingElement: $JsxClosingElement;

  public constructor(
    public readonly node: JsxElement,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$openingElement = new $JsxOpeningElement(node.openingElement, this, ctx);
    this.$children = $$jsxChildList(node.children, this, ctx);
    this.$closingElement = new $JsxClosingElement(node.closingElement, this, ctx);
  }
}

export class $JsxSelfClosingElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxSelfClosingElement;
  public readonly id: number;

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public constructor(
    public readonly node: JsxSelfClosingElement,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx);
    this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
  }
}

export class $JsxFragment implements I$Node {
  public readonly $kind = SyntaxKind.JsxFragment;
  public readonly id: number;

  public readonly $openingFragment: $JsxOpeningFragment;
  public readonly $children: readonly $$JsxChild[];
  public readonly $closingFragment: $JsxClosingFragment;

  public constructor(
    public readonly node: JsxFragment,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx = clearBit(ctx, Context.InExpressionStatement);

    this.$openingFragment = new $JsxOpeningFragment(node.openingFragment, this, ctx);
    this.$children = $$jsxChildList(node.children, this, ctx);
    this.$closingFragment = new $JsxClosingFragment(node.closingFragment, this, ctx);
  }
}

export class $JsxText implements I$Node {
  public readonly $kind = SyntaxKind.JsxText;
  public readonly id: number;

  public constructor(
    public readonly node: JsxText,
    public readonly parent: $$JsxParent,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $JsxOpeningElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxOpeningElement;
  public readonly id: number;

  public readonly $tagName: $$JsxTagNameExpression;
  public readonly $attributes: $JsxAttributes;

  public constructor(
    public readonly node: JsxOpeningElement,
    public readonly parent: $JsxElement,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx);
    this.$attributes = new $JsxAttributes(node.attributes, this, ctx);
  }
}

export class $JsxClosingElement implements I$Node {
  public readonly $kind = SyntaxKind.JsxClosingElement;
  public readonly id: number;

  public readonly $tagName: $$JsxTagNameExpression;

  public constructor(
    public readonly node: JsxClosingElement,
    public readonly parent: $JsxElement,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$tagName = $$jsxTagNameExpression(node.tagName, this, ctx);
  }
}

export class $JsxOpeningFragment implements I$Node {
  public readonly $kind = SyntaxKind.JsxOpeningFragment;
  public readonly id: number;

  public constructor(
    public readonly node: JsxOpeningFragment,
    public readonly parent: $JsxFragment,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $JsxClosingFragment implements I$Node {
  public readonly $kind = SyntaxKind.JsxClosingFragment;
  public readonly id: number;

  public constructor(
    public readonly node: JsxClosingFragment,
    public readonly parent: $JsxFragment,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $JsxAttribute implements I$Node {
  public readonly $kind = SyntaxKind.JsxAttribute;
  public readonly id: number;

  public readonly $name: $Identifier;
  public readonly $initializer: $StringLiteral | $JsxExpression | undefined;

  public constructor(
    public readonly node: JsxAttribute,
    public readonly parent: $JsxAttributes,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$name = $identifier(node.name, this, ctx);
    this.$initializer = node.initializer === void 0
      ? void 0
      : node.initializer.kind === SyntaxKind.StringLiteral
        ? new $StringLiteral(node.initializer, this, ctx)
        : new $JsxExpression(node.initializer, this, ctx);
  }
}

export class $JsxAttributes implements I$Node {
  public readonly $kind = SyntaxKind.JsxAttributes;
  public readonly id: number;

  public readonly $properties: readonly $$JsxAttributeLike[];

  public constructor(
    public readonly node: JsxAttributes,
    public readonly parent: $$JsxOpeningLikeElement,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$properties = node.properties.map(
      x => x.kind === SyntaxKind.JsxAttribute
        ? new $JsxAttribute(x, this, ctx)
        : new $JsxSpreadAttribute(x, this, ctx)
    );
  }
}

export class $JsxSpreadAttribute implements I$Node {
  public readonly $kind = SyntaxKind.JsxSpreadAttribute;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: JsxSpreadAttribute,
    public readonly parent: $JsxAttributes,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $JsxExpression implements I$Node {
  public readonly $kind = SyntaxKind.JsxExpression;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: JsxExpression,
    public readonly parent: $$JsxParent | $$JsxAttributeLike,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $NumericLiteral implements I$Node {
  public readonly $kind = SyntaxKind.NumericLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $BigIntLiteral implements I$Node {
  public readonly $kind = SyntaxKind.BigIntLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $StringLiteral implements I$Node {
  public readonly $kind = SyntaxKind.StringLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $RegularExpressionLiteral implements I$Node {
  public readonly $kind = SyntaxKind.RegularExpressionLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $NoSubstitutionTemplateLiteral implements I$Node {
  public readonly $kind = SyntaxKind.NoSubstitutionTemplateLiteral;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $NullLiteral implements I$Node {
  public readonly $kind = SyntaxKind.NullKeyword;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $BooleanLiteral implements I$Node {
  public readonly $kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-coveredparenthesizedexpression
  public readonly CoveredParenthesizedExpression: $ParenthesizedExpression;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
    this.$kind = node.kind;
  }
}

export class $PropertyDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.PropertyDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: PropertyDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
  }
}

export class $MethodDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.MethodDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-hasdirectsuper
  public readonly HasDirectSuper: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: string;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-specialmethod
  public readonly SpecialMethod: boolean;

  public constructor(
    public readonly node: MethodDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    const $parameters = this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);

    this.ExpectedArgumentCount = GetExpectedArgumentCount($parameters);
  }
}

export class $GetAccessorDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.GetAccessor;
  public readonly id: number;


  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$PropertyName;
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number = 0;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-hasdirectsuper
  public readonly HasDirectSuper: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: string;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-specialmethod
  public readonly SpecialMethod: boolean;

  public constructor(
    public readonly node: GetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);
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

  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-expectedargumentcount
  public readonly ExpectedArgumentCount: number = 1;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-hasdirectsuper
  public readonly HasDirectSuper: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-method-definitions-static-semantics-propname
  public readonly PropName: string;
  // http://www.ecma-international.org/ecma-262/#sec-static-semantics-specialmethod
  public readonly SpecialMethod: boolean;

  public constructor(
    public readonly node: SetAccessorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression | $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);
  }
}

export class $SemicolonClassElement implements I$Node {
  public readonly $kind = SyntaxKind.SemicolonClassElement;
  public readonly id: number;

  public constructor(
    public readonly node: SemicolonClassElement,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

export class $ConstructorDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.Constructor;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $parameters: readonly $ParameterDeclaration[];
  public readonly $body: $Block;

  public constructor(
    public readonly node: ConstructorDeclaration,
    public readonly parent: $ClassDeclaration | $ClassExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    this.$parameters = $parameterDeclarationList(node.parameters, this, ctx);
    this.$body = new $Block(node.body!, this, ctx);
  }
}


export class $SourceFile implements I$Node {
  public readonly $kind = SyntaxKind.SourceFile;
  public readonly id: number;

  public readonly root: $SourceFile = this;
  public readonly parent: $SourceFile = this;
  public readonly ctx: Context = Context.None;
  public readonly depth: number = 0;

  public readonly $statements: readonly $$Statement[] = [];

  public readonly DirectivePrologue: $DirectivePrologue;

  public constructor(
    public readonly $file: IFile,
    public readonly node: SourceFile,
    public readonly project: Project,
    public readonly npmPackage: NPMPackage,
  ) {
    this.id = project.registerNode(this);

    const $statements = this.$statements = $$statementList(
      node.statements as NodeArray<$ModuleStatementNode>,
      this,
      Context.InTopLevel,
    );

    this.DirectivePrologue = GetDirectivePrologue($statements);
  }

  public registerNode(node: I$Node): number {
    return this.project.registerNode(node);
  }
}

// #region Statements

export class $ModuleDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ModuleDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $$ModuleName;
  public readonly $body: $Identifier | $ModuleBlock | $ModuleDeclaration | undefined;

  public constructor(
    public readonly node: ModuleDeclaration,
    public readonly parent: $SourceFile | $$ModuleBody,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = node.name.kind === SyntaxKind.Identifier
      ? new $Identifier(node.name, this, ctx)
      : new $StringLiteral(node.name, this, ctx);
    if (node.body === void 0) {
      this.$body = void 0;
    } else {
      switch (node.body.kind) {
        case SyntaxKind.Identifier:
          this.$body = new $Identifier(node.body, this, ctx)
          break;
        case SyntaxKind.ModuleBlock:
          this.$body = new $ModuleBlock(node.body, this, ctx)
          break;
        case SyntaxKind.ModuleDeclaration:
          this.$body = new $ModuleDeclaration(node.body, this, ctx)
          break;
        default:
          throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
      }
    }
  }
}

export class $NamespaceExportDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.NamespaceExportDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier;

  public constructor(
    public readonly node: NamespaceExportDeclaration,
    public readonly parent: $$ModuleDeclarationParent,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = $identifier(node.name, this, ctx);
  }
}

/**
 * One of:
 * - import x = require("mod");
 * - import x = M.x;
 */
export class $ImportEqualsDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ImportEqualsDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier;
  public readonly $moduleReference: $$ModuleReference;

  public constructor(
    public readonly node: ImportEqualsDeclaration,
    public readonly parent: $SourceFile | $ModuleBlock,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = $identifier(node.name, this, ctx);
    switch (node.moduleReference.kind) {
      case SyntaxKind.Identifier:
        this.$moduleReference = new $Identifier(node.moduleReference, this, ctx)
        break;
      case SyntaxKind.QualifiedName:
        this.$moduleReference = new $QualifiedName(node.moduleReference, this, ctx)
        break;
      case SyntaxKind.ExternalModuleReference:
        this.$moduleReference = new $ExternalModuleReference(node.moduleReference, this, ctx)
        break;
      default:
        throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
    }
  }
}

// In case of:
// import "mod"  => importClause = undefined, moduleSpecifier = "mod"
// In rest of the cases, module specifier is string literal corresponding to module
// ImportClause information is shown at its declaration below.
export class $ImportDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ImportDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $importClause: $ImportClause | undefined;
  public readonly $moduleSpecifier: $StringLiteral;

  public readonly BoundNames: readonly string[];

  public constructor(
    public readonly node: ImportDeclaration,
    public readonly parent: $SourceFile | $ModuleBlock,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$importClause = node.importClause === void 0
      ? void 0
      : new $ImportClause(node.importClause, this, ctx);
    this.$moduleSpecifier = new $StringLiteral(node.moduleSpecifier as StringLiteral, this, ctx);

    this.BoundNames = this.$importClause === void 0 ? PLATFORM.emptyArray : this.$importClause.BoundNames;
  }
}

export class $ExportAssignment implements I$Node {
  public readonly $kind = SyntaxKind.ExportAssignment;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public readonly BoundNames: readonly string[];

  public constructor(
    public readonly node: ExportAssignment,
    public readonly parent: $SourceFile,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    this.BoundNames = SyntheticAnonymousBoundNames;
  }
}

export class $ExportDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.ExportDeclaration;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $exportClause: $NamedExports | undefined;
  public readonly $moduleSpecifier: $StringLiteral | undefined;

  public readonly BoundNames: readonly string[];

  public constructor(
    public readonly node: ExportDeclaration,
    public readonly parent: $SourceFile | $ModuleBlock,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$exportClause = node.exportClause === void 0
      ? void 0
      : new $NamedExports(node.exportClause, this, ctx)
    if (node.moduleSpecifier === void 0) {
      this.$moduleSpecifier = void 0;
    } else {
      this.$moduleSpecifier = new $StringLiteral(node.moduleSpecifier as StringLiteral, this, ctx);
    }

    this.BoundNames = PLATFORM.emptyArray;
  }
}

// #endregion

// #region Module declaration children

// In case of:
// import d from "mod" => name = d, namedBinding = undefined
// import * as ns from "mod" => name = undefined, namedBinding: NamespaceImport = { name: ns }
// import d, * as ns from "mod" => name = d, namedBinding: NamespaceImport = { name: ns }
// import { a, b as x } from "mod" => name = undefined, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
// import d, { a, b as x } from "mod" => name = d, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
export class $ImportClause implements I$Node {
  public readonly $kind = SyntaxKind.ImportClause;
  public readonly id: number;

  public readonly $name: $Identifier | undefined;
  public readonly $namedBindings: $NamespaceImport | $NamedImports | undefined;

  public readonly BoundNames: readonly string[];

  public constructor(
    public readonly node: ImportClause,
    public readonly parent: $ImportDeclaration,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$name = $identifier(node.name, this, ctx);
    this.$namedBindings = node.namedBindings === void 0
      ? void 0
      : node.namedBindings.kind === SyntaxKind.NamespaceImport
        ? new $NamespaceImport(node.namedBindings, this, ctx)
        : new $NamedImports(node.namedBindings, this, ctx);

    const BoundNames: string[] = [];
    if (this.$name !== void 0) {
      BoundNames.push(...this.$name.BoundNames);
    }
    if (this.$namedBindings !== void 0) {
      BoundNames.push(...this.$namedBindings.BoundNames);
    }
    this.BoundNames = BoundNames;
  }
}

export class $NamespaceImport implements I$Node {
  public readonly $kind = SyntaxKind.NamespaceImport;
  public readonly id: number;

  public readonly $name: $Identifier;

  public readonly BoundNames: readonly string[];

  public constructor(
    public readonly node: NamespaceImport,
    public readonly parent: $ImportClause,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$name = $identifier(node.name, this, ctx);

    this.BoundNames = this.$name.BoundNames;
  }
}

export class $NamedImports implements I$Node {
  public readonly $kind = SyntaxKind.NamedImports;
  public readonly id: number;

  public readonly $elements: readonly $ImportSpecifier[];

  public readonly BoundNames: readonly string[];

  public constructor(
    public readonly node: NamedImports,
    public readonly parent: $ImportClause,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$elements = node.elements.map(x => new $ImportSpecifier(x, this, ctx));

    this.BoundNames = SpecifiersToBoundNames(this.$elements);
  }
}

export class $ImportSpecifier implements I$Node {
  public readonly $kind = SyntaxKind.ImportSpecifier;
  public readonly id: number;

  public readonly $propertyName: $Identifier | undefined;
  public readonly $name: $Identifier;

  public readonly BoundNames: readonly [string];

  public constructor(
    public readonly node: ImportSpecifier,
    public readonly parent: $NamedImports,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$propertyName = $identifier(node.propertyName, this, ctx);
    this.$name = $identifier(node.name, this, ctx);

    this.BoundNames = this.$name.BoundNames;
  }
}

export class $NamedExports implements I$Node {
  public readonly $kind = SyntaxKind.NamedExports;
  public readonly id: number;

  public readonly $elements: readonly $ExportSpecifier[];

  public constructor(
    public readonly node: NamedExports,
    public readonly parent: $ExportDeclaration,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$elements = node.elements.map(x => new $ExportSpecifier(x, this, ctx));
  }
}

export class $ExportSpecifier implements I$Node {
  public readonly $kind = SyntaxKind.ExportSpecifier;
  public readonly id: number;

  public readonly $propertyName: $Identifier | undefined;
  public readonly $name: $Identifier;

  public constructor(
    public readonly node: ExportSpecifier,
    public readonly parent: $NamedExports,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$propertyName = $identifier(node.propertyName, this, ctx);
    this.$name = $identifier(node.name, this, ctx);
  }
}

export class $ModuleBlock implements I$Node {
  public readonly $kind = SyntaxKind.ModuleBlock;
  public readonly id: number;

  public readonly $statements: readonly $$Statement[];

  public constructor(
    public readonly node: ModuleBlock,
    public readonly parent: $ModuleDeclaration,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$statements = $$statementList(node.statements as NodeArray<$ModuleStatementNode>, this, ctx);
  }
}

export class $ExternalModuleReference implements I$Node {
  public readonly $kind = SyntaxKind.ExternalModuleReference;
  public readonly id: number;

  public readonly $expression: $StringLiteral;

  public constructor(
    public readonly node: ExternalModuleReference,
    public readonly parent: $ImportEqualsDeclaration,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = new $StringLiteral(node.expression as StringLiteral, this, ctx);
  }
}

// #endregion

export class $QualifiedName implements I$Node {
  public readonly $kind = SyntaxKind.QualifiedName;
  public readonly id: number;

  public readonly $left: $$EntityName;
  public readonly $right: $Identifier;

  public constructor(
    public readonly node: QualifiedName,
    public readonly parent: $$NodeWithQualifiedName,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$left = node.left.kind === SyntaxKind.Identifier
      ? new $Identifier(node.left, this, ctx)
      : new $QualifiedName(node.left, this, ctx);
    this.$right = new $Identifier(node.right, this, ctx);
  }
}

export class $ComputedPropertyName implements I$Node {
  public readonly $kind = SyntaxKind.ComputedPropertyName;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: ComputedPropertyName,
    public readonly parent: $$NamedDeclaration,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}


export class $ParameterDeclaration implements I$Node {
  public readonly $kind = SyntaxKind.Parameter;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;
  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $decorators: readonly $Decorator[];
  public readonly $name: $$BindingName;
  public readonly $initializer: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly string[] | readonly [string];
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-containsexpression
  public readonly ContainsExpression: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-hasinitializer
  public readonly HasInitializer: boolean;
  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-issimpleparameterlist
  public readonly IsSimpleParameterList: boolean;

  public constructor(
    public readonly node: ParameterDeclaration,
    public readonly parent: $$SignatureDeclaration,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = this.combinedModifierFlags = modifiersToModifierFlags(node.modifiers);
    this.nodeFlags = this.combinedNodeFlags = node.flags;

    ctx |= Context.InParameterDeclaration;

    this.$decorators = $decoratorList(node.decorators, this, ctx);
    const $name = this.$name = $$bindingName(node.name, this, ctx);
    const $initializer = this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

    this.BoundNames = $name.BoundNames;
    this.ContainsExpression = $initializer !== void 0 || $name.ContainsExpression;
    this.HasInitializer = $initializer !== void 0;
    this.IsSimpleParameterList = $initializer === void 0 && $name.IsSimpleParameterList;
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
  public readonly BoundNames: readonly string[];
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.combinedModifierFlags = parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx |= Context.InBindingPattern;

    const $elements = this.$elements = node.elements.map(x => new $BindingElement(x, this, ctx));

    this.BoundNames = BindingElementsToBoundNames($elements);
    this.ContainsExpression = BindingElementsToContainsExpression($elements);
    this.HasInitializer = BindingElementsToHasInitializer($elements);
    this.IsSimpleParameterList = BindingElementsToIsSimpleParameterList($elements);
  }
}

export class $ArrayBindingPattern implements I$Node {
  public readonly $kind = SyntaxKind.ArrayBindingPattern;
  public readonly id: number;

  public readonly combinedModifierFlags: ModifierFlags;
  public readonly nodeFlags: NodeFlags;
  public readonly combinedNodeFlags: NodeFlags;

  public readonly $elements: readonly $$ArrayBindingElement[];

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly string[];
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.combinedModifierFlags = parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx |= Context.InBindingPattern;

    const $elements = this.$elements = $$arrayBindingElementList(node.elements, this, ctx);

    this.BoundNames = ArrayBindingElementsToBoundNames($elements);
    this.ContainsExpression = ArrayBindingElementsToContainsExpression($elements);
    this.HasInitializer = ArrayBindingElementsToHasInitializer($elements);
    this.IsSimpleParameterList = ArrayBindingElementsToIsSimpleParameterList($elements);
  }
}

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
  public readonly BoundNames: readonly string[];
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);
    this.combinedModifierFlags = this.modifierFlags | parent.combinedModifierFlags;
    this.nodeFlags = node.flags;
    this.combinedNodeFlags = node.flags | parent.combinedModifierFlags;

    ctx = clearBit(ctx, Context.IsBindingName);

    const $propertyName = this.$propertyName = node.propertyName === void 0
      ? void 0
      : $$propertyName(node.propertyName, this, ctx);
    const $name = this.$name = $$bindingName(node.name, this, ctx | Context.IsBindingName);
    const $initializer = this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);

    this.BoundNames = $name.BoundNames;
    this.ContainsExpression = (
      $propertyName !== void 0
      && $propertyName.$kind === SyntaxKind.ComputedPropertyName
    ) || $initializer !== void 0
      ? true
      : $name.ContainsExpression;
    this.HasInitializer = $initializer !== void 0;
    this.IsSimpleParameterList = $initializer === void 0 && $name.$kind === SyntaxKind.Identifier;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $PropertyAssignment implements I$Node {
  public readonly $kind = SyntaxKind.PropertyAssignment;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $$PropertyName;
  public readonly $initializer: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: PropertyAssignment,
    public readonly parent: $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = $$propertyName(node.name, this, ctx | Context.IsMemberName);
    this.$initializer = $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
  }
}

export class $ShorthandPropertyAssignment implements I$Node {
  public readonly $kind = SyntaxKind.ShorthandPropertyAssignment;
  public readonly id: number;

  public readonly modifierFlags: ModifierFlags;

  public readonly $name: $Identifier;
  public readonly $objectAssignmentInitializer: $$AssignmentExpressionOrHigher | undefined;

  public constructor(
    public readonly node: ShorthandPropertyAssignment,
    public readonly parent: $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.modifierFlags = modifiersToModifierFlags(node.modifiers);

    this.$name = $identifier(node.name, this, ctx);
    this.$objectAssignmentInitializer = $assignmentExpression(node.objectAssignmentInitializer as $AssignmentExpressionNode, this, ctx);
  }
}

export class $SpreadAssignment implements I$Node {
  public readonly $kind = SyntaxKind.SpreadAssignment;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  public constructor(
    public readonly node: SpreadAssignment,
    public readonly parent: $ObjectLiteralExpression,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $OmittedExpression implements I$Node {
  public readonly $kind = SyntaxKind.OmittedExpression;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-destructuring-binding-patterns-static-semantics-boundnames
  public readonly BoundNames: readonly string[] = PLATFORM.emptyArray;
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
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

// #region Statements

export class $Block implements I$Node {
  public readonly $kind = SyntaxKind.Block;
  public readonly id: number;

  public readonly $statements: readonly $$StatementListItem[];

  // http://www.ecma-international.org/ecma-262/#sec-block-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statements.some(x => x.ContainsDuplicateLabels(labelSet))
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: Block,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$statements = $$esStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);
  }
}

export class $EmptyStatement implements I$Node {
  public readonly $kind = SyntaxKind.EmptyStatement;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  public readonly VarDeclaredNames: readonly string[] = PLATFORM.emptyArray;

  public constructor(
    public readonly node: EmptyStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

type $ExpressionStatement_T<T extends $$AssignmentExpressionOrHigher> = $ExpressionStatement & {
  readonly $expression: T;
};

type $DirectivePrologue = readonly $ExpressionStatement_T<$StringLiteral>[] & {
  readonly ContainsUseStrict?: true;
};

export class $ExpressionStatement implements I$Node {
  public readonly $kind = SyntaxKind.ExpressionStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  public readonly VarDeclaredNames: readonly string[] = PLATFORM.emptyArray;

  public constructor(
    public readonly node: ExpressionStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx | Context.InExpressionStatement);
  }
}

export class $IfStatement implements I$Node {
  public readonly $kind = SyntaxKind.IfStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $thenStatement: $$ESStatement;
  public readonly $elseStatement: $$ESStatement | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-if-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    let hasDuplicate = this.$thenStatement.ContainsDuplicateLabels(labelSet);
    if (hasDuplicate) {
      return true;
    }
    return this.$elseStatement !== void 0 && this.$elseStatement.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: IfStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    this.$thenStatement = $$esStatement(node.thenStatement as $StatementNode, this, ctx);
    this.$elseStatement = node.elseStatement === void 0
      ? void 0
      : $$esStatement(node.elseStatement as $StatementNode, this, ctx);

    if (this.$elseStatement === void 0) {
      //this.VarDeclaredNames = this.$thenStatement.V
    } else {

    }
  }
}

export class $DoStatement implements I$Node {
  public readonly $kind = SyntaxKind.DoStatement;
  public readonly id: number;

  public readonly $statement: $$ESStatement;
  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-do-while-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statement.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: DoStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $WhileStatement implements I$Node {
  public readonly $kind = SyntaxKind.WhileStatement;
  public readonly id: number;

  public readonly $statement: $$ESStatement;
  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-while-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statement.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: WhileStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $ForStatement implements I$Node {
  public readonly $kind = SyntaxKind.ForStatement;
  public readonly id: number;

  public readonly $initializer: $$Initializer | undefined;
  public readonly $condition: $$AssignmentExpressionOrHigher | undefined;
  public readonly $incrementor: $$AssignmentExpressionOrHigher | undefined;
  public readonly $statement: $$ESStatement;

  // http://www.ecma-international.org/ecma-262/#sec-for-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statement.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: ForStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$initializer = node.initializer === void 0
      ? void 0
      : node.initializer.kind === SyntaxKind.VariableDeclarationList
        ? new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx)
        : $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
    this.$condition = $assignmentExpression(node.condition as $AssignmentExpressionNode, this, ctx);
    this.$incrementor = $assignmentExpression(node.incrementor as $AssignmentExpressionNode, this, ctx);
    this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);
  }
}

export class $ForInStatement implements I$Node {
  public readonly $kind = SyntaxKind.ForInStatement;
  public readonly id: number;

  public readonly $initializer: $$Initializer;
  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESStatement;

  public readonly BoundNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statement.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: ForInStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$initializer = node.initializer.kind === SyntaxKind.VariableDeclarationList
      ? new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx)
      : $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);

    if (
      this.$initializer.$kind === SyntaxKind.VariableDeclarationList
      && (this.$initializer.nodeFlags & (NodeFlags.Const | NodeFlags.Let)) > 0
    ) {
      this.BoundNames = this.$initializer.BoundNames;
    } else {
      this.BoundNames = PLATFORM.emptyArray;
    }
  }
}

export class $ForOfStatement implements I$Node {
  public readonly $kind = SyntaxKind.ForOfStatement;
  public readonly id: number;

  public readonly $initializer: $$Initializer;
  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESStatement;

  public readonly BoundNames: readonly string[];
  // http://www.ecma-international.org/ecma-262/#sec-for-in-and-for-of-statements-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statement.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: ForOfStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$initializer = node.initializer.kind === SyntaxKind.VariableDeclarationList
      ? new $VariableDeclarationList(node.initializer as VariableDeclarationList, this, ctx)
      : $assignmentExpression(node.initializer as $AssignmentExpressionNode, this, ctx);
    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);

    if (
      this.$initializer.$kind === SyntaxKind.VariableDeclarationList
      && (this.$initializer.nodeFlags & (NodeFlags.Const | NodeFlags.Let)) > 0
    ) {
      this.BoundNames = this.$initializer.BoundNames;
    } else {
      this.BoundNames = PLATFORM.emptyArray;
    }
  }
}

export class $ContinueStatement implements I$Node {
  public readonly $kind = SyntaxKind.ContinueStatement;
  public readonly id: number;

  public readonly $label: $Identifier | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  public readonly VarDeclaredNames: readonly string[] = PLATFORM.emptyArray;

  public constructor(
    public readonly node: ContinueStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$label = $identifier(node.label, this, ctx | Context.IsLabelReference);
  }
}

export class $BreakStatement implements I$Node {
  public readonly $kind = SyntaxKind.BreakStatement;
  public readonly id: number;

  public readonly $label: $Identifier | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  public readonly VarDeclaredNames: readonly string[] = PLATFORM.emptyArray;

  public constructor(
    public readonly node: BreakStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$label = $identifier(node.label, this, ctx | Context.IsLabelReference);
  }
}

export class $ReturnStatement implements I$Node {
  public readonly $kind = SyntaxKind.ReturnStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  public readonly VarDeclaredNames: readonly string[] = PLATFORM.emptyArray;

  public constructor(
    public readonly node: ReturnStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = node.expression === void 0
      ? void 0
      : $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
  }
}

export class $WithStatement implements I$Node {
  public readonly $kind = SyntaxKind.WithStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statement: $$ESStatement;

  // http://www.ecma-international.org/ecma-262/#sec-with-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statement.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: WithStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    this.$statement = $$esStatement(node.statement as $StatementNode, this, ctx);
  }
}

export class $SwitchStatement implements I$Node {
  public readonly $kind = SyntaxKind.SwitchStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $caseBlock: $CaseBlock;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$caseBlock.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: SwitchStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    this.$caseBlock = new $CaseBlock(node.caseBlock, this, ctx);
  }
}

export class $LabeledStatement implements I$Node {
  public readonly $kind = SyntaxKind.LabeledStatement;
  public readonly id: number;

  public readonly $label: $Identifier;
  public readonly $statement: $$LabelledItem;

  // http://www.ecma-international.org/ecma-262/#sec-labelled-statements-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    const label = this.$label.node.text;
    if (labelSet.has(label)) {
      return true;
    }

    const newLabelSet = new Set(labelSet);
    newLabelSet.add(label);

    return this.$statement.ContainsDuplicateLabels(newLabelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: LabeledStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$label = $identifier(node.label, this, ctx | Context.IsLabel);
    this.$statement = $$esLabelledItem(node.statement as $StatementNode, this, ctx);
  }
}

export class $ThrowStatement implements I$Node {
  public readonly $kind = SyntaxKind.ThrowStatement;
  public readonly id: number;

  public readonly $expression: $$AssignmentExpressionOrHigher;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  public readonly VarDeclaredNames: readonly string[] = PLATFORM.emptyArray;

  public constructor(
    public readonly node: ThrowStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);

    $: if (true) {
      $: if (true) return;
    };
  }
}

export class $TryStatement implements I$Node {
  public readonly $kind = SyntaxKind.TryStatement;
  public readonly id: number;

  public readonly $tryBlock: $Block;
  public readonly $catchClause: $CatchClause | undefined;
  public readonly $finallyBlock: $Block | undefined;

  // http://www.ecma-international.org/ecma-262/#sec-try-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    if (this.$tryBlock.ContainsDuplicateLabels(labelSet)) {
      return true;
    }
    if (this.$catchClause !== void 0 && this.$catchClause.ContainsDuplicateLabels(labelSet)) {
      return true;
    }
    return this.$finallyBlock !== void 0 && this.$finallyBlock.ContainsDuplicateLabels(labelSet);
  }
  public readonly VarDeclaredNames: readonly string[];

  public constructor(
    public readonly node: TryStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$tryBlock = new $Block(node.tryBlock, this, ctx);
    this.$catchClause = node.catchClause === void 0
      ? void 0
      : new $CatchClause(node.catchClause, this, ctx);
    this.$finallyBlock = node.finallyBlock === void 0
      ? void 0
      : new $Block(node.finallyBlock, this, ctx);
  }
}

export class $DebuggerStatement implements I$Node {
  public readonly $kind = SyntaxKind.DebuggerStatement;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-statement-semantics-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): false { return false; }
  public readonly VarDeclaredNames: readonly string[] = PLATFORM.emptyArray;

  public constructor(
    public readonly node: DebuggerStatement,
    public readonly parent: $NodeWithStatements,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);
  }
}

// #endregion

// #region Statement members

export class $CaseBlock implements I$Node {
  public readonly $kind = SyntaxKind.CaseBlock;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$clauses.some(x => x.ContainsDuplicateLabels(labelSet));
  }
  public readonly $clauses: readonly ($CaseClause | $DefaultClause)[];

  public constructor(
    public readonly node: CaseBlock,
    public readonly parent: $SwitchStatement,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$clauses = node.clauses.map(
      x => x.kind === SyntaxKind.CaseClause
        ? new $CaseClause(x, this, ctx)
        : new $DefaultClause(x, this, ctx)
    );
  }
}

export class $CaseClause implements I$Node {
  public readonly $kind = SyntaxKind.CaseClause;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statements.some(x => x.ContainsDuplicateLabels(labelSet));
  }

  public readonly $expression: $$AssignmentExpressionOrHigher;
  public readonly $statements: readonly $$StatementListItem[];

  public constructor(
    public readonly node: CaseClause,
    public readonly parent: $CaseBlock,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$expression = $assignmentExpression(node.expression as $AssignmentExpressionNode, this, ctx);
    this.$statements = $$esStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);
  }
}

export class $DefaultClause implements I$Node {
  public readonly $kind = SyntaxKind.DefaultClause;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-switch-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$statements.some(x => x.ContainsDuplicateLabels(labelSet));
  }

  public readonly $statements: readonly $$StatementListItem[];

  public constructor(
    public readonly node: DefaultClause,
    public readonly parent: $CaseBlock,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    this.$statements = $$esStatementList(node.statements as NodeArray<$StatementNode>, this, ctx);
  }
}

export class $CatchClause implements I$Node {
  public readonly $kind = SyntaxKind.CatchClause;
  public readonly id: number;

  // http://www.ecma-international.org/ecma-262/#sec-try-statement-static-semantics-containsduplicatelabels
  public ContainsDuplicateLabels(labelSet: Set<string>): boolean {
    return this.$block.ContainsDuplicateLabels(labelSet);
  }

  public readonly $variableDeclaration: $VariableDeclaration | undefined;
  public readonly $block: $Block;

  public constructor(
    public readonly node: CatchClause,
    public readonly parent: $TryStatement,
    public readonly ctx: Context,
    public readonly root: $SourceFile = parent.root,
    public readonly depth: number = parent.depth + 1,
  ) {
    this.id = root.registerNode(this);

    ctx |= Context.InCatchClause;

    this.$variableDeclaration = node.variableDeclaration === void 0
      ? void 0
      : new $VariableDeclaration(node.variableDeclaration, this, ctx);
    this.$block = new $Block(node.block, this, ctx);
  }
}

  // #endregion


  // #endregion
