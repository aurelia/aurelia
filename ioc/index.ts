import { DefaultInjector, InjectorBuilder } from './injector';
import { TypeScriptSyntaxTransformer } from './analysis/syntax-transformer';
import { DependencyInjectionCodeGenerator } from './analysis/code-generator';
import * as ts from 'typescript';
import { IFileUtils } from './interfaces';
import { IModule } from './analysis/ast';

export class DIGenerator {
  public readonly fileUtils: IFileUtils;
  public readonly transformer: TypeScriptSyntaxTransformer;
  public readonly generator: DependencyInjectionCodeGenerator;

  constructor(fileUtils: IFileUtils) {
    this.fileUtils = fileUtils;
    this.transformer = new TypeScriptSyntaxTransformer();
    this.generator = new DependencyInjectionCodeGenerator();
  }

  async process(dir: string): Promise<void> {
    const fileNames = await this.fileUtils.getFileNamesRecursive(dir);
    const files = await Promise.all(
      fileNames.filter(f => /\.ts$/.test(f)).map(async f => ({
        name: f,
        content: await this.fileUtils.readFile(f)
      }))
    );
    const tsFiles = files.map(f => ts.createSourceFile(f.name, f.content, ts.ScriptTarget.Latest));
    const config = this.transformer.create(...tsFiles);
    const result = this.generator.create(config);

    for (const [mod, file] of (result.fileMap as any as [IModule, ts.SourceFile][])) {
      await this.fileUtils.writeFile(mod.path.replace('.ts', '.js'), ts.createPrinter().printFile(file));
    }
  }
}
