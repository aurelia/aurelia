import type { Constructable, IResourceKind, ResourceDefinition, IContainer } from '@aurelia/kernel';
export declare function alias(...aliases: readonly string[]): (target: Constructable) => void;
export declare function registerAliases(aliases: readonly string[], resource: IResourceKind<Constructable, ResourceDefinition>, key: string, container: IContainer): void;
//# sourceMappingURL=alias.d.ts.map