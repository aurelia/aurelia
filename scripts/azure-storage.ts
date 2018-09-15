import * as s from 'azure-storage';
const storage = <typeof import('azure-storage')>(<any>(<any>s).default || s);
import { createLogger, c } from './logger';

const log = createLogger('azure-storage');

// note: this script assumes a valid AZURE_STORAGE_CONNECTION_STRING env variable to be present

export async function createContainer(containerName: string): Promise<any> {
  const blobService = storage.createBlobService();

  return new Promise((resolve, reject) => {
    blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
      if (err) {
        log.error(`${c.redBright('failed:')} ${err.message}`);
        reject(err);
      } else {
        const url = blobService.getUrl(containerName);
        log.error(`${c.greenBright(`Container '${containerName}' available at ${url}`)}`);
        resolve();
      }
    });
  });
}

export async function uploadFile(containerName: string, blobName: string, sourceFilePath: string): Promise<any> {
  const blobService = storage.createBlobService();

  return new Promise((resolve, reject) => {
    blobService.createBlockBlobFromLocalFile(containerName, blobName, sourceFilePath, err => {
      if (err) {
        log.error(`${c.redBright('failed:')} ${err.message}`);
        reject(err);
      } else {
        const url = blobService.getUrl(containerName, blobName);
        log.error(`${c.greenBright(`File available at ${url}`)}`);
        resolve();
      }
    });
  });
}
