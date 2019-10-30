import { __decorate, __param } from "tslib";
import { all, DI } from '@aurelia/kernel';
import { AttrSyntax } from './ast';
import { AttributePattern, IAttributePattern, ISyntaxInterpreter } from './attribute-pattern';
export const IAttributeParser = DI.createInterface('IAttributeParser').withDefault(x => x.singleton(AttributeParser));
/** @internal */
let AttributeParser = class AttributeParser {
    constructor(interpreter, attrPatterns) {
        this.interpreter = interpreter;
        this.cache = {};
        this.interpreter = interpreter;
        const patterns = this.patterns = {};
        attrPatterns.forEach(attrPattern => {
            const defs = AttributePattern.getPatternDefinitions(attrPattern.constructor);
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
            return new AttrSyntax(name, value, name, null);
        }
        else {
            return this.patterns[pattern][pattern](name, value, interpretation.parts);
        }
    }
};
AttributeParser = __decorate([
    __param(0, ISyntaxInterpreter),
    __param(1, all(IAttributePattern))
], AttributeParser);
export { AttributeParser };
//# sourceMappingURL=attribute-parser.js.map