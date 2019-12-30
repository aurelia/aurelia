import { DebugConfiguration } from '@aurelia/debug';
import { join } from 'path';
import { TestRunner } from './test-runner';

(async function () {
  DebugConfiguration.register();

  const runner = TestRunner.create();
  await runner.runOnce({
    entryFile: join(__dirname, '..', '..', '..', '__tests__', 'setup-au.ts'),
    scratchDir: join(__dirname, '..', '..', '__dist'),
  });

})().catch(err => {
  console.error(err);
  process.exit(1);
});
