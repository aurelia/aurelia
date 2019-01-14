import { Constructable, IRegistry } from '@aurelia/kernel';
import {
  bindable,
  customElement
} from '@aurelia/runtime';
import {
  Application,
  ApplicationOptions,
  Container
} from 'pixi.js';

@customElement({ name: 'pixi-app', template: '<template><div replaceable part="children"></div></template>' })
export class PixiApp {
  public static readonly register: IRegistry['register'];

  public static readonly inject: Constructable[] = [Element];

  public get app(): Application {
    return this._app;
  }
  public stage: Container;

  @bindable public options?: ApplicationOptions;

  @bindable public width?: number;
  @bindable public height?: number;
  @bindable public view?: HTMLCanvasElement;
  @bindable public transparent?: boolean;
  @bindable public antialias?: boolean;
  @bindable public preserveDrawingBuffer?: boolean;
  @bindable public resolution?: number;
  @bindable public forceCanvas?: boolean;
  @bindable public backgroundColor?: number;
  @bindable public clearBeforeRender?: boolean;
  @bindable public roundPixels?: boolean;
  @bindable public forceFXAA?: boolean;
  @bindable public legacy?: boolean;
  @bindable public context?: WebGLRenderingContext;
  @bindable public autoResize?: boolean;
  @bindable public powerPreference?: 'high-performance';

  @bindable public tick?: (args: {delta: number}) => void;

  private readonly callTick: (delta: number) => void;
  private readonly element: Element;
  private _app: Application;

  constructor(element: Element) {
    this.element = element;
    this._app = null;
    this.stage = null;
    this.callTick = (delta: number): void => {
      if (typeof this.tick === 'function') {
        this.tick({delta});
      }
    };
  }

  public bound(): void {
    const boundOptions = {
      width: typeof this.width === 'string' ? parseInt(this.width, 10) : this.width,
      height: typeof this.height === 'string' ? parseInt(this.height, 10) : this.height,
      view: this.view,
      transparent: this.transparent,
      antialias: this.antialias,
      preserveDrawingBuffer: this.preserveDrawingBuffer,
      resolution: this.resolution,
      forceCanvas: this.forceCanvas,
      backgroundColor: typeof this.backgroundColor === 'string' ? parseInt(this.backgroundColor, 16) : this.backgroundColor,
      clearBeforeRender: this.clearBeforeRender,
      roundPixels: this.roundPixels,
      forceFXAA: this.forceFXAA,
      legacy: this.legacy,
      context: this.context,
      autoResize: this.autoResize,
      powerPreference: this.powerPreference
    };
    if (this.options instanceof Object) {
      this._app = new Application({ ...this.options, ...boundOptions });
    } else {
      this._app = new Application(boundOptions);
    }
    this.stage = this._app.stage;
  }

  public attached(): void {
    this.element.appendChild(this.app.view);
    this._app.ticker.add(this.callTick);
  }

  public detached(): void {
    this.element.removeChild(this.app.view);
    this._app.ticker.remove(this.callTick);
  }

  public unbound(): void {
    this.app.destroy();
    this._app = null;
    this.stage = null;
  }
}
