import { Constructable, DI, IContainer, IIndexable, InstanceProvider } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';

import { INode, setRef } from '../dom.js';
import { IPlatform } from '../platform.js';
import { CustomElement, CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element.js';
import { Controller, ICustomElementController } from '../templating/controller.js';
import { IRendering } from '../templating/rendering.js';

export const IWcElementRegistry = DI.createInterface<IAuElementRegistry>(x => x.singleton(WcCustomElementRegistry));
export interface IAuElementRegistry {
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
 * A default implementation of `IAuElementRegistry` interface.
 */
export class WcCustomElementRegistry implements IAuElementRegistry {
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
      throw new Error('Invalid web-components custom element name. It must include a "-"');
    }
    let elDef: CustomElementDefinition;
    if (def == null) {
      throw new Error('Invalid custom element definition');
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
      throw new Error('Containerless custom element is not supported. Consider using buitl-in extends instead');
    }
    const BaseClass = !options?.extends ? HTMLElement : this.p.document.createElement(options.extends).constructor as unknown as Constructable<HTMLElement>;
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
        childCtn.registerResolver(
          p.HTMLElement,
          childCtn.registerResolver(
            p.Element,
            childCtn.registerResolver(INode, new InstanceProvider<INode>('ElementProvider', this))
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
        this.auCtrl.activate(this.auCtrl, null, LifecycleFlags.none);
      }

      public disconnectedCallback() {
        // eslint-disable-next-line
        this.auCtrl.deactivate(this.auCtrl, null, LifecycleFlags.none);
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
