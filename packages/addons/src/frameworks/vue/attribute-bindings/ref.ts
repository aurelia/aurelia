import { AttrSyntax, attributePattern } from '@aurelia/runtime-html';

@attributePattern({ pattern: '#PART', symbols: '#' })
export class AngularSharpRefAttributePattern {
    public ['#PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, parts[0], 'element', 'ref');
    }
}