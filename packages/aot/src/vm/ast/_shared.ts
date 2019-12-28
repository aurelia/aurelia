import {
  ArrayLiteralExpression,
  ArrowFunction,
  AsExpression,
  AwaitExpression,
  BigIntLiteral,
  BinaryExpression,
  BindingName,
  Block,
  BooleanLiteral,
  BreakStatement,
  CallExpression,
  ClassDeclaration,
  ClassExpression,
  ConditionalExpression,
  ConstructorDeclaration,
  ContinueStatement,
  DebuggerStatement,
  Decorator,
  DeleteExpression,
  DoStatement,
  ElementAccessExpression,
  EmptyStatement,
  EnumDeclaration,
  ExportAssignment,
  ExportDeclaration,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  GetAccessorDeclaration,
  HeritageClause,
  Identifier,
  IfStatement,
  ImportDeclaration,
  ImportEqualsDeclaration,
  InterfaceDeclaration,
  JsxElement,
  JsxFragment,
  JsxSelfClosingElement,
  LabeledStatement,
  MetaProperty,
  MethodDeclaration,
  Modifier,
  ModifierFlags,
  ModuleDeclaration,
  NamespaceExportDeclaration,
  NewExpression,
  Node,
  NonNullExpression,
  NoSubstitutionTemplateLiteral,
  NullLiteral,
  NumericLiteral,
  ObjectLiteralExpression,
  OmittedExpression,
  ParenthesizedExpression,
  PostfixUnaryExpression,
  PrefixUnaryExpression,
  PropertyAccessExpression,
  PropertyDeclaration,
  PropertyName,
  RegularExpressionLiteral,
  ReturnStatement,
  SemicolonClassElement,
  SetAccessorDeclaration,
  SpreadElement,
  StringLiteral,
  SuperExpression,
  SwitchStatement,
  SyntaxKind,
  TaggedTemplateExpression,
  TemplateExpression,
  ThisExpression,
  ThrowStatement,
  TryStatement,
  TypeAliasDeclaration,
  TypeAssertion,
  TypeOfExpression,
  VariableStatement,
  VoidExpression,
  WhileStatement,
  WithStatement,
  YieldExpression,
  Statement,
} from 'typescript';
import {
  PLATFORM,
  ILogger,
} from '@aurelia/kernel';
import {
  Realm,
  ExecutionContext,
} from '../realm';
import {
  $DeclarativeEnvRec,
} from '../types/environment-record';
import {
  $Function,
} from '../types/function';
import {
  $Any,
  $AnyNonEmpty,
} from '../types/_shared';
import {
  $$TSModuleItem,
  $ExportSpecifier,
  $ExternalModuleReference,
  $ImportClause,
  $ImportSpecifier,
  $ModuleBlock,
  $NamedImports,
  $NamespaceImport,
  $QualifiedName,
  $ModuleDeclaration,
  $ExportAssignment,
  $ExportDeclaration,
  $ImportDeclaration,
  $ImportEqualsDeclaration,
  $ESScript,
  $ESModule,
  $$ESModuleOrScript,
} from './modules';
import {
  $ArrayBindingPattern,
  $BindingElement,
  $ComputedPropertyName,
  $ObjectBindingPattern,
  $SpreadElement,
} from './bindings';
import {
  $ArrayLiteralExpression,
  $AsExpression,
  $AwaitExpression,
  $BinaryExpression,
  $CallExpression,
  $ConditionalExpression,
  $Decorator,
  $DeleteExpression,
  $ElementAccessExpression,
  $MetaProperty,
  $NewExpression,
  $NonNullExpression,
  $ObjectLiteralExpression,
  $ParenthesizedExpression,
  $PostfixUnaryExpression,
  $PrefixUnaryExpression,
  $PropertyAccessExpression,
  $PropertyAssignment,
  $ShorthandPropertyAssignment,
  $SpreadAssignment,
  $TaggedTemplateExpression,
  $TemplateExpression,
  $TypeAssertion,
  $TypeOfExpression,
  $VoidExpression,
  $YieldExpression,
  $Identifier,
  $ThisExpression,
  $SuperExpression,
} from './expressions';
import {
  $ArrowFunction,
  $ConstructorDeclaration,
  $FunctionExpression,
  $ParameterDeclaration,
  $FunctionDeclaration,
} from './functions';
import {
  $Block,
  $BreakStatement,
  $CaseBlock,
  $CaseClause,
  $CatchClause,
  $ContinueStatement,
  $DefaultClause,
  $DoStatement,
  $ExpressionStatement,
  $ForInStatement,
  $ForOfStatement,
  $ForStatement,
  $IfStatement,
  $LabeledStatement,
  $ReturnStatement,
  $SwitchStatement,
  $ThrowStatement,
  $TryStatement,
  $VariableDeclaration,
  $VariableDeclarationList,
  $WhileStatement,
  $WithStatement,
  $VariableStatement,
  $EmptyStatement,
  $DebuggerStatement,
  ExpressionStatement_T,
} from './statements';
import {
  $ClassExpression,
  $ExpressionWithTypeArguments,
  $HeritageClause,
  $PropertyDeclaration,
  $ClassDeclaration,
  $SemicolonClassElement,
} from './classes';
import {
  $EnumMember,
  $InterfaceDeclaration,
  $TypeAliasDeclaration,
  $EnumDeclaration,
} from './types';
import {
  $GetAccessorDeclaration,
  $MethodDeclaration,
  $SetAccessorDeclaration,
} from './methods';
import {
  $JsxAttribute,
  $JsxAttributes,
  $JsxClosingElement,
  $JsxElement,
  $JsxExpression,
  $JsxFragment,
  $JsxOpeningElement,
  $JsxSelfClosingElement,
  $JsxSpreadAttribute,
} from './jsx';
import {
  $TemplateSpan,
  $BigIntLiteral,
  $BooleanLiteral,
  $NoSubstitutionTemplateLiteral,
  $NullLiteral,
  $NumericLiteral,
  $RegularExpressionLiteral,
  $StringLiteral,
} from './literals';
import {
  $StringSet,
} from '../globals/string';
import {
  $Empty,
} from '../types/empty';
import {
  $Error,
} from '../types/error';

