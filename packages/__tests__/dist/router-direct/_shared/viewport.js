import { Component } from './component.js';
export class Viewport {
    constructor(name, from, to, isTop) {
        this.name = name;
        this.isTop = isTop;
        this.from = new Component(from, name);
        this.to = new Component(to, name);
    }
}
//# sourceMappingURL=viewport.js.map