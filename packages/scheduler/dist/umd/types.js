(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TaskQueuePriority;
    (function (TaskQueuePriority) {
        TaskQueuePriority[TaskQueuePriority["microTask"] = 0] = "microTask";
        TaskQueuePriority[TaskQueuePriority["render"] = 1] = "render";
        TaskQueuePriority[TaskQueuePriority["macroTask"] = 2] = "macroTask";
        TaskQueuePriority[TaskQueuePriority["postRender"] = 3] = "postRender";
        TaskQueuePriority[TaskQueuePriority["idle"] = 4] = "idle";
    })(TaskQueuePriority = exports.TaskQueuePriority || (exports.TaskQueuePriority = {}));
    exports.defaultQueueTaskOptions = {
        delay: 0,
        preempt: false,
        priority: 1 /* render */,
        persistent: false,
        reusable: true,
    };
    let $resolve;
    let $reject;
    function executor(resolve, reject) {
        $resolve = resolve;
        $reject = reject;
    }
    function createExposedPromise() {
        const p = new Promise(executor);
        p.resolve = $resolve;
        p.reject = $reject;
        return p;
    }
    exports.createExposedPromise = createExposedPromise;
});
//# sourceMappingURL=types.js.map