import { runTasks } from '@aurelia/runtime';
import { createFixture } from '@aurelia/testing';
describe('4-gh-issues/2163.spec.ts', function () {
    it('should not throw when unbind a ref binding before other bindings', async function () {
        var _a;
        const { getBy, assertText, trigger } = createFixture(`
        <div if.bind="message">
          <el prop.bind="el"></el>
        </div>
        <div else>
          else
        </div>
        <input type="checkbox" checked.bind="message">
      `, { message: 'hi', el: undefined }, [(_a = class El {
                },
                _a.$au = {
                    type: 'custom-element',
                    name: 'el',
                    template: '<div ref="prop"></div>',
                    bindables: [{ name: 'prop', mode: 'fromView' }]
                },
                _a)]);
        getBy('input').checked = false;
        trigger('input', 'change');
        runTasks();
        assertText('else', { compact: true });
    });
});
//# sourceMappingURL=2163.spec.js.map