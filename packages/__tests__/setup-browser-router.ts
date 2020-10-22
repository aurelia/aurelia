import { $setup } from './setup-shared';

$setup(window);

console.log(`Browser router test context initialized`);

const testContext = require.context('.', true, /router\/[^_][^_].*?\.spec\.js$/i);
testContext.keys().forEach(testContext);
