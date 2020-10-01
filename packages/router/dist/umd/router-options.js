(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RouterOptions = void 0;
    class RouterOptions {
        constructor() {
            this.separators = {
                viewport: '@',
                sibling: '+',
                scope: '/',
                scopeStart: '(',
                scopeEnd: ')',
                noScope: '!',
                parameters: '(',
                parametersEnd: ')',
                parameterSeparator: ',',
                parameterKeySeparator: '=',
                parameter: '&',
                add: '+',
                clear: '-',
                action: '.',
            };
            this.useUrlFragmentHash = true;
            this.useHref = true;
            this.statefulHistoryLength = 0;
            this.useDirectRoutes = true;
            this.useConfiguredRoutes = true;
            this.additiveInstructionDefault = true;
            this.title = {
                // eslint-disable-next-line no-useless-escape
                appTitle: "${componentTitles}\${appTitleSeparator}Aurelia",
                appTitleSeparator: ' | ',
                componentTitleOrder: 'top-down',
                componentTitleSeparator: ' > ',
                useComponentNames: true,
                componentPrefix: 'app-',
            };
            this.navigationSyncStates = ['guardedUnload', 'swapped', 'completed'];
            this.swapStrategy = 'add-first-sequential';
            this.routingHookIntegration = 'integrated';
        }
    }
    exports.RouterOptions = RouterOptions;
});
//# sourceMappingURL=router-options.js.map