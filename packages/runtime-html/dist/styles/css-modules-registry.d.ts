import { IContainer, IRegistry } from '@aurelia/kernel';
export declare function cssModules(...cssModules: (Record<string, string>)[]): CSSModulesProcessorRegistry;
export declare class CSSModulesProcessorRegistry implements IRegistry {
    private readonly cssModules;
    constructor(cssModules: Record<string, string>[]);
    register(container: IContainer): void;
}
//# sourceMappingURL=css-modules-registry.d.ts.map