(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./link-handler", "./instruction-resolver", "./interfaces", "./lifecycle-logger", "./hook-manager", "./nav", "./nav-route", "./navigation", "./navigator", "./runner", "./queue", "./route-recognizer", "./router", "./router-options", "./viewport", "./viewport-content", "./viewport-instruction", "./configuration"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HrefCustomAttributeRegistration = exports.HrefCustomAttribute = exports.LoadCustomAttributeRegistration = exports.LoadCustomAttribute = exports.GotoCustomAttributeRegistration = exports.GotoCustomAttribute = exports.NavCustomElementRegistration = exports.NavCustomElement = exports.ViewportCustomElementRegistration = exports.ViewportCustomElement = exports.DefaultResources = exports.DefaultComponents = exports.RouterRegistration = exports.RouterConfiguration = exports.ViewportInstruction = exports.ViewportContent = exports.ContentStatus = exports.Viewport = exports.RouterOptions = exports.Router = exports.IRouter = exports.Endpoint = exports.RecognizedRoute = exports.ConfigurableRoute = exports.RouteRecognizer = exports.Queue = exports.Runner = exports.Navigator = exports.Navigation = exports.NavRoute = exports.Nav = exports.HookTypes = exports.HookManager = exports.LifecycleClass = exports.lifecycleLogger = exports.ReentryBehavior = exports.InstructionResolver = exports.LinkHandler = void 0;
    var link_handler_1 = require("./link-handler");
    Object.defineProperty(exports, "LinkHandler", { enumerable: true, get: function () { return link_handler_1.LinkHandler; } });
    var instruction_resolver_1 = require("./instruction-resolver");
    Object.defineProperty(exports, "InstructionResolver", { enumerable: true, get: function () { return instruction_resolver_1.InstructionResolver; } });
    var interfaces_1 = require("./interfaces");
    Object.defineProperty(exports, "ReentryBehavior", { enumerable: true, get: function () { return interfaces_1.ReentryBehavior; } });
    var lifecycle_logger_1 = require("./lifecycle-logger");
    Object.defineProperty(exports, "lifecycleLogger", { enumerable: true, get: function () { return lifecycle_logger_1.lifecycleLogger; } });
    Object.defineProperty(exports, "LifecycleClass", { enumerable: true, get: function () { return lifecycle_logger_1.LifecycleClass; } });
    var hook_manager_1 = require("./hook-manager");
    Object.defineProperty(exports, "HookManager", { enumerable: true, get: function () { return hook_manager_1.HookManager; } });
    Object.defineProperty(exports, "HookTypes", { enumerable: true, get: function () { return hook_manager_1.HookTypes; } });
    var nav_1 = require("./nav");
    Object.defineProperty(exports, "Nav", { enumerable: true, get: function () { return nav_1.Nav; } });
    var nav_route_1 = require("./nav-route");
    Object.defineProperty(exports, "NavRoute", { enumerable: true, get: function () { return nav_route_1.NavRoute; } });
    var navigation_1 = require("./navigation");
    Object.defineProperty(exports, "Navigation", { enumerable: true, get: function () { return navigation_1.Navigation; } });
    var navigator_1 = require("./navigator");
    Object.defineProperty(exports, "Navigator", { enumerable: true, get: function () { return navigator_1.Navigator; } });
    var runner_1 = require("./runner");
    Object.defineProperty(exports, "Runner", { enumerable: true, get: function () { return runner_1.Runner; } });
    var queue_1 = require("./queue");
    Object.defineProperty(exports, "Queue", { enumerable: true, get: function () { return queue_1.Queue; } });
    var route_recognizer_1 = require("./route-recognizer");
    Object.defineProperty(exports, "RouteRecognizer", { enumerable: true, get: function () { return route_recognizer_1.RouteRecognizer; } });
    Object.defineProperty(exports, "ConfigurableRoute", { enumerable: true, get: function () { return route_recognizer_1.ConfigurableRoute; } });
    Object.defineProperty(exports, "RecognizedRoute", { enumerable: true, get: function () { return route_recognizer_1.RecognizedRoute; } });
    Object.defineProperty(exports, "Endpoint", { enumerable: true, get: function () { return route_recognizer_1.Endpoint; } });
    var router_1 = require("./router");
    // IRouterActivateOptions,
    // IRouterOptions,
    // IRouterTitle,
    Object.defineProperty(exports, "IRouter", { enumerable: true, get: function () { return router_1.IRouter; } });
    Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_1.Router; } });
    var router_options_1 = require("./router-options");
    Object.defineProperty(exports, "RouterOptions", { enumerable: true, get: function () { return router_options_1.RouterOptions; } });
    var viewport_1 = require("./viewport");
    Object.defineProperty(exports, "Viewport", { enumerable: true, get: function () { return viewport_1.Viewport; } });
    var viewport_content_1 = require("./viewport-content");
    Object.defineProperty(exports, "ContentStatus", { enumerable: true, get: function () { return viewport_content_1.ContentStatus; } });
    Object.defineProperty(exports, "ViewportContent", { enumerable: true, get: function () { return viewport_content_1.ViewportContent; } });
    var viewport_instruction_1 = require("./viewport-instruction");
    Object.defineProperty(exports, "ViewportInstruction", { enumerable: true, get: function () { return viewport_instruction_1.ViewportInstruction; } });
    var configuration_1 = require("./configuration");
    Object.defineProperty(exports, "RouterConfiguration", { enumerable: true, get: function () { return configuration_1.RouterConfiguration; } });
    Object.defineProperty(exports, "RouterRegistration", { enumerable: true, get: function () { return configuration_1.RouterRegistration; } });
    Object.defineProperty(exports, "DefaultComponents", { enumerable: true, get: function () { return configuration_1.DefaultComponents; } });
    Object.defineProperty(exports, "DefaultResources", { enumerable: true, get: function () { return configuration_1.DefaultResources; } });
    Object.defineProperty(exports, "ViewportCustomElement", { enumerable: true, get: function () { return configuration_1.ViewportCustomElement; } });
    Object.defineProperty(exports, "ViewportCustomElementRegistration", { enumerable: true, get: function () { return configuration_1.ViewportCustomElementRegistration; } });
    Object.defineProperty(exports, "NavCustomElement", { enumerable: true, get: function () { return configuration_1.NavCustomElement; } });
    Object.defineProperty(exports, "NavCustomElementRegistration", { enumerable: true, get: function () { return configuration_1.NavCustomElementRegistration; } });
    Object.defineProperty(exports, "GotoCustomAttribute", { enumerable: true, get: function () { return configuration_1.GotoCustomAttribute; } });
    Object.defineProperty(exports, "GotoCustomAttributeRegistration", { enumerable: true, get: function () { return configuration_1.GotoCustomAttributeRegistration; } });
    Object.defineProperty(exports, "LoadCustomAttribute", { enumerable: true, get: function () { return configuration_1.LoadCustomAttribute; } });
    Object.defineProperty(exports, "LoadCustomAttributeRegistration", { enumerable: true, get: function () { return configuration_1.LoadCustomAttributeRegistration; } });
    Object.defineProperty(exports, "HrefCustomAttribute", { enumerable: true, get: function () { return configuration_1.HrefCustomAttribute; } });
    Object.defineProperty(exports, "HrefCustomAttributeRegistration", { enumerable: true, get: function () { return configuration_1.HrefCustomAttributeRegistration; } });
});
//# sourceMappingURL=index.js.map