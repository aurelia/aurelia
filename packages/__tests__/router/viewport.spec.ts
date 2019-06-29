import { CustomElement } from '@aurelia/runtime';
import { Viewport } from '@aurelia/router';

const define = (CustomElement as any).define;

describe('Viewport', function () {
  it('can be created', function () {
    const sut = new Viewport(null, null, null, null, null, null);
  });
});
