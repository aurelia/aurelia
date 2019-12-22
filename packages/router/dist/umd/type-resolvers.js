(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "./viewport", "./viewport-instruction"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const viewport_1 = require("./viewport");
    const viewport_instruction_1 = require("./viewport-instruction");
    exports.ComponentAppellationResolver = {
        isName: function (component) {
            return typeof component === 'string';
        },
        isType: function (component) {
            return runtime_1.CustomElement.isType(component);
        },
        isInstance: function (component) {
            return !exports.ComponentAppellationResolver.isName(component) && !exports.ComponentAppellationResolver.isType(component);
        },
        getName: function (component) {
            if (exports.ComponentAppellationResolver.isName(component)) {
                return component;
            }
            else if (exports.ComponentAppellationResolver.isType(component)) {
                return runtime_1.CustomElement.getDefinition(component).name;
            }
            else {
                return exports.ComponentAppellationResolver.getName(component.constructor);
            }
        },
        getType: function (component) {
            if (exports.ComponentAppellationResolver.isName(component)) {
                return null;
            }
            else if (exports.ComponentAppellationResolver.isType(component)) {
                return component;
            }
            else {
                return component.constructor;
            }
        },
        getInstance: function (component) {
            if (exports.ComponentAppellationResolver.isName(component) || exports.ComponentAppellationResolver.isType(component)) {
                return null;
            }
            else {
                return component;
            }
        },
    };
    exports.ViewportHandleResolver = {
        isName: function (viewport) {
            return typeof viewport === 'string';
        },
        isInstance: function (viewport) {
            return viewport instanceof viewport_1.Viewport;
        },
        getName: function (viewport) {
            if (exports.ViewportHandleResolver.isName(viewport)) {
                return viewport;
            }
            else {
                return viewport ? (viewport).name : null;
            }
        },
        getInstance: function (viewport) {
            if (exports.ViewportHandleResolver.isName(viewport)) {
                return null;
            }
            else {
                return viewport;
            }
        },
    };
    exports.NavigationInstructionResolver = {
        createViewportInstructions: function (router, navigationInstructions, options) {
            options = options || {};
            let scope = null;
            if (options.context) {
                scope = router.findScope(options.context);
                if (typeof navigationInstructions === 'string') {
                    // If it's not from scope root, figure out which scope
                    if (!navigationInstructions.startsWith('/')) {
                        // Scope modifications
                        if (navigationInstructions.startsWith('.')) {
                            // The same as no scope modification
                            if (navigationInstructions.startsWith('./')) {
                                navigationInstructions = navigationInstructions.slice(2);
                            }
                            // Find out how many scopes upwards we should move
                            while (navigationInstructions.startsWith('../')) {
                                scope = scope.parent || scope;
                                navigationInstructions = navigationInstructions.slice(3);
                            }
                        }
                        if (scope.path !== null) {
                            navigationInstructions = `${scope.path}/${navigationInstructions}`;
                            scope = router.rootScope.scope;
                        }
                    }
                    else { // Specified root scope with /
                        scope = router.rootScope.scope;
                    }
                }
                else {
                    navigationInstructions = exports.NavigationInstructionResolver.toViewportInstructions(router, navigationInstructions);
                    for (const instruction of navigationInstructions) {
                        if (instruction.scope === null) {
                            instruction.scope = scope;
                        }
                    }
                }
            }
            return {
                instructions: navigationInstructions,
                scope,
            };
        },
        toViewportInstructions: function (router, navigationInstructions) {
            if (!Array.isArray(navigationInstructions)) {
                return exports.NavigationInstructionResolver.toViewportInstructions(router, [navigationInstructions]);
            }
            const instructions = [];
            for (const instruction of navigationInstructions) {
                if (typeof instruction === 'string') {
                    instructions.push(...router.instructionResolver.parseViewportInstructions(instruction));
                }
                else if (instruction instanceof viewport_instruction_1.ViewportInstruction) {
                    instructions.push(instruction);
                }
                else if (instruction.component) {
                    const viewportComponent = instruction;
                    const newInstruction = router.createViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters);
                    if (viewportComponent.children !== void 0 && viewportComponent.children !== null) {
                        newInstruction.nextScopeInstructions = exports.NavigationInstructionResolver.toViewportInstructions(router, viewportComponent.children);
                    }
                    instructions.push(newInstruction);
                }
                else {
                    instructions.push(router.createViewportInstruction(instruction));
                }
            }
            return instructions;
        },
    };
});
//# sourceMappingURL=type-resolvers.js.map