([
  // ['textContent', function(this: PIXI.DisplayObject, value: string): string {
  //   return this.$text 
  // }]
  ['nextSibling', function(this: PIXI.DisplayObject) {
    const parent = this.parent;
    if (parent) {
      const idx = parent.getChildIndex(this);
      return parent.getChildAt(idx + 1) || null;
    }
    return null;
  }],
  ['previousSibling', function(this: PIXI.DisplayObject) {
    const parent = this.parent;
    if (parent) {
      const idx = parent.getChildIndex(this);
      return parent.getChildAt(idx - 1) || null;
    }
    return null;
  }],
] as [string, (...args: any[]) => any, boolean?][]).forEach(([prop, fn, isMethod]) => {
  Reflect.defineProperty(
    PIXI.DisplayObject.prototype,
    prop,
    isMethod
      ? { configurable: true, value: fn }
      : { configurable: true, get: fn }
  );
});

/**
 * Extends PIXI container functionality of first child and last child
 */
([
  ['firstChild', function(this: PIXI.Container): PIXI.DisplayObject {
      return this.children.length === 0 ? null : this.children[0];
    }
  ],
  ['lastChild', function(this: PIXI.Container): PIXI.DisplayObject {
    const childCount = this.children.length;
    return childCount === 0 ? null : this.children[childCount - 1];
  }],
  ['insertBefore', function<T extends PIXI.DisplayObject = PIXI.DisplayObject>(this: PIXI.Container, newChild: T, refChild: PIXI.DisplayObject): T {
    const idx = this.getChildIndex(refChild);
    if (idx === -1) {
      throw new Error('Referenced child is not child of this container');
    }
    this.addChildAt(newChild, idx);
    return newChild;
  }, true]
] as [string, (...args: any[]) => any, boolean?][]).forEach(([prop, fn, isMethod]) => {
  Reflect.defineProperty(
    PIXI.Container.prototype,
    prop,
    isMethod
      ? { configurable: true, value: fn }
      : { configurable: true, get: fn }
  );
});
