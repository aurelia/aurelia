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
    Object.defineProperty(exports, "NodeFileSystem", { enumerable: true, get: function () { return file_system_1.NodeFileSystem; } });
    var interfaces_1 = require("./system/interfaces");
    Object.defineProperty(exports, "Encoding", { enumerable: true, get: function () { return interfaces_1.Encoding; } });
    Object.defineProperty(exports, "FileKind", { enumerable: true, get: function () { return interfaces_1.FileKind; } });
    Object.defineProperty(exports, "IFileSystem", { enumerable: true, get: function () { return interfaces_1.IFileSystem; } });
    var boolean_1 = require("./vm/types/boolean");
    Object.defineProperty(exports, "$Boolean", { enumerable: true, get: function () { return boolean_1.$Boolean; } });
    var empty_1 = require("./vm/types/empty");
    Object.defineProperty(exports, "$Empty", { enumerable: true, get: function () { return empty_1.$Empty; } });
    var error_1 = require("./vm/types/error");
    Object.defineProperty(exports, "$Error", { enumerable: true, get: function () { return error_1.$Error; } });
    Object.defineProperty(exports, "$RangeError", { enumerable: true, get: function () { return error_1.$RangeError; } });
    Object.defineProperty(exports, "$ReferenceError", { enumerable: true, get: function () { return error_1.$ReferenceError; } });
    Object.defineProperty(exports, "$SyntaxError", { enumerable: true, get: function () { return error_1.$SyntaxError; } });
    Object.defineProperty(exports, "$TypeError", { enumerable: true, get: function () { return error_1.$TypeError; } });
    Object.defineProperty(exports, "$URIError", { enumerable: true, get: function () { return error_1.$URIError; } });
    // export {
    //   $BuiltinFunction,
    //   $Function,
    // } from './vm/types/function';
    var null_1 = require("./vm/types/null");
    Object.defineProperty(exports, "$Null", { enumerable: true, get: function () { return null_1.$Null; } });
    var number_1 = require("./vm/types/number");
    Object.defineProperty(exports, "$Number", { enumerable: true, get: function () { return number_1.$Number; } });
    var object_1 = require("./vm/types/object");
    Object.defineProperty(exports, "$Object", { enumerable: true, get: function () { return object_1.$Object; } });
    var string_1 = require("./vm/types/string");
    Object.defineProperty(exports, "$String", { enumerable: true, get: function () { return string_1.$String; } });
    var symbol_1 = require("./vm/types/symbol");
    Object.defineProperty(exports, "$Symbol", { enumerable: true, get: function () { return symbol_1.$Symbol; } });
    var undefined_1 = require("./vm/types/undefined");
    Object.defineProperty(exports, "$Undefined", { enumerable: true, get: function () { return undefined_1.$Undefined; } });
    var agent_1 = require("./vm/agent");
    Object.defineProperty(exports, "ISourceFileProvider", { enumerable: true, get: function () { return agent_1.ISourceFileProvider; } });
    var modules_1 = require("./vm/ast/modules");
    Object.defineProperty(exports, "$ESModule", { enumerable: true, get: function () { return modules_1.$ESModule; } });
    Object.defineProperty(exports, "$DocumentFragment", { enumerable: true, get: function () { return modules_1.$DocumentFragment; } });
    Object.defineProperty(exports, "$ESScript", { enumerable: true, get: function () { return modules_1.$ESScript; } });
    var job_1 = require("./vm/job");
    Object.defineProperty(exports, "Job", { enumerable: true, get: function () { return job_1.Job; } });
    var realm_1 = require("./vm/realm");
    Object.defineProperty(exports, "Realm", { enumerable: true, get: function () { return realm_1.Realm; } });
    Object.defineProperty(exports, "ExecutionContext", { enumerable: true, get: function () { return realm_1.ExecutionContext; } });
    Object.defineProperty(exports, "DeferredModule", { enumerable: true, get: function () { return realm_1.DeferredModule; } });
    var service_host_1 = require("./service-host");
    Object.defineProperty(exports, "ServiceHost", { enumerable: true, get: function () { return service_host_1.ServiceHost; } });
});
//# sourceMappingURL=index.js.map