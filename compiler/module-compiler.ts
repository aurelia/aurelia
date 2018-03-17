import { IAureliaModuleCompiler, IAureliaModule, IViewCompiler, IViewModelCompiler, IFileUtils } from "./interfaces";
import { DOM } from './dom';

export class AureliaModuleCompiler implements IAureliaModuleCompiler {

  static inject = ['IViewCompiler', 'IViewModelCompiler', 'IFileUtils'];

  readonly moduleRegistry: Record<string, IAureliaModule> = {};

  constructor(
    public viewCompiler: IViewCompiler,
    public viewModelCompiler: IViewModelCompiler,
    public fileUtils: IFileUtils
  ) {

  }

  // TODO: normalize file name before processing
  compile(fileName: string, content?: string, noRecompile?: boolean): IAureliaModule {
    let existing = this.moduleRegistry[fileName];
    if (noRecompile && existing) {
      return existing;
    }
    let compiledModule: IAureliaModule = this.parseFile(fileName, content);
    this.moduleRegistry[fileName] = compiledModule;
    return compiledModule;
  }

  private parseFile(fileName: string, content?: string) {
    let ext = (/\.(au|ts|js)$/.exec(fileName) || [])[1];
    if (!ext) {
      let auExist = this.fileUtils.existsSync(`${fileName}.au`);
      if (auExist) {
        fileName = fileName + '.au';
        ext = 'au';
      }
    }
    switch (ext) {
      case 'au': return this.parseAuFile(fileName, content = content || this.fileUtils.readFileSync(fileName));
      // case 'ts': return this.parseTsFile(fileName, content = content || fs.readFileSync(fileName, 'utf-8'));
      // case 'js': return this.parseJsFile(fileName, content = content || fs.readFileSync(fileName, 'utf-8'));
    }
    // TODO: support normal file
    throw new Error('normal file not supported');
  }

  private parseAuFile(fileName: string, content: string): IAureliaModule {
    const modules = DOM.parseHtml(content);
    let viewModule: Element | undefined;
    let viewModules: HTMLTemplateElement[] = [];
    let viewModelModule: Element | undefined;
    let styleModule: Element | undefined;
    for (let i = 0; i < modules.children.length; ++i) {
      let child = modules.children[i];
      if (child.tagName.toUpperCase() === 'TEMPLATE') {
        if (!viewModule) {
          viewModule = child;
        }
        viewModules.push(child as HTMLTemplateElement);
      } else if (child.tagName.toUpperCase() === 'SCRIPT') {
        if (!viewModelModule) {
          viewModelModule = child;
        }
      } else if (child.tagName.toUpperCase() === 'STYLE') {
        if (!styleModule) {
          styleModule = child;
        }
      }
    }
    if (!viewModules.length || !viewModelModule) {
      // TODO: support no view
      throw new Error('Invalid Aurelia file. Expect both view & view model.');
    }
    let $partialAureliaModule = this.viewModelCompiler.compile(fileName, viewModelModule.textContent || '');
    $partialAureliaModule.templates = viewModules;
    this.viewCompiler.compileWithModule(fileName, $partialAureliaModule);

    return $partialAureliaModule;
    // let templateFactory = this.viewCompiler.compile(fileName, viewModule, $viewModelModule);
    // let viewModelSource = viewModelModule.textContent;
    // this.generateViewModel(fileName, templateFactory, viewModelSource);
    // this.generate(fileName, templateFactory, $viewModelModule);
  }

  private normalizeFileName() {

  }

  parseTsFile(fileName: string, content: string) {

  }

  parseJsFile(fileName: string, content: string) {

  }

  fromJson(fileName: string): IAureliaModule {
    throw new Error('TODO: Not implemented');
  }

  emit(fileName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let $module = this.moduleRegistry[fileName];
      if (!$module) {
        return reject(new Error('Invalid module. Module does not exist'));
      }
      resolve(this.fileUtils.writeFile(`${fileName}.js`, $module.toString()).then(success => {
        console.log(`Emitted module ${fileName} ${success ? 'Successfully' : 'Unsuccessfully'}`);
        return success;
      }));
    });
  }

  emitAll() {
    console.log('Start emitting...');
    return Promise.all(Object.keys(this.moduleRegistry).map(this.emit, this)).then(successes => {
      console.log('Emitted all modules.');
    });
  }
}
