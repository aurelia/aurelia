/* eslint-disable @typescript-eslint/no-unused-vars */

import Aurelia, { CustomElement } from '.';

type AssertPromise<T extends Promise<void>> = T;
type _StaticAppStartReturnsPromise = AssertPromise<ReturnType<ReturnType<typeof Aurelia.app>['start']>>;

function testAureliaApp() {
  const App = CustomElement.define({ name: 'app', template: '' }, class {});

  void Aurelia.app({ host: document.body, component: class { } }).start();
  void Aurelia.app(App).start().then(() => undefined);
  void Aurelia.app(App).start().then((au) => {
    const value: void = au;
    return value;
  });
  void Aurelia.enhance({ host: document.body, component: class { } });
}
