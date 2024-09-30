/* eslint-disable @typescript-eslint/no-unused-vars */

import Aurelia from '.';

function testAureliaApp() {
  void Aurelia.app({ host: document.body, component: class { } }).start();
  void Aurelia.enhance({ host: document.body, component: class { } });
}
