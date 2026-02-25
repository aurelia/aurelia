import { AttrSyntax, attributePattern } from '@aurelia/runtime-html';

@attributePattern({ pattern: '[PART]', symbols: ':' })
export class VueOneWayBindingAttributePattern {
    public [':PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'to-view' /*'bind'*/);
    }
}