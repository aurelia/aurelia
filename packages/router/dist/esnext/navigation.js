export class Navigation {
    constructor(entry = {
        instruction: '',
        fullStateInstruction: '',
    }) {
        var _a;
        this.navigation = (_a = entry.navigation) !== null && _a !== void 0 ? _a : {
            first: false,
            new: false,
            refresh: false,
            forward: false,
            back: false,
            replace: false,
        };
        this.repeating = entry.repeating;
        // INavigatorEntry
        this.fromBrowser = entry.fromBrowser;
        this.origin = entry.origin;
        this.replacing = entry.replacing;
        this.refreshing = entry.refreshing;
        this.untracked = entry.untracked;
        this.historyMovement = entry.historyMovement;
        this.resolve = entry.resolve;
        this.reject = entry.reject;
        // IStoredNavigatorEntry
        this.instruction = entry.instruction;
        this.fullStateInstruction = entry.fullStateInstruction;
        this.scope = entry.scope;
        this.index = entry.index;
        this.firstEntry = entry.firstEntry;
        this.route = entry.route;
        this.path = entry.path;
        this.title = entry.title;
        this.query = entry.query;
        this.parameters = entry.parameters;
        this.data = entry.data;
    }
    get useFullStateInstruction() {
        var _a, _b;
        return ((_a = this.navigation.back) !== null && _a !== void 0 ? _a : false) || ((_b = this.navigation.forward) !== null && _b !== void 0 ? _b : false);
    }
    toStored() {
        return {
            navigation: this.navigation,
            repeating: this.repeating,
            // IStoredNavigatorEntry
            instruction: this.instruction,
            fullStateInstruction: this.fullStateInstruction,
            scope: this.scope,
            index: this.index,
            firstEntry: this.firstEntry,
            route: this.route,
            path: this.path,
            title: this.title,
            query: this.query,
            parameters: this.parameters,
            data: this.data,
        };
    }
}
//# sourceMappingURL=navigation.js.map