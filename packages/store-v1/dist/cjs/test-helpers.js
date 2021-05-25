"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSteps = void 0;
const index_js_1 = require("rxjs/operators/index.js");
const skip = index_js_1.skip;
const take = index_js_1.take;
const delay = index_js_1.delay;
async function executeSteps(store, shouldLogResults, ...steps) {
    const logStep = (step, stepIdx) => (res) => {
        if (shouldLogResults) {
            console.group(`Step ${stepIdx}`);
            console.log(res);
            console.groupEnd();
        }
        step(res);
    };
    const tryStep = (step, reject) => (res) => {
        try {
            step(res);
        }
        catch (err) {
            reject(err);
        }
    };
    const lastStep = (step, resolve) => (res) => {
        step(res);
        resolve();
    };
    return new Promise((resolve, reject) => {
        let currentStep = 0;
        steps.slice(0, -1).forEach((step) => {
            store.state.pipe(skip(currentStep), take(1), delay(0)).subscribe(tryStep(logStep(step, currentStep), reject));
            currentStep++;
        });
        store.state.pipe(skip(currentStep), take(1)).subscribe(lastStep(tryStep(logStep(steps[steps.length - 1], currentStep), reject), resolve));
    });
}
exports.executeSteps = executeSteps;
//# sourceMappingURL=test-helpers.js.map