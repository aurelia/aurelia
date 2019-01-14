import { PLATFORM, Registration } from '@aurelia/kernel';
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';
import { IExpressionParserRegistration } from '../../jit/src';
import {
  AccessScope,
  CallBindingInstruction,
  CallScope,
  FromViewBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  IDOM,
  InterpolationBinding,
  IPropertyBindingInstruction,
  IRenderable,
  IRenderContext,
  IRenderer,
  IRenderingEngine,
  LetBindingInstruction,
  LetElementInstruction,
  OneTimeBindingInstruction,
  RefBindingInstruction,
  SetPropertyInstruction,
  TargetedInstructionType,
  ToViewBindingInstruction,
  TwoWayBindingInstruction
} from '../src/index';
import { AuDOMConfiguration, AuNode } from './au-dom';
import { _ } from './util';

describe('Renderer', () => {
  function setup() {
    const container = AuDOMConfiguration.createContainer();
    IExpressionParserRegistration.register(container as any);
    const dom = container.get(IDOM);
    const renderable: IRenderable = { $bindableHead: null, $bindableTail: null, $attachableHead: null, $attachableTail: null, $context: null, $nodes: null, $scope: null };
    container.register(Registration.instance(IRenderable, renderable));
    const target = AuNode.createMarker();

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

    return { sut, renderable, dom, target, renderContext, renderingEngine };
  }

  describe('handles IPropertyBindingInstruction', () => {
    for (const Instruction of [OneTimeBindingInstruction, ToViewBindingInstruction, FromViewBindingInstruction, TwoWayBindingInstruction] as any[]) {
      for (const to of ['foo', 'bar']) {
        for (const from of ['foo', new AccessScope('foo')]) {
          const instruction = new Instruction(from, to) as IPropertyBindingInstruction;
          it(_`instruction=${instruction}`, () => {
            const { sut, dom, renderable, target, renderContext } = setup();

            sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

            expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
            expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
            const bindable = renderable.$bindableHead as InterpolationBinding;
            expect(bindable.target).to.equal(target);
            expect(bindable.sourceExpression['name']).to.equal('foo');
            expect(bindable.mode).to.equal(instruction.mode);
            expect(bindable.targetProperty).to.equal(to);
          });
        }
      }
    }
  });

  describe('handles ICallBindingInstruction', () => {
    for (const to of ['foo', 'bar']) {
      for (const from of ['foo()', new CallScope('foo', [])] as any[]) {
        const instruction = new CallBindingInstruction(from, to) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, dom, renderable, target, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

          expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
          expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
          const bindable = renderable.$bindableHead as InterpolationBinding;
          expect(bindable.targetObserver['obj']).to.equal(target);
          expect(bindable.targetObserver['propertyKey']).to.equal(to);
          expect(bindable.sourceExpression['name']).to.equal('foo');
        });
      }
    }
  });

  describe('handles IRefBindingInstruction', () => {
    for (const from of ['foo', new AccessScope('foo')] as any[]) {
      const instruction = new RefBindingInstruction(from) as any;
      it(_`instruction=${instruction}`, () => {
        const { sut, dom, renderable, target, renderContext } = setup();

        sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

        expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
        expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
        const bindable = renderable.$bindableHead as InterpolationBinding;
        expect(bindable.target).to.equal(target);
        expect(bindable.sourceExpression['name']).to.equal('foo');
      });
    }
  });

  describe('handles ISetPropertyInstruction', () => {
    for (const to of ['foo', 'bar']) {
      for (const value of ['foo', 42, {}] as any[]) {
        const instruction = new SetPropertyInstruction(value, to) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, dom, renderable, target, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

          expect(renderable.$bindableHead).to.equal(null, 'renderable.$bindableHead');
          expect(target[to]).to.equal(value);
        });
      }
    }
  });

  describe('handles IHydrateElementInstruction', () => {
    for (const res of ['foo', 'bar']) {
      for (const instructions of [[], [{type: TargetedInstructionType.setProperty}, {type: TargetedInstructionType.setProperty}]] as any[]) {
        const instruction = new HydrateElementInstruction(res, instructions) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, dom, renderable, target, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

          expect(renderContext.beginComponentOperation).to.have.been.calledWith(renderable, target, instruction, null, null, target, true);
          expect(renderContext.get).to.have.been.calledWith(`custom-element:${res}`);
          const operation = (renderContext.beginComponentOperation as SinonSpy).getCalls()[0].returnValue;
          expect(operation.dispose).to.have.been.called;
        });
      }
    }
  });

  describe('handles IHydrateAttributeInstruction', () => {
    for (const res of ['if', 'else', 'repeat']) {
      for (const instructions of [[], [new SetPropertyInstruction('bar', 'foo')]] as any[]) {
        const instruction = new HydrateAttributeInstruction(res, instructions) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, dom, renderable, target, renderContext, renderingEngine } = setup();

          sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

          expect(renderContext.beginComponentOperation).to.have.been.calledWith(renderable, target, instruction);
          expect(renderContext.get).to.have.been.calledWith(`custom-attribute:${res}`);
          const component = (renderContext.get as SinonSpy).getCalls()[0].returnValue;
          expect(component.$hydrate).to.have.been.calledWith(renderingEngine);
          if (instructions.length) {
            expect(component.foo).to.equal('bar');
          }
          expect(renderable.$bindableHead).to.equal(component);
          expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
          expect(renderable.$attachableHead).to.equal(component);
          expect(renderable.$attachableHead).to.equal(renderable.$attachableTail);
        });
      }
    }
  });

  describe('<let/>', () => {

    describe('ILetElementInstruction', () => {
      for (const to of ['processedFoo', 'processedPoo']) {
        for (const value of ['foo', new AccessScope('foo')] as any[]) {
          const instruction = new LetElementInstruction(
            [new LetBindingInstruction(value, to)],
            // tslint:disable-next-line:insecure-random
            Math.random() > 0.4
          ) as any;
          it(_`instruction=${instruction}`, () => {
            const { sut, dom, renderable, target, renderContext } = setup();

            sut.instructionRenderers[instruction.type].render(dom, renderContext, renderable, target, instruction);

            expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
            expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
          });
        }
      }
    });
  });
});
