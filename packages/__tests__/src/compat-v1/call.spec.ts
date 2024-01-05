import { compatRegistration } from '@aurelia/compat-v1';
import { bindable, customElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('compat-v1/call.spec.ts', function () {

  it('works with function call binding', async function () {
    @customElement({ name: 'my-ce', template: '<button click.trigger="action()"></button>' })
    class MyCe {
      @bindable public action: () => void;
    }

    const { stop, appHost, component } = createFixture(
      '<my-ce action.call="doSomething()"></my-ce>',
      class App {
        public callCount = 0;
        public doSomething() {
          this.callCount++;
        }
      },
      [MyCe, compatRegistration]
    );

    assert.strictEqual(component.callCount, 0);

    const button = appHost.querySelector('button') as HTMLButtonElement;
    button.click();

    assert.strictEqual(component.callCount, 1);

    await stop();
  });
});
