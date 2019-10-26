(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./ast", "./attribute-pattern"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const ast_1 = require("./ast");
    const attribute_pattern_1 = require("./attribute-pattern");
    exports.IAttributeParser = kernel_1.DI.createInterface('IAttributeParser').withDefault(x => x.singleton(AttributeParser));
    /** @internal */
    let AttributeParser = class AttributeParser {
        constructor(interpreter, attrPatterns) {
            this.interpreter = interpreter;
            this.cache = {};
            this.interpreter = interpreter;
            const patterns = this.patterns = {};
            attrPatterns.forEach(attrPattern => {
                const defs = attrPattern.$patternDefs;
                interpreter.add(defs);
                defs.forEach(def => {
                    patterns[def.pattern] = attrPattern;
                });
            });
        }
        parse(name, value) {
            let interpretation = this.cache[name];
            if (interpretation == null) {
                interpretation = this.cache[name] = this.interpreter.interpret(name);
            }
            const pattern = interpretation.pattern;
            if (pattern == null) {
                return new ast_1.AttrSyntax(name, value, name, null);
            }
            else {
                return this.patterns[pattern][pattern](name, value, interpretation.parts);
            }
        }
    };
    AttributeParser = tslib_1.__decorate([
        tslib_1.__param(0, attribute_pattern_1.ISyntaxInterpreter),
        tslib_1.__param(1, kernel_1.all(attribute_pattern_1.IAttributePattern))
    ], AttributeParser);
    exports.AttributeParser = AttributeParser;
});
//# sourceMappingURL=attribute-parser.js.map