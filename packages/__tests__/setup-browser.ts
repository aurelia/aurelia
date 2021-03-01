declare const sourceMapSupport: { install(): void };
if (typeof sourceMapSupport !== 'undefined') {
  sourceMapSupport.install();
}

import { BrowserPlatform } from '@aurelia/platform-browser';
import { $setup } from './setup-shared.js';

const platform = new BrowserPlatform(window);
$setup(platform);

console.log(`Browser test context initialized`);
