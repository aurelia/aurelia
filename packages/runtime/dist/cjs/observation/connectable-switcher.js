"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectableSwitcher = exports.exitConnectable = exports.enterConnectable = exports.currentConnectable = exports.resumeConnecting = exports.pauseConnecting = exports.connecting = void 0;
/**
 * Current subscription collector
 */
let _connectable = null;
const connectables = [];
// eslint-disable-next-line
exports.connecting = false;
// todo: layer based collection pause/resume?
function pauseConnecting() {
    exports.connecting = false;
}
exports.pauseConnecting = pauseConnecting;
function resumeConnecting() {
    exports.connecting = true;
}
exports.resumeConnecting = resumeConnecting;
function currentConnectable() {
    return _connectable;
}
exports.currentConnectable = currentConnectable;
function enterConnectable(connectable) {
    if (connectable == null) {
        throw new Error('connectable cannot be null/undefined');
    }
    if (_connectable == null) {
        _connectable = connectable;
        connectables[0] = _connectable;
        exports.connecting = true;
        return;
    }
    if (_connectable === connectable) {
        throw new Error(`Already in this connectable ${connectable.id}`);
    }
    connectables.push(_connectable);
    _connectable = connectable;
    exports.connecting = true;
}
exports.enterConnectable = enterConnectable;
function exitConnectable(connectable) {
    if (connectable == null) {
        throw new Error('Connectable cannot be null/undefined');
    }
    if (_connectable !== connectable) {
        throw new Error(`${connectable.id} is not currently collecting`);
    }
    connectables.pop();
    _connectable = connectables.length > 0 ? connectables[connectables.length - 1] : null;
    exports.connecting = _connectable != null;
}
exports.exitConnectable = exitConnectable;
exports.ConnectableSwitcher = Object.freeze({
    get current() {
        return _connectable;
    },
    get connecting() {
        return exports.connecting;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting,
});
//# sourceMappingURL=connectable-switcher.js.map