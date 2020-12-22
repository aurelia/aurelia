"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordCalls = exports.CallCollection = exports.Call = exports.createScopeForTest = exports.createObserverLocator = exports.padRight = exports.padLeft = exports.jsonStringify = exports.htmlStringify = exports.stringify = exports._ = exports.instructionTypeName = exports.getVisibleText = exports.verifyEqual = exports.verifyBindingInstructionsEqual = exports.ensureTaskQueuesEmpty = exports.TestConfiguration = exports.JsonValueConverter = exports.SortValueConverter = exports.SpySubscriber = exports.ProxyChangeSet = exports.CollectionChangeSet = exports.ChangeSet = exports.MockValueConverter = exports.MockTracingExpression = exports.MockSignaler = exports.MockServiceLocator = exports.MockPropertySubscriber = exports.MockContext = exports.MockBrowserHistoryLocation = exports.MockBindingBehavior = exports.MockBinding = exports.inspect = exports.createContainer = exports.setPlatform = exports.PLATFORMRegistration = exports.PLATFORM = exports.TestContext = exports.createFixture = exports.hJsx = exports.h = exports.generateCartesianProduct = exports.eachCartesianJoinAsync = exports.eachCartesianJoin = exports.eachCartesianJoinFactory = exports.PSEUDO_ELEMENTS = exports.CSS_PROPERTIES = exports.globalAttributeNames = exports.fail = exports.assert = void 0;
exports.createSpy = exports.trimFull = exports.trace = exports.stopRecordingCalls = void 0;
var assert_js_1 = require("./assert.js");
Object.defineProperty(exports, "assert", { enumerable: true, get: function () { return assert_js_1.assert; } });
Object.defineProperty(exports, "fail", { enumerable: true, get: function () { return assert_js_1.fail; } });
var data_js_1 = require("./data.js");
Object.defineProperty(exports, "globalAttributeNames", { enumerable: true, get: function () { return data_js_1.globalAttributeNames; } });
Object.defineProperty(exports, "CSS_PROPERTIES", { enumerable: true, get: function () { return data_js_1.CSS_PROPERTIES; } });
Object.defineProperty(exports, "PSEUDO_ELEMENTS", { enumerable: true, get: function () { return data_js_1.PSEUDO_ELEMENTS; } });
var each_cartesian_join_js_1 = require("./each-cartesian-join.js");
Object.defineProperty(exports, "eachCartesianJoinFactory", { enumerable: true, get: function () { return each_cartesian_join_js_1.eachCartesianJoinFactory; } });
Object.defineProperty(exports, "eachCartesianJoin", { enumerable: true, get: function () { return each_cartesian_join_js_1.eachCartesianJoin; } });
Object.defineProperty(exports, "eachCartesianJoinAsync", { enumerable: true, get: function () { return each_cartesian_join_js_1.eachCartesianJoinAsync; } });
Object.defineProperty(exports, "generateCartesianProduct", { enumerable: true, get: function () { return each_cartesian_join_js_1.generateCartesianProduct; } });
var h_js_1 = require("./h.js");
Object.defineProperty(exports, "h", { enumerable: true, get: function () { return h_js_1.h; } });
Object.defineProperty(exports, "hJsx", { enumerable: true, get: function () { return h_js_1.hJsx; } });
var startup_js_1 = require("./startup.js");
Object.defineProperty(exports, "createFixture", { enumerable: true, get: function () { return startup_js_1.createFixture; } });
var test_context_js_1 = require("./test-context.js");
Object.defineProperty(exports, "TestContext", { enumerable: true, get: function () { return test_context_js_1.TestContext; } });
Object.defineProperty(exports, "PLATFORM", { enumerable: true, get: function () { return test_context_js_1.PLATFORM; } });
Object.defineProperty(exports, "PLATFORMRegistration", { enumerable: true, get: function () { return test_context_js_1.PLATFORMRegistration; } });
Object.defineProperty(exports, "setPlatform", { enumerable: true, get: function () { return test_context_js_1.setPlatform; } });
Object.defineProperty(exports, "createContainer", { enumerable: true, get: function () { return test_context_js_1.createContainer; } });
var inspect_js_1 = require("./inspect.js");
Object.defineProperty(exports, "inspect", { enumerable: true, get: function () { return inspect_js_1.inspect; } });
var mocks_js_1 = require("./mocks.js");
Object.defineProperty(exports, "MockBinding", { enumerable: true, get: function () { return mocks_js_1.MockBinding; } });
Object.defineProperty(exports, "MockBindingBehavior", { enumerable: true, get: function () { return mocks_js_1.MockBindingBehavior; } });
Object.defineProperty(exports, "MockBrowserHistoryLocation", { enumerable: true, get: function () { return mocks_js_1.MockBrowserHistoryLocation; } });
Object.defineProperty(exports, "MockContext", { enumerable: true, get: function () { return mocks_js_1.MockContext; } });
Object.defineProperty(exports, "MockPropertySubscriber", { enumerable: true, get: function () { return mocks_js_1.MockPropertySubscriber; } });
Object.defineProperty(exports, "MockServiceLocator", { enumerable: true, get: function () { return mocks_js_1.MockServiceLocator; } });
Object.defineProperty(exports, "MockSignaler", { enumerable: true, get: function () { return mocks_js_1.MockSignaler; } });
Object.defineProperty(exports, "MockTracingExpression", { enumerable: true, get: function () { return mocks_js_1.MockTracingExpression; } });
Object.defineProperty(exports, "MockValueConverter", { enumerable: true, get: function () { return mocks_js_1.MockValueConverter; } });
Object.defineProperty(exports, "ChangeSet", { enumerable: true, get: function () { return mocks_js_1.ChangeSet; } });
Object.defineProperty(exports, "CollectionChangeSet", { enumerable: true, get: function () { return mocks_js_1.CollectionChangeSet; } });
Object.defineProperty(exports, "ProxyChangeSet", { enumerable: true, get: function () { return mocks_js_1.ProxyChangeSet; } });
Object.defineProperty(exports, "SpySubscriber", { enumerable: true, get: function () { return mocks_js_1.SpySubscriber; } });
var resources_js_1 = require("./resources.js");
Object.defineProperty(exports, "SortValueConverter", { enumerable: true, get: function () { return resources_js_1.SortValueConverter; } });
Object.defineProperty(exports, "JsonValueConverter", { enumerable: true, get: function () { return resources_js_1.JsonValueConverter; } });
Object.defineProperty(exports, "TestConfiguration", { enumerable: true, get: function () { return resources_js_1.TestConfiguration; } });
var scheduler_js_1 = require("./scheduler.js");
Object.defineProperty(exports, "ensureTaskQueuesEmpty", { enumerable: true, get: function () { return scheduler_js_1.ensureTaskQueuesEmpty; } });
var specialized_assertions_js_1 = require("./specialized-assertions.js");
// verifyASTEqual,
Object.defineProperty(exports, "verifyBindingInstructionsEqual", { enumerable: true, get: function () { return specialized_assertions_js_1.verifyBindingInstructionsEqual; } });
Object.defineProperty(exports, "verifyEqual", { enumerable: true, get: function () { return specialized_assertions_js_1.verifyEqual; } });
Object.defineProperty(exports, "getVisibleText", { enumerable: true, get: function () { return specialized_assertions_js_1.getVisibleText; } });
Object.defineProperty(exports, "instructionTypeName", { enumerable: true, get: function () { return specialized_assertions_js_1.instructionTypeName; } });
var string_manipulation_js_1 = require("./string-manipulation.js");
Object.defineProperty(exports, "_", { enumerable: true, get: function () { return string_manipulation_js_1._; } });
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return string_manipulation_js_1.stringify; } });
Object.defineProperty(exports, "htmlStringify", { enumerable: true, get: function () { return string_manipulation_js_1.htmlStringify; } });
Object.defineProperty(exports, "jsonStringify", { enumerable: true, get: function () { return string_manipulation_js_1.jsonStringify; } });
Object.defineProperty(exports, "padLeft", { enumerable: true, get: function () { return string_manipulation_js_1.padLeft; } });
Object.defineProperty(exports, "padRight", { enumerable: true, get: function () { return string_manipulation_js_1.padRight; } });
var test_builder_js_1 = require("./test-builder.js");
// DefinitionBuilder,
// InstructionBuilder,
// TemplateBuilder,
// TestBuilder,
// createCustomAttribute,
// createCustomElement,
Object.defineProperty(exports, "createObserverLocator", { enumerable: true, get: function () { return test_builder_js_1.createObserverLocator; } });
Object.defineProperty(exports, "createScopeForTest", { enumerable: true, get: function () { return test_builder_js_1.createScopeForTest; } });
var tracing_js_1 = require("./tracing.js");
Object.defineProperty(exports, "Call", { enumerable: true, get: function () { return tracing_js_1.Call; } });
Object.defineProperty(exports, "CallCollection", { enumerable: true, get: function () { return tracing_js_1.CallCollection; } });
Object.defineProperty(exports, "recordCalls", { enumerable: true, get: function () { return tracing_js_1.recordCalls; } });
Object.defineProperty(exports, "stopRecordingCalls", { enumerable: true, get: function () { return tracing_js_1.stopRecordingCalls; } });
Object.defineProperty(exports, "trace", { enumerable: true, get: function () { return tracing_js_1.trace; } });
var util_js_1 = require("./util.js");
Object.defineProperty(exports, "trimFull", { enumerable: true, get: function () { return util_js_1.trimFull; } });
Object.defineProperty(exports, "createSpy", { enumerable: true, get: function () { return util_js_1.createSpy; } });
//# sourceMappingURL=index.js.map