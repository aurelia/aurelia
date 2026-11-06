import { type IDisposable, resolve } from '@aurelia/kernel';
import { CustomAttribute, type CustomAttributeStaticAuDefinition, type ICustomAttributeViewModel, INode, IWindow } from '@aurelia/runtime-html';
import { Events, getMessage } from '../events';
import { IRouter } from '../router';
import { IRouterEvents } from '../router-events';
import { bmToView, isNavigationClick } from '../util';

/** Opt-in application-URL links. Register separately from RouterConfiguration. */
export class UrlCustomAttribute implements ICustomAttributeViewModel {
  public static readonly $au: CustomAttributeStaticAuDefinition = {
    type: 'custom-attribute',
    name: 'url',
    noMultiBindings: true,
    bindables: {
      value: { mode: bmToView },
    },
  };

  /** @internal */ private readonly _el = resolve<INode<HTMLElement>>(INode as unknown as INode<HTMLElement>);
  /** @internal */ private readonly _window = resolve(IWindow);
  /** @internal */ private readonly _router = resolve(IRouter);
  /** @internal */ private readonly _events = resolve(IRouterEvents);
  /** @internal */ private _navigationEndListener: IDisposable | null = null;
  /** @internal */ private _target: string | null = null;

  public value: string | null | undefined;

  public binding(): void {
    // One attribute must own both the href and the click. Combining them would
    // make binding order decide which navigation contract the link follows.
    if (CustomAttribute.for(this._el, 'load') !== void 0 || CustomAttribute.for(this._el, 'href') !== void 0) {
      throw new Error(getMessage(Events.rtrUrlResourceConflict));
    }
    this.valueChanged();
    this._el.addEventListener('click', this);
    this._navigationEndListener = this._events.subscribe('au:router:navigation-end', () => this.valueChanged());
  }

  public unbinding(): void {
    this._el.removeEventListener('click', this);
    this._navigationEndListener!.dispose();
    this._navigationEndListener = null;
  }

  public valueChanged(): void {
    if (this.value == null) {
      this._target = null;
      this._el.removeAttribute('href');
      return;
    }

    // Resolve once when publishing the link. Clicking uses that rooted target,
    // so an in-flight navigation cannot give the click a different destination
    // from opening the rendered href in another tab.
    const target = this._target = this._router._resolveUrlReference(this.value);
    this._el.setAttribute('href', this._router._createHrefFromPath(target));
  }

  public handleEvent(event: MouseEvent): void {
    const el = this._el;
    if (this._target === null || el.nodeName !== 'A'
      || el.hasAttribute('external') || el.hasAttribute('data-external')
      || !isNavigationClick(event, el, this._window.name)) {
      return;
    }

    event.preventDefault();
    // The router owns the transition and reports navigation failures.
    void this._router.navigate(this._target);
  }
}
