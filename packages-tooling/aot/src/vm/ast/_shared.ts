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
  emptyArray,
  IIndexable,
  Writable,
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
} from './modules';
import {
  $ArrayBindingPattern,
  $BindingElement,
  $ComputedPropertyName,
  $ObjectBindingPattern,
  $SpreadElement,
  $$NamedDeclaration,
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
  DirectivePrologue,
  ExpressionStatement_T,
} from './statements';
import {
  $ClassExpression,
  $ExpressionWithTypeArguments,
  $HeritageClause,
  $PropertyDeclaration,
  $ClassDeclaration,
  $$NodeWithHeritageClauses,
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
  $$JsxParent,
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
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): undefined;
export function $assignmentExpression(
  node: $AssignmentExpressionNode,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $$AssignmentExpressionOrHigher;
export function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $$AssignmentExpressionOrHigher | undefined;
export function $assignmentExpression(
  node: $AssignmentExpressionNode | undefined,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $$AssignmentExpressionOrHigher | undefined {
  if (node === void 0) {
    return void 0;
  }

  switch (node.kind) {
    case SyntaxKind.AsExpression:
      return new $AsExpression(node, parent, ctx, idx);
    case SyntaxKind.BinaryExpression:
      return new $BinaryExpression(node, parent, ctx, idx);
    case SyntaxKind.ArrowFunction:
      return new $ArrowFunction(node, parent, ctx, idx);
    case SyntaxKind.ConditionalExpression:
      return new $ConditionalExpression(node, parent, ctx, idx);
    case SyntaxKind.YieldExpression:
      return new $YieldExpression(node, parent, ctx, idx);
    default:
      return $unaryExpression(node, parent, ctx, idx);
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
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $$UnaryExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.JsxElement:
      return new $JsxElement(node, parent as $$JsxParent, ctx, idx);
    case SyntaxKind.JsxFragment:
      return new $JsxFragment(node, parent as $$JsxParent, ctx, idx);
    case SyntaxKind.JsxSelfClosingElement:
      return new $JsxSelfClosingElement(node, parent as $$JsxParent, ctx, idx);
    case SyntaxKind.PostfixUnaryExpression:
      return new $PostfixUnaryExpression(node, parent, ctx, idx);
    case SyntaxKind.PrefixUnaryExpression:
      return new $PrefixUnaryExpression(node, parent, ctx, idx);
    case SyntaxKind.AwaitExpression:
      return new $AwaitExpression(node, parent, ctx, idx);
    case SyntaxKind.DeleteExpression:
      return new $DeleteExpression(node, parent, ctx, idx);
    case SyntaxKind.TypeAssertionExpression:
      return new $TypeAssertion(node, parent, ctx, idx);
    case SyntaxKind.TypeOfExpression:
      return new $TypeOfExpression(node, parent, ctx, idx);
    case SyntaxKind.VoidExpression:
      return new $VoidExpression(node, parent, ctx, idx);
    default:
      return $LHSExpression(node, parent, ctx, idx);
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
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $$LHSExpressionOrHigher {
  switch (node.kind) {
    case SyntaxKind.ArrayLiteralExpression:
      return new $ArrayLiteralExpression(node, parent, ctx, idx);
    case SyntaxKind.ClassExpression:
      return new $ClassExpression(node, parent, ctx, idx);
    case SyntaxKind.FunctionExpression:
      return new $FunctionExpression(node, parent, ctx, idx);
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx, idx);
    case SyntaxKind.NewExpression:
      return new $NewExpression(node, parent, ctx, idx);
    case SyntaxKind.ObjectLiteralExpression:
      return new $ObjectLiteralExpression(node, parent, ctx, idx);
    case SyntaxKind.ParenthesizedExpression:
      return new $ParenthesizedExpression(node, parent, ctx, idx);
    case SyntaxKind.TemplateExpression:
      return new $TemplateExpression(node, parent, ctx, idx);
    case SyntaxKind.ElementAccessExpression:
      return new $ElementAccessExpression(node, parent, ctx, idx);
    case SyntaxKind.NonNullExpression:
      return new $NonNullExpression(node, parent, ctx, idx);
    case SyntaxKind.PropertyAccessExpression:
      return new $PropertyAccessExpression(node, parent, ctx, idx);
    case SyntaxKind.TaggedTemplateExpression:
      return new $TaggedTemplateExpression(node, parent, ctx, idx);
    case SyntaxKind.CallExpression:
      return new $CallExpression(node, parent, ctx, idx);
    case SyntaxKind.MetaProperty:
      return new $MetaProperty(node, parent, ctx, idx);
    case SyntaxKind.ThisKeyword:
      return new $ThisExpression(node, parent, ctx, idx);
    case SyntaxKind.SuperKeyword:
      return new $SuperExpression(node, parent, ctx, idx);
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, parent, ctx, idx);
    case SyntaxKind.BigIntLiteral:
      return new $BigIntLiteral(node, parent, ctx, idx);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, parent, ctx, idx);
    case SyntaxKind.RegularExpressionLiteral:
      return new $RegularExpressionLiteral(node, parent, ctx, idx);
    case SyntaxKind.NoSubstitutionTemplateLiteral:
      return new $NoSubstitutionTemplateLiteral(node, parent, ctx, idx);
    case SyntaxKind.NullKeyword:
      return new $NullLiteral(node, parent, ctx, idx);
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
      return new $BooleanLiteral(node, parent, ctx, idx);
    default:
      throw new Error(`Unexpected syntax node: ${SyntaxKind[(node as any).kind]}.`);
  }
}

export function $identifier(
  node: undefined,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): undefined;
export function $identifier(
  node: Identifier,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $Identifier;
export function $identifier(
  node: Identifier | undefined,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $Identifier | undefined;
export function $identifier(
  node: Identifier | undefined,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
): $Identifier | undefined {
  if (node === void 0) {
    return void 0;
  }
  return new $Identifier(node, parent, ctx, idx);
}

export type $$PropertyName = (
  $ComputedPropertyName |
  $Identifier |
  $NumericLiteral |
  $StringLiteral
);

export function $$propertyName(
  node: PropertyName,
  parent: $AnyParentNode,
  ctx: Context,
  idx: number,
  // @ts-ignore - TODO(fkleuver): update AOT to use new TS 3.8 ast
): $$PropertyName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx, idx);
    case SyntaxKind.StringLiteral:
      return new $StringLiteral(node, parent, ctx, idx);
    case SyntaxKind.NumericLiteral:
      return new $NumericLiteral(node, parent, ctx, idx);
    case SyntaxKind.ComputedPropertyName:
      return new $ComputedPropertyName(node, parent as $$NamedDeclaration, ctx, idx);
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
  parent: $$DestructurableBinding,
  ctx: Context,
  idx: number,
): $$BindingName {
  switch (node.kind) {
    case SyntaxKind.Identifier:
      return new $Identifier(node, parent, ctx | Context.IsBindingName, idx);
    case SyntaxKind.ObjectBindingPattern:
      return new $ObjectBindingPattern(node, parent, ctx, idx);
    case SyntaxKind.ArrayBindingPattern:
      return new $ArrayBindingPattern(node, parent, ctx, idx);
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
  parent: $NodeWithStatements,
  ctx: Context,
  idx: number,
): $$ESStatement {
  switch (node.kind) {
    case SyntaxKind.Block:
      return new $Block(node, parent, ctx, idx);
    case SyntaxKind.EmptyStatement:
      return new $EmptyStatement(node, parent, ctx, idx);
    case SyntaxKind.ExpressionStatement:
      return new $ExpressionStatement(node, parent, ctx, idx);
    case SyntaxKind.IfStatement:
      return new $IfStatement(node, parent, ctx, idx);
    case SyntaxKind.DoStatement:
      return new $DoStatement(node, parent, ctx, idx);
    case SyntaxKind.WhileStatement:
      return new $WhileStatement(node, parent, ctx, idx);
    case SyntaxKind.ForStatement:
      return new $ForStatement(node, parent, ctx, idx);
    case SyntaxKind.ForInStatement:
      return new $ForInStatement(node, parent, ctx, idx);
    case SyntaxKind.ForOfStatement:
      return new $ForOfStatement(node, parent, ctx, idx);
    case SyntaxKind.ContinueStatement:
      return new $ContinueStatement(node, parent, ctx, idx);
    case SyntaxKind.BreakStatement:
      return new $BreakStatement(node, parent, ctx, idx);
    case SyntaxKind.ReturnStatement:
      return new $ReturnStatement(node, parent, ctx, idx);
    case SyntaxKind.WithStatement:
      return new $WithStatement(node, parent, ctx, idx);
    case SyntaxKind.SwitchStatement:
      return new $SwitchStatement(node, parent, ctx, idx);
    case SyntaxKind.LabeledStatement:
      return new $LabeledStatement(node, parent, ctx, idx);
    case SyntaxKind.ThrowStatement:
      return new $ThrowStatement(node, parent, ctx, idx);
    case SyntaxKind.TryStatement:
      return new $TryStatement(node, parent, ctx, idx);
    case SyntaxKind.DebuggerStatement:
      return new $DebuggerStatement(node, parent, ctx, idx);
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
  parent: $NodeWithStatements,
  ctx: Context,
  idx: number,
): $$TSStatementListItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx, idx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx, idx);
    case SyntaxKind.ClassDeclaration:
      return new $ClassDeclaration(node, parent, ctx, idx);
    case SyntaxKind.InterfaceDeclaration:
      return new $InterfaceDeclaration(node, parent, ctx, idx);
    case SyntaxKind.TypeAliasDeclaration:
      return new $TypeAliasDeclaration(node, parent, ctx, idx);
    case SyntaxKind.EnumDeclaration:
      return new $EnumDeclaration(node, parent, ctx, idx);
    default:
      return $$esStatement(node, parent, ctx, idx);
  }
}

