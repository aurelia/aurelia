import {
  Aurelia,
  DOM,
  CustomElementResource,
  CustomAttributeResource,
  Lifecycle,
  LifecycleFlags,
  ITextBindingInstruction,
  IInterpolationInstruction,
  IPropertyBindingInstruction,
  IIteratorBindingInstruction,
  IListenerBindingInstruction,
  ICallBindingInstruction,
  IRefBindingInstruction,
  IStylePropertyBindingInstruction,
  ISetPropertyInstruction,
  ITargetedInstruction,
  IHydrateElementInstruction,
  IHydrateAttributeInstruction,
  IHydrateTemplateController,
  ILetElementInstruction,
  ILetBindingInstruction,

  ITemplateDefinition,

  TargetedInstruction,
  TextBindingInstruction,
  InterpolationInstruction,
  OneTimeBindingInstruction,
  ToViewBindingInstruction,
  FromViewBindingInstruction,
  TwoWayBindingInstruction,
  IteratorBindingInstruction,
  TriggerBindingInstruction,
  DelegateBindingInstruction,
  CaptureBindingInstruction,
  CallBindingInstruction,
  RefBindingInstruction,
  StylePropertyBindingInstruction,
  SetPropertyInstruction,
  SetAttributeInstruction,
  HydrateElementInstruction,
  HydrateAttributeInstruction,
  HydrateTemplateController,
  LetElementInstruction,
  LetBindingInstruction,

  AccessScope,
  AccessMember,
  AccessKeyed,
  AccessThis,

  ArrayLiteral,
  Assign,
  Binary,
  BindingBehavior,
  BindingIdentifier,

  CallFunction,
  CallMember,
  CallScope,

  Conditional,
  ForOfStatement,
  Interpolation,
  ObjectLiteral,
  PrimitiveLiteral,
  TaggedTemplate,
  Template,
  Unary,
  ValueConverter,

  IsBindingBehavior,
  IsAssign,

  IElement,
  INode,

  ISinglePageApp,
  IRenderingEngine,
  ILifecycle,
  ICustomElement

} from '../../../runtime/src/index';
import { IIndexable, DI, Container, IContainer, Constructable, Class } from '../../../kernel/src/index';
import { BasicConfiguration } from '../../../jit/src/index';
import { eachCartesianJoin } from '../unit/util';
import { expect } from 'chai';

export class TemplateBuilder {
  private template: IElement;

  constructor() {
    this.template = DOM.createElement('template');
  }

  public static interpolation(): TemplateBuilder {
    return new TemplateBuilder().interpolation();
  }

  public interpolation(): TemplateBuilder {
    const marker = DOM.createElement('au-m');
    marker['classList'].add('au');
    const text = DOM.createTextNode(' ');
    this.template.content['appendChild'](marker);
    this.template.content['appendChild'](text);
    return this;
  }

  public static behavior(): TemplateBuilder {
    return new TemplateBuilder().behavior();
  }

  public behavior(): TemplateBuilder {
    const marker = DOM.createElement('au-m');
    marker['classList'].add('au');
    this.template.content['appendChild'](marker);
    return this;
  }

  public build(): IElement {
    const { template } = this;
    this.template = null;
    return template;
  }
}

export class InstructionBuilder {
  private instructions: TargetedInstruction[];

  constructor() {
    this.instructions = [];
  }

  public static text(source: string): InstructionBuilder;
  public static text(expression: IsBindingBehavior): InstructionBuilder;
  public static text(parts: ReadonlyArray<string>): InstructionBuilder;
  public static text(parts: ReadonlyArray<string>, expressions: ReadonlyArray<IsBindingBehavior>): InstructionBuilder;
  public static text(partsOrExprOrSource: ReadonlyArray<string> | IsBindingBehavior | string, expressions?: ReadonlyArray<IsBindingBehavior>): InstructionBuilder;
  public static text(partsOrExprOrSource: ReadonlyArray<string> | IsBindingBehavior | string, expressions?: ReadonlyArray<IsBindingBehavior>): InstructionBuilder {
    return new InstructionBuilder().text(partsOrExprOrSource, expressions);
  }

