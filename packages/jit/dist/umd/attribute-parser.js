var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./ast", "./attribute-pattern"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                const defs = attribute_pattern_1.AttributePattern.getPatternDefinitions(attrPattern.constructor);
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
    AttributeParser = __decorate([
        __param(0, attribute_pattern_1.ISyntaxInterpreter),
        __param(1, kernel_1.all(attribute_pattern_1.IAttributePattern)),
        __metadata("design:paramtypes", [Object, Array])
    ], AttributeParser);
    exports.AttributeParser = AttributeParser;
});
//# sourceMappingURL=attribute-parser.js.map