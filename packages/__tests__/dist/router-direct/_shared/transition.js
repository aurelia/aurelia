import { Component } from './component.js';
export class Transition {
    constructor(transition) {
        this.viewport = transition.viewport;
        this.from = new Component(transition.from, this.viewport);
        this.to = new Component(transition.to, this.viewport);
    }
}
//# sourceMappingURL=transition.js.map