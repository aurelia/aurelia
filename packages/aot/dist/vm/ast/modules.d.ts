import { ExportAssignment, ExportDeclaration, ExportSpecifier, ExternalModuleReference, ImportClause, ImportDeclaration, ImportEqualsDeclaration, ImportSpecifier, ModifierFlags, ModuleBlock, ModuleDeclaration, NamedExports, NamedImports, NamespaceExportDeclaration, NamespaceImport, QualifiedName, SourceFile, SyntaxKind } from 'typescript';
import { ILogger, Writable } from '@aurelia/kernel';
import { IFile, $CompilerOptions } from '../../system/interfaces';
import { NPMPackage } from '../../system/npm-package-loader';
import { IModule, ResolveSet, ResolvedBindingRecord, Realm, ExecutionContext } from '../realm.js';
import { $ModuleEnvRec, $GlobalEnvRec } from '../types/environment-record.js';
import { $NamespaceExoticObject } from '../exotics/namespace.js';
import { $String } from '../types/string.js';
import { $Undefined } from '../types/undefined.js';
import { $Any } from '../types/_shared.js';
import { $Number } from '../types/number.js';
import { $Null } from '../types/null.js';
import { $Empty } from '../types/empty.js';
import { IModuleResolver } from '../../service-host';
import { $Error } from '../types/error.js';
import { $List } from '../types/list.js';
import { I$Node, Context, $$ESDeclaration, $$AssignmentExpressionOrHigher, $$TSDeclaration, $$ESStatementListItem, $$ModuleDeclarationParent, $$ESVarDeclaration } from './_shared.js';
import { $Identifier } from './expressions.js';
import { $ClassDeclaration } from './classes.js';
import { DirectivePrologue, $VariableStatement } from './statements.js';
import { $FunctionDeclaration } from './functions.js';
import { $InterfaceDeclaration, $TypeAliasDeclaration, $EnumDeclaration } from './types.js';
import { $StringLiteral } from './literals.js';
export declare type $$ESModuleItem = ($$ESStatementListItem | $ImportDeclaration | $ExportDeclaration);
export declare type $$TSModuleItem = ($$ESModuleItem | $$TSDeclaration | $ExportAssignment | $ImportEqualsDeclaration | $ModuleDeclaration | $NamespaceExportDeclaration);
export declare type $$ESModuleOrScript = ($ESModule | $ESScript);
export declare class $ESScript implements I$Node {
    readonly logger: ILogger;
    readonly $file: IFile;
    readonly node: SourceFile;
    readonly realm: Realm;
    readonly '<$ESScript>': unknown;
    disposed: boolean;
    '[[Environment]]': $Undefined;
    '[[HostDefined]]': any;
    readonly path: string;
    readonly mos: $ESScript;
    readonly parent: $ESScript;
    readonly ctx: Context;
    readonly depth: number;
    readonly $statements: readonly $$ESStatementListItem[];
    readonly DirectivePrologue: DirectivePrologue;
    ExecutionResult: $Any;
    readonly LexicallyDeclaredNames: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarDeclaredNames: readonly $String[];
    readonly VarScopedDeclarations: readonly Exclude<$$ESDeclaration, $ClassDeclaration>[];
    get isNull(): false;
    get isScript(): true;
    get isModule(): false;
    constructor(logger: ILogger, $file: IFile, node: SourceFile, realm: Realm);
    InstantiateGlobalDeclaration(ctx: ExecutionContext, env: $GlobalEnvRec): $Empty | $Error;
    EvaluateScript(ctx: ExecutionContext): $Any;
}
export declare type ModuleStatus = 'uninstantiated' | 'instantiating' | 'instantiated' | 'evaluating' | 'evaluated';
export declare class $ESModule implements I$Node, IModule {
    readonly logger: ILogger;
    readonly $file: IFile;
    readonly node: SourceFile;
    readonly realm: Realm;
    readonly pkg: NPMPackage | null;
    readonly moduleResolver: IModuleResolver;
    readonly compilerOptions: $CompilerOptions;
    readonly '<IModule>': unknown;
    disposed: boolean;
    '[[Environment]]': $ModuleEnvRec | $Undefined;
    '[[Namespace]]': $NamespaceExoticObject | $Undefined;
    '[[HostDefined]]': any;
    get isAbrupt(): false;
    get $kind(): SyntaxKind.SourceFile;
    readonly path: string;
    readonly mos: $ESModule;
    readonly parent: $ESModule;
    readonly ctx: Context;
    readonly depth: number;
    readonly $statements: readonly $$TSModuleItem[];
    readonly DirectivePrologue: DirectivePrologue;
    ExecutionResult: $Any;
    readonly ExportedBindings: readonly $String[];
    readonly ExportedNames: readonly $String[];
    readonly ExportEntries: readonly ExportEntryRecord[];
    readonly ImportEntries: readonly ImportEntryRecord[];
    readonly ImportedLocalNames: readonly $String[];
    readonly ModuleRequests: readonly $String[];
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly VarScopedDeclarations: readonly $$ESVarDeclaration[];
    readonly TypeDeclarations: readonly $$TSDeclaration[];
    readonly IsType: false;
    Status: ModuleStatus;
    DFSIndex: number | undefined;
    DFSAncestorIndex: number | undefined;
    RequestedModules: $String[];
    readonly LocalExportEntries: readonly ExportEntryRecord[];
    readonly IndirectExportEntries: readonly ExportEntryRecord[];
    readonly StarExportEntries: readonly ExportEntryRecord[];
    get isNull(): false;
    get isScript(): false;
    get isModule(): true;
    constructor(logger: ILogger, $file: IFile, node: SourceFile, realm: Realm, pkg: NPMPackage | null, moduleResolver: IModuleResolver, compilerOptions: $CompilerOptions);
    Instantiate(ctx: ExecutionContext): $Undefined | $Error;
    InitializeEnvironment(ctx: ExecutionContext): $Any;
    GetExportedNames(ctx: ExecutionContext, exportStarSet: Set<IModule>): $List<$String> | $Error;
    ResolveExport(ctx: ExecutionContext, exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | $Null | $String<'ambiguous'> | $Error;
    EvaluateModule(ctx: ExecutionContext): $Any;
    EvaluateModuleInner(ctx: ExecutionContext, stack: $ESModule[], idx: number): $Number | $Error;
    ExecuteModule(ctx: ExecutionContext): $Any;
    Evaluate(ctx: ExecutionContext): $Any;
    dispose(this: Writable<Partial<$ESModule>>): void;
}
export declare class $DocumentFragment implements I$Node, IModule {
    readonly logger: ILogger;
    readonly $file: IFile;
    readonly node: DocumentFragment;
    readonly realm: Realm;
    readonly pkg: NPMPackage | null;
    readonly '<IModule>': unknown;
    readonly documentFragment: $DocumentFragment;
    readonly parent: $DocumentFragment;
    readonly ctx: Context;
    readonly depth: number;
    readonly path: string;
    '[[Environment]]': $ModuleEnvRec | $Undefined;
    '[[Namespace]]': $NamespaceExoticObject | $Undefined;
    '[[HostDefined]]': any;
    get isNull(): false;
    get isAbrupt(): false;
    constructor(logger: ILogger, $file: IFile, node: DocumentFragment, realm: Realm, pkg: NPMPackage | null);
    ResolveExport(ctx: ExecutionContext, exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | $Null | $String<'ambiguous'>;
    GetExportedNames(ctx: ExecutionContext, exportStarSet: Set<IModule>): $List<$String> | $Error;
    Instantiate(ctx: ExecutionContext): $Undefined | $Error;
    dispose(): void;
}
export declare type $$ModuleBody = ($ModuleBlock | $ModuleDeclaration);
export declare type $$ModuleName = ($Identifier | $StringLiteral);
export declare class $ModuleDeclaration implements I$Node {
    readonly node: ModuleDeclaration;
    readonly parent: $ESModule | $$ModuleBody;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ModuleDeclaration;
    readonly modifierFlags: ModifierFlags;
    readonly $name: $$ModuleName;
    readonly $body: $Identifier | $ModuleBlock | $ModuleDeclaration | undefined;
    constructor(node: ModuleDeclaration, parent: $ESModule | $$ModuleBody, ctx: Context, idx: number, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
/**
 * | Import Statement Form          | MR        | IN          | LN        |
 * |:-------------------------------|:----------|:------------|:----------|
 * | `import v from "mod";`         | `"mod"`   | `"default"` | `"v"`     |
 * | `import * as ns from "mod";`   | `"mod"`   | `"*"`       | `"ns"`    |
 * | `import {x} from "mod";`       | `"mod"`   | `"x"`       | `"x"`     |
 * | `import {x as v} from "mod";`  | `"mod"`   | `"x"`       | `"v"`     |
 * | `import "mod";`                | N/A       | N/A         | N/A       |
 */
export declare class ImportEntryRecord {
    readonly source: $ImportClause | $NamespaceImport | $ImportSpecifier;
    readonly ModuleRequest: $String;
    readonly ImportName: $String;
    readonly LocalName: $String;
    constructor(source: $ImportClause | $NamespaceImport | $ImportSpecifier, ModuleRequest: $String, ImportName: $String, LocalName: $String);
}
export declare type $$ModuleReference = ($$EntityName | $ExternalModuleReference);
/**
 * One of:
 * - import x = require("mod");
 * - import x = M.x;
 */
export declare class $ImportEqualsDeclaration implements I$Node {
    readonly node: ImportEqualsDeclaration;
    readonly parent: $ESModule | $ModuleBlock;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ImportEqualsDeclaration;
    readonly modifierFlags: ModifierFlags;
    readonly $name: $Identifier;
    readonly $moduleReference: $$ModuleReference;
    constructor(node: ImportEqualsDeclaration, parent: $ESModule | $ModuleBlock, ctx: Context, idx: number, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ImportDeclaration implements I$Node {
    readonly node: ImportDeclaration;
    readonly parent: $ESModule | $ModuleBlock;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ImportDeclaration;
    readonly modifierFlags: ModifierFlags;
    readonly $importClause: $ImportClause | $Undefined;
    readonly $moduleSpecifier: $StringLiteral;
    readonly moduleSpecifier: $String;
    readonly BoundNames: readonly $String[];
    readonly ImportEntries: readonly ImportEntryRecord[];
    readonly ModuleRequests: readonly $String[];
    constructor(node: ImportDeclaration, parent: $ESModule | $ModuleBlock, ctx: Context, idx: number, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ImportClause implements I$Node {
    readonly node: ImportClause;
    readonly parent: $ImportDeclaration;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ImportClause;
    readonly $name: $Identifier | $Undefined;
    readonly $namedBindings: $NamespaceImport | $NamedImports | undefined;
    readonly moduleSpecifier: $String;
    readonly BoundNames: readonly $String[];
    readonly ImportEntriesForModule: readonly ImportEntryRecord[];
    constructor(node: ImportClause, parent: $ImportDeclaration, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $NamedImports implements I$Node {
    readonly node: NamedImports;
    readonly parent: $ImportClause;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NamedImports;
    readonly $elements: readonly $ImportSpecifier[];
    readonly moduleSpecifier: $String;
    readonly BoundNames: readonly $String[];
    readonly ImportEntriesForModule: readonly ImportEntryRecord[];
    constructor(node: NamedImports, parent: $ImportClause, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ImportSpecifier implements I$Node {
    readonly node: ImportSpecifier;
    readonly parent: $NamedImports;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ImportSpecifier;
    readonly $propertyName: $Identifier | $Undefined;
    readonly $name: $Identifier;
    readonly BoundNames: readonly [$String];
    readonly ImportEntriesForModule: readonly [ImportEntryRecord];
    constructor(node: ImportSpecifier, parent: $NamedImports, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $NamespaceImport implements I$Node {
    readonly node: NamespaceImport;
    readonly parent: $ImportClause;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NamespaceImport;
    readonly $name: $Identifier;
    readonly BoundNames: readonly $String[];
    readonly ImportEntriesForModule: readonly [ImportEntryRecord];
    constructor(node: NamespaceImport, parent: $ImportClause, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
/**
 * | Export Statement Form           | EN           | MR            | IN         | LN            |
 * |:--------------------------------|:-------------|:--------------|:-----------|:--------------|
 * | `export var v;`                 | `"v"`        | `null`        | `null`     | `"v"`         |
 * | `export default function f(){}` | `"default"`  | `null`        | `null`     | `"f"`         |
 * | `export default function(){}`   | `"default"`  | `null`        | `null`     | `"*default*"` |
 * | `export default 42;`            | `"default"`  | `null`        | `null`     | `"*default*"` |
 * | `export {x};`                   | `"x"`        | `null`        | `null`     | `"x"`         |
 * | `export {v as x};`              | `"x"`        | `null`        | `null`     | `"v"`         |
 * | `export {x} from "mod";`        | `"x"`        | `"mod"`       | `"x"`      | `null`        |
 * | `export {v as x} from "mod";`   | `"x"`        | `"mod"`       | `"v"`      | `null`        |
 * | `export * from "mod";`          | `null`       | `"mod"`       | `"*"`      | `null`        |
 */
export declare class ExportEntryRecord {
    readonly source: $FunctionDeclaration | $ClassDeclaration | $VariableStatement | $ExportDeclaration | $ExportSpecifier | $ESModule | $TypeAliasDeclaration | $InterfaceDeclaration | $EnumDeclaration;
    readonly ExportName: $String | $Null;
    readonly ModuleRequest: $String | $Null;
    readonly ImportName: $String | $Null;
    readonly LocalName: $String | $Null;
    constructor(source: $FunctionDeclaration | $ClassDeclaration | $VariableStatement | $ExportDeclaration | $ExportSpecifier | $ESModule | $TypeAliasDeclaration | $InterfaceDeclaration | $EnumDeclaration, ExportName: $String | $Null, ModuleRequest: $String | $Null, ImportName: $String | $Null, LocalName: $String | $Null);
}
export declare class $ExportAssignment implements I$Node {
    readonly node: ExportAssignment;
    readonly parent: $ESModule;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ExportAssignment;
    readonly modifierFlags: ModifierFlags;
    readonly $expression: $$AssignmentExpressionOrHigher;
    readonly BoundNames: readonly [$String<'*default*'>];
    constructor(node: ExportAssignment, parent: $ESModule, ctx: Context, idx: number, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ExportDeclaration implements I$Node {
    readonly node: ExportDeclaration;
    readonly parent: $ESModule | $ModuleBlock;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ExportDeclaration;
    readonly modifierFlags: ModifierFlags;
    readonly $exportClause: $NamedExports | undefined;
    readonly $moduleSpecifier: $StringLiteral | undefined;
    readonly moduleSpecifier: $String | $Null;
    readonly BoundNames: readonly $String[];
    readonly ExportedBindings: readonly $String[];
    readonly ExportedNames: readonly $String[];
    readonly ExportEntries: readonly ExportEntryRecord[];
    readonly IsConstantDeclaration: false;
    readonly LexicallyScopedDeclarations: readonly $$ESDeclaration[];
    readonly ModuleRequests: readonly $String[];
    readonly TypeDeclarations: readonly $$TSDeclaration[];
    readonly IsType: false;
    constructor(node: ExportDeclaration, parent: $ESModule | $ModuleBlock, ctx: Context, idx: number, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $NamedExports implements I$Node {
    readonly node: NamedExports;
    readonly parent: $ExportDeclaration;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NamedExports;
    readonly $elements: readonly $ExportSpecifier[];
    readonly moduleSpecifier: $String | $Null;
    readonly ExportedNames: readonly $String[];
    readonly ExportEntriesForModule: readonly ExportEntryRecord[];
    readonly ReferencedBindings: readonly $String[];
    constructor(node: NamedExports, parent: $ExportDeclaration, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ExportSpecifier implements I$Node {
    readonly node: ExportSpecifier;
    readonly parent: $NamedExports;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ExportSpecifier;
    readonly $propertyName: $Identifier | $Undefined;
    readonly $name: $Identifier;
    readonly ExportedNames: readonly [$String];
    readonly ExportEntriesForModule: readonly [ExportEntryRecord];
    readonly ReferencedBindings: readonly [$String];
    constructor(node: ExportSpecifier, parent: $NamedExports, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $NamespaceExportDeclaration implements I$Node {
    readonly node: NamespaceExportDeclaration;
    readonly parent: $$ModuleDeclarationParent;
    readonly ctx: Context;
    readonly idx: number;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.NamespaceExportDeclaration;
    readonly modifierFlags: ModifierFlags;
    readonly $name: $Identifier;
    constructor(node: NamespaceExportDeclaration, parent: $$ModuleDeclarationParent, ctx: Context, idx: number, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ModuleBlock implements I$Node {
    readonly node: ModuleBlock;
    readonly parent: $ModuleDeclaration;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ModuleBlock;
    readonly $statements: readonly $$TSModuleItem[];
    constructor(node: ModuleBlock, parent: $ModuleDeclaration, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare class $ExternalModuleReference implements I$Node {
    readonly node: ExternalModuleReference;
    readonly parent: $ImportEqualsDeclaration;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.ExternalModuleReference;
    readonly $expression: $StringLiteral;
    constructor(node: ExternalModuleReference, parent: $ImportEqualsDeclaration, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
export declare type $$NodeWithQualifiedName = ($ImportEqualsDeclaration | $QualifiedName);
export declare type $$EntityName = ($Identifier | $QualifiedName);
export declare class $QualifiedName implements I$Node {
    readonly node: QualifiedName;
    readonly parent: $$NodeWithQualifiedName;
    readonly ctx: Context;
    readonly mos: $ESModule;
    readonly realm: Realm;
    readonly depth: number;
    readonly logger: ILogger;
    readonly path: string;
    get $kind(): SyntaxKind.QualifiedName;
    readonly $left: $$EntityName;
    readonly $right: $Identifier;
    constructor(node: QualifiedName, parent: $$NodeWithQualifiedName, ctx: Context, mos?: $ESModule, realm?: Realm, depth?: number, logger?: ILogger, path?: string);
}
//# sourceMappingURL=modules.d.ts.map