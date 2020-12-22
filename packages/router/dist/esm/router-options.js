export class RouterOptions {
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
//# sourceMappingURL=router-options.js.map