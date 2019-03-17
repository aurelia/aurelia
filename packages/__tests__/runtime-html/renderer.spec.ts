import { PLATFORM, Registration } from '@aurelia/kernel';
import {
  AccessScope,
  BindingMode,
  DelegationStrategy,
  Interpolation,
  InterpolationBinding,
  IRenderable,
  IRenderContext,
  IRenderer,
  IRenderingEngine,
  LifecycleFlags as LF
} from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import { IExpressionParserRegistration } from '@aurelia/jit';
import {
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  IListenerBindingInstruction,
  Listener,
  SetAttributeInstruction,
  StylePropertyBindingInstruction,
  TextBindingInstruction,
  TriggerBindingInstruction
} from '@aurelia/runtime-html';
import { _, TestContext } from '@aurelia/testing';

describe('Renderer', function () {
  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { dom, container } = ctx;
    IExpressionParserRegistration.register(container);
    const renderable: IRenderable = { $bindingHead: null, $bindingTail: null, $componentHead: null, $componentTail: null, $context: null, $nodes: null, $scope: null };
    container.register(Registration.instance(IRenderable, renderable));
    const wrapper = ctx.createElementFromMarkup('<div><au-target class="au"></au-target> </div>');
    dom.appendChild(ctx.doc.body, wrapper);
    const target = wrapper.firstElementChild as HTMLElement;
    const placeholder = target.nextSibling as HTMLElement;

    const renderingEngine = container.get(IRenderingEngine);
    const sut = container.get(IRenderer);

    const renderContext: IRenderContext = {
      get(key) {
        return key === IRenderer ? sut : { $hydrate: spy(), key } as any;
      },
      beginComponentOperation() {
        return {
          dispose: spy()
        } as any;
      },
      createChild: PLATFORM.noop as any,
      render: PLATFORM.noop,
      has: PLATFORM.noop as any,
      getAll: PLATFORM.noop as any
    };
    spy(renderContext, 'get');
    spy(renderContext, 'beginComponentOperation');

    return { ctx, sut, dom, renderable, target, placeholder, wrapper, renderContext, renderingEngine };
  }

  function tearDown({ ctx, wrapper }: Partial<ReturnType<typeof setup>>) {
    ctx.doc.body.removeChild(wrapper);
  }

  describe('handles ITextBindingInstruction', function () {
    for (const from of ['${foo}', new Interpolation(['', ''], [new AccessScope('foo')])] as any[]) {
      const instruction = new TextBindingInstruction(from) as any;
      it(_`instruction=${instruction}`, function () {
        const { ctx, sut, dom, renderable, target, placeholder, wrapper, renderContext } = setup();

        sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

        expect(renderable.$componentHead).to.equal(null);
        expect(renderable.$componentTail).to.equal(null);
        expect(renderable.$bindingHead).to.be.a('object', 'renderable.$componentHead');
        expect(renderable.$bindingHead).to.equal(renderable.$bindingTail);
        const bindable = renderable.$bindingHead as InterpolationBinding;
        expect(bindable.target).to.equal(placeholder);
        expect(bindable.interpolation['expressions'][0]['name']).to.equal('foo');
        expect(bindable.interpolation['parts'][0]).to.equal('');
        expect(bindable.interpolation['parts'][1]).to.equal('');
        expect(bindable.mode).to.equal(BindingMode.toView);
        //expect(target.isConnected).to.equal(false);

        tearDown({ ctx, wrapper });
      });
    }
  });

  describe('handles IListenerBindingInstruction', function () {
    for (const Instruction of [TriggerBindingInstruction, DelegateBindingInstruction, CaptureBindingInstruction] as any[]) {
      for (const to of ['foo', 'bar']) {
        for (const from of ['foo', new AccessScope('foo')]) {
          const instruction = new (Instruction)(from, to) as IListenerBindingInstruction;
          it(_`instruction=${instruction}`, function () {
            const { ctx, sut, dom, renderable, target, wrapper, renderContext } = setup();

            sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

            expect(renderable.$componentHead).to.equal(null);
            expect(renderable.$componentTail).to.equal(null);
            expect(renderable.$bindingHead).to.be.a('object', 'renderable.$componentHead');
            expect(renderable.$bindingHead).to.equal(renderable.$bindingTail);
            const bindable = renderable.$bindingHead as Listener;
            expect(bindable.target).to.equal(target);
            expect(bindable.sourceExpression['name']).to.equal('foo');
            expect(bindable.delegationStrategy).to.equal(instruction.strategy);
            expect(bindable.targetEvent).to.equal(to);
            expect(bindable.preventDefault).to.equal(instruction.strategy === DelegationStrategy.none);

            tearDown({ ctx, wrapper });
          });
        }
      }
    }
  });

  describe('handles IStyleBindingInstruction', function () {
    for (const to of ['foo', 'bar']) {
      for (const from of ['foo', new AccessScope('foo')] as any[]) {
        const instruction = new StylePropertyBindingInstruction(from, to) as any;
        it(_`instruction=${instruction}`, function () {
          const { ctx, sut, dom, renderable, target, wrapper, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

          expect(renderable.$componentHead).to.equal(null);
          expect(renderable.$componentTail).to.equal(null);
          expect(renderable.$bindingHead).to.be.a('object', 'renderable.$componentHead');
          expect(renderable.$bindingHead).to.equal(renderable.$bindingTail);
          const bindable = renderable.$bindingHead as InterpolationBinding;
          expect(bindable.target).to.equal(target.style);
          expect(bindable.sourceExpression['name']).to.equal('foo');
          expect(bindable.mode).to.equal(BindingMode.toView);
          expect(bindable.targetProperty).to.equal(to);

          tearDown({ ctx, wrapper });
        });
      }
    }
  });

  describe('handles ISetAttributeInstruction', function () {
    for (const to of ['id', 'accesskey', 'slot', 'tabindex']) {
      for (const value of ['foo', 42, null] as any[]) {
        const instruction = new SetAttributeInstruction(value, to) as any;
        it(_`instruction=${instruction}`, function () {
          const { ctx, sut, dom, renderable, target, wrapper, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

          expect(renderable.$componentHead).to.equal(null);
          expect(renderable.$componentTail).to.equal(null);
          expect(renderable.$bindingHead).to.equal(null);
          expect(renderable.$bindingTail).to.equal(null);
          expect(target.getAttribute(to)).to.equal(`${value}`);

          tearDown({ ctx, wrapper });
        });
      }
    }
  });
});
