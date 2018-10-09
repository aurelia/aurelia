const BASE_SIZE = 100;
const DEGREES = 180 / Math.PI;

export class State {
  leftTransform: string;
  rightTransform: string;

  baseSize = BASE_SIZE;

  mouseMoved(x: number, y: number) {
    let height = window.innerHeight;
    let width = window.innerWidth;
    this.update(1 - y / height, x / width);
  }

  private update(ratioH: number, ratioW: number) {
    let h = 0.8 * ratioH;
    let h2 = h * h;
    let l = 0.01 + 0.98 * ratioW;
    let r = 1 - l;
    let leftScale = Math.sqrt(h2 + l * l);
    let rightScale = Math.sqrt(h2 + r * r);
    let leftRotation = Math.atan2(h, l) * DEGREES;
    let rightRotation = -Math.atan2(h, r) * DEGREES;
    this.leftTransform = `translate(0, 1) scale(${leftScale}) rotate(${leftRotation})`;
    this.rightTransform = `translate(${1 - rightScale}, 1) scale(${rightScale}) rotate(${rightRotation} 1 0)`;
  }
}
