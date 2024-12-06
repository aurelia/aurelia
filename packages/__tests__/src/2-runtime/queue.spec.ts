import { assert, createFixture } from '@aurelia/testing';
import { nextTick } from '@aurelia/runtime';
import { bindable, CustomElement, customElement } from '@aurelia/runtime-html';

describe('2-runtime/queue.spec.ts', function () {
  describe('AttributeBinding', function () {
    it('should work', async function () {
      const { component, assertClassStrict } = createFixture(
        '<div active.class="active"></div>',
        class {
          active = false;
        }
      );

      assertClassStrict('div');

      component.active = true;

      assertClassStrict('div');
      await nextTick();
      assertClassStrict('div', 'active');

      component.active = false;

      assertClassStrict('div', 'active');
      await nextTick();
      assertClassStrict('div');
    });
  });

  describe('ContentBinding', function () {
    it('should work', async function () {
      const { component, assertText } = createFixture(
        '<div>${text}</div>',
        class {
          text = '';
        }
      );

      assertText('');

      component.text = 'foo';

      assertText('');
      await nextTick();
      assertText('foo');

      component.text = '';

      assertText('foo');
      await nextTick();
      assertText('');
    });
  });

  describe('InterpolationBinding', function () {
    it('should work', async function () {
      const { component, assertAttr } = createFixture(
        '<div name="${name}"></div>',
        class {
          name = '';
        }
      );

      assertAttr('div', 'name', null);

      component.name = 'foo';

      assertAttr('div', 'name', null);
      await nextTick();
      // not working for some reason
      assertAttr('div', 'name', 'foo');

      component.name = '';

      assertAttr('div', 'name', 'foo');
      await nextTick();
      assertAttr('div', 'name', null);
    });
  });

  describe('LetBinding', function () {
    it('should work', async function () {
      const { component, assertText } = createFixture(
        '<let text.bind="value"></let>${text}',
        class {
          value = '';
        }
      );

      assertText('');

      component.value = 'foo';

      assertText('');
      await nextTick();
      assertText('foo');

      component.value = '';

      assertText('foo');
      await nextTick();
      assertText('');
    });
  });

  describe('ListenerBinding', function () {
    it('should work', async function () {

    });
  });

  describe('PropertyBinding', function () {
    it('simple toView should work', async function () {
      @customElement({
        name: 'child-component',
        template: `<div>\${value}</div>`
      })
      class ChildComponent {
        @bindable value = '';
      }

      const { component, assertText, appHost } = createFixture(
        '<child-component value.bind="value"></child-component>',
        class { value = ''; },
        [ChildComponent],
      );
      const childComponent = CustomElement.for<ChildComponent>(appHost.querySelector('my-component')).viewModel;

      assert.strictEqual(childComponent.value, '');
      assertText('');

      component.value = 'foo';

      assert.strictEqual(childComponent.value, '');
      assertText('');
      await nextTick();
      assert.strictEqual(childComponent.value, 'foo');
      assertText('foo');

      component.value = '';

      assert.strictEqual(childComponent.value, 'foo');
      assertText('foo');
      await nextTick();
      assert.strictEqual(childComponent.value, '');
      assertText('');
    });
  });

  describe('RefBinding', function () {
    it('should work', async function () {
      @customElement({
        name: 'child-component',
        template: `<div></div>`
      })
      class ChildComponent {}

      const { component } = createFixture(
        '<child-component ref="child"></child-component>',
        class {
          child: ChildComponent | null = null;
        },
        [ChildComponent],
      );

      assert.notEqual(component.child, null);
    });
  });

  describe('SpreadBinding', function () {
    it('should work', async function () {

    });
  });
});
