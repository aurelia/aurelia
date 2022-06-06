import { ResourceDefinition } from './resource';

export class ResourceIndexer {
  public constructor(
    public fs: IAuFileSystem
  ) {

  }

  public index(path: string): object {
    return { path };
  }
}

export interface IAuFileSystem {
  createProject(basePath: string): IAuProject;
  findRelatedFiles(basePath: string): IFile[];
  fileType(nme: string): FileType;
}

export type FileType = 'code' | 'view' | 'template' | 'styles' | 'unknown';

export interface IAuProject {
  readonly basePath: string;
  readonly files: IFile[];

  findRelated(file: IFile): IFileGroup;
  getResources(): ResourceDefinition[];
}

export interface IFileGroup {
  code?: IFile;
  template?: IFile;
  styles?: IFile;
  view?: IFile;
}

export interface IFile {
  path: string;
  readonly ext: string;
  readonly type: FileType;
}
