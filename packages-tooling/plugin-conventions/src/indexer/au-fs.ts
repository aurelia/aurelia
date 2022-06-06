import { FileType, IAuFileSystem, IAuProject, IFile, IFileGroup } from './resource-indexer';
import * as fs from 'fs';
import { basename, dirname, extname } from 'path';
import { ResourceDefinition } from './resource';

export class AuFileSystem implements IAuFileSystem {

  public constructor(private readonly _fs: typeof fs) {}

  public createProject(basePath: string): IAuProject {
    const stat = this._fs.statSync(basePath);
    if (stat.isFile()) {
      return new AuProject(basePath, this.findRelatedFiles(basePath));
    }

    return new AuProject(basePath, this.getFiles(basePath));
  }

  public findRelatedFiles(basePath: string): IFile[] {
    const baseFileName = basename(basePath);
    const ext = extname(baseFileName);
    const bareBaseFileName = baseFileName.replace(new RegExp(`${ext}$`), '');
    return this.getFiles(basePath).filter(f => basename(f.path).startsWith(bareBaseFileName));
  }

  private getFiles(basePath: string): IFile[] {
    const stat = this._fs.statSync(basePath);
    const dir = stat.isFile() ? dirname(basePath) : basePath;
    return this._fs.readdirSync(dir).map(filePath => ({
      path: filePath,
      ext: extname(filePath),
      type: this.fileType(filePath),
    }));
  }

  public fileType(baseName: string): FileType {
    switch (extname(baseName)) {
      case '.js':
      case '.ts':
        return 'code';
      case '.html':
        return baseName.endsWith('.view.html') ? 'view' : 'template';
      case '.css':
        return 'styles';
      default:
        return 'unknown';
    }
  }

  public findPair(): IFile {
    throw new Error('Method not implemented.');
  }

  public getResources(): ResourceDefinition[] {
    throw new Error('Method not implemented.');
  }
}

class AuProject implements IAuProject {
  public constructor(
    public readonly basePath: string,
    public readonly files: IFile[],
  ) {}

  public findRelated(file: IFile): IFileGroup {
    throw new Error('Method not implemented.');
  }

  public getResources(): ResourceDefinition[] {
    throw new Error('Method not implemented.');
  }
}

class FileGroup implements IFileGroup {
  public constructor(
    public code?: IFile,
    public template?: IFile,
    public styles?: IFile,
    public view?: IFile,
  ) {
  }
}

// class File implements IFile {
//   public constructor(
//     public readonly path: string,
//     public readonly ext: string,
//     public readonly type: 'code' | 'template' | 'styles' | 'unknown',
//   ) {
//   }
// }
