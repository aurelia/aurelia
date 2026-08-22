import { IFileUnitHost } from './options';
import { fileExists, readFile } from './file-exists';

export const nodeFileUnitHost: IFileUnitHost = {
  fileExists,
  readFile,
};
