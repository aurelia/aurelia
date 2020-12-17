import { BrowserPlatform } from '@aurelia/platform-browser';
import { $setup } from './setup-shared.js';

const platform = new BrowserPlatform(window);
$setup(platform);

console.log(`Browser test context initialized`);
