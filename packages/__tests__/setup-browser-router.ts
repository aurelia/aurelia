import { BrowserPlatform } from '@aurelia/platform-browser';
import { $setup } from './setup-shared.js';

const platform = new BrowserPlatform(window);
$setup(platform);

console.log(`Browser router test context initialized`);

const testContext = require.context('.', true, /router\/.[^_].*?\.spec\.js$/i);

// const testContext = require.context('.', true, /router\/.*hook-tests-3.*?\.spec\.js$/i);
// const testContext = require.context('.', true, /router\/.*rules.*?\.spec\.js$/i);
// const testContext = require.context('.', true, /router\/router.*?\.spec\.js$/i);
// const testContext = require.context('.', true, /router\/__route.*?\.spec\.js$/i);
testContext.keys().forEach(testContext);
