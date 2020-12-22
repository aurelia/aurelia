"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = exports.emptyObject = exports.emptyArray = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
exports.emptyArray = Object.freeze([]);
exports.emptyObject = Object.freeze({});
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
exports.noop = noop;
//# sourceMappingURL=platform.js.map