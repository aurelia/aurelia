import { ILogger, IContainer } from '@aurelia/kernel';
import { IFileSystem, IFile } from './interfaces.js';
import { Package } from './package-types.js';
export declare class NPMPackageLoader {
    readonly container: IContainer;
    readonly logger: ILogger;
    readonly fs: IFileSystem;
    private readonly pkgCache;
    private readonly pkgPromiseCache;
    private readonly pkgResolveCache;
    private readonly pkgResolvePromiseCache;
    static get inject(): (import("@aurelia/kernel").InterfaceSymbol<IFileSystem> | import("@aurelia/kernel").InterfaceSymbol<ILogger> | import("@aurelia/kernel").InterfaceSymbol<IContainer>)[];
    constructor(container: IContainer, logger: ILogger, fs: IFileSystem);
    loadEntryPackage(projectDir: string): Promise<NPMPackage>;
    getCachedPackage(refName: string): NPMPackage;
    private loadPackageCore;
    private resolvePackagePath;
    private resolvePackagePathCore;
}
export declare class NPMPackage {
    readonly loader: NPMPackageLoader;
    readonly files: readonly IFile[];
    readonly issuer: NPMPackageDependency | null;
    readonly pkgJsonFile: IFile;
    readonly dir: string;
    readonly pkgJson: Package;
    readonly pkgName: string;
    readonly isAureliaPkg: boolean;
    readonly isEntryPoint: boolean;
    readonly entryFile: IFile;
    readonly deps: readonly NPMPackageDependency[];
    readonly container: IContainer;
    constructor(loader: NPMPackageLoader, files: readonly IFile[], issuer: NPMPackageDependency | null, pkgJsonFile: IFile, dir: string, pkgJsonFileContent: string);
}
export declare class NPMPackageDependency {
    readonly issuer: NPMPackage;
    readonly refName: string;
    get pkg(): NPMPackage;
    private _pkg;
    private loadPromise;
    constructor(issuer: NPMPackage, refName: string);
    private loadCore;
}
//# sourceMappingURL=npm-package-loader.d.ts.map