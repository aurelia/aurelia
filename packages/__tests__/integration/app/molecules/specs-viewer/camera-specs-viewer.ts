import { bindable, customElement } from '@aurelia/runtime-html';
import template from './camera-specs-viewer.html';
import { Thing } from './thing-viewer.js';

export class Zoom {
  public constructor(
    public optical: number,
    public digital?: number
  ) { }
}
export class Camera extends Thing {
  public constructor(
    public zoom: Zoom,
    public iso: number[],
    public focalLengthRange: [number, number],
    public fNumberRange: [number, number],
    modelNumber: string,
    make: string
  ) {
    super(modelNumber, make);
  }
}

@customElement({ name: 'camera-specs-viewer', template })
export class CameraSpecsViewer {
  @bindable public model: Camera;

  private focalLength: string;
  private fNumber: string;

  public binding(...args) {
    const { focalLengthRange: [fln, flx], fNumberRange: [fnn, fnx] } = this.model;
    this.focalLength = `${fln}-${flx}`;
    this.fNumber = `${fnn}-${fnx}`;
  }
}
