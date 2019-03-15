import { PLATFORM, Registration } from '@aurelia/kernel';
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';
import { IExpressionParserRegistration } from '@aurelia/jit';
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
  LifecycleFlags as LF,
  OneTimeBindingInstruction,
  RefBindingInstruction,
  SetPropertyInstruction,
  TargetedInstructionType,
  ToViewBindingInstruction,
  TwoWayBindingInstruction
} from '@aurelia/runtime';
import { AuDOMConfiguration, AuNode } from './au-dom';
import { _ } from '../util';

describe('Renderer', function () {
  function setup() {
    const container = AuDOMConfiguration.createContainer();
    IExpressionParserRegistration.register(container as any);
    const dom = container.get(IDOM);
    const renderable: IRenderable = {
      $bindingHead: null,
      $bindingTail: null,
      $componentHead: null,
      $componentTail: null,
      $context: null,
      $nodes: null,
      $scope: null
    };
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

  describe('handles IPropertyBindingInstruction', function () {
    for (const Instruction of [OneTimeBindingInstruction, ToViewBindingInstruction, FromViewBindingInstruction, TwoWayBindingInstruction] as any[]) {
      for (const to of ['foo', 'bar']) {
        for (const from of ['foo', new AccessScope('foo')]) {
          const instruction = new Instruction(from, to) as IPropertyBindingInstruction;
          it(_`instruction=${instruction}`, function () {
            const { sut, dom, renderable, target, renderContext } = setup();

            sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

            expect(renderable.$componentHead).to.equal(null);
            expect(renderable.$componentTail).to.equal(null);
            expect(renderable.$bindingHead).to.be.a('object', 'renderable.$componentHead');
            expect(renderable.$bindingHead).to.equal(renderable.$bindingTail);
            const bindable = renderable.$bindingHead as InterpolationBinding;
            expect(bindable.target).to.equal(target);
            expect(bindable.sourceExpression['name']).to.equal('foo');
            expect(bindable.mode).to.equal(instruction.mode);
            expect(bindable.targetProperty).to.equal(to);
          });
        }
      }
    }
  });

  describe('handles ICallBindingInstruction', function () {
    for (const to of ['foo', 'bar']) {
      for (const from of ['foo()', new CallScope('foo', [])] as any[]) {
        const instruction = new CallBindingInstruction(from, to) as any;
        it(_`instruction=${instruction}`, function () {
          const { sut, dom, renderable, target, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

          expect(renderable.$componentHead).to.equal(null);
          expect(renderable.$componentTail).to.equal(null);
          expect(renderable.$bindingHead).to.be.a('object', 'renderable.$componentHead');
          expect(renderable.$bindingHead).to.equal(renderable.$bindingTail);
          const bindable = renderable.$bindingHead as InterpolationBinding;
          expect(bindable.targetObserver['obj']).to.equal(target);
          expect(bindable.targetObserver['propertyKey']).to.equal(to);
          expect(bindable.sourceExpression['name']).to.equal('foo');
        });
      }
    }
  });

  describe('handles IRefBindingInstruction', function () {
    for (const from of ['foo', new AccessScope('foo')] as any[]) {
      const instruction = new RefBindingInstruction(from) as any;
      it(_`instruction=${instruction}`, function () {
        const { sut, dom, renderable, target, renderContext } = setup();

        sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

        expect(renderable.$componentHead).to.equal(null);
        expect(renderable.$componentTail).to.equal(null);
        expect(renderable.$bindingHead).to.be.a('object', 'renderable.$componentHead');
        expect(renderable.$bindingHead).to.equal(renderable.$bindingTail);
        const bindable = renderable.$bindingHead as InterpolationBinding;
        expect(bindable.target).to.equal(target);
        expect(bindable.sourceExpression['name']).to.equal('foo');
      });
    }
  });

  describe('handles ISetPropertyInstruction', function () {
    for (const to of ['foo', 'bar']) {
      for (const value of ['foo', 42, {}] as any[]) {
        const instruction = new SetPropertyInstruction(value, to) as any;
        it(_`instruction=${instruction}`, function () {
          const { sut, dom, renderable, target, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

          expect(renderable.$componentHead).to.equal(null);
          expect(renderable.$componentTail).to.equal(null);
          expect(renderable.$bindingHead).to.equal(null);
          expect(renderable.$bindingTail).to.equal(null);
          expect(target[to]).to.equal(value);
        });
      }
    }
  });

  describe('handles IHydrateElementInstruction', function () {
    for (const res of ['foo', 'bar']) {
      for (const instructions of [[], [{type: TargetedInstructionType.setProperty}, {type: TargetedInstructionType.setProperty}]] as any[]) {
        const instruction = new HydrateElementInstruction(res, instructions) as any;
        it(_`instruction=${instruction}`, function () {
          const { sut, dom, renderable, target, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

          expect(renderContext.beginComponentOperation).to.have.been.calledWith(renderable, target, instruction, null, null, target, true);
          expect(renderContext.get).to.have.been.calledWith(`custom-element:${res}`);
          const operation = (renderContext.beginComponentOperation as SinonSpy).getCalls()[0].returnValue;
          expect(operation.dispose).to.have.been.called;
        });
      }
    }
  });

  describe('handles IHydrateAttributeInstruction', function () {
    for (const res of ['if', 'else', 'repeat']) {
      for (const instructions of [[], [new SetPropertyInstruction('bar', 'foo')]] as any[]) {
        const instruction = new HydrateAttributeInstruction(res, instructions) as any;
        it(_`instruction=${instruction}`, function () {
          const { sut, dom, renderable, target, renderContext } = setup();

          sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

          expect(renderContext.beginComponentOperation).to.have.been.calledWith(renderable, target, instruction);
          expect(renderContext.get).to.have.been.calledWith(`custom-attribute:${res}`);
          const component = (renderContext.get as SinonSpy).getCalls()[0].returnValue;
          expect(component.$hydrate).to.have.been.calledWith(LF.none, renderContext);
          if (instructions.length) {
            expect(component.foo).to.equal('bar');
          }
          expect(renderable.$bindingHead).to.equal(null);
          expect(renderable.$bindingTail).to.equal(null);
          expect(renderable.$componentHead).to.equal(component);
          expect(renderable.$componentHead).to.equal(renderable.$componentTail);
          expect(renderable.$componentHead).to.equal(component);
          expect(renderable.$componentHead).to.equal(renderable.$componentTail);
        });
      }
    }
  });

  describe('<let/>', function () {

    describe('ILetElementInstruction', function () {
      for (const to of ['processedFoo', 'processedPoo']) {
        for (const value of ['foo', new AccessScope('foo')] as any[]) {
          const instruction = new LetElementInstruction(
            [new LetBindingInstruction(value, to)],
            // tslint:disable-next-line:insecure-random
            Math.random() > 0.4
          ) as any;
          it(_`instruction=${instruction}`, function () {
            const { sut, dom, renderable, target, renderContext } = setup();

            sut.instructionRenderers[instruction.type].render(LF.none, dom, renderContext, renderable, target, instruction);

            expect(renderable.$bindingHead).to.be.a('object', 'renderable.$componentHead');
            expect(renderable.$bindingHead).to.equal(renderable.$bindingTail);
            expect(renderable.$componentHead).to.equal(null);
            expect(renderable.$componentTail).to.equal(null);
          });
        }
      }
    });
  });
});
