/// <reference path="./pixi-dom.d.ts" />
import * as PIXI from 'pixi.js';

const PixiDomMap: Record<string, () => PIXI.DisplayObject> = {};

export const PixiDOM = new class {
  
  /**
   * Create basic node of a PIXI DOM
   */
  createComment(): PIXI.DisplayObject {
    return new PIXI.DisplayObject();
  }

  createElement(tagName: 'container'): PIXI.Container;
  createElement(tagName: 'div'): PIXI.Container;
  createElement(tagName: 'b'): PIXI.Text;
  createElement(tagName: 'au-marker'): PIXI.Text;
  createElement(tagName: 'au-m'): PIXI.Text;
  createElement(tagName: 'button'): PIXI.Sprite;
  createElement(tagName: string): PIXI.DisplayObject {
    return PixiDomMap[tagName]();
  }

  remove<T extends PIXI.DisplayObject = PIXI.DisplayObject>(node: T): T | null {
    if (node.parent) {
      node.parent.removeChild(node);
      return node;
    }
    return null;
  }

  map(tagName: string, ctor: (() => PIXI.DisplayObject)): void {
    if (tagName in PixiDomMap) {
      throw new Error(`Pixi element with the same name "${tagName}" already exists`);
    }
    PixiDomMap[tagName] = ctor;
  }

};

// Pre map common tag names to PIXI element
(map => {
  map('container', () => new PIXI.Container());
  map('div', () => new PIXI.Container);
  map('b', () => {
    const text = new PIXI.Text();
    text.style.fontWeight = 'bold';
    return text;
  });
  map('au-marker', () => new PIXI.Text());
  map('text', () => new PIXI.Text());
  map('button', () => {
    return new PIXI.Sprite();
  });
})(PixiDOM.map);
