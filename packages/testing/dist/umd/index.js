(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./assert", "./data", "./each-cartesian-join", "./h", "./startup", "./test-context", "./inspect", "./mocks", "./resources", "./scheduler", "./specialized-assertions", "./string-manipulation", "./test-builder", "./tracing", "./util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSpy = exports.trimFull = exports.trace = exports.stopRecordingCalls = exports.recordCalls = exports.CallCollection = exports.Call = exports.createScopeForTest = exports.createObserverLocator = exports.padRight = exports.padLeft = exports.jsonStringify = exports.htmlStringify = exports.stringify = exports._ = exports.instructionTypeName = exports.getVisibleText = exports.verifyEqual = exports.verifyBindingInstructionsEqual = exports.ensureTaskQueuesEmpty = exports.TestConfiguration = exports.JsonValueConverter = exports.SortValueConverter = exports.SpySubscriber = exports.ProxyChangeSet = exports.CollectionChangeSet = exports.ChangeSet = exports.MockValueConverter = exports.MockTracingExpression = exports.MockSignaler = exports.MockServiceLocator = exports.MockPropertySubscriber = exports.MockContext = exports.MockBrowserHistoryLocation = exports.MockBindingBehavior = exports.MockBinding = exports.inspect = exports.createContainer = exports.setPlatform = exports.PLATFORMRegistration = exports.PLATFORM = exports.TestContext = exports.createFixture = exports.hJsx = exports.h = exports.generateCartesianProduct = exports.eachCartesianJoinAsync = exports.eachCartesianJoin = exports.eachCartesianJoinFactory = exports.PSEUDO_ELEMENTS = exports.CSS_PROPERTIES = exports.globalAttributeNames = exports.fail = exports.assert = void 0;
    var assert_1 = require("./assert");
    Object.defineProperty(exports, "assert", { enumerable: true, get: function () { return assert_1.assert; } });
    Object.defineProperty(exports, "fail", { enumerable: true, get: function () { return assert_1.fail; } });
    var data_1 = require("./data");
    Object.defineProperty(exports, "globalAttributeNames", { enumerable: true, get: function () { return data_1.globalAttributeNames; } });
    Object.defineProperty(exports, "CSS_PROPERTIES", { enumerable: true, get: function () { return data_1.CSS_PROPERTIES; } });
    Object.defineProperty(exports, "PSEUDO_ELEMENTS", { enumerable: true, get: function () { return data_1.PSEUDO_ELEMENTS; } });
    var each_cartesian_join_1 = require("./each-cartesian-join");
    Object.defineProperty(exports, "eachCartesianJoinFactory", { enumerable: true, get: function () { return each_cartesian_join_1.eachCartesianJoinFactory; } });
    Object.defineProperty(exports, "eachCartesianJoin", { enumerable: true, get: function () { return each_cartesian_join_1.eachCartesianJoin; } });
    Object.defineProperty(exports, "eachCartesianJoinAsync", { enumerable: true, get: function () { return each_cartesian_join_1.eachCartesianJoinAsync; } });
    Object.defineProperty(exports, "generateCartesianProduct", { enumerable: true, get: function () { return each_cartesian_join_1.generateCartesianProduct; } });
    var h_1 = require("./h");
    Object.defineProperty(exports, "h", { enumerable: true, get: function () { return h_1.h; } });
    Object.defineProperty(exports, "hJsx", { enumerable: true, get: function () { return h_1.hJsx; } });
    var startup_1 = require("./startup");
    Object.defineProperty(exports, "createFixture", { enumerable: true, get: function () { return startup_1.createFixture; } });
    var test_context_1 = require("./test-context");
    Object.defineProperty(exports, "TestContext", { enumerable: true, get: function () { return test_context_1.TestContext; } });
    Object.defineProperty(exports, "PLATFORM", { enumerable: true, get: function () { return test_context_1.PLATFORM; } });
    Object.defineProperty(exports, "PLATFORMRegistration", { enumerable: true, get: function () { return test_context_1.PLATFORMRegistration; } });
    Object.defineProperty(exports, "setPlatform", { enumerable: true, get: function () { return test_context_1.setPlatform; } });
    Object.defineProperty(exports, "createContainer", { enumerable: true, get: function () { return test_context_1.createContainer; } });
    var inspect_1 = require("./inspect");
    Object.defineProperty(exports, "inspect", { enumerable: true, get: function () { return inspect_1.inspect; } });
    var mocks_1 = require("./mocks");
    Object.defineProperty(exports, "MockBinding", { enumerable: true, get: function () { return mocks_1.MockBinding; } });
    Object.defineProperty(exports, "MockBindingBehavior", { enumerable: true, get: function () { return mocks_1.MockBindingBehavior; } });
    Object.defineProperty(exports, "MockBrowserHistoryLocation", { enumerable: true, get: function () { return mocks_1.MockBrowserHistoryLocation; } });
    Object.defineProperty(exports, "MockContext", { enumerable: true, get: function () { return mocks_1.MockContext; } });
    Object.defineProperty(exports, "MockPropertySubscriber", { enumerable: true, get: function () { return mocks_1.MockPropertySubscriber; } });
    Object.defineProperty(exports, "MockServiceLocator", { enumerable: true, get: function () { return mocks_1.MockServiceLocator; } });
    Object.defineProperty(exports, "MockSignaler", { enumerable: true, get: function () { return mocks_1.MockSignaler; } });
    Object.defineProperty(exports, "MockTracingExpression", { enumerable: true, get: function () { return mocks_1.MockTracingExpression; } });
    Object.defineProperty(exports, "MockValueConverter", { enumerable: true, get: function () { return mocks_1.MockValueConverter; } });
    Object.defineProperty(exports, "ChangeSet", { enumerable: true, get: function () { return mocks_1.ChangeSet; } });
    Object.defineProperty(exports, "CollectionChangeSet", { enumerable: true, get: function () { return mocks_1.CollectionChangeSet; } });
    Object.defineProperty(exports, "ProxyChangeSet", { enumerable: true, get: function () { return mocks_1.ProxyChangeSet; } });
    Object.defineProperty(exports, "SpySubscriber", { enumerable: true, get: function () { return mocks_1.SpySubscriber; } });
    var resources_1 = require("./resources");
    Object.defineProperty(exports, "SortValueConverter", { enumerable: true, get: function () { return resources_1.SortValueConverter; } });
    Object.defineProperty(exports, "JsonValueConverter", { enumerable: true, get: function () { return resources_1.JsonValueConverter; } });
    Object.defineProperty(exports, "TestConfiguration", { enumerable: true, get: function () { return resources_1.TestConfiguration; } });
    var scheduler_1 = require("./scheduler");
    Object.defineProperty(exports, "ensureTaskQueuesEmpty", { enumerable: true, get: function () { return scheduler_1.ensureTaskQueuesEmpty; } });
    var specialized_assertions_1 = require("./specialized-assertions");
    // verifyASTEqual,
    Object.defineProperty(exports, "verifyBindingInstructionsEqual", { enumerable: true, get: function () { return specialized_assertions_1.verifyBindingInstructionsEqual; } });
    Object.defineProperty(exports, "verifyEqual", { enumerable: true, get: function () { return specialized_assertions_1.verifyEqual; } });
    Object.defineProperty(exports, "getVisibleText", { enumerable: true, get: function () { return specialized_assertions_1.getVisibleText; } });
    Object.defineProperty(exports, "instructionTypeName", { enumerable: true, get: function () { return specialized_assertions_1.instructionTypeName; } });
    var string_manipulation_1 = require("./string-manipulation");
    Object.defineProperty(exports, "_", { enumerable: true, get: function () { return string_manipulation_1._; } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return string_manipulation_1.stringify; } });
    Object.defineProperty(exports, "htmlStringify", { enumerable: true, get: function () { return string_manipulation_1.htmlStringify; } });
    Object.defineProperty(exports, "jsonStringify", { enumerable: true, get: function () { return string_manipulation_1.jsonStringify; } });
    Object.defineProperty(exports, "padLeft", { enumerable: true, get: function () { return string_manipulation_1.padLeft; } });
    Object.defineProperty(exports, "padRight", { enumerable: true, get: function () { return string_manipulation_1.padRight; } });
    var test_builder_1 = require("./test-builder");
    // DefinitionBuilder,
    // InstructionBuilder,
    // TemplateBuilder,
    // TestBuilder,
    // createCustomAttribute,
    // createCustomElement,
    Object.defineProperty(exports, "createObserverLocator", { enumerable: true, get: function () { return test_builder_1.createObserverLocator; } });
    Object.defineProperty(exports, "createScopeForTest", { enumerable: true, get: function () { return test_builder_1.createScopeForTest; } });
    var tracing_1 = require("./tracing");
    Object.defineProperty(exports, "Call", { enumerable: true, get: function () { return tracing_1.Call; } });
    Object.defineProperty(exports, "CallCollection", { enumerable: true, get: function () { return tracing_1.CallCollection; } });
    Object.defineProperty(exports, "recordCalls", { enumerable: true, get: function () { return tracing_1.recordCalls; } });
    Object.defineProperty(exports, "stopRecordingCalls", { enumerable: true, get: function () { return tracing_1.stopRecordingCalls; } });
    Object.defineProperty(exports, "trace", { enumerable: true, get: function () { return tracing_1.trace; } });
    var util_1 = require("./util");
    Object.defineProperty(exports, "trimFull", { enumerable: true, get: function () { return util_1.trimFull; } });
    Object.defineProperty(exports, "createSpy", { enumerable: true, get: function () { return util_1.createSpy; } });
});
//# sourceMappingURL=index.js.map