import { IPlatform, resolve } from '@aurelia/kernel';
import { BrowserStorage } from './storage-browser';

/**
 * A simple browser local storage based storage implementation for cache interceptor
 */
export class BrowserLocalStorage extends BrowserStorage {
    public constructor(){
      super(resolve(IPlatform).globalThis.localStorage);
    }
}
