import { CustomElementResource } from '@aurelia/runtime';
import { Viewport } from '@aurelia/router';

const define = (CustomElementResource as any).define;

describe('Viewport', function () {
  it('can be created', function () {
    const sut = new Viewport(null, null, null, null, null, null);
  });
});
