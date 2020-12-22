import { IContainer, ILogger, Writable, IDisposable } from '@aurelia/kernel';
import { JSDOM } from 'jsdom';
import { IFileSystem, IFile, $CompilerOptions } from './system/interfaces.js';
import { IModule, ExecutionContext } from './vm/realm.js';
import { $ESModule, $ESScript, $$ESModuleOrScript } from './vm/ast/modules.js';
import { $String } from './vm/types/string.js';
import { ISourceFileProvider, Agent } from './vm/agent.js';
import { $Any } from './vm/types/_shared.js';
import { $Error } from './vm/types/error.js';
export interface IModuleResolver {
    ResolveImportedModule(ctx: ExecutionContext, referencingModule: $ESModule, $specifier: $String): IModule | $Error;
}
export interface IServiceHost extends IModuleResolver, IDisposable {
    executeEntryFile(dir: string): Promise<$Any>;
    executeSpecificFile(file: IFile, mode: 'script' | 'module'): Promise<$Any>;
    executeProvider(provider: ISourceFileProvider): Promise<$Any>;
    loadEntryFile(ctx: ExecutionContext, dir: string): Promise<$ESModule>;
    loadSpecificFile(ctx: ExecutionContext, file: IFile, mode: 'script' | 'module'): Promise<$$ESModuleOrScript>;
}
export declare class SpecificSourceFileProvider implements ISourceFileProvider {
    private readonly host;
    private readonly file;
    private readonly mode;
    constructor(host: ServiceHost, file: IFile, mode: 'script' | 'module');
    GetSourceFiles(ctx: ExecutionContext): Promise<readonly $$ESModuleOrScript[]>;
}
export declare class EntrySourceFileProvider implements ISourceFileProvider {
    private readonly host;
    private readonly dir;
    constructor(host: ServiceHost, dir: string);
    GetSourceFiles(ctx: ExecutionContext): Promise<readonly $ESModule[]>;
}
export declare class ServiceHost implements IServiceHost {
    readonly container: IContainer;
    readonly logger: ILogger;
    readonly fs: IFileSystem;
    private _jsdom;
    get jsdom(): JSDOM;
    readonly agent: Agent;
    readonly compilerOptionsCache: Map<string, $CompilerOptions>;
    readonly moduleCache: Map<string, IModule>;
    readonly scriptCache: Map<string, $ESScript>;
    constructor(container: IContainer, logger?: ILogger, fs?: IFileSystem);
    loadEntryFile(ctx: ExecutionContext, dir: string): Promise<$ESModule>;
    loadSpecificFile(ctx: ExecutionContext, file: IFile, mode: 'script' | 'module'): Promise<$$ESModuleOrScript>;
    executeEntryFile(dir: string): Promise<$Any>;
    executeSpecificFile(file: IFile, mode: 'script' | 'module'): Promise<$Any>;
    executeProvider(provider: ISourceFileProvider): Promise<$Any>;
    ResolveImportedModule(ctx: ExecutionContext, referencingModule: $ESModule, $specifier: $String): IModule | $Error;
    dispose(this: Writable<Partial<ServiceHost>>): void;
    private loadEntryPackage;
    private getHTMLModule;
    private getESScript;
    private getESModule;
    private getCompilerOptions;
}
//# sourceMappingURL=service-host.d.ts.map