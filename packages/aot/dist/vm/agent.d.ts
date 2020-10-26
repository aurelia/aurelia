import { JobQueue, Job } from './job';
import { IContainer, ILogger, IDisposable, Writable } from '@aurelia/kernel';
import { Realm, ExecutionContext } from './realm';
import { $Any } from './types/_shared';
import { $ESModule, $$ESModuleOrScript, $ESScript } from './ast/modules';
export declare const ISourceFileProvider: import("@aurelia/kernel").InterfaceSymbol<ISourceFileProvider>;
export interface ISourceFileProvider {
    GetSourceFiles(ctx: ExecutionContext): Promise<readonly $$ESModuleOrScript[]>;
}
export declare class Agent implements IDisposable {
    readonly logger: ILogger;
    readonly ScriptJobs: JobQueue;
    readonly PromiseJobs: JobQueue;
    constructor(logger: ILogger);
    RunJobs(container: IContainer): Promise<$Any>;
    dispose(this: Writable<Partial<Agent>>): void;
}
export declare class TopLevelModuleEvaluationJob extends Job<$ESModule> {
    constructor(realm: Realm, mos: $ESModule);
    Run(ctx: ExecutionContext): $Any;
}
export declare class ScriptEvaluationJob extends Job<$ESScript> {
    constructor(realm: Realm, mos: $ESScript);
    Run(ctx: ExecutionContext): $Any;
}
//# sourceMappingURL=agent.d.ts.map