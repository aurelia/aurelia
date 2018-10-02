import { ParserRegistration, AttributeSymbol, bindingCommand, IBindingCommand, BasicConfiguration } from "../../src";
import {
  IExpressionParser, INode, TargetedInstructionType, BindingType, IRenderable,
  IRenderStrategyInstruction, renderStrategy, IRenderStrategy, Aurelia,
  IChangeSet, CustomElementResource, IEventManager, Listener, IExpression,
  DelegationStrategy, AttributeDefinition, ElementDefinition, TargetedInstruction
} from "../../../runtime/src";
import { IIndexable, DI, IContainer, IServiceLocator, inject } from "../../../kernel/src";
import { expect } from "chai";
import { spy } from "sinon";



@bindingCommand('keyup')
@inject(IExpressionParser)
export class KeyupBindingCommand implements IBindingCommand {
  constructor(private parser: IExpressionParser) {}

  public compile($attr: AttributeSymbol): any {
    return {
      type: TargetedInstructionType.renderStrategy,
      expr: this.parser.parse($attr.rawValue, BindingType.TriggerCommand),
      keys: $attr.target.split('+'),
      name: 'keyup'
    };
  }

  public handles($attr: AttributeSymbol): boolean {
    return true;
  }
}

@renderStrategy('keyup')
@inject(IContainer, IEventManager)
export class KeyupRenderStrategy implements IRenderStrategy {
  constructor(private context: IContainer, private eventManager: IEventManager) {}

  public render(renderable: IRenderable, target: any, instruction: IRenderStrategyInstruction & IIndexable): void {
    const binding = new KeyupListener(instruction.keys, instruction.expr, target, this.eventManager, this.context);
    renderable.$bindables.push(binding);
  }
}

export class KeyupListener extends Listener {
  private altKey: boolean;
  private ctrlKey: boolean;
  private shiftKey: boolean;
  private key: string;

  constructor(keys: string[], sourceExpression: IExpression, target: INode, eventManager: IEventManager, locator: IServiceLocator) {
    super('keyup', DelegationStrategy.none, sourceExpression, target, true, eventManager, locator);
    keys = keys.map(k => k.toLowerCase());
    this.altKey = keys.includes('alt');
    this.ctrlKey = keys.includes('ctrl');
    this.shiftKey = keys.includes('shift');
    this.key = keys.find(k => k.length === 1);
  }

  public handleEvent(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (this.key === key) {
      if (this.altKey === event.altKey && this.ctrlKey === event.ctrlKey && this.shiftKey === event.shiftKey) {
        this.callSource(event);
      }
    }
  }
}

const globalResources: any[] = [
  KeyupBindingCommand,
  KeyupRenderStrategy
]

const TestConfiguration = {
  register(container: IContainer) {
    container.register(...globalResources);
  }
}

function createCustomElement(markup: string, ...dependencies: Function[]): { [key: string]: any } {
  return new (CustomElementResource.define({
    name: 'app',
    dependencies: [...dependencies],
    templateOrNode: markup,
    build: { required: true, compiler: 'default' },
    instructions: [],
    surrogates: []
  }, class App { }))();
}


describe('bindingCommand', () => {
  let au: Aurelia;
  let host: HTMLElement;
  let component: ReturnType<typeof createCustomElement>;

  beforeEach(() => {
    const container = DI.createContainer();
    container.register(ParserRegistration);
    host = document.createElement('app');
    document.body.appendChild(host);
    au = new Aurelia(container).register(TestConfiguration, BasicConfiguration);
  });

  it(`keyup listens for ctrl+v, receives ctrl+v, calls source`, () => {
    component = createCustomElement(`<template><div ctrl+v.keyup="paste()"></div.</template>`);
    au.app({ host, component }).start();
    component.paste = spy();
    const event = new KeyboardEvent('keyup', { ctrlKey: true, key: 'V' });
    host.firstElementChild.dispatchEvent(event);
    expect(component.paste).to.have.been.called;
  });

  it(`keyup listens for ctrl+v, receives alt+v, does not call source`, () => {
    component = createCustomElement(`<template><div ctrl+v.keyup="paste()"></div.</template>`);
    au.app({ host, component }).start();
    component.paste = spy();
    const event = new KeyboardEvent('keyup', { altKey: true, key: 'V' });
    host.firstElementChild.dispatchEvent(event);
    expect(component.paste).not.to.have.been.called;
  });

  it(`keyup listens for ctrl+v, receives ctrl+z, does not call source`, () => {
    component = createCustomElement(`<template><div ctrl+v.keyup="paste()"></div.</template>`);
    au.app({ host, component }).start();
    component.paste = spy();
    const event = new KeyboardEvent('keyup', { ctrlKey: true, key: 'Z' });
    host.firstElementChild.dispatchEvent(event);
    expect(component.paste).not.to.have.been.called;
  });

  it(`keyup listens for alt+ctrl+shift+0, receives alt+ctrl+shift+0, calls source`, () => {
    component = createCustomElement(`<template><div alt+ctrl+shift+0.keyup="paste()"></div.</template>`);
    au.app({ host, component }).start();
    component.paste = spy();
    const event = new KeyboardEvent('keyup', { ctrlKey: true, altKey: true, shiftKey: true, key: '0' });
    host.firstElementChild.dispatchEvent(event);
    expect(component.paste).to.have.been.called;
  });

  it(`keyup listens for alt+ctrl+shift+0, receives alt+ctrl+enter, does not call source`, () => {
    component = createCustomElement(`<template><div alt+ctrl+shift+0.keyup="paste()"></div.</template>`);
    au.app({ host, component }).start();
    component.paste = spy();
    const event = new KeyboardEvent('keyup', { ctrlKey: true, altKey: true, shiftKey: true, key: '1' });
    host.firstElementChild.dispatchEvent(event);
    expect(component.paste).not.to.have.been.called;
  });
});