export function $$tsStatementList(
  nodes: readonly $StatementNode[],
  parent: $NodeWithStatements,
  ctx: Context,
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
    $nodes[x] = $$tsStatementListItem(node, parent, ctx, x);
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
  parent: $NodeWithStatements,
  ctx: Context,
  idx: number,
): $$ESLabelledItem {
  switch (node.kind) {
    case SyntaxKind.VariableStatement:
      return new $VariableStatement(node, parent, ctx, idx);
    case SyntaxKind.FunctionDeclaration:
      return new $FunctionDeclaration(node, parent, ctx, idx);
    default:
      return $$esStatement(node, parent, ctx, idx);
  }
}

// #endregion

// #region AST helpers

export function GetDirectivePrologue(statements: readonly Statement[]): DirectivePrologue {
  let directivePrologue: ExpressionStatement_T<StringLiteral>[] = emptyArray;

  let statement: ExpressionStatement_T<StringLiteral>;
  const len = statements.length;
  for (let i = 0; i < len; ++i) {
    statement = statements[i] as ExpressionStatement_T<StringLiteral>;
    if (
      statement.kind === SyntaxKind.ExpressionStatement
      && statement.expression.kind === SyntaxKind.StringLiteral
    ) {
      if (directivePrologue === emptyArray) {
        directivePrologue = [statement];
      } else {
        directivePrologue.push(statement);
      }
      if (statement.expression.text === 'use strict') {
        (directivePrologue as Writable<DirectivePrologue>).ContainsUseStrict = true;
      }
    } else {
      break;
    }
  }

  return directivePrologue;
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
  parent: $NodeWithDecorators,
  ctx: Context,
): readonly $Decorator[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  if (nodes.length === 1) {
    return [new $Decorator(nodes[0], parent, ctx, 0)];
  }

  const len = nodes.length;
  const $nodes: $Decorator[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $Decorator(nodes[i], parent, ctx, i);
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
  parent: $$NodeWithHeritageClauses,
  ctx: Context,
): readonly $HeritageClause[] {
  if (nodes === void 0 || nodes.length === 0) {
    return emptyArray;
  }

  const len = nodes.length;
  const $nodes: $HeritageClause[] = Array(len);
  for (let i = 0; i < len; ++i) {
    $nodes[i] = new $HeritageClause(nodes[i], parent, ctx, i);
  }
  return $nodes;
}

export function $$classElementList(
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
      $node = $$classElement(nodes[i], parent, ctx, i);
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
  parent: $ClassDeclaration | $ClassExpression,
  ctx: Context,
  idx: number,
): $$ClassElement | undefined {
  switch (node.kind) {
    case SyntaxKind.PropertyDeclaration:
      return new $PropertyDeclaration(node, parent, ctx, idx);
    case SyntaxKind.SemicolonClassElement:
      return new $SemicolonClassElement(node, parent, ctx, idx);
    case SyntaxKind.MethodDeclaration:
      return new $MethodDeclaration(node, parent, ctx, idx);
    case SyntaxKind.Constructor:
      return new $ConstructorDeclaration(node, parent, ctx, idx);
    case SyntaxKind.GetAccessor:
      return new $GetAccessorDeclaration(node, parent, ctx, idx);
    case SyntaxKind.SetAccessor:
      return new $SetAccessorDeclaration(node, parent, ctx, idx);
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
      // todo(fred): bigopon added these cast, as it causes issues to the build
      //             it's from existing working code, though the cast is really weird when the lookup only has a few keys
      return (lookup as IIndexable)[mods[0].kind] as ModifierFlags;
    } else if (len === 2) {
      return (lookup as IIndexable)[mods[0].kind] as ModifierFlags + ((lookup as IIndexable)[mods[1].kind] as ModifierFlags);
    } else if (len === 3) {
      return ((lookup as IIndexable)[mods[0].kind] as ModifierFlags)
        + ((lookup as IIndexable)[mods[1].kind] as ModifierFlags)
        + ((lookup as IIndexable)[mods[2].kind] as ModifierFlags);
    } else {
      // More than 4 modifiers is not possible
      return ((lookup as IIndexable)[mods[0].kind] as ModifierFlags)
        + ((lookup as IIndexable)[mods[1].kind] as ModifierFlags)
        + ((lookup as IIndexable)[mods[2].kind] as ModifierFlags)
        + ((lookup as IIndexable)[mods[3].kind] as ModifierFlags);
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
