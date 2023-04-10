import { AttrSyntax, attributePattern } from '@aurelia/runtime-html';

@attributePattern({ pattern: 'bind:PART', symbols: 'bind:' })
export class SveleteEventBindingAttributePattern {
    public ['bind:PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
}