import { AttrSyntax, attributePattern } from '@aurelia/runtime-html';

@attributePattern({ pattern: '::PART', symbols: '::' })
export class DoubleColonTwoWayBindingAttributePattern {
    public ['::PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
    }
}

@attributePattern({ pattern: 'v-model', symbols: '' })
export class VueTwoWayBindingAttributePattern {
    public ['v-model'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, 'value', 'two-way');
    }
}