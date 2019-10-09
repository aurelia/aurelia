import { customElement } from 'aurelia';
import template from './app.html';
import { loader } from 'pixi.js';

interface ISprite {
  src: string;
  entropy?: number;
  x?: number;
  y?: number;
  anchor?: { x: number; y: number };
  scale?: { x: number; y: number };
  width?: number;
}

@customElement({ name: 'app', template })
export class App {
  public sprites: ISprite[];
  public timestamp: number;
  public constructor() {
    this.timestamp = 0;
    this.sprites = [];
  }

  public binding(): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    loader.add('logo', require('img/aurelia-icon-256x256.png'));
    loader.load();

    for (let i = 0; i < 50; ++i) {
      this.addSprite();
    }
  }

  public update({delta}: {delta: number}): void {
    this.timestamp += delta;
    let sprite: App['sprites'] extends (infer S)[] ? S : never;
    const sprites = this.sprites;
    const len = sprites.length;
    let entropy: number;
    let i = 0;
    for (; i < len; ++i) {
      sprite = sprites[i];
      entropy = sprite['entropy'];
      sprite.x += entropy;
      if (sprite.x > (640)) {
        sprite.x = 0 - sprite.width;
        if ((entropy % 1) > 0.5) {
          sprite.y += entropy * 25;
        } else {
          sprite.y -= entropy * 25;
        }
        if (sprite.y > 480) {
          sprite.y = 0;
        }
      }
    }
  }

  public addSprite(): void {
    const scale = 0.1 + 0.75 * Math.random();
    const sprite = {
      src: 'logo',
      entropy: 1 + Math.random() * 5,
      x: 640 * Math.random(),
      y: 480 * Math.random(),
      anchor: { x: 0.5, y: 0.5 },
      scale: { x: scale, y: scale }
    };
    this.sprites.push(sprite);
  }
}
