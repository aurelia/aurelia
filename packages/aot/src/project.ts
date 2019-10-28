import { NPMPackage } from './system/npm-package-loader';

export class Project {
  public constructor(
    public readonly rootDir: string,
    public readonly entryPkg: NPMPackage,
  ) {}
}
