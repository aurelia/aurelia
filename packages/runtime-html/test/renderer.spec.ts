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
  IRenderingEngine
} from '@aurelia/runtime';
import { expect } from 'chai';
import { spy } from 'sinon';
import { IExpressionParserRegistration } from '../../jit/src/index';
import {
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  IListenerBindingInstruction,
  Listener,
  SetAttributeInstruction,
  StylePropertyBindingInstruction,
  TextBindingInstruction,
  TriggerBindingInstruction
} from '../src/index';
import { _, TestContext } from './util';

describe('Renderer', () => {
  function setup() {
    const ctx = TestContext.createHTMLTestContext();
    const { dom, container } = ctx;
    IExpressionParserRegistration.register(container);
    const renderable: IRenderable = { $bindableHead: null, $bindableTail: null, $attachableHead: null, $attachableTail: null, $context: null, $nodes: null, $scope: null };
    container.register(Registration.instance(IRenderable, renderable));
    const wrapper = ctx.createElementFromMarkup('<div><au-target class="au"></au-target> </div>') as HTMLElement;
    dom.appendChild(ctx.doc.body, wrapper);
    const target = wrapper.firstElementChild as HTMLElement;
    const placeholder = target.nextSibling as HTMLElement;

    const renderingEngine = container.get(IRenderingEngine) as IRenderingEngine;
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

  describe('handles ITextBindingInstruction', () => {
    for (const from of ['${foo}', new Interpolation(['', ''], [new AccessScope('foo')])] as any[]) {
      const instruction = new TextBindingInstruction(from) as any;
      it(_`instruction=${instruction}`, () => {
        const { ctx, sut, dom, renderable, target, placeholder, wrapper, renderContext } = setup();

        sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

        expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
        expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
        const bindable = renderable.$bindableHead as InterpolationBinding;
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

  describe('handles IListenerBindingInstruction', () => {
    for (const Instruction of [TriggerBindingInstruction, DelegateBindingInstruction, CaptureBindingInstruction] as any[]) {
      for (const to of ['foo', 'bar']) {
        for (const from of ['foo', new AccessScope('foo')]) {
          const instruction = new (Instruction as any)(from, to) as IListenerBindingInstruction;
          it(_`instruction=${instruction}`, () => {
            const { ctx, sut, dom, renderable, target, wrapper, renderContext } = setup();

            sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

            expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
            expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
            const bindable = renderable.$bindableHead as Listener;
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

  describe('handles IStyleBindingInstruction', () => {
    for (const to of ['foo', 'bar']) {
      for (const from of ['foo', new AccessScope('foo')] as any[]) {
        const instruction = new StylePropertyBindingInstruction(from, to) as any;
        it(_`instruction=${instruction}`, () => {
          const { ctx, sut, dom, renderable, target, wrapper, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

          expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
          expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
          const bindable = renderable.$bindableHead as InterpolationBinding;
          expect(bindable.target).to.equal(target.style);
          expect(bindable.sourceExpression['name']).to.equal('foo');
          expect(bindable.mode).to.equal(BindingMode.toView);
          expect(bindable.targetProperty).to.equal(to);

          tearDown({ ctx, wrapper });
        });
      }
    }
  });

  describe('handles ISetAttributeInstruction', () => {
    for (const to of ['id', 'accesskey', 'slot', 'tabindex']) {
      for (const value of ['foo', 42, null] as any[]) {
        const instruction = new SetAttributeInstruction(value, to) as any;
        it(_`instruction=${instruction}`, () => {
          const { ctx, sut, dom, renderable, target, wrapper, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

          expect(renderable.$bindableHead).to.equal(null, 'renderable.$bindableHead');
          expect(target.getAttribute(to)).to.equal(value + '');

          tearDown({ ctx, wrapper });
        });
      }
    }
  });
});
