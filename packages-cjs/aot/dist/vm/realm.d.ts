import { ILogger, IContainer, Writable, IDisposable } from '@aurelia/kernel';
import { IFile } from '../system/interfaces.js';
import { Intrinsics } from './intrinsics.js';
import { $EnvRec, $ModuleEnvRec, $GlobalEnvRec, $FunctionEnvRec, $DeclarativeEnvRec } from './types/environment-record.js';
import { $String } from './types/string.js';
import { $Undefined } from './types/undefined.js';
import { $Object } from './types/object.js';
import { $Reference } from './types/reference.js';
import { $AnyNonEmpty } from './types/_shared.js';
import { $Function } from './types/function.js';
import { $Null } from './types/null.js';
import { $Error } from './types/error.js';
import { $NamespaceExoticObject } from './exotics/namespace.js';
import { $List } from './types/list.js';
import { $Number } from './types/number.js';
import { $TemplateExpression, $TaggedTemplateExpression } from './ast/expressions.js';
import { $$ESModuleOrScript } from './ast/modules.js';
import { $GeneratorInstance } from './globals/generator-function.js';
import { JobQueue } from './job.js';
import { $AsyncGeneratorInstance } from './globals/async-generator-function.js';
export declare class ResolveSet {
    private readonly modules;
    private readonly exportNames;
    private count;
    has(mod: IModule, exportName: $String): boolean;
    add(mod: IModule, exportName: $String): void;
    forEach(callback: (mod: IModule, exportName: $String) => void): void;
}
export declare class ResolvedBindingRecord {
    readonly Module: IModule;
    readonly BindingName: $String;
    get isAbrupt(): false;
    get isNull(): false;
    get isAmbiguous(): false;
    constructor(Module: IModule, BindingName: $String);
}
export interface IModule extends IDisposable {
    /** This field is never used. Its only purpose is to help TS distinguish this interface from others. */
    readonly '<IModule>': unknown;
    readonly isAbrupt: false;
    '[[Environment]]': $ModuleEnvRec | $Undefined;
    '[[Namespace]]': $NamespaceExoticObject | $Undefined;
    '[[HostDefined]]': any;
    readonly realm: Realm;
    ResolveExport(ctx: ExecutionContext, exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | $Null | $String<'ambiguous'> | $Error;
    GetExportedNames(ctx: ExecutionContext, exportStarSet: Set<IModule>): $List<$String> | $Error;
    Instantiate(ctx: ExecutionContext): $Undefined | $Error;
}
export declare class DeferredModule implements IModule {
    readonly $file: IFile;
    readonly realm: Realm;
    readonly '<IModule>': unknown;
    '[[Environment]]': $ModuleEnvRec | $Undefined;
    '[[Namespace]]': $NamespaceExoticObject | $Undefined;
    '[[HostDefined]]': any;
    get isAbrupt(): false;
    constructor($file: IFile, realm: Realm);
    ResolveExport(ctx: ExecutionContext, exportName: $String, resolveSet: ResolveSet): ResolvedBindingRecord | $Null | $String<'ambiguous'> | $Error;
    GetExportedNames(ctx: ExecutionContext, exportStarSet: Set<IModule>): $List<$String> | $Error;
    Instantiate(ctx: ExecutionContext): $Undefined | $Error;
    _InnerModuleInstantiation(ctx: ExecutionContext, stack: IModule[], index: $Number): $Number | $Error;
    dispose(): void;
}
export declare class Realm implements IDisposable {
    readonly container: IContainer;
    readonly logger: ILogger;
    readonly PromiseJobs: JobQueue;
    timeout: number;
    contextId: number;
    readonly stack: ExecutionContextStack;
    '[[Intrinsics]]': Intrinsics;
    '[[GlobalObject]]': $Object;
    '[[GlobalEnv]]': $GlobalEnvRec;
    '[[TemplateMap]]': {
        '[[Site]]': $TemplateExpression | $TaggedTemplateExpression;
        '[[Array]]': $Object;
    }[];
    get isAbrupt(): false;
    private constructor();
    static Create(container: IContainer, promiseJobs: JobQueue): Realm;
    GetActiveScriptOrModule(): $$ESModuleOrScript;
    ResolveBinding(name: $String, env?: $EnvRec): $Reference | $Error;
    GetThisEnvironment(): $FunctionEnvRec | $GlobalEnvRec | $ModuleEnvRec;
    ResolveThisBinding(): $AnyNonEmpty;
    GetCurrentLexicalEnvironment(): $EnvRec;
    SetCurrentLexicalEnvironment(envRec: $EnvRec): void;
    dispose(this: Writable<Partial<Realm>>): void;
    private GetIdentifierReference;
}
export declare class ExecutionContextStack extends Array<ExecutionContext> implements IDisposable {
    readonly logger: ILogger;
    constructor(logger: ILogger);
    get top(): ExecutionContext;
    push(context: ExecutionContext): number;
    pop(): ExecutionContext;
    toString(): string;
    dispose(this: Writable<Partial<ExecutionContextStack>>): void;
}
export declare class ExecutionContext<TLex extends $EnvRec = $EnvRec, TVar extends ($ModuleEnvRec | $FunctionEnvRec | $DeclarativeEnvRec | $GlobalEnvRec) = ($ModuleEnvRec | $FunctionEnvRec | $DeclarativeEnvRec | $GlobalEnvRec)> implements IDisposable {
    readonly Realm: Realm;
    readonly id: number;
    Function: $Function | $Null;
    ScriptOrModule: $$ESModuleOrScript | $Null;
    LexicalEnvironment: TLex;
    VariableEnvironment: TVar;
    Generator: $GeneratorInstance | $AsyncGeneratorInstance | undefined;
    onResume: ((value: $AnyNonEmpty) => $AnyNonEmpty) | undefined;
    suspended: boolean;
    readonly logger: ILogger;
    private activityTimestamp;
    private activeTime;
    private timeoutCheck;
    constructor(Realm: Realm);
    checkTimeout(): void;
    resume(): void;
    suspend(): void;
    makeCopy(): this;
    dispose(this: Writable<Partial<ExecutionContext>>): void;
}
//# sourceMappingURL=realm.d.ts.map