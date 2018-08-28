import { Aurelia, PLATFORM, TaskQueue } from 'aurelia-framework';
import { Instrumenter } from './instrumenter';
declare var instrumenter: Instrumenter;

instrumenter.markLifecycle('module-loaded');

export async function configure(au: Aurelia): Promise<void> {
  const tq = au.container.get(TaskQueue);
  instrumenter.taskQueue = tq;

  instrumenter.markLifecycle('au-created');

  au.use.defaultBindingLanguage().defaultResources();

  instrumenter.markLifecycle('au-configured');

  await au.start();

  const host = document.querySelector('[aurelia-app]');

  await au.setRoot(PLATFORM.moduleName('dist/app'), host);

  instrumenter.markLifecycle('au-started');
}
