import { CustomElement } from '@aurelia/runtime';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export const ComponentAppellationResolver = {
    isName: function (component) {
        return typeof component === 'string';
    },
    isType: function (component) {
        return CustomElement.isType(component);
    },
    isInstance: function (component) {
        return !ComponentAppellationResolver.isName(component) && !ComponentAppellationResolver.isType(component);
    },
    getName: function (component) {
        if (ComponentAppellationResolver.isName(component)) {
            return component;
        }
        else if (ComponentAppellationResolver.isType(component)) {
            return CustomElement.getDefinition(component).name;
        }
        else {
            return ComponentAppellationResolver.getName(component.constructor);
        }
    },
    getType: function (component) {
        if (ComponentAppellationResolver.isName(component)) {
            return null;
        }
        else if (ComponentAppellationResolver.isType(component)) {
            return component;
        }
        else {
            return component.constructor;
        }
    },
    getInstance: function (component) {
        if (ComponentAppellationResolver.isName(component) || ComponentAppellationResolver.isType(component)) {
            return null;
        }
        else {
            return component;
        }
    },
};
export const ViewportHandleResolver = {
    isName: function (viewport) {
        return typeof viewport === 'string';
    },
    isInstance: function (viewport) {
        return viewport instanceof Viewport;
    },
    getName: function (viewport) {
        if (ViewportHandleResolver.isName(viewport)) {
            return viewport;
        }
        else {
            return viewport ? (viewport).name : null;
        }
    },
    getInstance: function (viewport) {
        if (ViewportHandleResolver.isName(viewport)) {
            return null;
        }
        else {
            return viewport;
        }
    },
};
export const NavigationInstructionResolver = {
    toViewportInstructions: function (router, navigationInstructions) {
        if (!Array.isArray(navigationInstructions)) {
            return NavigationInstructionResolver.toViewportInstructions(router, [navigationInstructions]);
        }
        const instructions = [];
        for (const instruction of navigationInstructions) {
            if (typeof instruction === 'string') {
                instructions.push(...router.instructionResolver.parseViewportInstructions(instruction));
            }
            else if (instruction instanceof ViewportInstruction) {
                instructions.push(instruction);
            }
            else if (instruction.component) {
                const viewportComponent = instruction;
                instructions.push(new ViewportInstruction(viewportComponent.component, viewportComponent.viewport, viewportComponent.parameters));
            }
            else {
                instructions.push(new ViewportInstruction(instruction));
            }
        }
        return instructions;
    },
};
//# sourceMappingURL=type-resolvers.js.map