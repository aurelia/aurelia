import { AttrSyntax, attributePattern } from '@aurelia/runtime-html';

@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBindingAttributePattern {
    public ['[(PART)]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
    }
}