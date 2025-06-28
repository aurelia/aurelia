import { createFixture, assert } from '@aurelia/testing';
import { bindable, BindingMode, CustomElement, customElement } from '@aurelia/runtime-html';

describe('3-runtime-html/custom-element-interpolation.spec.ts', function () {
  describe('Custom Element Interpolation', function () {
    it('renders a custom element instance in content binding', async function () {
      const CardCE = CustomElement.define({
        name: 'card',
        template: '<div class="card">Card Content</div>'
      }, class Card { });

      const { appHost, tearDown } = createFixture(
        '<div>${cardComponent}</div>',
        class App {
          cardComponent = CardCE;
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Card Content</div></card></div>');

      await tearDown();
    });

    it('renders a custom element with bindable properties', async function () {
      const CardCE = CustomElement.define({
        name: 'card',
        template: '<div class="card">${title}</div>',
        bindables: {
          title: { mode: BindingMode.toView }
        }
      }, class Card {
        title = 'Default Title';

        activate(model?: any) {
          if (model && model.title) {
            this.title = model.title;
          }
        }
      });

      const { appHost, tearDown } = createFixture(
        '<div>${cardComponent}</div>',
        class App {
          cardComponent = {
            component: CardCE,
            model: { title: 'Custom Title' }
          };
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Custom Title</div></card></div>');

      await tearDown();
    });

    it('updates when custom element instance changes', async function () {
      const Card1CE = CustomElement.define({
        name: 'card1',
        template: '<div class="card1">Card 1</div>'
      }, class Card1 { });

      const Card2CE = CustomElement.define({
        name: 'card2',
        template: '<div class="card2">Card 2</div>'
      }, class Card2 { });

      const { appHost, component, platform, tearDown } = createFixture(
        '<div>${currentCard}</div>',
        class App {
          currentCard: any = Card1CE;
        }
      );

      assert.html.innerEqual(appHost, '<div><card1><div class="card1">Card 1</div></card1></div>');

      component.currentCard = Card2CE;
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div><card2><div class="card2">Card 2</div></card2></div>');

      await tearDown();
    });

    it('handles null/undefined custom element gracefully', async function () {
      const CardCE = CustomElement.define({
        name: 'card',
        template: '<div class="card">Card Content</div>'
      }, class Card { });

      const { appHost, component, platform, tearDown } = createFixture(
        '<div>${cardComponent}</div>',
        class App {
          cardComponent: any = CardCE;
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Card Content</div></card></div>');

      component.cardComponent = null;
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div></div>');

      component.cardComponent = CardCE;
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div><card><div class="card">Card Content</div></card></div>');

      await tearDown();
    });

    it('renders custom element with activate lifecycle', async function () {
      let activateCallCount = 0;

      const CardCE = CustomElement.define({
        name: 'card',
        template: '<div class="card">${message}</div>'
      }, class Card {
        message = 'Initial';

        activate(model?: any) {
          activateCallCount++;
          if (model) {
            this.message = model.message;
          }
        }
      });

      const { appHost, tearDown } = createFixture(
        '<div>${cardComponent}</div>',
        class App {
          cardComponent = {
            component: CardCE,
            model: { message: 'Activated' }
          };
        }
      );

      assert.strictEqual(activateCallCount, 1);
      assert.html.innerEqual(appHost, '<div><card><div class="card">Activated</div></card></div>');

      await tearDown();
    });

    it('works with conditional rendering', async function () {
      const CardCE = CustomElement.define({
        name: 'card',
        template: '<div class="card">Card Content</div>'
      }, class Card { });

      const { appHost, component, platform, tearDown } = createFixture(
        '<div>${showCard ? cardComponent : ""}</div>',
        class App {
          showCard = true;
          cardComponent = CardCE;
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Card Content</div></card></div>');

      component.showCard = false;
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div></div>');

      component.showCard = true;
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div><card><div class="card">Card Content</div></card></div>');

      await tearDown();
    });

    it('renders multiple custom elements in interpolation', async function () {
      const HeaderCE = CustomElement.define({
        name: 'my-header',
        template: '<h1>Header</h1>'
      }, class Header { });

      const FooterCE = CustomElement.define({
        name: 'my-footer',
        template: '<footer>Footer</footer>'
      }, class Footer { });

      const { appHost, tearDown } = createFixture(
        '<div>${header} Content ${footer}</div>',
        class App {
          header = HeaderCE;
          footer = FooterCE;
        }
      );

      assert.html.innerEqual(
        appHost,
        '<div><my-header><h1>Header</h1></my-header> Content <my-footer><footer>Footer</footer></my-footer></div>'
      );

      await tearDown();
    });

    it('works with decorator-defined custom elements', async function () {
      @customElement({
        name: 'card',
        template: '<div class="card">${title}</div>'
      })
      class Card {
        @bindable({ mode: BindingMode.toView })
        title = 'Card Title';
      }

      const { appHost, tearDown } = createFixture(
        '<div>${cardComponent}</div>',
        class App {
          cardComponent = Card;
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Card Title</div></card></div>');

      await tearDown();
    });

    it('renders an instance of a custom element view model with modified properties', async function () {
      @customElement({
        name: 'card',
        template: '<div class="card">${title}</div>',
      })
      class Card {
        @bindable()
        title = 'Default Title';
      }

      const card = new Card();
      card.title = 'Modified Title';

      const { appHost, tearDown } = createFixture(
        '<div>${cardComponent}</div>',
        class App {
          cardComponent = card;
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Modified Title</div></card></div>');

      await tearDown();
    });

    it('updates when a property on a rendered custom element instance changes', async function () {
      @customElement({
        name: 'card',
        template: '<div class="card">${title}</div>',
      })
      class Card {
        @bindable()
        title = 'Default Title';
      }

      const card = new Card();

      const { appHost, platform, tearDown } = createFixture(
        '<div>${cardComponent}</div>',
        class App {
          cardComponent = card;
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Default Title</div></card></div>');

      card.title = 'Updated Title';
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div><card><div class="card">Updated Title</div></card></div>');

      await tearDown();
    });

    it('disposes previous custom element when value changes', async function () {
      let card1Disposed = false;
      let card2Disposed = false;

      const Card1CE = CustomElement.define({
        name: 'card1',
        template: '<div class="card1">Card 1</div>'
      }, class Card1 {
        dispose() {
          card1Disposed = true;
        }
      });

      const Card2CE = CustomElement.define({
        name: 'card2',
        template: '<div class="card2">Card 2</div>'
      }, class Card2 {
        dispose() {
          card2Disposed = true;
        }
      });

      const { appHost, component, platform, tearDown } = createFixture(
        '<div>${currentCard}</div>',
        class App {
          currentCard: any = Card1CE;
        }
      );

      assert.strictEqual(card1Disposed, false);
      assert.strictEqual(card2Disposed, false);

      component.currentCard = Card2CE;
      platform.domQueue.flush();

      assert.strictEqual(card1Disposed, true);
      assert.strictEqual(card2Disposed, false);

      await tearDown();

      assert.strictEqual(card2Disposed, true);
    });

    it('handles promise-based custom elements', async function () {
      const CardCE = CustomElement.define({
        name: 'card',
        template: '<div class="card">Async Card</div>'
      }, class Card { });

      const { appHost, startPromise, platform, tearDown } = createFixture(
        '<div>${getCard()}</div>',
        class App {
          async getCard() {
            await new Promise(resolve => setTimeout(resolve, 10));
            return CardCE;
          }
        }
      );

      await startPromise;

      // Wait for the promise to resolve and the DOM to update
      await new Promise(resolve => setTimeout(resolve, 20));
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div><card><div class="card">Async Card</div></card></div>');

      await tearDown();
    });

    it('works inside if.bind', async function () {
      const CardCE = CustomElement.define({
        name: 'card',
        template: '<div class="card">Card Content</div>'
      }, class Card { });

      const EmptyCE = CustomElement.define({
        name: 'empty-state',
        template: '<div class="empty">No Content</div>'
      }, class EmptyState { });

      const { appHost, component, platform, tearDown } = createFixture(
        '<div if.bind="hasContent">${cardComponent}</div><div else>${emptyComponent}</div>',
        class App {
          hasContent = true;
          cardComponent = CardCE;
          emptyComponent = EmptyCE;
        }
      );

      assert.html.innerEqual(appHost, '<div><card><div class="card">Card Content</div></card></div>');

      component.hasContent = false;
      platform.domQueue.flush();

      assert.html.innerEqual(appHost, '<div><empty-state><div class="empty">No Content</div></empty-state></div>');

      await tearDown();
    });

    it('works inside repeat.for', async function () {
      const ItemCE = CustomElement.define({
        name: 'list-item',
        template: '<li>${content}</li>',
        bindables: ['content']
      }, class ListItem {
        content = '';
        activate(model?: any) {
          if (model) {
            this.content = model.content;
          }
        }
      });

      const { appHost, tearDown } = createFixture(
        '<ul><template repeat.for="item of items">${item.component}</template></ul>',
        class App {
          items = [
            { component: ItemCE, model: { content: 'Item 1' } },
            { component: ItemCE, model: { content: 'Item 2' } },
            { component: ItemCE, model: { content: 'Item 3' } }
          ].map(item => ({
            component: {
              component: item.component,
              model: item.model
            }
          }));
        }
      );

      assert.html.innerEqual(
        appHost,
        '<ul><list-item><li>Item 1</li></list-item><list-item><li>Item 2</li></list-item><list-item><li>Item 3</li></list-item></ul>'
      );

      await tearDown();
    });

    it('works with components containing slots', async function () {
      const LayoutCE = CustomElement.define({
        name: 'layout-component',
        template: '<div class="layout"><header><au-slot name="header">Default Header</au-slot></header><main><au-slot>Default Content</au-slot></main></div>'
      }, class Layout { });

      const { appHost, tearDown } = createFixture(
        '<div>${layoutComponent}</div>',
        class App {
          layoutComponent = LayoutCE;
        }
      );

      assert.html.innerEqual(
        appHost,
        '<div><layout-component><div class="layout"><header>Default Header</header><main>Default Content</main></div></layout-component></div>'
      );

      await tearDown();
    });

    it('works with nested custom elements', async function () {
      const InnerCE = CustomElement.define({
        name: 'inner-component',
        template: '<span class="inner">${message}</span>',
        bindables: ['message']
      }, class Inner {
        message = 'Inner Default';
      });

      const OuterCE = CustomElement.define({
        name: 'outer-component',
        template: '<div class="outer"><h3>Outer Component</h3>${innerComponent}</div>'
      }, class Outer {
        innerComponent = {
          component: InnerCE,
          model: { message: 'Nested Message' }
        };
      });

      const { appHost, tearDown } = createFixture(
        '<div>${outerComponent}</div>',
        class App {
          outerComponent = OuterCE;
        }
      );

      assert.html.innerEqual(
        appHost,
        '<div><outer-component><div class="outer"><h3>Outer Component</h3><inner-component><span class="inner">Inner Default</span></inner-component></div></outer-component></div>'
      );

      await tearDown();
    });

    it('works with components with two-way bindables', async function () {
      const InputCE = CustomElement.define({
        name: 'custom-input',
        template: '<input value.bind="value" input.trigger="updateValue($event.target.value)">',
        bindables: {
          value: { mode: BindingMode.twoWay }
        }
      }, class CustomInput {
        value = '';

        updateValue(newValue: string) {
          this.value = newValue;
        }

        activate(model?: any) {
          if (model && model.value !== undefined) {
            this.value = model.value;
          }
        }
      });

      const { appHost, tearDown } = createFixture(
        '<div>${inputComponent}<span>Value: ${inputValue}</span></div>',
        class App {
          inputValue = 'Initial';
          inputComponent = {
            component: InputCE,
            model: { value: this.inputValue }
          };
        }
      );

      const input = appHost.querySelector('input') as HTMLInputElement;
      assert.strictEqual(input.value, 'Initial');
      assert.includes(appHost.textContent, 'Value: Initial');

      await tearDown();
    });

    it('handles complex conditional component selection', async function () {
      const LoginCE = CustomElement.define({
        name: 'login-form',
        template: '<form class="login">Login Form</form>'
      }, class Login { });

      const DashboardCE = CustomElement.define({
        name: 'user-dashboard',
        template: '<div class="dashboard">Dashboard</div>'
      }, class Dashboard { });

      const AdminCE = CustomElement.define({
        name: 'admin-panel',
        template: '<div class="admin">Admin Panel</div>'
      }, class Admin { });

      const { appHost, component, platform, tearDown } = createFixture(
        '<div>${currentView}</div>',
        class App {
          userRole: 'guest' | 'user' | 'admin' = 'guest';

          get currentView() {
            switch (this.userRole) {
              case 'admin': return AdminCE;
              case 'user': return DashboardCE;
              default: return LoginCE;
            }
          }
        }
      );

      assert.html.innerEqual(appHost, '<div><login-form><form class="login">Login Form</form></login-form></div>');

      component.userRole = 'user';
      platform.domQueue.flush();
      assert.html.innerEqual(appHost, '<div><user-dashboard><div class="dashboard">Dashboard</div></user-dashboard></div>');

      component.userRole = 'admin';
      platform.domQueue.flush();
      assert.html.innerEqual(appHost, '<div><admin-panel><div class="admin">Admin Panel</div></admin-panel></div>');

      await tearDown();
    });

    it('works with containerless custom elements', async function () {
      const ContainerlessCE = CustomElement.define({
        name: 'containerless-component',
        template: '<span>First</span><span>Second</span>',
        containerless: true
      }, class Containerless { });

      const { appHost, tearDown } = createFixture(
        '<div>${component}</div>',
        class App {
          component = ContainerlessCE;
        }
      );

      assert.html.innerEqual(appHost, '<div><span>First</span><span>Second</span></div>');

      await tearDown();
    });

    it('works with shadow DOM components using native slots', async function () {
      const ShadowCardCE = CustomElement.define({
        name: 'shadow-card',
        template: '<div class="card"><h3><slot name="header">Default Header</slot></h3><div class="content"><slot>Default Content</slot></div></div>',
        shadowOptions: { mode: 'open' }
      }, class ShadowCard { });

      const { appHost, tearDown } = createFixture(
        '<div>${shadowComponent}</div>',
        class App {
          shadowComponent = ShadowCardCE;
        }
      );

      // With Shadow DOM, the template content will be in the shadow root
      const shadowCard = appHost.querySelector('shadow-card') as HTMLElement;
      assert.notStrictEqual(shadowCard, null);

      const shadowRoot = shadowCard.shadowRoot;
      assert.notStrictEqual(shadowRoot, null);

      // Check the shadow DOM content
      assert.html.innerEqual(
        shadowRoot,
        '<div class="card"><h3><slot name="header">Default Header</slot></h3><div class="content"><slot>Default Content</slot></div></div>'
      );

      await tearDown();
    });

    it('works with shadow DOM components with content projection', async function () {
      // Parent component that will provide slotted content
      const ParentCE = CustomElement.define({
        name: 'parent-component',
        template: '<shadow-layout><span slot="title">Custom Title</span><p>This is the main content</p></shadow-layout>'
      }, class Parent { });

      // Shadow DOM component with slots
      const ShadowLayoutCE = CustomElement.define({
        name: 'shadow-layout',
        template: '<header><slot name="title">Default Title</slot></header><main><slot>Default Content</slot></main>',
        shadowOptions: { mode: 'open' }
      }, class ShadowLayout { });

      // Register the shadow layout component so it can be used in the parent template
      const { appHost, startPromise, tearDown } = createFixture(
        '<div>${parentComponent}</div>',
        class App {
          parentComponent = ParentCE;
        },
        [ShadowLayoutCE]
      );

      await startPromise;

      const parentEl = appHost.querySelector('parent-component') as HTMLElement;
      assert.notStrictEqual(parentEl, null);

      const shadowLayout = parentEl.querySelector('shadow-layout') as HTMLElement;
      assert.notStrictEqual(shadowLayout, null);

      const shadowRoot = shadowLayout.shadowRoot;
      assert.notStrictEqual(shadowRoot, null);

      // Check shadow DOM structure
      const header = shadowRoot.querySelector('header');
      const main = shadowRoot.querySelector('main');
      assert.notStrictEqual(header, null);
      assert.notStrictEqual(main, null);

      // Check that slots are rendered (the actual content projection happens via browser's native slot mechanism)
      const titleSlot = header.querySelector('slot[name="title"]') as HTMLSlotElement;
      const contentSlot = main.querySelector('slot:not([name])') as HTMLSlotElement;
      assert.notStrictEqual(titleSlot, null);
      assert.notStrictEqual(contentSlot, null);

      await tearDown();
    });

    it('handles mixed shadow DOM and non-shadow DOM components', async function () {
      const RegularCardCE = CustomElement.define({
        name: 'regular-card',
        template: '<div class="regular">Regular Card</div>'
      }, class RegularCard { });

      const ShadowCardCE = CustomElement.define({
        name: 'shadow-card',
        template: '<div class="shadow">Shadow Card</div>',
        shadowOptions: { mode: 'open' }
      }, class ShadowCard { });

      const { appHost, component, platform, tearDown } = createFixture(
        '<div>${currentCard}</div>',
        class App {
          useShadow = false;
          get currentCard() {
            return this.useShadow ? ShadowCardCE : RegularCardCE;
          }
        }
      );

      // First render regular card
      assert.html.innerEqual(appHost, '<div><regular-card><div class="regular">Regular Card</div></regular-card></div>');

      // Switch to shadow card
      component.useShadow = true;
      platform.domQueue.flush();

      const shadowCard = appHost.querySelector('shadow-card') as HTMLElement;
      assert.notStrictEqual(shadowCard, null);
      assert.notStrictEqual(shadowCard.shadowRoot, null);
      assert.html.innerEqual(shadowCard.shadowRoot, '<div class="shadow">Shadow Card</div>');

      // Switch back to regular card
      component.useShadow = false;
      platform.domQueue.flush();
      assert.html.innerEqual(appHost, '<div><regular-card><div class="regular">Regular Card</div></regular-card></div>');

      await tearDown();
    });
  });
});
