import {
  bindable,
  customElement,
  IController,
  State
} from '@aurelia/runtime';
import {
  Circle,
  Container,
  DisplayObject,
  Ellipse,
  Filter,
  Graphics,
  loader,
  Matrix,
  ObservablePoint,
  Polygon,
  Rectangle,
  RoundedRectangle,
  Shader,
  Sprite,
  Texture,
  TransformBase
} from 'pixi.js';

const directProps = [
  'alpha',
  'buttomMode',
  'cacheAsBitmap',
  'cursor',
  'filterArea',
  'filters',
  'hitArea',
  'interactive',
  'mask',
  'name',
  'renderable',
  'rotation',
  'transform',
  'visible',
  'x',
  'y',
  'zIndex',
  'height',
  'interactiveChildren',
  'sortableChildren',
  'sortDirty',
  'anchor',
  'blendMode',
  'pluginName',
  'roundPixels',
  'shader',
  'texture',
  'tint'
];

const pointProps = [
  'pivot',
  'position',
  'scale',
  'skew'
];

@customElement({ name: 'pixi-sprite', template: '<template></template>' })
export class PixiSprite {
  public get sprite(): Sprite & { [key: string]: unknown } {
    return this._sprite as Sprite & { [key: string]: unknown };
  }

  @bindable public container?: Container;
  @bindable public src?: string;

  // DisplayObject properties
  // http://pixijs.download/dev/docs/PIXI.DisplayObject.html
  @bindable public alpha?: number;
  @bindable public buttomMode?: boolean;
  @bindable public cacheAsBitmap?: boolean;
  @bindable public cursor?: string;
  @bindable public filterArea?: Rectangle;
  // eslint-disable-next-line @typescript-eslint/ban-types
  @bindable public filters?: Filter<Object>[]; // Object usage is "inherited" from Pixi.
  @bindable public hitArea?: Rectangle | Circle | Ellipse | Polygon | RoundedRectangle;
  @bindable public interactive?: boolean;
  public get localTransform(): Matrix {
    return this.sprite.localTransform;
  }
  @bindable public mask?: Graphics;
  @bindable public name?: string;
  public get parent(): Container {
    return this.sprite.parent;
  }
  @bindable public pivotX?: number;
  @bindable public pivotY?: number;
  @bindable public positionX?: number;
  @bindable public positionY?: number;
  @bindable public renderable?: boolean;
  @bindable public rotation?: number;
  @bindable public scaleX?: number;
  @bindable public scaleY?: number;
  @bindable public skewX?: number;
  @bindable public skewY?: number;
  @bindable public transform?: TransformBase;
  @bindable public visible?: boolean;
  public get worldAlpha(): number {
    return this.sprite.worldAlpha;
  }
  public get worldTransform(): Matrix {
    return this.sprite.worldTransform;
  }
  public get worldVisible(): boolean {
    return this.sprite.worldVisible;
  }
  @bindable public x?: number;
  @bindable public y?: number;
  @bindable public zIndex?: number;

  // Container properties
  // http://pixijs.download/dev/docs/PIXI.Container.html
  public get children(): DisplayObject[] {
    return this.sprite.children;
  }
  @bindable public height?: number;
  @bindable public interactiveChildren?: boolean;
  @bindable public sortableChildren?: boolean;
  @bindable public sortDirty?: boolean;
  @bindable public width?: number;

  // Sprite properties
  // http://pixijs.download/dev/docs/PIXI.Sprite.html
  @bindable public anchor?: ObservablePoint;
  @bindable public blendMode?: number;
  public get isSprite(): boolean {
    return this.sprite['isSprite'] as boolean;
  }
  @bindable public pluginName?: string;
  @bindable public roundPixels?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  @bindable public shader?: Filter<Object> | Shader; // Object usage is "inherited" from Pixi.
  @bindable public texture?: Texture;
  @bindable public tint?: number;

  public $controller!: IController<Element, this>;

  private _sprite: Sprite & { [key: string]: unknown } | null;

  public constructor() {
    this._sprite = null;
  }

  public attached(): void {
    if (this.container) {
      const $this = this as this & { [key: string]: unknown };
      this._sprite = new Sprite(loader.resources[this.src as string].texture) as Sprite & { [key: string]: unknown };
      for (const prop of directProps) {
        if ($this[prop] !== undefined) {
          this._sprite[prop] = $this[prop];
        }
      }
      for (const prop of pointProps) {
        if ($this[`${prop}X`] !== undefined) {
          (this._sprite[prop] as { x: unknown }).x = $this[`${prop}X`];
        }
        if ($this[`${prop}Y`] !== undefined) {
          (this._sprite[prop] as { y: unknown }).y = $this[`${prop}Y`];
        }
      }
      this.width = this._sprite.width;
      this.container.addChild(this._sprite);
    }
  }

  public detached(): void {
    if (this.container && this._sprite) {
      this.container.removeChild(this._sprite);
      this._sprite.destroy();
      this._sprite = null;
    }
  }
}

for (const prop of directProps) {
  (PixiSprite.prototype as PixiSprite & { [key: string]: unknown })[`${prop}Changed`] = function(this: PixiSprite, newValue: unknown): void {
    if ((this.$controller.state & State.isBound) > 0 && this.sprite != null) {
      this.sprite[prop] = newValue;
    }
  };
}
for (const prop of pointProps) {
  (PixiSprite.prototype as PixiSprite & { [key: string]: unknown })[`${prop}XChanged`] = function(this: PixiSprite, newValue: unknown): void {
    if ((this.$controller.state & State.isBound) > 0 && this.sprite != null) {
      (this.sprite[prop] as { x: unknown }).x = newValue;
    }
  };
  (PixiSprite.prototype as PixiSprite & { [key: string]: unknown })[`${prop}YChanged`] = function(this: PixiSprite, newValue: unknown): void {
    if ((this.$controller.state & State.isBound) > 0 && this.sprite != null) {
      (this.sprite[prop] as { y: unknown }).y = newValue;
    }
  };
}
