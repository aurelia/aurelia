(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/debug", "@aurelia/runtime", "@aurelia/runtime-html", "./assert"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debug_1 = require("@aurelia/debug");
    const runtime_1 = require("@aurelia/runtime");
    const runtime_html_1 = require("@aurelia/runtime-html");
    const assert_1 = require("./assert");
    function verifyASTEqual(actual, expected, errors, path) {
        if (expected == null) {
            if (actual != null) {
                assert_1.assert.strictEqual(actual, null, `actual`);
            }
        }
        else if (actual == null) {
            const expectedSerialized = debug_1.Serializer.serialize(expected);
            assert_1.assert.strictEqual(actual, expectedSerialized, `actual`);
        }
        else {
            const expectedSerialized = debug_1.Serializer.serialize(expected);
            const expectedUnparsed = debug_1.Unparser.unparse(expected);
            const actualSerialized = debug_1.Serializer.serialize(actual);
            const actualUnparsed = debug_1.Unparser.unparse(actual);
            if (actualSerialized !== expectedSerialized) {
                assert_1.assert.strictEqual(actualSerialized, expectedSerialized, `actualSerialized`);
            }
            if (actualUnparsed !== expectedUnparsed) {
                assert_1.assert.strictEqual(actualUnparsed, expectedUnparsed, `actualUnparsed`);
            }
        }
    }
    exports.verifyASTEqual = verifyASTEqual;
    function verifyEqual(actual, expected, depth, property, index) {
        if (depth === undefined) {
            depth = 0;
        }
        if (typeof expected !== 'object' || expected === null) {
            assert_1.assert.strictEqual(actual, expected, `actual, depth=${depth}, prop=${property}, index=${index}`);
            return;
        }
        if (expected instanceof Array) {
            for (let i = 0; i < expected.length; i++) {
                verifyEqual(actual[i], expected[i], depth + 1, property, i);
            }
            return;
        }
        if (expected.nodeType > 0) {
            if (expected.nodeType === 11) {
                for (let i = 0; i < expected.childNodes.length; i++) {
                    verifyEqual(actual.childNodes.item(i), expected.childNodes.item(i), depth + 1, property, i);
                }
            }
            else {
                assert_1.assert.strictEqual(actual.outerHTML, expected.outerHTML, `actual.outerHTML, depth=${depth}, prop=${property}, index=${index}`);
            }
            return;
        }
        if (actual) {
            assert_1.assert.strictEqual(actual.constructor.name, expected.constructor.name, `actual.constructor.name, depth=${depth}, prop=${property}, index=${index}`);
            assert_1.assert.strictEqual(actual.toString(), expected.toString(), `actual.toString(), depth=${depth}, prop=${property}, index=${index}`);
            for (const prop of Object.keys(expected)) {
                verifyEqual(actual[prop], expected[prop], depth + 1, prop, index);
            }
        }
    }
    exports.verifyEqual = verifyEqual;
    function getVisibleText(root, host, removeWhiteSpace) {
        const context = { text: host.textContent };
        $getVisibleText(root, context);
        const text = context.text;
        return removeWhiteSpace && text ? text.replace(/\s\s+/g, ' ').trim() : text;
    }
    exports.getVisibleText = getVisibleText;
    function isShadowDOMProjector(projector) {
        return projector != void 0 && 'shadowRoot' in projector;
    }
    function $getVisibleText(root, context) {
        if (root == void 0) {
            return;
        }
        const { controllers } = root;
        if (controllers == void 0) {
            return;
        }
        const { length } = controllers;
        let controller;
        for (let i = 0; i < length; ++i) {
            controller = controllers[i];
            if (isShadowDOMProjector(controller.projector)) {
                context.text += controller.projector.shadowRoot.textContent;
                $getVisibleText(controller, context);
            }
            else if (controller.viewModel instanceof runtime_1.Replaceable) {
                $getVisibleText(controller.viewModel.view, context);
            }
            else if (controller.viewModel instanceof runtime_1.With) {
                $getVisibleText(controller.viewModel.view, context);
            }
            else if (controller.viewModel instanceof runtime_1.If) {
                $getVisibleText(controller.viewModel.view, context);
            }
            else if (controller.viewModel instanceof runtime_html_1.Compose) {
                $getVisibleText(controller.viewModel.view, context);
            }
            else if (controller.viewModel instanceof runtime_1.Repeat) {
                for (const view of controller.viewModel.views) {
                    $getVisibleText(view, context);
                }
            }
        }
    }
    function targetedInstructionTypeName(type) {
        switch (type) {
            case "ha" /* textBinding */:
                return 'textBinding';
            case "rf" /* interpolation */:
                return 'interpolation';
            case "rg" /* propertyBinding */:
                return 'propertyBinding';
            case "rk" /* iteratorBinding */:
                return 'iteratorBinding';
            case "hb" /* listenerBinding */:
                return 'listenerBinding';
            case "rh" /* callBinding */:
                return 'callBinding';
            case "rj" /* refBinding */:
                return 'refBinding';
            case "hd" /* stylePropertyBinding */:
                return 'stylePropertyBinding';
            case "re" /* setProperty */:
                return 'setProperty';
            case "he" /* setAttribute */:
                return 'setAttribute';
            case "ra" /* hydrateElement */:
                return 'hydrateElement';
            case "rb" /* hydrateAttribute */:
                return 'hydrateAttribute';
            case "rc" /* hydrateTemplateController */:
                return 'hydrateTemplateController';
            case "rd" /* hydrateLetElement */:
                return 'hydrateLetElement';
            case "ri" /* letBinding */:
                return 'letBinding';
            default:
                return type;
        }
    }
    exports.targetedInstructionTypeName = targetedInstructionTypeName;
    function verifyBindingInstructionsEqual(actual, expected, errors, path) {
        if (path === undefined) {
            path = 'instruction';
        }
        if (errors === undefined) {
            errors = [];
        }
        if (!(expected instanceof Object) || !(actual instanceof Object)) {
            if (actual !== expected) {
                // Special treatment for generated names (TODO: we *can* predict the values and we might want to at some point,
                // because this exception is essentially a loophole that will eventually somehow cause a bug to slip through)
                if (path.endsWith('.name')) {
                    if (String(expected) === 'unnamed' && String(actual).startsWith('unnamed-')) {
                        errors.push(`OK   : ${path} === ${expected} (${actual})`);
                    }
                }
                else if (path.endsWith('.key')) {
                    if (String(expected).endsWith('unnamed') && /unnamed-\d+$/.test(String(actual))) {
                        errors.push(`OK   : ${path} === ${expected} (${actual})`);
                    }
                }
                else {
                    if (typeof expected === 'object' && expected != null) {
                        expected = JSON.stringify(expected);
                    }
                    if (typeof actual === 'object' && actual != null) {
                        actual = JSON.stringify(actual);
                    }
                    if (path.endsWith('type')) {
                        expected = targetedInstructionTypeName(expected);
                        actual = targetedInstructionTypeName(actual);
                    }
                    errors.push(`WRONG: ${path} === ${actual} (expected: ${expected})`);
                }
            }
            else {
                errors.push(`OK   : ${path} === ${expected}`);
            }
        }
        else if (expected instanceof Array) {
            for (let i = 0, ii = Math.max(expected.length, actual.length); i < ii; ++i) {
                verifyBindingInstructionsEqual(actual[i], expected[i], errors, `${path}[${i}]`);
            }
        }
        else if (expected.nodeType > 0) {
            if (expected.nodeType === 11) {
                for (let i = 0, ii = Math.max(expected.childNodes.length, actual.childNodes.length); i < ii; ++i) {
                    verifyBindingInstructionsEqual(actual.childNodes.item(i), expected.childNodes.item(i), errors, `${path}.childNodes[${i}]`);
                }
            }
            else {
                if (actual.outerHTML !== expected['outerHTML']) {
                    errors.push(`WRONG: ${path}.outerHTML === ${actual.outerHTML} (expected: ${expected['outerHTML']})`);
                }
                else {
                    errors.push(`OK   : ${path}.outerHTML === ${expected}`);
                }
            }
        }
        else if (actual) {
            const seen = {};
            for (const prop in expected) {
                verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
                seen[prop] = true;
            }
            for (const prop in actual) {
                if (!seen[prop]) {
                    verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
                }
            }
        }
        if (path === 'instruction' && errors.some(e => e.startsWith('W'))) {
            throw new Error(`Failed assertion: binding instruction mismatch\n  - ${errors.join('\n  - ')}`);
        }
    }
    exports.verifyBindingInstructionsEqual = verifyBindingInstructionsEqual;
});
//# sourceMappingURL=specialized-assertions.js.map