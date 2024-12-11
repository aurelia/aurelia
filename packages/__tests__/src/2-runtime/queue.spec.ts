import { assert, createFixture } from '@aurelia/testing';
import { nextTick } from '@aurelia/runtime';
import { bindable, CustomElement, customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'form-component',
  template: `
    <input ref="input" type="text" value.bind="value">
    <let text.bind="[\${value}]"></let>\${text}
  `
})
class FormComponent {
  input: HTMLInputElement;
}

@customElement({
  name: 'main-page',
  template: `
    <form-component></form-component>
  `,
  dependencies: [FormComponent]
})
class MainPage {

}

@customElement({
  name: 'app-root',
  template: `
    <main-page active.class="active"></main-page>
  `,
  dependencies: [MainPage]
})
class AppRoot {

}

describe('2-runtime/queue.spec.ts', function () {
  describe('AttributeBinding', function () {
    it('class binding should work', async function () {
      const { component, assertAttr } = createFixture(
        '<div active.class="active"></div>',
        class {
          active = false;
        }
      );

      assertAttr('div', 'class', null);

      component.active = true;

      assertAttr('div', 'class', null);
      await nextTick();
      assertAttr('div', 'class', 'active');

      component.active = false;

      assertAttr('div', 'class', 'active');
      await nextTick();
      assertAttr('div', 'class', null);
    });

    it('attr binding should work', async function () {
      const { component, assertAttr } = createFixture(
        '<div tag.attr="tag"></div>',
        class {
          tag = null;
        }
      );

      assertAttr('div', 'tag', null);

      component.tag = 'foo';

      assertAttr('div', 'tag', null);
      await nextTick();
      assertAttr('div', 'tag', 'foo');

      component.tag = 'foo';

      assertAttr('div', 'tag', 'foo');
      await nextTick();
      assertAttr('div', 'tag', null);
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
