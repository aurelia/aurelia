/// <reference types="pixi.js" />

declare namespace PIXI {
  interface DisplayObject {
    nodeName: string;
    textContent: string;
    nextSibling: PIXI.DisplayObject;
    previousSibling: PIXI.DisplayObject;
  }
  interface Container {
    firstChild: PIXI.DisplayObject;
    lastChild: PIXI.DisplayObject;
    insertBefore<T extends PIXI.DisplayObject = PIXI.DisplayObject>(newChild: T, refChild: PIXI.DisplayObject): T;
  }
}