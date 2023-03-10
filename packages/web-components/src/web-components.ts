import { DI, IContainer, InstanceProvider, type IResolver, type Key, type Constructable, type IIndexable } from '@aurelia/kernel';

import {
  Controller,
  CustomElement,
  CustomElementDefinition,
  type ICustomElementController,
  INode,
  IPlatform,
  IRendering,
  type PartialCustomElementDefinition,
  setRef
} from '@aurelia/runtime-html';

export const IWcElementRegistry = DI.createInterface<IWcElementRegistry>(x => x.singleton(WcCustomElementRegistry));
export interface IWcElementRegistry {
  /**
   * Define a web-component custom element for a set of given parameters
   *
   * @param name - the name to register with the underlying CustomElementRegistry
   * @param def - the definition of the view model of the underlying web-components custom element.
   *
   * This can be either a plain class, or an object with definition specification like in a normal Aurelia customElement view model configuration
   * @param options - The web-component definition options in the call customElements.define(..., xxx)
   *
   * This is to define extend built-in element etc...
   *
   * @returns the web-component custom element class. This can be used in application to further enhance/spy on its instances
   */
  define(name: string, def: Constructable, options?: ElementDefinitionOptions): Constructable<HTMLElement>;
  define(name: string, def: Omit<PartialCustomElementDefinition, 'name'>, options?: ElementDefinitionOptions): Constructable<HTMLElement>;
}

export type WebComponentViewModelClass = Constructable
  | {
    bindables?: PartialCustomElementDefinition['bindables'];
    watches?: PartialCustomElementDefinition['watches'];
    template?: PartialCustomElementDefinition['template'];
    shadowOptions?: PartialCustomElementDefinition['shadowOptions'];
  };

/**
 * A default implementation of `IWcElementRegistry` interface.
 */
export class WcCustomElementRegistry implements IWcElementRegistry {
  /** @internal */
  protected static inject = [IContainer, IPlatform, IRendering];

  /** @internal */
  private readonly ctn: IContainer;
  /** @internal */
  private readonly p: IPlatform;
  /** @internal */
  private readonly r: IRendering;

  public constructor(ctn: IContainer, p: IPlatform, r: IRendering) {
    this.ctn = ctn;
    this.p = p;
    this.r = r;
  }

  public define(name: string, def: Constructable | Omit<PartialCustomElementDefinition, 'name'>, options?: ElementDefinitionOptions): Constructable<HTMLElement> {
    if (!name.includes('-')) {
      throw createError('Invalid web-components custom element name. It must include a "-"');
    }
    let elDef: CustomElementDefinition;
    if (def == null) {
      throw createError('Invalid custom element definition');
    }
    switch (typeof def) {
      case 'function':
        elDef = CustomElement.isType(def)
          ? CustomElement.getDefinition(def)
          : CustomElementDefinition.create(CustomElement.generateName(), def);
        break;
      default:
        elDef = CustomElementDefinition.getOrCreate(def as PartialCustomElementDefinition);
        break;
    }
    if (elDef.containerless) {
      throw createError('Containerless custom element is not supported. Consider using buitl-in extends instead');
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const BaseClass = options?.extends
      ? this.p.document.createElement(options.extends).constructor as Constructable<HTMLElement>
      : this.p.HTMLElement;
    const container = this.ctn;
    const rendering = this.r;
    const bindables = elDef.bindables;
    const p = this.p;
    class CustomElementClass extends BaseClass {
      public static readonly observedAttributes = Object.keys(bindables);

      private auCtrl!: ICustomElementController;
      private auInited: boolean | undefined;

      private auInit() {
        if (this.auInited) {
          return;
        }
        this.auInited = true;
        const childCtn = container.createChild();
        registerResolver(
          childCtn,
          p.HTMLElement,
          registerResolver(
            childCtn,
            p.Element,
            registerResolver(childCtn, INode, new InstanceProvider<INode>('ElementProvider', this))
          )
        );
        const compiledDef = rendering.compile(
          elDef,
          childCtn,
          // todo: compile existing child element with [au-slot] into here
          //       complication: what are the scope for the [au-slot] view?
          { projections: null }
        );
        const viewModel = childCtn.invoke(compiledDef.Type);
        const controller = this.auCtrl = Controller.$el(childCtn, viewModel, this, null, compiledDef);
        setRef(this, compiledDef.key, controller);
      }

      public connectedCallback() {
        this.auInit();
        // eslint-disable-next-line
        this.auCtrl.activate(this.auCtrl, null);
      }

      public disconnectedCallback() {
        // eslint-disable-next-line
        this.auCtrl.deactivate(this.auCtrl, null, false);
      }

      public adoptedCallback() {
        this.auInit();
      }

      public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        this.auInit();
        (this.auCtrl.viewModel as IIndexable)[name] = newValue;
      }
    }

    for (const bindableProp in bindables) {
      Object.defineProperty(CustomElementClass.prototype, bindableProp, {
        configurable: true,
        enumerable: false,
        get(this: CustomElementClass) {
          return (this['auCtrl'].viewModel as IIndexable)[bindableProp];
        },
        set(this: CustomElementClass, v: unknown) {
          if (!this['auInited']) {
            this['auInit']();
          }
          (this['auCtrl'].viewModel as IIndexable)[bindableProp] = v;
        }
      });
    }

    this.p.customElements.define(name, CustomElementClass, options);

    return CustomElementClass;
  }
}

const registerResolver = (ctn: IContainer, key: Key, resolver: IResolver): IResolver =>
  ctn.registerResolver(key, resolver);

const createError = (message: string) => new Error(message);
