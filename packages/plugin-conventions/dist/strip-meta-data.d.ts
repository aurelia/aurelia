import { PartialBindableDefinition } from '@aurelia/runtime-html';
interface IStrippedHtml {
    html: string;
    deps: string[];
    shadowMode: 'open' | 'closed' | null;
    containerless: boolean;
    hasSlot: boolean;
    bindables: Record<string, PartialBindableDefinition>;
    aliases: string[];
}
export declare function stripMetaData(rawHtml: string): IStrippedHtml;
export {};
//# sourceMappingURL=strip-meta-data.d.ts.map