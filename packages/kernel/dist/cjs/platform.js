"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPlatform = exports.noop = exports.emptyObject = exports.emptyArray = void 0;
const di_js_1 = require("./di.js");
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
exports.emptyArray = Object.freeze([]);
exports.emptyObject = Object.freeze({});
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
exports.noop = noop;
exports.IPlatform = di_js_1.DI.createInterface('IPlatform');
//# sourceMappingURL=platform.js.map