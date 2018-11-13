import {
  Renderer,
  TargetedInstructionType,
  AccessScope,
  IExpressionParser,
  IRenderable,
  DOM,
  IRenderContext,
  IObserverLocator,
  IEventManager,
  IRenderingEngine,
  ITextBindingInstruction,
  Binding,
  BindingMode,
  IPropertyBindingInstruction,
  IExpression,
  ITargetedInstruction,
  DelegationStrategy,
  Listener,
  IListenerBindingInstruction,
  ICallBindingInstruction,
  Call,
  CallScope,
  Ref,
  Interpolation,
  InterpolationBinding,
  CallBindingInstruction,
  CaptureBindingInstruction,
  DelegateBindingInstruction,
  FromViewBindingInstruction,
  HydrateAttributeInstruction,
  HydrateElementInstruction,
  OneTimeBindingInstruction,
  RefBindingInstruction,
  SetAttributeInstruction,
  SetPropertyInstruction,
  StylePropertyBindingInstruction,
  TextBindingInstruction,
  ToViewBindingInstruction,
  TriggerBindingInstruction,
  TwoWayBindingInstruction,
  LetBindingInstruction,
  LetElementInstruction
} from '../../../src/index';
import { expect } from 'chai';
import { _, createElement } from '../util';
import {
  ParserRegistration
} from '../../../../jit/src/index';
import { DI } from '../../../../kernel/src/index';
import { spy, SinonSpy } from 'sinon';

