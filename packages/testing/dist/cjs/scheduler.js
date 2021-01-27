"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureTaskQueuesEmpty = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
function ensureTaskQueuesEmpty(platform) {
    if (!platform) {
        platform = runtime_html_1.BrowserPlatform.getOrCreate(globalThis);
    }
    // canceling pending heading to remove the sticky tasks
    platform.taskQueue.flush();
    platform.taskQueue['pending'].forEach((x) => x.cancel());
    platform.domWriteQueue.flush();
    platform.domWriteQueue['pending'].forEach((x) => x.cancel());
    platform.domReadQueue.flush();
    platform.domReadQueue['pending'].forEach((x) => x.cancel());
}
exports.ensureTaskQueuesEmpty = ensureTaskQueuesEmpty;
//# sourceMappingURL=scheduler.js.map