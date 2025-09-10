import {
  CustomElement
} from '@aurelia/runtime-html';
import { createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.syntax.spec.ts', function () {
  it('keeps underscore in the middle of attribute names', async function () {
    const { assertText } = createFixture(
      `<my-el my_prop.bind="message">`,
      class App {
        message = 'Hello Aurelia 2!';
      },
      [
        CustomElement.define({
          name: 'my-el',
          template: '${my_prop}',
          bindables: ['my_prop']
        })
      ],
    );

    assertText('Hello Aurelia 2!');
  });

  it('keeps trailing underscore of attribute names', async function () {
    const { assertText } = createFixture(
      `<my-el _my_prop_.bind="message">`,
      class App {
        message = 'Hello Aurelia 2!';
      },
      [
        CustomElement.define({
          name: 'my-el',
          template: '${_my_prop_}',
          bindables: ['_my_prop_']
        })
      ],
    );

    assertText('Hello Aurelia 2!');
  });
});
