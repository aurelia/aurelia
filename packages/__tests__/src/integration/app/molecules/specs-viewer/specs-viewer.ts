import { valueConverter, bindable, customElement } from '@aurelia/runtime-html';
import { Thing, ThingViewer } from './thing-viewer.js';
import { Camera, CameraSpecsViewer } from './camera-specs-viewer.js';
import { Laptop, LaptopSpecsViewer } from './laptop-specs-viewer.js';
import template from './specs-viewer.html';

@customElement({ name: 'specs-viewer', template })
export class SpecsViewer {
  @bindable public things: Thing[];
  private pairs: { vm: typeof ThingViewer; thing: Thing }[];

  public binding(): void {
    const toVm = (thing: unknown) => {
      switch (true) {
        case thing instanceof Camera: return CameraSpecsViewer;
        case thing instanceof Laptop: return LaptopSpecsViewer;
        case thing instanceof Thing: return ThingViewer;
        default: throw new Error(`Unsupported type ${(thing as object).constructor.prototype}`);
      }
    };
    this.pairs = this.things.map((thing) => ({ thing, vm: toVm(thing) }));
  }
}

@valueConverter('viewer')
export class ViewerValueConverter {
  public toView(thing: unknown) {
    switch (true) {
      case thing instanceof Camera: return CameraSpecsViewer;
      case thing instanceof Laptop: return LaptopSpecsViewer;
      case thing instanceof Thing: return ThingViewer;
      default: throw new Error(`Unsupported type ${(thing as object).constructor.prototype}`);
    }
  }
}
