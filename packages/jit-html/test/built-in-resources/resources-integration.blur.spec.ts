import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { BlurCustomAttribute } from '@aurelia/runtime-html';
import { expect } from 'chai';
import { spy } from 'sinon';
import { TestContext } from '../util';

describe.only('built-in-resources.blur', function() {
  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, dom } = ctx;
    const au = new Aurelia(container);
    const host = dom.createElement('div');

    return { dom, au, host, lifecycle };
  }

  it('01.', function() {
    const { dom, au, host, lifecycle } = setup();

    const useSpy = spy(BlurCustomAttribute, 'use');

    const App = CustomElementResource.define(
      {
        name: 'app',
        template: `
          <template>
            <div blur.from-view="isBlur"></div>
          </template>`,
        dependencies: [BlurCustomAttribute]
      },
      class {
        public isBlur = true;
        public selectedValue = '2';
      }
    );
    const component = new App();

    au.app({ host, component });
    au.start();

    dom.dispatchEvent(dom.createCustomEvent('mousedown', { bubbles: true }));

    expect(useSpy).to.have.callCount(1);
    expect(component['isBlur']).to.equal(false, 'component.isBlur');

    useSpy.restore();
  });
});