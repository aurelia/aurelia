import {
  initializeBrowserTestContext,
  initializeChaiExtensions,
} from '@aurelia/testing';

initializeBrowserTestContext();
initializeChaiExtensions();

const testContext = require.context('.', true, /\.spec/);
testContext.keys().forEach(testContext);
