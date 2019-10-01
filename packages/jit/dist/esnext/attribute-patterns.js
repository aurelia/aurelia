import { __decorate } from "tslib";
import { AttrSyntax } from './ast';
import { attributePattern } from './attribute-pattern';
let DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
    ['PART.PART'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
    }
    ['PART.PART.PART'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
    }
};
DotSeparatedAttributePattern = __decorate([
    attributePattern({ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' })
], DotSeparatedAttributePattern);
export { DotSeparatedAttributePattern };
let RefAttributePattern = class RefAttributePattern {
    ['ref'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, 'element', 'ref');
    }
    ['PART.ref'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'ref');
    }
};
RefAttributePattern = __decorate([
    attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'PART.ref', symbols: '.' })
], RefAttributePattern);
export { RefAttributePattern };
let ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
    [':PART'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
    }
};
ColonPrefixedBindAttributePattern = __decorate([
    attributePattern({ pattern: ':PART', symbols: ':' })
], ColonPrefixedBindAttributePattern);
export { ColonPrefixedBindAttributePattern };
let AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
    ['@PART'](rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
};
AtPrefixedTriggerAttributePattern = __decorate([
    attributePattern({ pattern: '@PART', symbols: '@' })
], AtPrefixedTriggerAttributePattern);
export { AtPrefixedTriggerAttributePattern };
//# sourceMappingURL=attribute-patterns.js.map