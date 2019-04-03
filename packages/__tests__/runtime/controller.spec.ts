import {
  Controller,
  LifecycleFlags,
  ViewFactory,
  ITemplateFactory,
  createRenderContext,
  buildTemplateDefinition,
  Scope,
  BindingContext,
  Interpolation,
  AccessScope,
} from '@aurelia/runtime';
import {
  TextBindingInstruction,
} from '@aurelia/runtime-html';
import {
  TestContext,
  assert,
  h,
} from '@aurelia/testing';


describe('controller', function () {

  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, dom } = ctx;
    const templateFactory = container.get(ITemplateFactory);
    const renderContext = createRenderContext(dom, container, null);
    const $loc = h('div');
    const host = h('div', null, $loc);
    const loc = dom.convertToRenderLocation($loc);

    return {
      ctx,
      container,
      lifecycle,
      dom,
      templateFactory,
      renderContext,
      host,
      loc,
    };
  }

  describe('forSyntheticView()', function () {
    for (const viewCache of [null, void 0]) {
      it(`throws if viewCache is ${viewCache}`, function () {
        const {
          lifecycle,
        } = setup();

        assert.throws(
          () => {
            Controller.forSyntheticView(
              viewCache,
              lifecycle,
              LifecycleFlags.none,
            );
          },
        );
      });
    }

    it(`correctly initializes`, function () {
      const {
        lifecycle,
        templateFactory,
        renderContext,
        host,
        loc,
      } = setup();

      const flags = LifecycleFlags.none;

      const viewFactory = new ViewFactory(
        'test',
        templateFactory.create(
          renderContext,
          buildTemplateDefinition(
            null,
            {
              name: 'test',
              template: h('div', null, h('au-m', { class: 'au' }), ''),
              instructions: [[new TextBindingInstruction(new Interpolation(['', ''], [new AccessScope('msg')]))]]
            }
          )
        ),
        lifecycle,
      );

      const sut = viewFactory.create(flags);
      const bindingContext = BindingContext.create(flags, { msg: 'hi' });
      const scope = Scope.create(flags, bindingContext);

      sut.hold(loc);

      sut.bind(flags, scope);
      sut.attach(flags);

      lifecycle.processRAFQueue(flags);

      assert.equal(host.textContent, 'hi');
    });
  });
});
