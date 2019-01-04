import { IRegistry } from '@aurelia/kernel';
import {
  bindable,
  customElement,
  ICustomElement,
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

export interface PixiSprite extends ICustomElement<Node> {}

@customElement({ name: 'pixi-sprite', template: '<template></template>' })
export class PixiSprite {
  public static readonly register: IRegistry['register'];

  public get sprite(): Sprite {
    return this._sprite;
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
  @bindable public filters?: Filter<Object>[];
  @bindable public hitArea?: Rectangle | Circle | Ellipse | Polygon | RoundedRectangle;
  @bindable public interactive?: boolean;
  public get localTransform(): Matrix {
    return this._sprite.localTransform;
  }
  @bindable public mask?: Graphics;
  @bindable public name?: string;
  public get parent(): Container {
    return this._sprite.parent;
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
    return this._sprite.worldAlpha;
  }
  public get worldTransform(): Matrix {
    return this._sprite.worldTransform;
  }
  public get worldVisible(): boolean {
    return this._sprite.worldVisible;
  }
  @bindable public x?: number;
  @bindable public y?: number;
  @bindable public zIndex?: number;

  // Container properties
  // http://pixijs.download/dev/docs/PIXI.Container.html
  public get children(): DisplayObject[] {
    return this._sprite.children;
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
    return this._sprite['isSprite'];
  }
  @bindable public pluginName?: string;
  @bindable public roundPixels?: boolean;
  @bindable public shader?: Filter<Object> | Shader;
  @bindable public texture?: Texture;
  @bindable public tint?: number;

  private _sprite: Sprite;

  constructor() {
    this._sprite = null;
  }

  public attached(): void {
    if (this.container) {
      this._sprite = new Sprite(loader.resources[this.src].texture);
      for (const prop of directProps) {
        if (this[prop] !== undefined) {
          this._sprite[prop] = this[prop];
        }
      }
      for (const prop of pointProps) {
        if (this[`${prop}X`] !== undefined) {
          this._sprite[prop].x = this[`${prop}X`];
        }
        if (this[`${prop}Y`] !== undefined) {
          this._sprite[prop].y = this[`${prop}Y`];
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
  PixiSprite.prototype[`${prop}Changed`] = function(this: PixiSprite, newValue: unknown): void {
    if (this.$state & State.isBound && this.sprite !== null && newValue) {
      this.sprite[prop] = newValue;
    }
  }
}
for (const prop of pointProps) {
  PixiSprite.prototype[`${prop}XChanged`] = function(this: PixiSprite, newValue: unknown): void {
    if (this.$state & State.isBound && this.sprite !== null && newValue) {
      this.sprite[prop].x = newValue;
    }
  }
  PixiSprite.prototype[`${prop}YChanged`] = function(this: PixiSprite, newValue: unknown): void {
    if (this.$state & State.isBound && this.sprite !== null && newValue) {
      this.sprite[prop].y = newValue;
    }
  }
}
