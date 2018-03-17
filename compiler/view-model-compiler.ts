import {
  IAureliaModule,
  IViewModelCompiler,
  IFileUtils,
} from "./interfaces";


import { ResourceModule } from './aurelia-module';

export class ViewModelCompiler implements IViewModelCompiler {

  static inject = ['IFileUtils'];

  constructor(
    public fileUtils: IFileUtils
  ) {

  }

  compile(fileName: string, content?: string): IAureliaModule {
    return new ResourceModule(fileName, content, this.fileUtils);
  }
}
