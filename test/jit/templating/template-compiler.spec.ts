import { ITwoWayBindingInstruction, TargetedInstructionType } from './../../../src/runtime/templating/instructions';
import { IExpressionParser } from '../../../src/runtime/binding/expression-parser';
import { TemplateCompiler } from '../../../src/jit/templating/template-compiler';
import { ITemplateCompiler } from '../../../src/runtime/templating/template-compiler';
import { DI } from '../../../src/kernel/di';
import { register } from '../../../src/jit/binding/expression-parser';
import { IObserverLocator } from '../../../src/runtime/binding/observer-locator';
import { TemplateDefinition } from '../../../src/runtime/templating/instructions';
import { IResourceDescriptions } from '../../../src/runtime/resource';
import { expect } from 'chai';

describe('TemplateCompiler', () => {
  let sut: ITemplateCompiler;

  beforeEach(() => {
    const c = DI.createContainer();
    register(c);

    sut = new TemplateCompiler(c.get(IExpressionParser), c.get(IObserverLocator), c);
  });

  it('works', () => {
    const template = `<input value.bind="inputValue">`;
    const definition = { template } as TemplateDefinition;
    const resources = {} as IResourceDescriptions;
    sut.compile(definition, resources);
    const instruction = definition.instructions[0][0] as ITwoWayBindingInstruction;
    
    expect(instruction.dest).to.equal('value');
    expect(instruction.src).to.equal('inputValue');
    expect(instruction.type).to.equal(TargetedInstructionType.twoWayBinding);
  });

});
