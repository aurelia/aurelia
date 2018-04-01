import { SyntaxTransformer } from './syntax-transformer';
import { DependencyInjectionCodeGenerator } from './code-generator';
import * as ts from 'typescript';
import { IFileUtils } from './interfaces';
import { IModule } from './ast';

export class DIGenerator {
  public readonly fileUtils: IFileUtils;
  public readonly transformer: SyntaxTransformer;
  public readonly generator: DependencyInjectionCodeGenerator;

  constructor(fileUtils: IFileUtils) {
    this.fileUtils = fileUtils;
    this.transformer = new SyntaxTransformer();
    this.generator = new DependencyInjectionCodeGenerator();
  }

  process(dir: string): Promise<void> {
    return this.fileUtils.getFileNamesRecursive(dir).then(fileNames => {
      const files = fileNames.filter(f => /^(?!.*ioc\.[tj]s$).*\.[tj]s$/i.test(f)).map(f => ({
        name: f,
        content: this.fileUtils.readFileSync(f)
      }));
      const tsFiles = files.map(f => ts.createSourceFile(f.name, f.content, ts.ScriptTarget.Latest));
      const config = this.transformer.create(...tsFiles);
      config.rootDir = this.fileUtils.getAbsolutePath(dir);
      const result = this.generator.create(config);

      for (const [mod, file] of (result.fileMap as any) as [IModule, ts.SourceFile][]) {
        this.fileUtils.writeFileSync(mod.path.replace(/\.[tj]s$/, '-ioc.js'), ts.createPrinter().printFile(file));
      }
    });
  }
}
