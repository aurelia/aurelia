import { parseAttributeName, AttributeName, BindingType } from '@aurelia/jit';
import { RuntimeContext } from '@aurelia/jit';
import { expect } from 'chai';

describe('parseAttributeName', () => {
  const ctx = new RuntimeContext();
  ctx.registeredAttributes.push('foo');
  ctx.registeredCommands.push('foo');

  const existingCommands = ['one-time', 'to-view', 'from-view', 'two-way', 'bind', 'trigger', 'capture', 'delegate', 'call', 'options', 'for', 'foo'];
  const existingTargets = ['foo', 'ref'];
  const nonExistingCommands = ['bar', 'ref', 'call ', ' call', 'bind.bind'];
  const nonExistingTargets = ['bar', 'for', 'ref ', ' ref'];

  for (const existingTarget of existingTargets) {
    for (const existingCommand of existingCommands) {
      const name = `${existingTarget}.${existingCommand}`;
      it(name, () => {
        const actual = parseAttributeName(name, ctx);
        expect(actual.name).to.equal(existingTarget);
        expect(actual.command).to.equal(existingCommand);
        expect(actual.bindingType & BindingType.IsCommand).to.equal(BindingType.IsCommand);
      });
    }

    for (const nonExistingCommand of nonExistingCommands) {
      const name = `${existingTarget}.${nonExistingCommand}`;
      it(name, () => {
        const actual = parseAttributeName(name, ctx);
        expect(actual.name).to.equal(name);
        expect(actual.bindingType).to.equal(BindingType.UnknownCommand);
      });
    }

    it(`existingTarget=${existingTarget}`, () => {
      const actual = parseAttributeName(existingTarget, ctx);
      expect(actual.name).to.equal(existingTarget);
      expect(actual.bindingType & BindingType.IsCustom).to.equal(BindingType.IsCustom);
    });
  }

  for (const nonExistingTarget of nonExistingTargets) {
    for (const existingCommand of existingCommands) {
      const name = `${nonExistingTarget}.${existingCommand}`;
      it(name, () => {
        const actual = parseAttributeName(name, ctx);
        expect(actual.name).to.equal(nonExistingTarget);
        expect(actual.command).to.equal(existingCommand);
        expect(actual.bindingType & BindingType.IsCommand).to.equal(BindingType.IsCommand);
      });
    }

    for (const nonExistingCommand of nonExistingCommands) {
      const name = `${nonExistingTarget}.${nonExistingCommand}`;
      it(name, () => {
        const actual = parseAttributeName(name, ctx);
        expect(actual.name).to.equal(name);
        expect(actual.bindingType).to.equal(BindingType.UnknownCommand);
      });
    }

    it(`nonExistingTarget=${nonExistingTarget}`, () => {
      const actual = parseAttributeName(nonExistingTarget, ctx);
      expect(actual.name).to.equal(nonExistingTarget);
      expect(actual.bindingType).to.equal(BindingType.IsPlain);
    });
  }
});

export class AttributeBindingCommand {
  constructor(public name: string, public command: string, public expression: any) {}
}

function createElement(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper.firstElementChild as HTMLElement;
}
