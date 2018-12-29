import { Class, Constructable, DI, IContainer, Registration } from '@aurelia/kernel';
import { parseExpression } from '../../jit/src/index';
import { HTMLJitConfiguration } from '../../jit-html/src/index';
import {
  BindingType,
  CustomElementResource,
  HydrateAttributeInstruction,

  HydrateElementInstruction,

  HydrateTemplateController,
  ICustomElement,
  IDOM,
  ILifecycle,
  INode,
  Interpolation,

  IRenderingEngine,

  IsBindingBehavior,

  ITemplateDefinition,

  IteratorBindingInstruction,
  LifecycleFlags,

  ToViewBindingInstruction,
  IProjectorLocator

} from '@aurelia/runtime';
import { TextBindingInstruction, HTMLTargetedInstruction } from '../src/index';


export type TemplateCb = (builder: TemplateBuilder) => TemplateBuilder;
export type InstructionCb = (builder: InstructionBuilder) => InstructionBuilder;
export type DefinitionCb = (builder: DefinitionBuilder) => DefinitionBuilder;

export class TemplateBuilder {
  private template: HTMLTemplateElement;

  constructor() {
    this.template = document.createElement('template');
  }

  public static interpolation(): TemplateBuilder {
    return new TemplateBuilder().interpolation();
  }

  public interpolation(): TemplateBuilder {
    const marker = document.createElement('au-m');
    marker['classList'].add('au');
    const text = document.createTextNode(' ');
    this.template.content['appendChild'](marker);
    this.template.content['appendChild'](text);
    return this;
  }

  public static behavior(): TemplateBuilder {
    return new TemplateBuilder().behavior();
  }

  public behavior(): TemplateBuilder {
    const marker = document.createElement('au-m');
    marker['classList'].add('au');
    this.template.content['appendChild'](marker);
    return this;
  }

  public build(): HTMLTemplateElement {
    const { template } = this;
    this.template = null;
    return template;
  }
}

export class InstructionBuilder {
  private instructions: HTMLTargetedInstruction[];

  constructor() {
    this.instructions = [];
  }

  public static interpolation(source: string): InstructionBuilder;
  public static interpolation(parts: ReadonlyArray<string>): InstructionBuilder;
  public static interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): InstructionBuilder;
  public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder;
  public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder {
    return new InstructionBuilder().interpolation(partsOrSource, sources);
  }

  public static iterator(source: string, target: string): InstructionBuilder {
    return new InstructionBuilder().iterator(source, target);
  }

  public static toView(source: string, target?: string): InstructionBuilder {
    return new InstructionBuilder().toView(source, target);
  }

  public interpolation(source: string): InstructionBuilder;
  public interpolation(parts: ReadonlyArray<string>): InstructionBuilder;
  public interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): InstructionBuilder;
  public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder;
  public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder {
    let parts: string[];
    let expressions: IsBindingBehavior[];
    if (Array.isArray(partsOrSource)) {
      parts = partsOrSource;
      expressions = [];
      if (Array.isArray(sources)) {
        for (const source of sources) {
          expressions.push(<any>parseExpression(<string>source, <any>BindingType.None));
        }
      }
    } else {
      parts = ['', ''];
      expressions = [<any>parseExpression(<string>partsOrSource, <any>BindingType.None)];
    }
    const instruction = new TextBindingInstruction(
      new Interpolation(parts, expressions)
    );
    this.instructions.push(instruction);
    return this;
  }


  public iterator(source: string, target: string): InstructionBuilder {
    const statement = <any>parseExpression(source, <any>BindingType.ForCommand);
    const instruction = new IteratorBindingInstruction(statement, target);
    this.instructions.push(instruction);
    return this;
  }

  public toView(source: string, target?: string): InstructionBuilder {
    const statement = <any>parseExpression(source, <any>BindingType.ToViewCommand);
    const instruction = new ToViewBindingInstruction(statement, target || 'value');
    this.instructions.push(instruction);
    return this;
  }

  public templateController(
    res: string,
    insCbOrBuilder: InstructionCb | InstructionBuilder,
    defCbOrBuilder: DefinitionCb | DefinitionBuilder
  ): InstructionBuilder {
    let childInstructions: HTMLTargetedInstruction[];
    let definition: ITemplateDefinition;
    if (insCbOrBuilder instanceof InstructionBuilder) {
      childInstructions = insCbOrBuilder.build();
    } else {
      childInstructions = insCbOrBuilder(new InstructionBuilder()).build();
    }
    if (defCbOrBuilder instanceof DefinitionBuilder) {
      definition = defCbOrBuilder.build();
    } else {
      definition = defCbOrBuilder(new DefinitionBuilder()).build();
    }
    const instruction = new HydrateTemplateController(definition, res, childInstructions, res === 'else');
    this.instructions.push(instruction);
    return this;
  }

  public element(res: string, ins: InstructionCb): InstructionBuilder {
    const childInstructions = ins(new InstructionBuilder()).build();
    const instruction = new HydrateElementInstruction(res, childInstructions);
    this.instructions.push(instruction);
    return this;
  }

  public attribute(res: string, ins: InstructionCb): InstructionBuilder {
    const childInstructions = ins(new InstructionBuilder()).build();
    const instruction = new HydrateAttributeInstruction(res, childInstructions);
    this.instructions.push(instruction);
    return this;
  }

  public build(): HTMLTargetedInstruction[] {
    const { instructions } = this;
    this.instructions = null;
    return instructions;
  }
}