describe('Renderer', () => {
  function setup() {
    const container = DI.createContainer();
    ParserRegistration.register(container);
    const parser = <IExpressionParser>container.get(IExpressionParser);
    const renderable = <IRenderable>{ $bindablesHead: null, $bindableTail: null, $attachableHead: null, $attachableTail: null };
    const wrapper = <HTMLElement>createElement('<div><au-target class="au"></au-target> </div>');
    document.body.appendChild(wrapper);
    const target = <HTMLElement>wrapper.firstElementChild;
    const placeholder = <HTMLElement>target.nextSibling;

    const renderContext = <IRenderContext>{
      get(key) {
        return { $hydrate: spy(), key }
      },
      beginComponentOperation(renderable, target, instruction, factory, parts, location, locationIsContainer) {
        return <any>{
          dispose: spy()
        }
      }
    };
    spy(renderContext, 'get');
    spy(renderContext, 'beginComponentOperation');
    const observerLocator = <IObserverLocator>container.get(IObserverLocator);
    const eventManager = <IEventManager>container.get(IEventManager);
    const renderingEngine = <IRenderingEngine>container.get(IRenderingEngine);

    const sut = new Renderer(renderContext, observerLocator, eventManager, parser, renderingEngine);

    return { sut, renderable, target, placeholder, wrapper, renderContext, renderingEngine };
  }

  function tearDown({ wrapper }: Partial<ReturnType<typeof setup>>) {
    document.body.removeChild(wrapper);
  }

  describe('handles ITextBindingInstruction', () => {
    for (const from of ['${foo}', new Interpolation(['', ''], [new AccessScope('foo')])] as any[]) {
      const instruction = new TextBindingInstruction(from) as any;
      it(_`instruction=${instruction}`, () => {
        const { sut, renderable, target, placeholder, wrapper } = setup();

        sut[instruction.type](renderable, target, instruction);

        expect(placeholder['auInterpolationTarget']).to.be.true;
        expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
        expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
        const bindable = <InterpolationBinding>renderable.$bindableHead;
        expect(bindable.target).to.equal(placeholder);
        expect(bindable.interpolation['expressions'][0]['name']).to.equal('foo');
        expect(bindable.interpolation['parts'][0]).to.equal('');
        expect(bindable.interpolation['parts'][1]).to.equal('');
        expect(bindable.mode).to.equal(BindingMode.toView);
        expect(target.isConnected).to.be.false;

        tearDown({ wrapper });
      });
    }
  });

  describe('handles IPropertyBindingInstruction', () => {
    for (const Instruction of [OneTimeBindingInstruction, ToViewBindingInstruction, FromViewBindingInstruction, TwoWayBindingInstruction] as any[]) {
      for (const to of ['foo', 'bar']) {
        for (const from of ['foo', new AccessScope('foo')]) {
          const instruction = <IPropertyBindingInstruction>new (<any>Instruction)(from, to);
          it(_`instruction=${instruction}`, () => {
            const { sut, renderable, target, wrapper } = setup();

            sut[instruction.type](renderable, target, instruction);

            expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
            expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
            const bindable = <InterpolationBinding>renderable.$bindableHead;
            expect(bindable.target).to.equal(target);
            expect(bindable.sourceExpression['name']).to.equal('foo');
            expect(bindable.mode).to.equal(instruction.mode);
            expect(bindable.targetProperty).to.equal(to);

            tearDown({ wrapper });
          });
        }
      }
    }
  });

  describe('handles IListenerBindingInstruction', () => {
    for (const Instruction of [TriggerBindingInstruction, DelegateBindingInstruction, CaptureBindingInstruction] as any[]) {
      for (const to of ['foo', 'bar']) {
        for (const from of ['foo', new AccessScope('foo')]) {
          const instruction = <IListenerBindingInstruction>new (<any>Instruction)(from, to);
          it(_`instruction=${instruction}`, () => {
            const { sut, renderable, target, wrapper } = setup();

            sut[instruction.type](renderable, target, instruction);

            expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
            expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
            const bindable = <InterpolationBinding>renderable.$bindableHead;
            expect(bindable.target).to.equal(target);
            expect(bindable.sourceExpression['name']).to.equal('foo');
            expect(bindable.delegationStrategy).to.equal(instruction.strategy);
            expect(bindable.targetEvent).to.equal(to);
            expect(bindable.preventDefault).to.equal(instruction.strategy === DelegationStrategy.none);

            tearDown({ wrapper });
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
          const { sut, renderable, target, wrapper } = setup();

          sut[instruction.type](renderable, target, instruction);

          expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
          expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
          const bindable = <InterpolationBinding>renderable.$bindableHead;
          expect(bindable.targetObserver['obj']).to.equal(target);
          expect(bindable.targetObserver['propertyKey']).to.equal(to);
          expect(bindable.sourceExpression['name']).to.equal('foo');

          tearDown({ wrapper });
        });
      }
    }
  });

  describe('handles IRefBindingInstruction', () => {
    for (const from of ['foo', new AccessScope('foo')] as any[]) {
      const instruction = new RefBindingInstruction(from) as any;
      it(_`instruction=${instruction}`, () => {
        const { sut, renderable, target, wrapper } = setup();

        sut[instruction.type](renderable, target, instruction);

        expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
        expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
        const bindable = <InterpolationBinding>renderable.$bindableHead;
        expect(bindable.target).to.equal(target);
        expect(bindable.sourceExpression['name']).to.equal('foo');

        tearDown({ wrapper });
      });
    }
  });

  describe('handles IStyleBindingInstruction', () => {
    for (const to of ['foo', 'bar']) {
      for (const from of ['foo', new AccessScope('foo')] as any[]) {
        const instruction = new StylePropertyBindingInstruction(from, to) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, renderable, target, wrapper } = setup();

          sut[instruction.type](renderable, target, instruction);

          expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
          expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
          const bindable = <InterpolationBinding>renderable.$bindableHead;
          expect(bindable.target).to.equal(target.style);
          expect(bindable.sourceExpression['name']).to.equal('foo');
          expect(bindable.mode).to.equal(BindingMode.toView);
          expect(bindable.targetProperty).to.equal(to);

          tearDown({ wrapper });
        });
      }
    }
  });

  describe('handles ISetPropertyInstruction', () => {
    for (const to of ['foo', 'bar']) {
      for (const value of ['foo', 42, {}] as any[]) {
        const instruction = new SetPropertyInstruction(value, to) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, renderable, target, wrapper } = setup();

          sut[instruction.type](renderable, target, instruction);

          expect(renderable.$bindableHead).to.equal(undefined, 'renderable.$bindableHead');
          expect(target[to]).to.equal(value);

          tearDown({ wrapper });
        });
      }
    }
  });

  describe('handles ISetAttributeInstruction', () => {
    for (const to of ['id', 'accesskey', 'slot', 'tabindex']) {
      for (const value of ['foo', 42, null] as any[]) {
        const instruction = new SetAttributeInstruction(value, to) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, renderable, target, wrapper } = setup();

          sut[instruction.type](renderable, target, instruction);

          expect(renderable.$bindableHead).to.equal(undefined, 'renderable.$bindableHead');
          expect(target.getAttribute(to)).to.equal(value + '');

          tearDown({ wrapper });
        });
      }
    }
  });

  describe('handles IHydrateElementInstruction', () => {
    for (const res of ['foo', 'bar']) {
      for (const instructions of [[], [,]] as any[]) {
        const instruction = new HydrateElementInstruction(res, instructions) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, renderable, target, wrapper, renderContext } = setup();
          sut.hydrateElementInstance = spy();

          sut[instruction.type](renderable, target, instruction);

          expect(renderContext.beginComponentOperation).to.have.been.calledWith(renderable, target, instruction, null, null, target, true);
          expect(renderContext.get).to.have.been.calledWith(`custom-element:${res}`);
          const component = (<SinonSpy>renderContext.get).getCalls()[0].returnValue;
          expect(sut.hydrateElementInstance).to.have.been.calledWith(renderable, target, instruction, component);
          const operation = (<SinonSpy>renderContext.beginComponentOperation).getCalls()[0].returnValue;
          expect(operation.dispose).to.have.been.called;

          tearDown({ wrapper });
        });
      }
    }
  });

  describe('handles IHydrateAttributeInstruction', () => {
    for (const res of ['if', 'else', 'repeat']) {
      for (const instructions of [[], [new SetPropertyInstruction('bar', 'foo')]] as any[]) {
        const instruction = new HydrateAttributeInstruction(res, instructions) as any;
        it(_`instruction=${instruction}`, () => {
          const { sut, renderable, target, wrapper, renderContext, renderingEngine } = setup();

          sut[instruction.type](renderable, target, instruction);

          expect(renderContext.beginComponentOperation).to.have.been.calledWith(renderable, target, instruction);
          expect(renderContext.get).to.have.been.calledWith(`custom-attribute:${res}`);
          const component = (<SinonSpy>renderContext.get).getCalls()[0].returnValue;
          expect(component.$hydrate).to.have.been.calledWith(renderingEngine);
          if (instructions.length) {
            expect(component.foo).to.equal('bar');
          }
          expect(renderable.$bindableHead).to.equal(component);
          expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
          expect(renderable.$attachableHead).to.equal(component);
          expect(renderable.$attachableHead).to.equal(renderable.$attachableTail);

          tearDown({ wrapper });
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
            Math.random() > .4
          ) as any;
          it(_`instruction=${instruction}`, () => {
            const { sut, renderable, target, wrapper } = setup();

            sut[instruction.type](renderable, target, instruction);

            expect(renderable.$bindableHead).to.be.a('object', 'renderable.$bindableHead');
            expect(renderable.$bindableHead).to.equal(renderable.$bindableTail);
            const bindable = <InterpolationBinding>renderable.$bindableHead;

            expect(document.contains(target)).to.be.false;

            tearDown({ wrapper });
          });
        }
      }
    });
  });
});
