import { bindable, customElement } from '@aurelia/runtime';
import template from './camera-specs-viewer.html';
import { Thing } from './thing-viewer';

export class Storage {
  public constructor(
    public type: "HDD" | "SSD",
    public size: number,
    public unit: "GB" | "TB"
  ) { }
}
export class Laptop extends Thing {
  public constructor(
    public cpu: string,
    public ram: string,
    public storage: Storage,
    public screen: string,
    modelNumber: string,
    make: string
  ) {
    super(modelNumber, make);
  }
}

@customElement({ name: 'laptop-specs-viewer', template })
export class LaptopSpecsViewer {
  @bindable public model: Laptop;
  private storage: string;

  public binding() {
    const { storage: { size, unit, type } } = this.model;
    this.storage = `${size}${unit} ${type}`;
  }
}