  public text(source: string): InstructionBuilder;
  public text(expression: IsBindingBehavior): InstructionBuilder;
  public text(parts: ReadonlyArray<string>): InstructionBuilder;
  public text(parts: ReadonlyArray<string>, expressions: ReadonlyArray<IsBindingBehavior>): InstructionBuilder;
  public text(partsOrExprOrSource: ReadonlyArray<string> | IsBindingBehavior | string, expressions?: ReadonlyArray<IsBindingBehavior>): InstructionBuilder;
  public text(partsOrExprOrSource: ReadonlyArray<string> | IsBindingBehavior | string, expressions?: ReadonlyArray<IsBindingBehavior>): InstructionBuilder {
    let instruction: TextBindingInstruction;
    if (Array.isArray(partsOrExprOrSource)) {
      instruction = new TextBindingInstruction(
        new Interpolation(partsOrExprOrSource, expressions)
      );
    } else {
      if (typeof partsOrExprOrSource === 'string') {
        instruction = new TextBindingInstruction(
          new Interpolation(
            ['', ''],
            [new AccessScope(partsOrExprOrSource)]
          )
        );
      } else {
        instruction = new TextBindingInstruction(
          new Interpolation(
            ['', ''],
            [partsOrExprOrSource as IsBindingBehavior]
          )
        );
      }
    }
    this.instructions.push(instruction);
    return this;
  }

  public static iterator(itemName: string, iterable: IsBindingBehavior, targetName: string): InstructionBuilder;
  public static iterator(itemName: string, collName: string, targetName?: string): InstructionBuilder;
  public static iterator(itemName: string, collNameOrIterable: string | IsBindingBehavior, targetName?: string): InstructionBuilder;
  public static iterator(itemName: string, collNameOrIterable: string | IsBindingBehavior, targetName?: string): InstructionBuilder {
    return new InstructionBuilder().iterator(itemName, collNameOrIterable, targetName);
  }

  public iterator(itemName: string, iterable: IsBindingBehavior, targetName: string): InstructionBuilder;
  public iterator(itemName: string, collName: string, targetName?: string): InstructionBuilder;
  public iterator(itemName: string, collNameOrIterable: string | IsBindingBehavior, targetName?: string): InstructionBuilder;
  public iterator(itemName: string, collNameOrIterable: string | IsBindingBehavior, targetName?: string): InstructionBuilder {
    let to: string;
    let iterable: IsBindingBehavior;
    if (typeof collNameOrIterable === 'string') {
      iterable = new AccessScope(collNameOrIterable);
      to = targetName || collNameOrIterable;
    } else {
      iterable = collNameOrIterable;
      to = targetName;
    }
    const instruction = new IteratorBindingInstruction(
      new ForOfStatement(new BindingIdentifier(itemName), iterable), to
    );
    this.instructions.push(instruction);
    return this;
  }

  public templateController(
    res: string,
    configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder,
    configureChildInstructions: (instructionBuilder: InstructionBuilder) => InstructionBuilder = b => b
  ): InstructionBuilder {

    const definition = configureDefinition(new DefinitionBuilder()).build();
    const childInstructions = configureChildInstructions(new InstructionBuilder()).build();
    const instruction = new HydrateTemplateController(definition, res, childInstructions, name === 'else');
    this.instructions.push(instruction);

    return this;
  }

  public element(
    res: string,
    configureChildInstructions: (instructionBuilder: InstructionBuilder) => InstructionBuilder = b => b
  ): InstructionBuilder {

    const childInstructions = configureChildInstructions(new InstructionBuilder()).build();
    const instruction = new HydrateElementInstruction(res, childInstructions);
    this.instructions.push(instruction);

    return this;
  }

  public attribute(
    res: string,
    configureChildInstructions: (instructionBuilder: InstructionBuilder) => InstructionBuilder
  ): InstructionBuilder {

    const childInstructions = configureChildInstructions(new InstructionBuilder()).build();
    const instruction = new HydrateAttributeInstruction(res, childInstructions);
    this.instructions.push(instruction);

    return this;
  }

