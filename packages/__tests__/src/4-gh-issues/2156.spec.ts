import { assert, createFixture } from '@aurelia/testing';

describe('4-gh-issues/2156.spec.ts', function () {
  it('should not compose when deactivated', function () {
    const logs = [];
    const { component, assertText } = createFixture(
      `<el if.bind="show">`,
      class App {
        show = true;
      },
      [class El2 {
        static $au = {
          type: 'custom-element',
          name: 'el2',
          template: 'Hi, el2 here'
        };

        activate(model) {
          logs.push(model);
        }
      }, class El {
        static $au = {
          type: 'custom-element',
          name: 'el',
          template: '<au-compose model.bind="obj.model" component.bind="obj.component"></au-compose>'
        };

        obj = {
          model: 'test',
          component: 'el2'
        };

        unbinding() {
          this.obj = null;
        }
      }]
    );

    assertText('Hi, el2 here');
    assert.deepStrictEqual(logs, ['test']);
    logs.length = 0;

    component.show = false;
    assert.deepStrictEqual(logs, []);
  });
});
