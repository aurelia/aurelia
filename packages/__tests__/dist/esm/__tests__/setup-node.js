import { noop } from '@aurelia/kernel';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { JSDOM } from 'jsdom';
import { $setup } from './setup-shared.js';
const jsdom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, { pretendToBeVisual: true });
const p = Promise.resolve();
function $queueMicrotask(cb) {
    p.then(cb).catch(function (err) {
        throw err;
    });
}
const w = Object.assign(jsdom.window);
const platform = new BrowserPlatform(w, {
    queueMicrotask: typeof w.queueMicrotask === 'function'
        ? w.queueMicrotask.bind(w)
        : $queueMicrotask,
    fetch: typeof w.fetch === 'function'
        ? w.fetch.bind(w)
        : noop,
});
$setup(platform);
console.log(`Node JSDOM test context initialized`);
//# sourceMappingURL=setup-node.js.map