import { IFileUnitHost, IFileUnitHostAsync } from './options';
import { fileExists, fileExistsAsync, readFile, readFileAsync } from './file-exists';

export const nodeFileUnitHost: IFileUnitHost = {
  fileExists,
  readFile,
};

export const nodeFileUnitHostAsync: IFileUnitHostAsync = {
  fileExists: fileExistsAsync,
  readFile: readFileAsync,
};
