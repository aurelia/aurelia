export declare type ResourceType = 'customElement' | 'customAttribute' | 'valueConverter' | 'bindingBehavior' | 'bindingCommand';
interface NameConvention {
    name: string;
    type: ResourceType;
}
export declare function nameConvention(className: string): NameConvention;
export {};
//# sourceMappingURL=name-convention.d.ts.map