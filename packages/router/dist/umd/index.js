(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./browser-navigator", "./link-handler", "./guard", "./guardian", "./instruction-resolver", "./interfaces", "./lifecycle-logger", "./nav", "./nav-route", "./navigator", "./queue", "./route-recognizer", "./router", "./viewport", "./viewport-content", "./viewport-instruction", "./configuration"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var browser_navigator_1 = require("./browser-navigator");
    exports.BrowserNavigator = browser_navigator_1.BrowserNavigator;
    var link_handler_1 = require("./link-handler");
    exports.LinkHandler = link_handler_1.LinkHandler;
    var guard_1 = require("./guard");
    exports.Guard = guard_1.Guard;
    var guardian_1 = require("./guardian");
    exports.GuardTypes = guardian_1.GuardTypes;
    exports.Guardian = guardian_1.Guardian;
    var instruction_resolver_1 = require("./instruction-resolver");
    exports.InstructionResolver = instruction_resolver_1.InstructionResolver;
    var interfaces_1 = require("./interfaces");
    exports.ReentryBehavior = interfaces_1.ReentryBehavior;
    var lifecycle_logger_1 = require("./lifecycle-logger");
    exports.lifecycleLogger = lifecycle_logger_1.lifecycleLogger;
    exports.LifecycleClass = lifecycle_logger_1.LifecycleClass;
    var nav_1 = require("./nav");
    exports.Nav = nav_1.Nav;
    var nav_route_1 = require("./nav-route");
    exports.NavRoute = nav_route_1.NavRoute;
    var navigator_1 = require("./navigator");
    exports.Navigator = navigator_1.Navigator;
    var queue_1 = require("./queue");
    exports.Queue = queue_1.Queue;
    var route_recognizer_1 = require("./route-recognizer");
    exports.HandlerEntry = route_recognizer_1.HandlerEntry;
    exports.RouteGenerator = route_recognizer_1.RouteGenerator;
    exports.TypesRecord = route_recognizer_1.TypesRecord;
    exports.RecognizeResult = route_recognizer_1.RecognizeResult;
    exports.CharSpec = route_recognizer_1.CharSpec;
    exports.State = route_recognizer_1.State;
    exports.StaticSegment = route_recognizer_1.StaticSegment;
    exports.DynamicSegment = route_recognizer_1.DynamicSegment;
    exports.StarSegment = route_recognizer_1.StarSegment;
    exports.EpsilonSegment = route_recognizer_1.EpsilonSegment;
    exports.RouteRecognizer = route_recognizer_1.RouteRecognizer;
    var router_1 = require("./router");
    exports.IRouteTransformer = router_1.IRouteTransformer;
    exports.IRouter = router_1.IRouter;
    exports.Router = router_1.Router;
    var viewport_1 = require("./viewport");
    exports.Viewport = viewport_1.Viewport;
    var viewport_content_1 = require("./viewport-content");
    exports.ContentStatus = viewport_content_1.ContentStatus;
    exports.ViewportContent = viewport_content_1.ViewportContent;
    var viewport_instruction_1 = require("./viewport-instruction");
    exports.ViewportInstruction = viewport_instruction_1.ViewportInstruction;
    var configuration_1 = require("./configuration");
    exports.RouterConfiguration = configuration_1.RouterConfiguration;
    exports.RouterRegistration = configuration_1.RouterRegistration;
    exports.DefaultComponents = configuration_1.DefaultComponents;
    exports.DefaultResources = configuration_1.DefaultResources;
    exports.ViewportCustomElement = configuration_1.ViewportCustomElement;
    exports.ViewportCustomElementRegistration = configuration_1.ViewportCustomElementRegistration;
    exports.NavCustomElement = configuration_1.NavCustomElement;
    exports.NavCustomElementRegistration = configuration_1.NavCustomElementRegistration;
    exports.GotoCustomAttribute = configuration_1.GotoCustomAttribute;
    exports.GotoCustomAttributeRegistration = configuration_1.GotoCustomAttributeRegistration;
});
//# sourceMappingURL=index.js.map