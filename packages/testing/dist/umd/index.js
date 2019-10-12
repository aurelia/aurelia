(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./assert", "./au-dom", "./data", "./each-cartesian-join", "./h", "./startup", "./html-test-context", "./inspect", "./mocks", "./profiler", "./resources", "./specialized-assertions", "./string-manipulation", "./test-builder", "./tracing", "./util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert_1 = require("./assert");
    exports.assert = assert_1.assert;
    exports.fail = assert_1.fail;
    var au_dom_1 = require("./au-dom");
    exports.AuNode = au_dom_1.AuNode;
    exports.AuDOM = au_dom_1.AuDOM;
    exports.AuDOMConfiguration = au_dom_1.AuDOMConfiguration;
    exports.AuDOMInitializer = au_dom_1.AuDOMInitializer;
    exports.AuDOMTest = au_dom_1.AuDOMTest;
    exports.AuNodeSequence = au_dom_1.AuNodeSequence;
    exports.AuNodeSequenceFactory = au_dom_1.AuNodeSequenceFactory;
    exports.AuObserverLocator = au_dom_1.AuObserverLocator;
    exports.AuProjector = au_dom_1.AuProjector;
    exports.AuProjectorLocator = au_dom_1.AuProjectorLocator;
    exports.AuTemplateFactory = au_dom_1.AuTemplateFactory;
    exports.AuTextInstruction = au_dom_1.AuTextInstruction;
    exports.AuTextRenderer = au_dom_1.AuTextRenderer;
    var data_1 = require("./data");
    exports.globalAttributeNames = data_1.globalAttributeNames;
    exports.CSS_PROPERTIES = data_1.CSS_PROPERTIES;
    exports.PSEUDO_ELEMENTS = data_1.PSEUDO_ELEMENTS;
    var each_cartesian_join_1 = require("./each-cartesian-join");
    exports.eachCartesianJoinFactory = each_cartesian_join_1.eachCartesianJoinFactory;
    exports.eachCartesianJoin = each_cartesian_join_1.eachCartesianJoin;
    exports.eachCartesianJoinAsync = each_cartesian_join_1.eachCartesianJoinAsync;
    var h_1 = require("./h");
    exports.h = h_1.h;
    exports.hJsx = h_1.hJsx;
    var startup_1 = require("./startup");
    exports.setup = startup_1.setup;
    var html_test_context_1 = require("./html-test-context");
    exports.HTMLTestContext = html_test_context_1.HTMLTestContext;
    exports.TestContext = html_test_context_1.TestContext;
    var inspect_1 = require("./inspect");
    exports.inspect = inspect_1.inspect;
    var mocks_1 = require("./mocks");
    exports.MockBinding = mocks_1.MockBinding;
    exports.MockBindingBehavior = mocks_1.MockBindingBehavior;
    exports.MockBrowserHistoryLocation = mocks_1.MockBrowserHistoryLocation;
    exports.MockContext = mocks_1.MockContext;
    exports.MockPropertySubscriber = mocks_1.MockPropertySubscriber;
    exports.MockServiceLocator = mocks_1.MockServiceLocator;
    exports.MockSignaler = mocks_1.MockSignaler;
    exports.MockTracingExpression = mocks_1.MockTracingExpression;
    exports.MockValueConverter = mocks_1.MockValueConverter;
    exports.ChangeSet = mocks_1.ChangeSet;
    exports.CollectionChangeSet = mocks_1.CollectionChangeSet;
    exports.ProxyChangeSet = mocks_1.ProxyChangeSet;
    exports.SpySubscriber = mocks_1.SpySubscriber;
    var profiler_1 = require("./profiler");
    exports.writeProfilerReport = profiler_1.writeProfilerReport;
    var resources_1 = require("./resources");
    exports.SortValueConverter = resources_1.SortValueConverter;
    exports.JsonValueConverter = resources_1.JsonValueConverter;
    exports.TestConfiguration = resources_1.TestConfiguration;
    var specialized_assertions_1 = require("./specialized-assertions");
    exports.verifyASTEqual = specialized_assertions_1.verifyASTEqual;
    exports.verifyBindingInstructionsEqual = specialized_assertions_1.verifyBindingInstructionsEqual;
    exports.verifyEqual = specialized_assertions_1.verifyEqual;
    exports.getVisibleText = specialized_assertions_1.getVisibleText;
    exports.targetedInstructionTypeName = specialized_assertions_1.targetedInstructionTypeName;
    var string_manipulation_1 = require("./string-manipulation");
    exports._ = string_manipulation_1._;
    exports.stringify = string_manipulation_1.stringify;
    exports.htmlStringify = string_manipulation_1.htmlStringify;
    exports.jsonStringify = string_manipulation_1.jsonStringify;
    exports.padLeft = string_manipulation_1.padLeft;
    exports.padRight = string_manipulation_1.padRight;
    var test_builder_1 = require("./test-builder");
    // DefinitionBuilder,
    // InstructionBuilder,
    // TemplateBuilder,
    // TestBuilder,
    // createCustomAttribute,
    // createCustomElement,
    exports.createObserverLocator = test_builder_1.createObserverLocator;
    exports.createScopeForTest = test_builder_1.createScopeForTest;
    var tracing_1 = require("./tracing");
    exports.enableTracing = tracing_1.enableTracing;
    exports.disableTracing = tracing_1.disableTracing;
    exports.SymbolTraceWriter = tracing_1.SymbolTraceWriter;
    exports.Call = tracing_1.Call;
    exports.CallCollection = tracing_1.CallCollection;
    exports.recordCalls = tracing_1.recordCalls;
    exports.stopRecordingCalls = tracing_1.stopRecordingCalls;
    exports.trace = tracing_1.trace;
    var util_1 = require("./util");
    exports.trimFull = util_1.trimFull;
    exports.createSpy = util_1.createSpy;
});
//# sourceMappingURL=index.js.map