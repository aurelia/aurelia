declare namespace PIXI {
  interface DisplayObject {
    nodeName: string;
    textContent: string;
  }
  interface Container {
    firstChild: PIXI.DisplayObject;
    lastChild: PIXI.DisplayObject;
  }
}