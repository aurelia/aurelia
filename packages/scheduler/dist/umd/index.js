(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./now", "./scheduler", "./task-queue", "./task", "./types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var now_1 = require("./now");
    exports.Now = now_1.Now;
    var scheduler_1 = require("./scheduler");
    exports.IScheduler = scheduler_1.IScheduler;
    exports.Scheduler = scheduler_1.Scheduler;
    var task_queue_1 = require("./task-queue");
    exports.TaskQueue = task_queue_1.TaskQueue;
    var task_1 = require("./task");
    exports.Task = task_1.Task;
    exports.TaskAbortError = task_1.TaskAbortError;
    var types_1 = require("./types");
    exports.createExposedPromise = types_1.createExposedPromise;
    exports.TaskQueuePriority = types_1.TaskQueuePriority;
});
//# sourceMappingURL=index.js.map