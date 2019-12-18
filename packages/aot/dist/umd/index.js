(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./system/file-system", "./system/interfaces", "./vm/types/boolean", "./vm/types/empty", "./vm/types/error", "./vm/types/null", "./vm/types/number", "./vm/types/object", "./vm/types/string", "./vm/types/symbol", "./vm/types/undefined", "./vm/agent", "./vm/ast/modules", "./vm/job", "./vm/realm", "./service-host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var file_system_1 = require("./system/file-system");
    exports.NodeFileSystem = file_system_1.NodeFileSystem;
    var interfaces_1 = require("./system/interfaces");
    exports.Encoding = interfaces_1.Encoding;
    exports.FileKind = interfaces_1.FileKind;
    exports.IFileSystem = interfaces_1.IFileSystem;
    var boolean_1 = require("./vm/types/boolean");
    exports.$Boolean = boolean_1.$Boolean;
    var empty_1 = require("./vm/types/empty");
    exports.$Empty = empty_1.$Empty;
    var error_1 = require("./vm/types/error");
    exports.$Error = error_1.$Error;
    exports.$RangeError = error_1.$RangeError;
    exports.$ReferenceError = error_1.$ReferenceError;
    exports.$SyntaxError = error_1.$SyntaxError;
    exports.$TypeError = error_1.$TypeError;
    exports.$URIError = error_1.$URIError;
    // export {
    //   $BuiltinFunction,
    //   $Function,
    // } from './vm/types/function';
    var null_1 = require("./vm/types/null");
    exports.$Null = null_1.$Null;
    var number_1 = require("./vm/types/number");
    exports.$Number = number_1.$Number;
    var object_1 = require("./vm/types/object");
    exports.$Object = object_1.$Object;
    var string_1 = require("./vm/types/string");
    exports.$String = string_1.$String;
    var symbol_1 = require("./vm/types/symbol");
    exports.$Symbol = symbol_1.$Symbol;
    var undefined_1 = require("./vm/types/undefined");
    exports.$Undefined = undefined_1.$Undefined;
    var agent_1 = require("./vm/agent");
    exports.ISourceFileProvider = agent_1.ISourceFileProvider;
    var modules_1 = require("./vm/ast/modules");
    exports.$ESModule = modules_1.$ESModule;
    exports.$DocumentFragment = modules_1.$DocumentFragment;
    exports.$ESScript = modules_1.$ESScript;
    var job_1 = require("./vm/job");
    exports.Job = job_1.Job;
    var realm_1 = require("./vm/realm");
    exports.Realm = realm_1.Realm;
    exports.ExecutionContext = realm_1.ExecutionContext;
    exports.DeferredModule = realm_1.DeferredModule;
    var service_host_1 = require("./service-host");
    exports.ServiceHost = service_host_1.ServiceHost;
});
//# sourceMappingURL=index.js.map