import { IPlatform, resolve } from '@aurelia/kernel';
import { BrowserStorage } from './storage-browser';

/**
 * A simple browser session storage based storage implementation for cache interceptor
 */
export class BrowserSessionStorage extends BrowserStorage {
  constructor(){
    super(resolve(IPlatform).globalThis.sessionStorage);
  }
}