const {
  emptyArray,
} = PLATFORM;

// #region TS AST unions

export type $PrimaryExpressionNode = (
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

export type $MemberExpressionNode = (
  $PrimaryExpressionNode |
  ElementAccessExpression |
  NonNullExpression |
  PropertyAccessExpression |
  TaggedTemplateExpression
);

export type $CallExpressionNode = (
  $MemberExpressionNode |
  CallExpression
);

export type $LHSExpressionNode = (
  $CallExpressionNode |
  MetaProperty
);

export type $UpdateExpressionNode = (
  $LHSExpressionNode |
  JsxElement |
  JsxFragment |
  JsxSelfClosingElement |
  PostfixUnaryExpression |
  PrefixUnaryExpression
);

export type $UnaryExpressionNode = (
  $UpdateExpressionNode |
  AwaitExpression |
  DeleteExpression |
  PrefixUnaryExpression |
  TypeAssertion |
  TypeOfExpression |
  VoidExpression
);

export type $BinaryExpressionNode = (
  $UnaryExpressionNode |
  AsExpression |
  BinaryExpression
);

export type $AssignmentExpressionNode = (
  $BinaryExpressionNode |
  ArrowFunction |
  ConditionalExpression |
  YieldExpression
);

export type $ArgumentOrArrayLiteralElementNode = (
  $AssignmentExpressionNode |
  SpreadElement |
  OmittedExpression
);

export type $LiteralNode = (
  NumericLiteral |
  BigIntLiteral |
  StringLiteral |
  RegularExpressionLiteral |
  NoSubstitutionTemplateLiteral |
  NullLiteral |
  BooleanLiteral
);

export type $ModuleStatementNode = (
  ModuleDeclaration |
  NamespaceExportDeclaration |
  ImportEqualsDeclaration |
  ImportDeclaration |
  ExportAssignment |
  ExportDeclaration
);

export type $StatementNode = (
  $ESStatementListItemNode |
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

export type $ESStatementListItemNode = (
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
  ClassDeclaration
);

export type $ClassElementNode = (
  GetAccessorDeclaration |
  SetAccessorDeclaration |
  ConstructorDeclaration |
  MethodDeclaration |
  SemicolonClassElement |
  PropertyDeclaration
);

// #endregion

// #region $Node type unions

export type $AnyParentNode = (
  $$TSModuleItem |
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
  $ESModule |
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

export type $$JsxOpeningLikeElement = (
  $JsxSelfClosingElement |
  $JsxOpeningElement
);

// #endregion

// #region Builders

export type $$BinaryExpression = (
  $AsExpression |
  $BinaryExpression
);

export type $$BinaryExpressionOrHigher = (
  $$UnaryExpressionOrHigher |
  $$BinaryExpression
);

export type $$AssignmentExpression = (
  $ArrowFunction |
  $ConditionalExpression |
  $YieldExpression
);

export type $$AssignmentExpressionOrHigher = (
  $$BinaryExpressionOrHigher |
  $$AssignmentExpression
);

export function $assignmentExpression(
  node: undefined,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): undefined;
export function $assignmentExpression(
  node: $AssignmentExpressionNode,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$AssignmentExpressionOrHigher;
export function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$AssignmentExpressionOrHigher | undefined;
export function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$AssignmentExpressionOrHigher | undefined {
  if (node === void 0) {
    return void 0;
  }

  switch (node.kind) {
    case SyntaxKind.AsExpression:
      return new $AsExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.BinaryExpression:
      return new $BinaryExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ArrowFunction:
      return new $ArrowFunction(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ConditionalExpression:
      return new $ConditionalExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.YieldExpression:
      return new $YieldExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    default:
      return $unaryExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
  }
}

export type $$UpdateExpression = (
  $JsxElement |
  $JsxFragment |
  $JsxSelfClosingElement |
  $PostfixUnaryExpression |
  $PrefixUnaryExpression
);

export type $$UpdateExpressionOrHigher = (
  $$LHSExpressionOrHigher |
  $$UpdateExpression
);

export type $$UnaryExpression = (
  $AwaitExpression |
  $DeleteExpression |
  $PrefixUnaryExpression |
  $TypeAssertion |
  $TypeOfExpression |
  $VoidExpression
);

export type $$UnaryExpressionOrHigher = (
  $$UpdateExpressionOrHigher |
  $$UnaryExpression
);

export function $unaryExpression(
  node: $UnaryExpressionNode,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$UnaryExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.JsxElement:
      return new $JsxElement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.JsxFragment:
      return new $JsxFragment(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.JsxSelfClosingElement:
      return new $JsxSelfClosingElement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.PostfixUnaryExpression:
      return new $PostfixUnaryExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.PrefixUnaryExpression:
      return new $PrefixUnaryExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.AwaitExpression:
      return new $AwaitExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.DeleteExpression:
      return new $DeleteExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.TypeAssertionExpression:
      return new $TypeAssertion(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.TypeOfExpression:
      return new $TypeOfExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.VoidExpression:
      return new $VoidExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    default:
      return $LHSExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
  }
}

export type $$Literal = (
  $BigIntLiteral |
  $BooleanLiteral |
  $NoSubstitutionTemplateLiteral |
  $NullLiteral |
  $NumericLiteral |
  $RegularExpressionLiteral |
  $StringLiteral
);

export type $$PrimaryExpression = (
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

export type $$PrimaryExpressionOrHigher = (
  $$Literal |
  $$PrimaryExpression
);

export type $$MemberExpression = (
  $ElementAccessExpression |
  $NonNullExpression |
  $PropertyAccessExpression |
  $TaggedTemplateExpression
);

export type $$MemberExpressionOrHigher = (
  $$PrimaryExpressionOrHigher |
  $$MemberExpression
);

export type $$CallExpressionOrHigher = (
  $$MemberExpressionOrHigher |
  $CallExpression
);

export type $$LHSExpression = (
  $MetaProperty
);

export type $$LHSExpressionOrHigher = (
  $$CallExpressionOrHigher |
  $$LHSExpression
);

export function $LHSExpression(
  node: $LHSExpressionNode,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$LHSExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.ArrayLiteralExpression:
      return new $ArrayLiteralExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ClassExpression:
      return new $ClassExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.FunctionExpression:
      return new $FunctionExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.Identifier:
      return new $Identifier(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.NewExpression:
      return new $NewExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ObjectLiteralExpression:
      return new $ObjectLiteralExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ParenthesizedExpression:
      return new $ParenthesizedExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.TemplateExpression:
      return new $TemplateExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ElementAccessExpression:
      return new $ElementAccessExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.NonNullExpression:
      return new $NonNullExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.TaggedTemplateExpression:
      return new $TaggedTemplateExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.CallExpression:
      return new $CallExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.MetaProperty:
      return new $MetaProperty(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.SuperKeyword:
      return new $SuperExpression(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.BigIntLiteral:
      return new $BigIntLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.RegularExpressionLiteral:
      return new $RegularExpressionLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.NoSubstitutionTemplateLiteral:
      return new $NoSubstitutionTemplateLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.NullKeyword:
      return new $NullLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
      return new $BooleanLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as any).kind]}.`);
  }
}

export function $identifier(
  node: undefined,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): undefined;
export function $identifier(
  node: Identifier,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $Identifier;
export function $identifier(
  node: Identifier | undefined,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $Identifier | undefined;
export function $identifier(
  node: Identifier | undefined,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $Identifier | undefined {
  if (node === void 0) {
    return void 0;
  }
  return new $Identifier(node, ctx, idx, depth + 1, mos, realm, logger, path);
}

export type $$PropertyName = (
  $ComputedPropertyName |
  $Identifier |
  $NumericLiteral |
  $StringLiteral
);

export function $$propertyName(
  node: PropertyName,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$PropertyName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ComputedPropertyName:
      return new $ComputedPropertyName(node, ctx, idx, depth + 1, mos, realm, logger, path);
  }
}

export type $$DestructurableBinding = (
  $VariableDeclaration |
  $ParameterDeclaration |
  $BindingElement
);

export type $$BindingName = (
  $ArrayBindingPattern |
  $Identifier |
  $ObjectBindingPattern
);

export function $$bindingName(
  node: BindingName,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$BindingName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, ctx | Context.IsBindingName, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ObjectBindingPattern:
      return new $ObjectBindingPattern(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ArrayBindingPattern:
      return new $ArrayBindingPattern(node, ctx, idx, depth + 1, mos, realm, logger, path);
  }
}

export type $NodeWithStatements = (
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
  $ESModule |
  $ESScript |
  $TryStatement |
  $WithStatement |
  $FunctionExpression |
  $ArrowFunction |
  $IfStatement
);

export type $$IterationStatement = (
  $DoStatement |
  $ForInStatement |
  $ForOfStatement |
  $ForStatement |
  $WhileStatement
);

export type $$BreakableStatement = (
  $$IterationStatement |
  $SwitchStatement
);

export type $$ModuleDeclarationParent = (
  $ESModule |
  $ModuleBlock |
  $ModuleDeclaration
);

// http://www.ecma-international.org/ecma-262/#prod-Statement
export type $$ESStatement = (
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

export function $$esStatement(
  node: $StatementNode,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$ESStatement {
  switch (node.kind) {
    case SyntaxKind.Block:
      return new $Block(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.EmptyStatement:
      return new $EmptyStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ExpressionStatement:
      return new $ExpressionStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.IfStatement:
      return new $IfStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.DoStatement:
      return new $DoStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.WhileStatement:
      return new $WhileStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ForStatement:
      return new $ForStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ForInStatement:
      return new $ForInStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ForOfStatement:
      return new $ForOfStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ContinueStatement:
      return new $ContinueStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.BreakStatement:
      return new $BreakStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ReturnStatement:
      return new $ReturnStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.WithStatement:
      return new $WithStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.SwitchStatement:
      return new $SwitchStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.LabeledStatement:
      return new $LabeledStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ThrowStatement:
      return new $ThrowStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.TryStatement:
      return new $TryStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.DebuggerStatement:
      return new $DebuggerStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as Node).kind]}.`);
  }
}

export type $$ESVarDeclaration = (
  $FunctionDeclaration |
  $VariableStatement |
  $VariableDeclaration
);

export type $$ESDeclaration = (
  $$ESVarDeclaration |
  $ClassDeclaration
);

export type $$TSDeclaration = (
  $InterfaceDeclaration |
  $TypeAliasDeclaration |
  $EnumDeclaration
);

export type $$ESStatementListItem = (
  $$ESStatement |
  $$ESDeclaration
);

export type $$TSStatementListItem = (
  $$ESStatementListItem |
  $$TSDeclaration
);

export function $$tsStatementListItem(
  node: $StatementNode,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$TSStatementListItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.ClassDeclaration:
      return new $ClassDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.InterfaceDeclaration:
      return new $InterfaceDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.TypeAliasDeclaration:
      return new $TypeAliasDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.EnumDeclaration:
      return new $EnumDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    default:
      return $$esStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
  }
}

export function $$tsStatementList(
  nodes: readonly $StatementNode[],
  ctx: Context,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): readonly $$TSStatementListItem[] {
  const len = nodes.length;
  let node: $StatementNode;
  const $nodes: $$TSStatementListItem[] = [];

  let x = 0;
  for (let i = 0; i < len; ++i) {
    node = nodes[i];
    if (node.kind === SyntaxKind.FunctionDeclaration && node.body === void 0) {
      continue;
    }
    $nodes[x] = $$tsStatementListItem(node, ctx, x, depth + 1, mos, realm, logger, path);
    ++x;
  }
  return $nodes;
}

export type $$ESLabelledItem = (
  $$ESStatement |
  $FunctionDeclaration
);

export function $$esLabelledItem(
  node: $StatementNode,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$ESLabelledItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    default:
      return $$esStatement(node, ctx, idx, depth + 1, mos, realm, logger, path);
  }
}

// #endregion

// #region AST helpers

export type DirectivePrologue = readonly ExpressionStatement_T<StringLiteral>[] & {
  readonly ContainsUseStrict: boolean;
  readonly lastIndex: number;
};
type MutableDirectivePrologue = ExpressionStatement_T<StringLiteral>[] & {
  ContainsUseStrict?: boolean;
  lastIndex?: number;
};

export const NoDirectiveProgue = (function () {
  const value = [] as MutableDirectivePrologue;
  value.ContainsUseStrict = false;
  value.lastIndex = -1;
  return Object.freeze(value) as DirectivePrologue;
})();

export function GetDirectivePrologue(statements: readonly Statement[]): DirectivePrologue {
  let directivePrologue = NoDirectiveProgue as MutableDirectivePrologue;

  let statement: ExpressionStatement_T<StringLiteral>;
  const len = statements.length;
  for (let i = 0; i < len; ++i) {
    statement = statements[i] as ExpressionStatement_T<StringLiteral>;
    if (
      statement.kind === SyntaxKind.ExpressionStatement
      && statement.expression.kind === SyntaxKind.StringLiteral
    ) {
      if (directivePrologue === NoDirectiveProgue) {
        directivePrologue = [statement];
        directivePrologue.ContainsUseStrict = false;
      } else {
        directivePrologue.push(statement);
      }
      if (statement.expression.text === 'use strict') {
        directivePrologue.ContainsUseStrict = true;
      }
      directivePrologue.lastIndex = i;
    } else {
      break;
    }
  }

  return directivePrologue as DirectivePrologue;
}

export function GetExpectedArgumentCount(params: readonly $ParameterDeclaration[]): number {
  for (let i = 0, ii = params.length; i < ii; ++i) {
    if (params[i].HasInitializer) {
      return i;
    }
  }

  return params.length;
}

export function evaluateStatement(
  ctx: ExecutionContext,
  statement: $$ESLabelledItem,
): $Any {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  let stmtCompletion: $Any = intrinsics.empty;
  switch (statement.$kind) {
    case SyntaxKind.Block:
    case SyntaxKind.VariableStatement:
    case SyntaxKind.EmptyStatement:
    case SyntaxKind.ExpressionStatement:
    case SyntaxKind.IfStatement:
    case SyntaxKind.SwitchStatement:
    case SyntaxKind.ContinueStatement:
    case SyntaxKind.BreakStatement:
    case SyntaxKind.ReturnStatement:
    case SyntaxKind.WithStatement:
    case SyntaxKind.LabeledStatement:
    case SyntaxKind.ThrowStatement:
    case SyntaxKind.TryStatement:
    case SyntaxKind.DebuggerStatement:
    case SyntaxKind.FunctionDeclaration:
      stmtCompletion = statement.Evaluate(ctx);
      break;
    case SyntaxKind.DoStatement:
    case SyntaxKind.WhileStatement:
    case SyntaxKind.ForStatement:
    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement:
      stmtCompletion = statement.EvaluateLabelled(ctx, new $StringSet());
      break;
    // Note that no default case is needed here as the cases above are exhausetive $$ESStatement (http://www.ecma-international.org/ecma-262/#prod-Statement)
  }
  return stmtCompletion;
}

// http://www.ecma-international.org/ecma-262/#sec-block-runtime-semantics-evaluation
// StatementList : StatementList StatementListItem
export function evaluateStatementList(
  ctx: ExecutionContext,
  statements: readonly $$TSStatementListItem[],
): $Any {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Let sl be the result of evaluating StatementList.
  // 2. ReturnIfAbrupt(sl).
  // 3. Let s be the result of evaluating StatementListItem.
  // 4. Return Completion(UpdateEmpty(s, sl)).
  let sl: $Any = intrinsics.empty;
  for (const statement of statements) {
    const s = evaluateStatement(ctx, statement as $$ESStatement); // TODO handle the declarations.
    if (s.isAbrupt) {
      return s;
    }
    sl = sl.UpdateEmpty(s);
  }

  return sl;
}

// http://www.ecma-international.org/ecma-262/#sec-blockdeclarationinstantiation
export function BlockDeclarationInstantiation(
  ctx: ExecutionContext,
  lexicallyScopedDeclarations: readonly $$ESDeclaration[],
  envRec: $DeclarativeEnvRec,
): $Empty | $Error {
  const realm = ctx.Realm;
  const intrinsics = realm['[[Intrinsics]]'];

  // 1. Let envRec be env's EnvironmentRecord.
  // 2. Assert: envRec is a declarative Environment Record.
  // 3. Let declarations be the LexicallyScopedDeclarations of code.

  // 4. For each element d in declarations, do
  for (const d of lexicallyScopedDeclarations) {

    // 4. a. For each element dn of the BoundNames of d, do
    for (const dn of d.BoundNames) {
      // 4. a. i. If IsConstantDeclaration of d is true, then
      if (d.IsConstantDeclaration) {
        // 4. a. i. 1. Perform ! envRec.CreateImmutableBinding(dn, true).
        envRec.CreateImmutableBinding(ctx, dn, intrinsics.true);
      } else {
        // 4. a. ii. Else,
        // 4. a. ii. 1. Perform ! envRec.CreateMutableBinding(dn, false).
        envRec.CreateImmutableBinding(ctx, dn, intrinsics.false);
      }
    }

    const dkind = d.$kind;
    // 4. b. If d is a FunctionDeclaration, a GeneratorDeclaration, an AsyncFunctionDeclaration, or an AsyncGeneratorDeclaration, then
    if (dkind === SyntaxKind.FunctionDeclaration /* || dkind === SyntaxKind.GeneratorDeclaration || dkind === SyntaxKind.AsyncFunctionDeclaration || dkind === SyntaxKind.AsyncGeneratorDeclaration */) {
      // 4. b. i. Let fn be the sole element of the BoundNames of d.
      const fn = d.BoundNames[0];

      // 4. b. ii. Let fo be the result of performing InstantiateFunctionObject for d with argument env.
      const fo = (d as $FunctionDeclaration).InstantiateFunctionObject(ctx, envRec);
      if (fo.isAbrupt) { return fo; }

      // 4. b. iii. Perform envRec.InitializeBinding(fn, fo).
      envRec.InitializeBinding(ctx, fn, fo);
    }
  }

  return ctx.Realm['[[Intrinsics]]'].empty;
}

// http://www.ecma-international.org/ecma-262/#sec-isconstructor
export function IsConstructor(ctx: ExecutionContext, argument: $AnyNonEmpty): argument is $Function {
  const intrinsics = ctx.Realm['[[Intrinsics]]'];
  // 1. If Type(argument) is not Object, return false.
  if (!argument.isObject) { return intrinsics.false.GetValue(ctx)['[[Value]]']; }

  // 2. If argument has a [[Construct]] internal method, return true.
  if (argument instanceof $Function && argument['[[Construct]]'] !== void 0) { return intrinsics.true.GetValue(ctx)['[[Value]]']; }

  // 3. Return false.
  return intrinsics.false.GetValue(ctx)['[[Value]]'];
}

// #endregion

// #region AST

// #region Declaration statements
export type $NodeWithDecorators = (
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

export function $decoratorList(
  nodes: readonly Decorator[] | undefined,
  ctx: Context,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): readonly $Decorator[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  if (nodes.length === 1) {
    return [new $Decorator(nodes[0], ctx, 0, depth + 1, mos, realm, logger, path)];
  }

  const len = nodes.length;
  const $nodes: $Decorator[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $Decorator(nodes[i], ctx, i, depth + 1, mos, realm, logger, path);
  }
  return $nodes;
}

// Simple property accessors used for some map/flatMap/some/every operations,
// to avoid allocating a new arrow function for each of those calls.
export function getContainsExpression<T>(obj: { ContainsExpression: T }): T { return obj.ContainsExpression; }
export function getHasInitializer<T>(obj: { HasInitializer: T }): T { return obj.HasInitializer; }
export function getIsSimpleParameterList<T>(obj: { IsSimpleParameterList: T }): T { return obj.IsSimpleParameterList; }
export function getBoundNames<T>(obj: { BoundNames: T }): T { return obj.BoundNames; }
export function getLexicallyDeclaredNames<T>(obj: { LexicallyDeclaredNames: T }): T { return obj.LexicallyDeclaredNames; }
export function getLexicallyScopedDeclarations<T>(obj: { LexicallyScopedDeclarations: T }): T { return obj.LexicallyScopedDeclarations; }
export function getVarDeclaredNames<T>(obj: { VarDeclaredNames: T }): T { return obj.VarDeclaredNames; }
export function getVarScopedDeclarations<T>(obj: { VarScopedDeclarations: T }): T { return obj.VarScopedDeclarations; }
export function getLocalName<T>(obj: { LocalName: T }): T { return obj.LocalName; }
export function getImportEntriesForModule<T>(obj: { ImportEntriesForModule: T }): T { return obj.ImportEntriesForModule; }
export function getExportedNames<T>(obj: { ExportedNames: T }): T { return obj.ExportedNames; }
export function getExportEntriesForModule<T>(obj: { ExportEntriesForModule: T }): T { return obj.ExportEntriesForModule; }
export function getReferencedBindings<T>(obj: { ReferencedBindings: T }): T { return obj.ReferencedBindings; }

export function $heritageClauseList(
  nodes: readonly HeritageClause[] | undefined,
  ctx: Context,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): readonly $HeritageClause[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $HeritageClause[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $HeritageClause(nodes[i], ctx, i, depth + 1, mos, realm, logger, path);
  }
  return $nodes;
}

export function $$classElementList(
  nodes: readonly $ClassElementNode[] | undefined,
  ctx: Context,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
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
    switch (node.kind) {
      case SyntaxKind.Constructor:
      case SyntaxKind.MethodDeclaration:
        if (node.body !== void 0) {
          $node = $$classElement(node, ctx, i, depth + 1, mos, realm, logger, path);
          if ($node !== void 0) {
            $nodes.push($node);
          }
        }
        break;
      default:
        $node = $$classElement(node, ctx, i, depth + 1, mos, realm, logger, path);
        if ($node !== void 0) {
          $nodes.push($node);
        }
    }
  }
  return $nodes;
}

export type $$ClassElement = (
  $GetAccessorDeclaration |
  $SetAccessorDeclaration |
  $ConstructorDeclaration |
  $MethodDeclaration |
  $SemicolonClassElement |
  $PropertyDeclaration
);

export function $$classElement(
  node: $ClassElementNode,
  ctx: Context,
  idx: number,
  depth: number,
  mos: $$ESModuleOrScript,
  realm: Realm,
  logger: ILogger,
  path: string,
): $$ClassElement | undefined {
  switch (node.kind) {
    case SyntaxKind.PropertyDeclaration:
      return new $PropertyDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.SemicolonClassElement:
      return new $SemicolonClassElement(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.MethodDeclaration:
      return new $MethodDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.Constructor:
      return new $ConstructorDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.GetAccessor:
      return new $GetAccessorDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    case SyntaxKind.SetAccessor:
      return new $SetAccessorDeclaration(node, ctx, idx, depth + 1, mos, realm, logger, path);
    default:
      return void 0;
  }
}

export type $$MethodDefinition = (
  $MethodDeclaration |
  $GetAccessorDeclaration |
  $SetAccessorDeclaration
);

// #endregion

export function hasBit(flag: number, bit: number): boolean {
  return (flag & bit) > 0;
}

export function hasAllBits(flag: number, bit: number): boolean {
  return (flag & bit) === bit;
}

export function clearBit(flag: number, bit: number): number {
  return (flag | bit) ^ bit;
}

export const enum Context {
  None                      = 0b00000000000000000,
  Dynamic                   = 0b00000000000000010,
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
  InStrictMode              = 0b10000000000000000,
}

export const modifiersToModifierFlags = (function () {
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
  };
})();

export const enum FunctionKind {
  normal           = 0b0000,
  nonConstructor   = 0b0001,
  classConstructor = 0b0010,
  generator        = 0b0100,
  async            = 0b1000,
  asyncGenerator   = 0b1100,
}

/**
 * Returns the indexed string representation, or an empty string if the number is -1.
 */
export function $i(idx: number): string {
  return idx === -1 ? '' : `[${idx}]`;
}

export interface I$Node<
  TNode extends object = object,
> {
  readonly depth: number;
  readonly realm: Realm;
  readonly parent: I$Node;
  readonly node: TNode;
  readonly ctx: Context;
  readonly path: string;
}

export class TransformationContext {
  public propertyAssignments: ExpressionStatement[] | undefined = void 0;
}

type Transformable<T> = {
  transform(tctx: TransformationContext): T | readonly T[] | undefined;
  readonly node: T;
};

export function transformList<T>(
  tctx: TransformationContext,
  transformableList: readonly Transformable<T>[],
  nodeList: readonly T[],
): readonly T[] | undefined {
  let transformedList: T[] | undefined = void 0;
  let transformable: Transformable<T> | undefined;
  let transformed: T | readonly T[] | undefined;

  let x = 0;
  for (let i = 0, ii = transformableList.length; i < ii; ++i) {
    transformed = (transformable = transformableList[i]).transform(tctx);
    if (transformedList === void 0) {
      if (transformed === void 0) {
        transformedList = nodeList.slice(0, x = i);
      } else if (transformed !== transformable.node) {
        transformedList = nodeList.slice(0, x = i);
        if (transformed instanceof Array) {
          for (let j = 0, jj = transformed.length; j < jj; ++j) {
            transformedList[x++] = transformed[j];
          }
        } else {
          transformedList[x++] = transformed as T;
        }
      }
    } else if (transformed !== void 0) {
      if (transformed instanceof Array) {
        for (let j = 0, jj = transformed.length; j < jj; ++j) {
          transformedList[x++] = transformed[j];
        }
      } else {
        transformedList[x++] = transformed as T;
      }
    }
  }

  return transformedList;
}

export function transformModifiers(
  modifiers: readonly Modifier[],
): readonly Modifier[] | undefined {
  let transformedList: Modifier[] | undefined = void 0;
  let modifier: Modifier;

  let x = 0;
  for (let i = 0, ii = modifiers.length; i < ii; ++i) {
    modifier = modifiers[i];
    switch (modifier.kind) {
      case SyntaxKind.ConstKeyword:
      case SyntaxKind.DeclareKeyword:
      case SyntaxKind.AbstractKeyword:
      case SyntaxKind.PublicKeyword:
      case SyntaxKind.PrivateKeyword:
      case SyntaxKind.ProtectedKeyword:
      case SyntaxKind.ReadonlyKeyword:
        if (transformedList === void 0) {
          transformedList = modifiers.slice(0, x = i);
        }
        break;
      case SyntaxKind.AsyncKeyword:
      case SyntaxKind.DefaultKeyword:
      case SyntaxKind.ExportKeyword:
      case SyntaxKind.StaticKeyword:
        if (transformedList !== void 0) {
          transformedList[x++] = modifier;
        }
        break;
    }
  }

  return transformedList;
}
