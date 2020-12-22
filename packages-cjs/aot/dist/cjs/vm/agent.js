"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptEvaluationJob = exports.TopLevelModuleEvaluationJob = exports.Agent = exports.ISourceFileProvider = void 0;
const job_js_1 = require("./job.js");
const kernel_1 = require("@aurelia/kernel");
const realm_js_1 = require("./realm.js");
const empty_js_1 = require("./types/empty.js");
exports.ISourceFileProvider = kernel_1.DI.createInterface('ISourceFileProvider');
// http://www.ecma-international.org/ecma-262/#sec-agents
class Agent {
    constructor(logger) {
        this.logger = logger;
        this.ScriptJobs = new job_js_1.JobQueue(logger, 'Script');
        this.PromiseJobs = new job_js_1.JobQueue(logger, 'Promise');
    }
    // http://www.ecma-international.org/ecma-262/#sec-runjobs
    // 8.6 RunJobs ( )
    async RunJobs(container) {
        // 1. Perform ? InitializeHostDefinedRealm().
        const realm = realm_js_1.Realm.Create(container, this.PromiseJobs);
        const intrinsics = realm['[[Intrinsics]]'];
        const stack = realm.stack;
        // We always have 1 synthetic root context which should not be considered to be a part of the stack.
        // It's exclusively used for initializing intrinsics, to conform to the method signatures.
        const rootCtx = stack.top;
        // 2. In an implementation-dependent manner, obtain the ECMAScript source texts (see clause 10) and any associated host-defined values for zero or more ECMAScript scripts and/or ECMAScript modules. For each such sourceText and hostDefined, do
        const sfProvider = container.get(exports.ISourceFileProvider);
        const files = await sfProvider.GetSourceFiles(rootCtx);
        for (const file of files) {
            // 2. a. If sourceText is the source code of a script, then
            if (file.isScript) {
                // 2. a. i. Perform EnqueueJob("ScriptJobs", ScriptEvaluationJob, « sourceText, hostDefined »).
                this.ScriptJobs.EnqueueJob(rootCtx, new ScriptEvaluationJob(realm, file));
            }
            // 2. b. Else sourceText is the source code of a module,
            else {
                // 2. b. i. Perform EnqueueJob("ScriptJobs", TopLevelModuleEvaluationJob, « sourceText, hostDefined »).
                this.ScriptJobs.EnqueueJob(rootCtx, new TopLevelModuleEvaluationJob(realm, file));
            }
        }
        const ctx = rootCtx;
        let lastFile = null;
        // 3. Repeat,
        while (true) {
            // 3. a. Suspend the running execution context and remove it from the execution context stack.
            if (ctx !== rootCtx) {
                ctx.suspend();
                stack.pop();
            }
            let nextPending;
            // 3. b. Assert: The execution context stack is now empty.
            // 3. c. Let nextQueue be a non-empty Job Queue chosen in an implementation-defined manner. If all Job Queues are empty, the result is implementation-defined.
            if (this.ScriptJobs.isEmpty) {
                if (this.PromiseJobs.isEmpty) {
                    this.logger.debug(`Finished successfully`);
                    return new empty_js_1.$Empty(realm, 1 /* normal */, intrinsics.empty, lastFile);
                }
                else {
                    // 3. d. Let nextPending be the PendingJob record at the front of nextQueue. Remove that record from nextQueue.
                    nextPending = this.PromiseJobs.queue.shift();
                }
            }
            else {
                // 3. d. Let nextPending be the PendingJob record at the front of nextQueue. Remove that record from nextQueue.
                nextPending = this.ScriptJobs.queue.shift();
            }
            // 3. e. Let newContext be a new execution context.
            const newContext = new realm_js_1.ExecutionContext(nextPending['[[Realm]]']);
            // 3. f. Set newContext's Function to null.
            newContext.Function = intrinsics.null;
            // 3. g. Set newContext's Realm to nextPending.[[Realm]].
            // 3. h. Set newContext's ScriptOrModule to nextPending.[[ScriptOrModule]].
            lastFile = newContext.ScriptOrModule = nextPending['[[ScriptOrModule]]'];
            // 3. i. Push newContext onto the execution context stack; newContext is now the running execution context.
            stack.push(newContext);
            // 3. j. Perform any implementation or host environment defined job initialization using nextPending.
            // 3. k. Let result be the result of performing the abstract operation named by nextPending.[[Job]] using the elements of nextPending.[[Arguments]] as its arguments.
            const result = nextPending.Run(newContext);
            // 3. l. If result is an abrupt completion, perform HostReportErrors(« result.[[Value]] »).
            if (result.isAbrupt) {
                this.logger.debug(`Job completed with errors`);
                return result;
            }
        }
    }
    dispose() {
        this.PromiseJobs.dispose();
        this.ScriptJobs.dispose();
        this.PromiseJobs = void 0;
        this.ScriptJobs = void 0;
        this.logger = void 0;
    }
}
exports.Agent = Agent;
class TopLevelModuleEvaluationJob extends job_js_1.Job {
    constructor(realm, mos) {
        super(realm.logger.scopeTo('TopLevelModuleEvaluationJob'), realm, mos);
    }
    // http://www.ecma-international.org/ecma-262/#sec-toplevelmoduleevaluationjob
    // 15.2.1.20 Runtime Semantics: TopLevelModuleEvaluationJob ( sourceText , hostDefined )
    Run(ctx) {
        this.logger.debug(`Run(#${ctx.id})`);
        const m = this['[[ScriptOrModule]]'];
        // 1. Assert: sourceText is an ECMAScript source text (see clause 10).
        // 2. Let realm be the current Realm Record.
        // 3. Let m be ParseModule(sourceText, realm, hostDefined).
        // 4. If m is a List of errors, then
        // 4. a. Perform HostReportErrors(m).
        // 4. b. Return NormalCompletion(undefined).
        // 5. Perform ? m.Instantiate().
        const result = m.Instantiate(ctx);
        if (result.isAbrupt) {
            return result;
        }
        // 6. Assert: All dependencies of m have been transitively resolved and m is ready for evaluation.
        // 7. Return ? m.Evaluate().
        return m.EvaluateModule(ctx);
    }
}
exports.TopLevelModuleEvaluationJob = TopLevelModuleEvaluationJob;
class ScriptEvaluationJob extends job_js_1.Job {
    constructor(realm, mos) {
        super(realm.logger.scopeTo('ScriptEvaluationJob'), realm, mos);
    }
    // http://www.ecma-international.org/ecma-262/#sec-scriptevaluationjob
    // 15.1.12 Runtime Semantics: ScriptEvaluationJob ( sourceText , hostDefined )
    Run(ctx) {
        this.logger.debug(`Run(#${ctx.id})`);
        const m = this['[[ScriptOrModule]]'];
        // 1. Assert: sourceText is an ECMAScript source text (see clause 10).
        // 2. Let realm be the current Realm Record.
        // 3. Let s be ParseScript(sourceText, realm, hostDefined).
        // 4. If s is a List of errors, then
        // 4. a. Perform HostReportErrors(s).
        // 4. b. Return NormalCompletion(undefined).
        // 5. Return ? ScriptEvaluation(s).
        return m.EvaluateScript(ctx);
    }
}
exports.ScriptEvaluationJob = ScriptEvaluationJob;
//# sourceMappingURL=agent.js.map