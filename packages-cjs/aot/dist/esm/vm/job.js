import { $Empty, } from './types/empty.js';
// http://www.ecma-international.org/ecma-262/#table-25
export class Job {
    constructor(logger, realm, scriptOrModule) {
        this.logger = logger;
        this.logger = logger.scopeTo(`Job`);
        this['[[Realm]]'] = realm;
        this['[[ScriptOrModule]]'] = scriptOrModule;
    }
    dispose() {
        this['[[Realm]]'] = void 0;
        this['[[ScriptOrModule]]'] = void 0;
        this.logger = void 0;
    }
}
export class JobQueue {
    constructor(logger, name) {
        this.logger = logger;
        this.name = name;
        this.queue = [];
        this.logger = logger.root.scopeTo(`JobQueue['${name}']`);
    }
    get isEmpty() {
        return this.queue.length === 0;
    }
    // http://www.ecma-international.org/ecma-262/#sec-enqueuejob
    // 8.4.1 EnqueueJob ( queueName , job , arguments )
    EnqueueJob(ctx, job) {
        const realm = ctx.Realm;
        this.logger.debug(`EnqueueJob(#${ctx.id}) currentQueueLength=${this.queue.length}`);
        // 1. Assert: Type(queueName) is String and its value is the name of a Job Queue recognized by this implementation.
        // 2. Assert: job is the name of a Job.
        // 3. Assert: arguments is a List that has the same number of elements as the number of parameters required by job.
        // 4. Let callerContext be the running execution context.
        // 5. Let callerRealm be callerContext's Realm.
        // 6. Let callerScriptOrModule be callerContext's ScriptOrModule.
        // 7. Let pending be PendingJob { [[Job]]: job, [[Arguments]]: arguments, [[Realm]]: callerRealm, [[ScriptOrModule]]: callerScriptOrModule, [[HostDefined]]: undefined }.
        // 8. Perform any implementation or host environment defined processing of pending. This may include modifying the [[HostDefined]] field or any other field of pending.
        // 9. Add pending at the back of the Job Queue named by queueName.
        this.queue.push(job);
        // 10. Return NormalCompletion(empty).
        return new $Empty(realm);
    }
    dispose() {
        this.queue.forEach(x => { x.dispose(); });
        this.queue = void 0;
        this.logger = void 0;
    }
}
//# sourceMappingURL=job.js.map