import { HistoryBrowser } from '@aurelia/router';
import { DI } from '@aurelia/kernel';
import { ILifecycle } from '@aurelia/runtime';

describe('HistoryBrowser', function () {
  it('can be created', function () {
    new HistoryBrowser(DI.createContainer().get(ILifecycle));
  });
});
