import { ILogger, IDisposable, Writable } from '@aurelia/kernel';
import { $Any } from './types/_shared';
import { Realm, ExecutionContext } from './realm';
import { $Empty } from './types/empty';
import { $$ESModuleOrScript } from './ast/modules';
export declare abstract class Job<MOS extends $$ESModuleOrScript = $$ESModuleOrScript> implements IDisposable {
    readonly logger: ILogger;
    '[[Realm]]': Realm;
    '[[ScriptOrModule]]': MOS;
    constructor(logger: ILogger, realm: Realm, scriptOrModule: MOS);
    abstract Run(ctx: ExecutionContext): $Any;
    dispose(this: Writable<Partial<Job>>): void;
}
export declare class JobQueue<T extends Job = Job> implements IDisposable {
    readonly logger: ILogger;
    readonly name: string;
    readonly queue: T[];
    get isEmpty(): boolean;
    constructor(logger: ILogger, name: string);
    EnqueueJob(ctx: ExecutionContext, job: T): $Empty;
    dispose(this: Writable<Partial<JobQueue>>): void;
}
//# sourceMappingURL=job.d.ts.map