  public build(): TargetedInstruction[] {
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
  private instructions: TargetedInstruction[][];

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
  public static repeat(
    configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder,
    configureChildInstructions: (instructionBuilder: InstructionBuilder) => InstructionBuilder
  ): DefinitionBuilder {
    return new DefinitionBuilder().repeat(configureDefinition, configureChildInstructions);
  }
  public static if(configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().if(configureDefinition);
  }
  public static else(configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().else(configureDefinition);
  }
  public static compose(configureChildInstructions: (instructionBuilder: InstructionBuilder) => InstructionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().compose(configureChildInstructions);
  }
  public static replaceable(configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder): DefinitionBuilder {
    return new DefinitionBuilder().replaceable(configureDefinition);
  }

  public repeat(
    configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder,
    configureChildInstructions: (instructionBuilder: InstructionBuilder) => InstructionBuilder
  ): DefinitionBuilder {
    this.instructionBuilder.templateController('repeat', configureDefinition, configureChildInstructions);
    this.templateBuilder.behavior();
    return this.next();
  }
  public if(configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('if', configureDefinition);
    this.templateBuilder.behavior();
    return this.next();
  }
  public else(configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('else', configureDefinition);
    this.templateBuilder.behavior();
    return this.next();
  }
  public compose(configureChildInstructions: (instructionBuilder: InstructionBuilder) => InstructionBuilder): DefinitionBuilder {
    this.instructionBuilder.element('au-compose', configureChildInstructions);
    this.templateBuilder.behavior();
    return this.next();
  }
  public replaceable(configureDefinition: (definitionBuilder: DefinitionBuilder) => DefinitionBuilder): DefinitionBuilder {
    this.instructionBuilder.templateController('replaceable', configureDefinition);
    this.templateBuilder.behavior();
    return this.next();
  }
  public interpolation(source: string): DefinitionBuilder;
  public interpolation(expression: IsBindingBehavior): DefinitionBuilder;
  public interpolation(parts: ReadonlyArray<string>): DefinitionBuilder;
  public interpolation(parts: ReadonlyArray<string>, expressions: ReadonlyArray<IsBindingBehavior>): DefinitionBuilder;
  public interpolation(partsOrExprOrSource: ReadonlyArray<string> | IsBindingBehavior | string, expressions?: ReadonlyArray<IsBindingBehavior>): DefinitionBuilder;
  public interpolation(partsOrExprOrSource: ReadonlyArray<string> | IsBindingBehavior | string, expressions?: ReadonlyArray<IsBindingBehavior>): DefinitionBuilder {
    this.instructionBuilder.text(partsOrExprOrSource, expressions);
    this.templateBuilder.interpolation();
    return this.next();
  }

  private next(): DefinitionBuilder {
    this.instructions.push(this.instructionBuilder.build());
    this.instructionBuilder = new InstructionBuilder();
    return this;
  }

  public build(): ITemplateDefinition {
    const { name, templateBuilder, instructionBuilder, instructions } = this;
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
    this.container = DI.createContainer();
    this.container.register(<any>BasicConfiguration, <any>Type);
    this.Type = Type;
  }

  public static app<T extends Object>(obj: T, configure: (builder: DefinitionBuilder) => DefinitionBuilder): T extends Constructable ? TestBuilder<T> : TestBuilder<Class<T>> {
    const definition = configure(DefinitionBuilder.app()).build();
    const Type = obj['prototype'] ? obj : function() {
      Object.assign(this, obj);
    };
    const App = CustomElementResource.define(definition, <any>Type);
    return new TestBuilder(App) as any;
  }

  public element(obj: Object, configure: (builder: DefinitionBuilder) => DefinitionBuilder): TestBuilder<T> {
    const definition = configure(DefinitionBuilder.element()).build();
    const Type = obj['prototype'] ? obj : function() {
      Object.assign(this, obj);
    };
    const Resource = CustomElementResource.define(definition, <any>Type);
    this.container.register(<any>Resource);
    return this;
  }

  public build(): TestContext<T> {
    const { container, Type } = this;
    const host = DOM.createElement('div');
    const component = new Type();
    return new TestContext(container, host, component);
  }
}

export class TestContext<T extends Constructable> {
  public container: IContainer;
  public host: INode;
  public component: ICustomElement & T;
  public lifecycle: Lifecycle;
  public isHydrated: boolean;
  public startCount: number;
  public stopCount: number;

  constructor(
    container: IContainer,
    host: INode,
    component: ICustomElement & T
  ) {
    this.container = container;
    this.host = host;
    this.component = component;
    this.lifecycle = container.get<Lifecycle>(ILifecycle);
    this.isHydrated = false;
    this.startCount = 0;
    this.stopCount = 0;
  }

  public hydrate(renderingEngine?: IRenderingEngine, host?: INode): void {
    renderingEngine = renderingEngine || this.container.get<IRenderingEngine>(IRenderingEngine);
    host = host || this.host;
    this.component.$hydrate(<any>renderingEngine, host);
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
    ++this.startCount;
  }

  public startAndAssertTextContentEquals(text: string): void {
    this.start();
    this.assertTextContentEquals(text);
  }

  public stop(): void {
    this.detach();
    this.unbind();
    ++this.stopCount;
  }

  public stopAndAssertTextContentEmpty(): void {
    this.stop();
    this.assertTextContentEmpty();
  }

  public assertTextContentEquals(text: string): void {
    const { textContent } = this.host;
    if (textContent !== text) {
      const { startCount, stopCount } = this;
      throw new Error(`Expected host.textContent to equal "${text}", but got: "${textContent}" (startCount: ${startCount}, stopCount: ${stopCount})`);
    }
  }

  public assertTextContentEmpty(): void {
    const { textContent } = this.host;
    if (textContent !== '') {
      const { startCount, stopCount } = this;
      throw new Error(`Expected host.textContent to be empty, but got: "${textContent}" (startCount: ${startCount}, stopCount: ${stopCount})`);
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
