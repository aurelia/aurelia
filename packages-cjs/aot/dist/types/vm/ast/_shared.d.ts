import { ArrayLiteralExpression, ArrowFunction, AsExpression, AwaitExpression, BigIntLiteral, BinaryExpression, BindingName, Block, BooleanLiteral, BreakStatement, CallExpression, ClassDeclaration, ClassExpression, ConditionalExpression, ConstructorDeclaration, ContinueStatement, DebuggerStatement, Decorator, DeleteExpression, DoStatement, ElementAccessExpression, EmptyStatement, EnumDeclaration, ExportAssignment, ExportDeclaration, ExpressionStatement, ForInStatement, ForOfStatement, ForStatement, FunctionDeclaration, FunctionExpression, GetAccessorDeclaration, HeritageClause, Identifier, IfStatement, ImportDeclaration, ImportEqualsDeclaration, InterfaceDeclaration, JsxElement, JsxFragment, JsxSelfClosingElement, LabeledStatement, MetaProperty, MethodDeclaration, Modifier, ModifierFlags, ModuleDeclaration, NamespaceExportDeclaration, NewExpression, NonNullExpression, NoSubstitutionTemplateLiteral, NullLiteral, NumericLiteral, ObjectLiteralExpression, OmittedExpression, ParenthesizedExpression, PostfixUnaryExpression, PrefixUnaryExpression, PropertyAccessExpression, PropertyDeclaration, PropertyName, RegularExpressionLiteral, ReturnStatement, SemicolonClassElement, SetAccessorDeclaration, SpreadElement, StringLiteral, SuperExpression, SwitchStatement, TaggedTemplateExpression, TemplateExpression, ThisExpression, ThrowStatement, TryStatement, TypeAliasDeclaration, TypeAssertion, TypeOfExpression, VariableStatement, VoidExpression, WhileStatement, WithStatement, YieldExpression, Statement } from 'typescript';
import { Realm, ExecutionContext } from '../realm.js';
import { $DeclarativeEnvRec } from '../types/environment-record.js';
import { $Function } from '../types/function.js';
import { $Any, $AnyNonEmpty } from '../types/_shared.js';
import { $$TSModuleItem, $ExportSpecifier, $ExternalModuleReference, $ImportClause, $ImportSpecifier, $ModuleBlock, $NamedImports, $NamespaceImport, $QualifiedName, $ModuleDeclaration, $ExportAssignment, $ExportDeclaration, $ImportDeclaration, $ImportEqualsDeclaration, $ESScript, $ESModule } from './modules.js';
import { $ArrayBindingPattern, $BindingElement, $ComputedPropertyName, $ObjectBindingPattern, $SpreadElement } from './bindings.js';
import { $ArrayLiteralExpression, $AsExpression, $AwaitExpression, $BinaryExpression, $CallExpression, $ConditionalExpression, $Decorator, $DeleteExpression, $ElementAccessExpression, $MetaProperty, $NewExpression, $NonNullExpression, $ObjectLiteralExpression, $ParenthesizedExpression, $PostfixUnaryExpression, $PrefixUnaryExpression, $PropertyAccessExpression, $PropertyAssignment, $ShorthandPropertyAssignment, $SpreadAssignment, $TaggedTemplateExpression, $TemplateExpression, $TypeAssertion, $TypeOfExpression, $VoidExpression, $YieldExpression, $Identifier, $ThisExpression, $SuperExpression } from './expressions.js';
import { $ArrowFunction, $ConstructorDeclaration, $FunctionExpression, $ParameterDeclaration, $FunctionDeclaration } from './functions.js';
import { $Block, $BreakStatement, $CaseBlock, $CaseClause, $CatchClause, $ContinueStatement, $DefaultClause, $DoStatement, $ExpressionStatement, $ForInStatement, $ForOfStatement, $ForStatement, $IfStatement, $LabeledStatement, $ReturnStatement, $SwitchStatement, $ThrowStatement, $TryStatement, $VariableDeclaration, $VariableDeclarationList, $WhileStatement, $WithStatement, $VariableStatement, $EmptyStatement, $DebuggerStatement, DirectivePrologue } from './statements.js';
import { $ClassExpression, $ExpressionWithTypeArguments, $HeritageClause, $PropertyDeclaration, $ClassDeclaration, $$NodeWithHeritageClauses, $SemicolonClassElement } from './classes.js';
import { $EnumMember, $InterfaceDeclaration, $TypeAliasDeclaration, $EnumDeclaration } from './types.js';
import { $GetAccessorDeclaration, $MethodDeclaration, $SetAccessorDeclaration } from './methods.js';
import { $JsxAttribute, $JsxAttributes, $JsxClosingElement, $JsxElement, $JsxExpression, $JsxFragment, $JsxOpeningElement, $JsxSelfClosingElement, $JsxSpreadAttribute } from './jsx.js';
import { $TemplateSpan, $BigIntLiteral, $BooleanLiteral, $NoSubstitutionTemplateLiteral, $NullLiteral, $NumericLiteral, $RegularExpressionLiteral, $StringLiteral } from './literals.js';
import { $Empty } from '../types/empty.js';
import { $Error } from '../types/error.js';
export declare type $PrimaryExpressionNode = ($LiteralNode | ArrayLiteralExpression | ClassExpression | FunctionExpression | Identifier | NewExpression | ObjectLiteralExpression | ParenthesizedExpression | TemplateExpression | ThisExpression | SuperExpression);
export declare type $MemberExpressionNode = ($PrimaryExpressionNode | ElementAccessExpression | NonNullExpression | PropertyAccessExpression | TaggedTemplateExpression);
export declare type $CallExpressionNode = ($MemberExpressionNode | CallExpression);
export declare type $LHSExpressionNode = ($CallExpressionNode | MetaProperty);
export declare type $UpdateExpressionNode = ($LHSExpressionNode | JsxElement | JsxFragment | JsxSelfClosingElement | PostfixUnaryExpression | PrefixUnaryExpression);
export declare type $UnaryExpressionNode = ($UpdateExpressionNode | AwaitExpression | DeleteExpression | PrefixUnaryExpression | TypeAssertion | TypeOfExpression | VoidExpression);
export declare type $BinaryExpressionNode = ($UnaryExpressionNode | AsExpression | BinaryExpression);
export declare type $AssignmentExpressionNode = ($BinaryExpressionNode | ArrowFunction | ConditionalExpression | YieldExpression);
export declare type $ArgumentOrArrayLiteralElementNode = ($AssignmentExpressionNode | SpreadElement | OmittedExpression);
export declare type $LiteralNode = (NumericLiteral | BigIntLiteral | StringLiteral | RegularExpressionLiteral | NoSubstitutionTemplateLiteral | NullLiteral | BooleanLiteral);
export declare type $ModuleStatementNode = (ModuleDeclaration | NamespaceExportDeclaration | ImportEqualsDeclaration | ImportDeclaration | ExportAssignment | ExportDeclaration);
export declare type $StatementNode = ($ESStatementListItemNode | InterfaceDeclaration | TypeAliasDeclaration | EnumDeclaration | ModuleDeclaration | NamespaceExportDeclaration | ImportEqualsDeclaration | ImportDeclaration | ExportAssignment | ExportDeclaration);
export declare type $ESStatementListItemNode = (Block | VariableStatement | EmptyStatement | ExpressionStatement | IfStatement | DoStatement | WhileStatement | ForStatement | ForInStatement | ForOfStatement | ContinueStatement | BreakStatement | ReturnStatement | WithStatement | SwitchStatement | LabeledStatement | ThrowStatement | TryStatement | DebuggerStatement | FunctionDeclaration | ClassDeclaration);
export declare type $ClassElementNode = (GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration | MethodDeclaration | SemicolonClassElement | PropertyDeclaration);
export declare type $AnyParentNode = ($$TSModuleItem | $ArrayBindingPattern | $ArrayLiteralExpression | $ArrowFunction | $AsExpression | $AwaitExpression | $BinaryExpression | $BindingElement | $Block | $BreakStatement | $CallExpression | $CaseBlock | $CaseClause | $CatchClause | $ClassExpression | $ComputedPropertyName | $ConditionalExpression | $ConstructorDeclaration | $ContinueStatement | $Decorator | $DefaultClause | $DeleteExpression | $DoStatement | $ElementAccessExpression | $EnumMember | $ExportSpecifier | $ExpressionStatement | $ExpressionWithTypeArguments | $ExternalModuleReference | $ForInStatement | $ForOfStatement | $ForStatement | $FunctionExpression | $GetAccessorDeclaration | $HeritageClause | $IfStatement | $ImportClause | $ImportSpecifier | $JsxAttribute | $JsxAttributes | $JsxClosingElement | $JsxElement | $JsxExpression | $JsxFragment | $JsxOpeningElement | $JsxSelfClosingElement | $JsxSpreadAttribute | $LabeledStatement | $MetaProperty | $MethodDeclaration | $ModuleBlock | $NamedImports | $NamespaceImport | $NewExpression | $NonNullExpression | $ObjectBindingPattern | $ObjectLiteralExpression | $ParameterDeclaration | $ParenthesizedExpression | $PostfixUnaryExpression | $PrefixUnaryExpression | $PropertyAccessExpression | $PropertyAssignment | $PropertyDeclaration | $QualifiedName | $ReturnStatement | $SetAccessorDeclaration | $ShorthandPropertyAssignment | $ESModule | $SpreadAssignment | $SpreadElement | $SwitchStatement | $TaggedTemplateExpression | $TemplateExpression | $TemplateSpan | $ThrowStatement | $TryStatement | $TypeAssertion | $TypeOfExpression | $VariableDeclaration | $VariableDeclarationList | $VoidExpression | $WhileStatement | $WithStatement | $YieldExpression);
export declare type $$JsxOpeningLikeElement = ($JsxSelfClosingElement | $JsxOpeningElement);
export declare type $$BinaryExpression = ($AsExpression | $BinaryExpression);
export declare type $$BinaryExpressionOrHigher = ($$UnaryExpressionOrHigher | $$BinaryExpression);
export declare type $$AssignmentExpression = ($ArrowFunction | $ConditionalExpression | $YieldExpression);
export declare type $$AssignmentExpressionOrHigher = ($$BinaryExpressionOrHigher | $$AssignmentExpression);
export declare function $assignmentExpression(node: undefined, parent: $AnyParentNode, ctx: Context, idx: number): undefined;
export declare function $assignmentExpression(node: $AssignmentExpressionNode, parent: $AnyParentNode, ctx: Context, idx: number): $$AssignmentExpressionOrHigher;
export declare function $assignmentExpression(node: $AssignmentExpressionNode | undefined, parent: $AnyParentNode, ctx: Context, idx: number): $$AssignmentExpressionOrHigher | undefined;
export declare type $$UpdateExpression = ($JsxElement | $JsxFragment | $JsxSelfClosingElement | $PostfixUnaryExpression | $PrefixUnaryExpression);
export declare type $$UpdateExpressionOrHigher = ($$LHSExpressionOrHigher | $$UpdateExpression);
export declare type $$UnaryExpression = ($AwaitExpression | $DeleteExpression | $PrefixUnaryExpression | $TypeAssertion | $TypeOfExpression | $VoidExpression);
export declare type $$UnaryExpressionOrHigher = ($$UpdateExpressionOrHigher | $$UnaryExpression);
export declare function $unaryExpression(node: $UnaryExpressionNode, parent: $AnyParentNode, ctx: Context, idx: number): $$UnaryExpressionOrHigher;
export declare type $$Literal = ($BigIntLiteral | $BooleanLiteral | $NoSubstitutionTemplateLiteral | $NullLiteral | $NumericLiteral | $RegularExpressionLiteral | $StringLiteral);
export declare type $$PrimaryExpression = ($ArrayLiteralExpression | $ClassExpression | $FunctionExpression | $Identifier | $NewExpression | $ObjectLiteralExpression | $ParenthesizedExpression | $TemplateExpression | $ThisExpression | $SuperExpression);
export declare type $$PrimaryExpressionOrHigher = ($$Literal | $$PrimaryExpression);
export declare type $$MemberExpression = ($ElementAccessExpression | $NonNullExpression | $PropertyAccessExpression | $TaggedTemplateExpression);
export declare type $$MemberExpressionOrHigher = ($$PrimaryExpressionOrHigher | $$MemberExpression);
export declare type $$CallExpressionOrHigher = ($$MemberExpressionOrHigher | $CallExpression);
export declare type $$LHSExpression = ($MetaProperty);
export declare type $$LHSExpressionOrHigher = ($$CallExpressionOrHigher | $$LHSExpression);
export declare function $LHSExpression(node: $LHSExpressionNode, parent: $AnyParentNode, ctx: Context, idx: number): $$LHSExpressionOrHigher;
export declare function $identifier(node: undefined, parent: $AnyParentNode, ctx: Context, idx: number): undefined;
export declare function $identifier(node: Identifier, parent: $AnyParentNode, ctx: Context, idx: number): $Identifier;
export declare function $identifier(node: Identifier | undefined, parent: $AnyParentNode, ctx: Context, idx: number): $Identifier | undefined;
export declare type $$PropertyName = ($ComputedPropertyName | $Identifier | $NumericLiteral | $StringLiteral);
export declare function $$propertyName(node: PropertyName, parent: $AnyParentNode, ctx: Context, idx: number): $$PropertyName;
export declare type $$DestructurableBinding = ($VariableDeclaration | $ParameterDeclaration | $BindingElement);
export declare type $$BindingName = ($ArrayBindingPattern | $Identifier | $ObjectBindingPattern);
export declare function $$bindingName(node: BindingName, parent: $$DestructurableBinding, ctx: Context, idx: number): $$BindingName;
export declare type $NodeWithStatements = ($GetAccessorDeclaration | $SetAccessorDeclaration | $$IterationStatement | $Block | $CaseClause | $CatchClause | $ConstructorDeclaration | $DefaultClause | $FunctionDeclaration | $LabeledStatement | $MethodDeclaration | $ModuleBlock | $ESModule | $ESScript | $TryStatement | $WithStatement | $FunctionExpression | $ArrowFunction | $IfStatement);
export declare type $$IterationStatement = ($DoStatement | $ForInStatement | $ForOfStatement | $ForStatement | $WhileStatement);
export declare type $$BreakableStatement = ($$IterationStatement | $SwitchStatement);
export declare type $$ModuleDeclarationParent = ($ESModule | $ModuleBlock | $ModuleDeclaration);
export declare type $$ESStatement = ($Block | $VariableStatement | // Note, technically only "var declaration" belongs here but TS clumps them up
$EmptyStatement | $ExpressionStatement | $IfStatement | $$BreakableStatement | $ContinueStatement | $BreakStatement | $ReturnStatement | $WithStatement | $LabeledStatement | $ThrowStatement | $TryStatement | $DebuggerStatement);
export declare function $$esStatement(node: $StatementNode, parent: $NodeWithStatements, ctx: Context, idx: number): $$ESStatement;
export declare type $$ESVarDeclaration = ($FunctionDeclaration | $VariableStatement | $VariableDeclaration);
export declare type $$ESDeclaration = ($$ESVarDeclaration | $ClassDeclaration);
export declare type $$TSDeclaration = ($InterfaceDeclaration | $TypeAliasDeclaration | $EnumDeclaration);
export declare type $$ESStatementListItem = ($$ESStatement | $$ESDeclaration);
export declare type $$TSStatementListItem = ($$ESStatementListItem | $$TSDeclaration);
export declare function $$tsStatementListItem(node: $StatementNode, parent: $NodeWithStatements, ctx: Context, idx: number): $$TSStatementListItem;
export declare function $$tsStatementList(nodes: readonly $StatementNode[], parent: $NodeWithStatements, ctx: Context): readonly $$TSStatementListItem[];
export declare type $$ESLabelledItem = ($$ESStatement | $FunctionDeclaration);
export declare function $$esLabelledItem(node: $StatementNode, parent: $NodeWithStatements, ctx: Context, idx: number): $$ESLabelledItem;
export declare function GetDirectivePrologue(statements: readonly Statement[]): DirectivePrologue;
export declare function GetExpectedArgumentCount(params: readonly $ParameterDeclaration[]): number;
export declare function evaluateStatement(ctx: ExecutionContext, statement: $$ESLabelledItem): $Any;
export declare function evaluateStatementList(ctx: ExecutionContext, statements: readonly $$TSStatementListItem[]): $Any;
export declare function BlockDeclarationInstantiation(ctx: ExecutionContext, lexicallyScopedDeclarations: readonly $$ESDeclaration[], envRec: $DeclarativeEnvRec): $Empty | $Error;
export declare function IsConstructor(ctx: ExecutionContext, argument: $AnyNonEmpty): argument is $Function;
export declare type $NodeWithDecorators = ($GetAccessorDeclaration | $SetAccessorDeclaration | $ClassDeclaration | $ConstructorDeclaration | $EnumDeclaration | $ExportAssignment | $ExportDeclaration | $FunctionDeclaration | $ImportDeclaration | $ImportEqualsDeclaration | $InterfaceDeclaration | $MethodDeclaration | $ModuleDeclaration | $ParameterDeclaration | $PropertyDeclaration | $TypeAliasDeclaration);
export declare function $decoratorList(nodes: readonly Decorator[] | undefined, parent: $NodeWithDecorators, ctx: Context): readonly $Decorator[];
export declare function getContainsExpression<T>(obj: {
    ContainsExpression: T;
}): T;
export declare function getHasInitializer<T>(obj: {
    HasInitializer: T;
}): T;
export declare function getIsSimpleParameterList<T>(obj: {
    IsSimpleParameterList: T;
}): T;
export declare function getBoundNames<T>(obj: {
    BoundNames: T;
}): T;
export declare function getLexicallyDeclaredNames<T>(obj: {
    LexicallyDeclaredNames: T;
}): T;
export declare function getLexicallyScopedDeclarations<T>(obj: {
    LexicallyScopedDeclarations: T;
}): T;
export declare function getVarDeclaredNames<T>(obj: {
    VarDeclaredNames: T;
}): T;
export declare function getVarScopedDeclarations<T>(obj: {
    VarScopedDeclarations: T;
}): T;
export declare function getLocalName<T>(obj: {
    LocalName: T;
}): T;
export declare function getImportEntriesForModule<T>(obj: {
    ImportEntriesForModule: T;
}): T;
export declare function getExportedNames<T>(obj: {
    ExportedNames: T;
}): T;
export declare function getExportEntriesForModule<T>(obj: {
    ExportEntriesForModule: T;
}): T;
export declare function getReferencedBindings<T>(obj: {
    ReferencedBindings: T;
}): T;
export declare function $heritageClauseList(nodes: readonly HeritageClause[] | undefined, parent: $$NodeWithHeritageClauses, ctx: Context): readonly $HeritageClause[];
export declare function $$classElementList(nodes: readonly $ClassElementNode[] | undefined, parent: $ClassDeclaration | $ClassExpression, ctx: Context): readonly $$ClassElement[];
export declare type $$ClassElement = ($GetAccessorDeclaration | $SetAccessorDeclaration | $ConstructorDeclaration | $MethodDeclaration | $SemicolonClassElement | $PropertyDeclaration);
export declare function $$classElement(node: $ClassElementNode, parent: $ClassDeclaration | $ClassExpression, ctx: Context, idx: number): $$ClassElement | undefined;
export declare type $$MethodDefinition = ($MethodDeclaration | $GetAccessorDeclaration | $SetAccessorDeclaration);
export declare function hasBit(flag: number, bit: number): boolean;
export declare function hasAllBits(flag: number, bit: number): boolean;
export declare function clearBit(flag: number, bit: number): number;
export declare const enum Context {
    None = 0,
    Dynamic = 2,
    InVariableStatement = 4,
    IsBindingName = 8,
    InParameterDeclaration = 16,
    InCatchClause = 32,
    InBindingPattern = 64,
    InTypeElement = 128,
    IsPropertyAccessName = 256,
    IsMemberName = 512,
    IsLabel = 1024,
    IsLabelReference = 2048,
    InExport = 4096,
    IsConst = 8192,
    IsLet = 16384,
    IsBlockScoped = 24576,
    IsVar = 32768,
    IsFunctionScoped = 32768,
    InStrictMode = 65536
}
export declare const modifiersToModifierFlags: (mods: readonly Modifier[] | undefined) => ModifierFlags;
export declare const enum FunctionKind {
    normal = 0,
    nonConstructor = 1,
    classConstructor = 2,
    generator = 4,
    async = 8,
    asyncGenerator = 12
}
/**
 * Returns the indexed string representation, or an empty string if the number is -1.
 */
export declare function $i(idx: number): string;
export interface I$Node<TNode extends object = object> {
    readonly depth: number;
    readonly realm: Realm;
    readonly parent: I$Node;
    readonly node: TNode;
    readonly ctx: Context;
    readonly path: string;
}
//# sourceMappingURL=_shared.d.ts.map