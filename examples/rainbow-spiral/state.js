const BASE_SIZE = 100;
const DEGREES = 180 / Math.PI;

export class State {

  constructor() {
    this.leftTransform = '';
    this.rightTransform = '';

    this.baseSize = BASE_SIZE;
  }

  mouseMoved(x, y) {
    const height = window.innerHeight;
    const width = window.innerWidth;
    this.update(1 - y / height, x / width);
  }

  update(ratioH, ratioW) {
    const h = 0.8 * ratioH;
    const h2 = h * h;
    const l = 0.01 + 0.98 * ratioW;
    const r = 1 - l;
    const leftScale = Math.sqrt(h2 + l * l);
    const rightScale = Math.sqrt(h2 + r * r);
    const leftRotation = Math.atan2(h, l) * DEGREES;
    const rightRotation = -Math.atan2(h, r) * DEGREES;
    this.leftTransform = `translate(0, 1) scale(${leftScale}) rotate(${leftRotation})`;
    this.rightTransform = `translate(${1 - rightScale}, 1) scale(${rightScale}) rotate(${rightRotation} 1 0)`;
  }
}