export class DefinitionBuilder {
  private static lastId: number = 0;
  private name: string;
  private templateBuilder: TemplateBuilder;
  private instructionBuilder: InstructionBuilder;
  private instructions: HTMLTargetedInstruction[][];

  constructor(name?: string) {
    this.name = name || ('$' + ++DefinitionBuilder.lastId);
    this.templateBuilder = new TemplateBuilder();
    this.instructionBuilder = new InstructionBuilder();
    this.instructions = [];
  }

  public static element(name?: string): DefinitionBuilder {
    return new DefinitionBuilder(name);
  }
  public static app(): DefinitionBuilder {
    return new DefinitionBuilder('app');
  }
  public static repeat(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public static repeat(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public static repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public static repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().repeat(insCbOrBuilder, defCbOrBuilder);
  }
  public static if(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public static if(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public static if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public static if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().if(insCbOrBuilder, defCbOrBuilder);
  }
  public static with(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public static with(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public static with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public static with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().with(insCbOrBuilder, defCbOrBuilder);
  }
  public static else(def: DefinitionCb): DefinitionBuilder {
    return new DefinitionBuilder().else(def);
  }
  public static compose(ins: InstructionCb): DefinitionBuilder {
    return new DefinitionBuilder().compose(ins);
  }
  public static replaceable(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public static replaceable(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public static replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public static replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().replaceable(insCbOrBuilder, defCbOrBuilder);
  }
  public static interpolation(source: string): DefinitionBuilder;
  public static interpolation(parts: ReadonlyArray<string>): DefinitionBuilder;
  public static interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): DefinitionBuilder;
  public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder;
  public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder {
    return new DefinitionBuilder().interpolation(partsOrSource, sources);
  }

  public repeat(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public repeat(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('repeat', insCbOrBuilder, defCbOrBuilder);
    this.templateBuilder.behavior();
    return this.next();
  }
  public if(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public if(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('if', insCbOrBuilder, defCbOrBuilder);
    this.templateBuilder.behavior();
    return this.next();
  }
  public with(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public with(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('with', insCbOrBuilder, defCbOrBuilder);
    this.templateBuilder.behavior();
    return this.next();
  }
  public else(defCb: DefinitionCb): DefinitionBuilder;
  public else(defBuilder: DefinitionBuilder): DefinitionBuilder;
  public else(defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public else(defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('else', b => b, defCbOrBuilder);
    this.templateBuilder.behavior();
    return this.next();
  }
  public compose(ins: InstructionCb): DefinitionBuilder {
    this.instructionBuilder.element('au-compose', ins);
    this.templateBuilder.behavior();
    return this.next();
  }
  public replaceable(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
  public replaceable(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
  public replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
  public replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('replaceable', insCbOrBuilder, defCbOrBuilder);
    this.templateBuilder.behavior();
    return this.next();
  }
  public interpolation(source: string): DefinitionBuilder;
  public interpolation(parts: ReadonlyArray<string>): DefinitionBuilder;
  public interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): DefinitionBuilder;
  public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder;
  public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder {
    this.instructionBuilder.interpolation(partsOrSource, sources);
    this.templateBuilder.interpolation();
    return this.next();
  }

  private next(): DefinitionBuilder {
    this.instructions.push(this.instructionBuilder.build());
    this.instructionBuilder = new InstructionBuilder();
    return this;
  }

  public build(): ITemplateDefinition {
    const { name, templateBuilder, instructions } = this;
    const definition = { name, template: templateBuilder.build(), instructions };
    this.name = null;
    this.templateBuilder = null;
    this.instructionBuilder = null;
    this.instructions = null;
    return definition;
  }
}

export class TestBuilder<T extends Constructable> {
  private container: IContainer;
  private Type: T;

  constructor(Type: T) {
    this.container = HTMLJitConfiguration.createContainer();
    this.container.register(<any>Type);
    this.Type = Type;
  }

  public static app<T extends Object>(obj: T, defBuilder: DefinitionBuilder): T extends Constructable ? TestBuilder<Class<InstanceType<T>, T>> : TestBuilder<Class<T, {}>>;
  public static app<T extends Object>(obj: T, defCb: DefinitionCb): T extends Constructable ? TestBuilder<Class<InstanceType<T>, T>> : TestBuilder<Class<T, {}>>;
  public static app<T extends Object>(obj: T, defCbOrBuilder: DefinitionCb | DefinitionBuilder): T extends Constructable ? TestBuilder<Class<InstanceType<T>, T>> : TestBuilder<Class<T, {}>> {
    let definition: ITemplateDefinition;
    if (defCbOrBuilder instanceof DefinitionBuilder) {
      definition = defCbOrBuilder.build();
    } else {
      definition = defCbOrBuilder(DefinitionBuilder.app()).build();
    }
    const Type = obj['prototype'] ? obj : function() {
      Object.assign(this, obj);
    };
    const App = CustomElementResource.define(definition, <any>Type);
    return new TestBuilder(App) as any;
  }

  public element(obj: Object, def: DefinitionCb): TestBuilder<T> {
    const definition = def(DefinitionBuilder.element()).build();
    const Type = obj['prototype'] ? obj : function() {
      Object.assign(this, obj);
    };
    const Resource = CustomElementResource.define(definition, <any>Type);
    this.container.register(<any>Resource);
    return this;
  }

  public build(): TestContext<InstanceType<T>> {
    const { container, Type } = this;
    const host = document.createElement('div');
    const component = new Type();
    return new TestContext(container, host, component);
  }
}

export class TestContext<T extends Object> {
  public container: IContainer;
  public host: INode;
  public component: ICustomElement & T;
  public lifecycle: ILifecycle;
  public isHydrated: boolean;
  public assertCount: number;

  constructor(
    container: IContainer,
    host: INode,
    component: ICustomElement & T
  ) {
    this.container = container;
    this.host = host;
    this.component = component;
    this.lifecycle = container.get<ILifecycle>(ILifecycle);
    this.isHydrated = false;
    this.assertCount = 0;
  }

  public hydrate(renderingEngine?: IRenderingEngine, host?: INode): void {
    renderingEngine = renderingEngine || this.container.get(IRenderingEngine);
    const projectorLocator = this.container.get(IProjectorLocator);
    const dom = this.container.get(IDOM);
    host = host || this.host;
    this.component.$hydrate(dom, projectorLocator, renderingEngine, host);
  }

  public bind(flags?: LifecycleFlags): void {
    flags = arguments.length === 1 ? flags : LifecycleFlags.fromStartTask | LifecycleFlags.fromBind;
    this.component.$bind(flags);
  }

  public attach(flags?: LifecycleFlags): void {
    flags = arguments.length === 1 ? flags : LifecycleFlags.fromStartTask | LifecycleFlags.fromAttach;
    this.component.$attach(flags);
  }

  public detach(flags?: LifecycleFlags): void {
    flags = arguments.length === 1 ? flags : LifecycleFlags.fromStopTask | LifecycleFlags.fromDetach;
    this.component.$detach(flags);
  }

  public unbind(flags?: LifecycleFlags): void {
    flags = arguments.length === 1 ? flags : LifecycleFlags.fromStopTask | LifecycleFlags.fromUnbind;
    this.component.$unbind(flags);
  }

  public start(): void {
    if (this.isHydrated === false) {
      this.hydrate();
    }
    this.bind();
    this.attach();
  }

  public startAndAssertTextContentEquals(text: string): void {
    this.start();
    this.assertTextContentEquals(text);
  }

  public stop(): void {
    this.detach();
    this.unbind();
  }

  public stopAndAssertTextContentEmpty(): void {
    this.stop();
    this.assertTextContentEmpty();
  }

  public flush(flags?: LifecycleFlags): void {
    flags = arguments.length === 1 ? flags : LifecycleFlags.fromAsyncFlush;
    this.lifecycle.processFlushQueue(flags);
  }

  public assertTextContentEquals(text: string): void {
    ++this.assertCount;
    const { textContent } = this.host as { textContent?: string };
    if (textContent !== text) {
      throw new Error(`Expected host.textContent to equal "${text}", but got: "${textContent}" (assert #${this.assertCount})`);
    }
  }

  public assertTextContentEmpty(): void {
    ++this.assertCount;
    const { textContent } = this.host as { textContent?: string };
    if (textContent !== '') {
      throw new Error(`Expected host.textContent to be empty, but got: "${textContent}" (assert #${this.assertCount})`);
    }
  }

  public dispose(): void {
    this.container = null;
    this.host = null;
    this.component = null;
    this.lifecycle = null;
    this.isHydrated = null;
  }
}
