import { Block, BreakStatement, CaseBlock, CaseClause, CatchClause, ContinueStatement, DebuggerStatement, DefaultClause, DoStatement, EmptyStatement, ExpressionStatement, ForInStatement, ForOfStatement, ForStatement, IfStatement, LabeledStatement, ModifierFlags, ReturnStatement, StringLiteral, SwitchStatement, SyntaxKind, ThrowStatement, TryStatement, VariableDeclaration, VariableDeclarationList, VariableStatement, WhileStatement, WithStatement, Expression, CaseOrDefaultClause } from 'typescript';
import { ILogger } from '@aurelia/kernel';
import { Realm, ExecutionContext } from '../realm';
import { $String } from '../types/string';
import { $Any, $AnyNonEmpty } from '../types/_shared';
import { $Empty } from '../types/empty';
import { I$Node, Context, $$ESDeclaration, $NodeWithStatements, $$AssignmentExpressionOrHigher, $$TSDeclaration, $$BindingName, $$TSStatementListItem, $$ESLabelledItem, $$ESVarDeclaration } from './_shared';
import { ExportEntryRecord, $$ESModuleOrScript } from './modules';
import { $Identifier } from './expressions';
import { $StringSet } from '../globals/string';
export declare class $VariableStatement implements I$Node {
    readonly node: VariableStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.VariableStatement;
    readonly modifierFlags: ModifierFlags;
    readonly $declarationList: $VariableDeclarationList;
    readonly isLexical: boolean;
    readonly BoundNames: readonly $String[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly ExportedBindings: readonly $String[];
    readonly ExportedNames: readonly $String[];
    readonly ExportEntries: readonly ExportEntryRecord[];
    readonly IsConstantDeclaration: boolean;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly ModuleRequests: readonly $String[];
    readonly TypeDeclarations: readonly $$TSDeclaration[];
    readonly IsType: false;
    constructor(node: VariableStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $VariableDeclaration implements I$Node {
    readonly node: VariableDeclaration;
    readonly parent: $VariableDeclarationList | $CatchClause;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.VariableDeclaration;
    readonly modifierFlags: ModifierFlags;
    readonly combinedModifierFlags: ModifierFlags;
    readonly $name: $$BindingName;
    readonly $initializer: $$AssignmentExpressionOrHigher | undefined;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly BoundNames: readonly $String[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly IsConstantDeclaration: boolean;
    constructor(node: VariableDeclaration, parent: $VariableDeclarationList | $CatchClause, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    InitializeBinding(ctx: ExecutionContext, value: $AnyNonEmpty): $Any;
}
export declare function $variableDeclarationList(nodes: readonly VariableDeclaration[], parent: $VariableDeclarationList, ctx: Context): readonly $VariableDeclaration[];
export declare class $VariableDeclarationList implements I$Node {
    readonly node: VariableDeclarationList;
    readonly parent: $VariableStatement | $ForStatement | $ForOfStatement | $ForInStatement;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.VariableDeclarationList;
    readonly combinedModifierFlags: ModifierFlags;
    readonly $declarations: readonly $VariableDeclaration[];
    readonly isLexical: boolean;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly BoundNames: readonly $String[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly IsConstantDeclaration: boolean;
    constructor(node: VariableDeclarationList, parent: $VariableStatement | $ForStatement | $ForOfStatement | $ForInStatement, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $Block implements I$Node {
    readonly node: Block;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.Block;
    readonly $statements: readonly $$TSStatementListItem[];
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly TopLevelLexicallyDeclaredNames: readonly $String[];
    readonly TopLevelLexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly TopLevelVarDeclaredNames: readonly $String[];
    readonly TopLevelVarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly TypeDeclarations: readonly $$TSDeclaration[];
    readonly IsType: false;
    constructor(node: Block, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $EmptyStatement implements I$Node {
    readonly node: EmptyStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.EmptyStatement;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: EmptyStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export type ExpressionStatement_T<T extends Expression> = ExpressionStatement & {
    readonly expression: T;
};
export type DirectivePrologue = readonly ExpressionStatement_T<StringLiteral>[] & {
    readonly ContainsUseStrict?: true;
};
export declare class $ExpressionStatement implements I$Node {
    readonly node: ExpressionStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ExpressionStatement;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: ExpressionStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $IfStatement implements I$Node {
    readonly node: IfStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.IfStatement;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly $thenStatement: $$ESLabelledItem;
    readonly $elseStatement: $$ESLabelledItem | undefined;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: IfStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $DoStatement implements I$Node {
    readonly node: DoStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.DoStatement;
    readonly $statement: $$ESLabelledItem;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: DoStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluateLabelled(ctx: ExecutionContext, labelSet: $StringSet): $Any;
}
export declare class $WhileStatement implements I$Node {
    readonly node: WhileStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.WhileStatement;
    readonly $statement: $$ESLabelledItem;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: WhileStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluateLabelled(ctx: ExecutionContext, labelSet: $StringSet): $Any;
}
export type $$Initializer = ($$AssignmentExpressionOrHigher | $VariableDeclarationList);
export declare class $ForStatement implements I$Node {
    readonly node: ForStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ForStatement;
    readonly $initializer: $$Initializer | undefined;
    readonly $condition: $$AssignmentExpressionOrHigher | undefined;
    readonly $incrementor: $$AssignmentExpressionOrHigher | undefined;
    readonly $statement: $$ESLabelledItem;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: ForStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluateLabelled(ctx: ExecutionContext): $Any;
}
export declare class $ForInStatement implements I$Node {
    readonly node: ForInStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ForInStatement;
    readonly $initializer: $$Initializer;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly $statement: $$ESLabelledItem;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly BoundNames: readonly $String[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: ForInStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluateLabelled(ctx: ExecutionContext): $Any;
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $ForOfStatement implements I$Node {
    readonly node: ForOfStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ForOfStatement;
    readonly $initializer: $$Initializer;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly $statement: $$ESLabelledItem;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly BoundNames: readonly $String[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: ForOfStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluateLabelled(ctx: ExecutionContext): $Any;
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $ContinueStatement implements I$Node {
    readonly node: ContinueStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ContinueStatement;
    readonly $label: $Identifier | undefined;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: ContinueStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Empty;
}
export declare class $BreakStatement implements I$Node {
    readonly node: BreakStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.BreakStatement;
    readonly $label: $Identifier | undefined;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: BreakStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $ReturnStatement implements I$Node {
    readonly node: ReturnStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ReturnStatement;
    readonly $expression: $$AssignmentExpressionOrHigher | undefined;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: ReturnStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $WithStatement implements I$Node {
    readonly node: WithStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.WithStatement;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly $statement: $$ESLabelledItem;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: WithStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export declare class $SwitchStatement implements I$Node {
    readonly node: SwitchStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.SwitchStatement;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly $caseBlock: $CaseBlock;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: SwitchStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
    private EvaluateCaseBlock;
    private IsCaseClauseSelected;
}
export declare class $LabeledStatement implements I$Node {
    readonly node: LabeledStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.LabeledStatement;
    readonly $label: $Identifier;
    readonly $statement: $$ESLabelledItem;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly TopLevelLexicallyDeclaredNames: readonly $String[];
    readonly TopLevelLexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly TopLevelVarDeclaredNames: readonly $String[];
    readonly TopLevelVarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly TypeDeclarations: readonly $$TSDeclaration[];
    readonly IsType: false;
    constructor(node: LabeledStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    EvaluateLabelled(ctx: ExecutionContext): $AnyNonEmpty;
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $ThrowStatement implements I$Node {
    readonly node: ThrowStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ThrowStatement;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: ThrowStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
}
export declare class $TryStatement implements I$Node {
    readonly node: TryStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.TryStatement;
    readonly $tryBlock: $Block;
    readonly $catchClause: $CatchClause | undefined;
    readonly $finallyBlock: $Block | undefined;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: TryStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $AnyNonEmpty;
    private EvaluateCatchClause;
}
export declare class $DebuggerStatement implements I$Node {
    readonly node: DebuggerStatement;
    readonly parent: $NodeWithStatements;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.DebuggerStatement;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    constructor(node: DebuggerStatement, parent: $NodeWithStatements, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    Evaluate(ctx: ExecutionContext): $Any;
}
export type $$CaseOrDefaultClause = $CaseClause | $DefaultClause;
export declare function $$clauseList(nodes: readonly CaseOrDefaultClause[], parent: $CaseBlock, ctx: Context): readonly $$CaseOrDefaultClause[];
export declare class $CaseBlock implements I$Node {
    readonly node: CaseBlock;
    readonly parent: $SwitchStatement;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.CaseBlock;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly $clauses: readonly $$CaseOrDefaultClause[];
    constructor(node: CaseBlock, parent: $SwitchStatement, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $CaseClause implements I$Node {
    readonly node: CaseClause;
    readonly parent: $CaseBlock;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.CaseClause;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly $statements: readonly $$TSStatementListItem[];
    constructor(node: CaseClause, parent: $CaseBlock, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $DefaultClause implements I$Node {
    readonly node: DefaultClause;
    readonly parent: $CaseBlock;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.DefaultClause;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly $statements: readonly $$TSStatementListItem[];
    constructor(node: DefaultClause, parent: $CaseBlock, ctx: Context, idx: number, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $CatchClause implements I$Node {
    readonly node: CatchClause;
    readonly parent: $TryStatement;
    readonly ctx: Context;
    readonly mos: $$ESModuleOrScript;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.CatchClause;
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly $variableDeclaration: $VariableDeclaration | undefined;
    readonly $block: $Block;
    constructor(node: CatchClause, parent: $TryStatement, ctx: Context, mos?: $$ESModuleOrScript, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
    CreateBinding(ctx: ExecutionContext, realm: Realm): void;
}
//# sourceMappingURL=statements.d.ts.map