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
    Object.defineProperty(exports, "Now", { enumerable: true, get: function () { return now_1.Now; } });
    var scheduler_1 = require("./scheduler");
    Object.defineProperty(exports, "IScheduler", { enumerable: true, get: function () { return scheduler_1.IScheduler; } });
    Object.defineProperty(exports, "Scheduler", { enumerable: true, get: function () { return scheduler_1.Scheduler; } });
    var task_queue_1 = require("./task-queue");
    Object.defineProperty(exports, "TaskQueue", { enumerable: true, get: function () { return task_queue_1.TaskQueue; } });
    var task_1 = require("./task");
    Object.defineProperty(exports, "Task", { enumerable: true, get: function () { return task_1.Task; } });
    Object.defineProperty(exports, "TaskAbortError", { enumerable: true, get: function () { return task_1.TaskAbortError; } });
    var types_1 = require("./types");
    Object.defineProperty(exports, "createExposedPromise", { enumerable: true, get: function () { return types_1.createExposedPromise; } });
    Object.defineProperty(exports, "TaskQueuePriority", { enumerable: true, get: function () { return types_1.TaskQueuePriority; } });
});
//# sourceMappingURL=index.js.map