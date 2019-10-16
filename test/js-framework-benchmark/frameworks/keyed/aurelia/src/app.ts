import {Store} from './store';

let startTime: number;
let lastMeasure: string;
const startMeasure = function(name) {
  startTime = performance.now();
  lastMeasure = name;
};
const stopMeasure = function() {
  window.setTimeout(function() {
    const stop = performance.now();
    console.log(`${lastMeasure} took ${stop-startTime}`);
  }, 0);
};

export class App {
  public store: Store;
  public constructor() {
    this.store = new Store();
  }

  public run() {
    startMeasure("run");
    this.store.run();
    stopMeasure();
  }
  public add() {
    startMeasure("add");
    this.store.add();
    stopMeasure();
  }
  public remove(item) {
    startMeasure("delete");
    this.store.delete(item.id);
    stopMeasure();
  }
  public select(item) {
    startMeasure("select");
    this.store.select(item.id);
    stopMeasure();
  }
  public update() {
    startMeasure("update");
    this.store.update();
    stopMeasure();
  }

  public runLots() {
    startMeasure("runLots");
    this.store.runLots();
    stopMeasure();
  }

  public clear() {
    startMeasure("clear");
    this.store.clear();
    stopMeasure();
  }

  public swapRows() {
    startMeasure("swapRows");
    this.store.swapRows();
    stopMeasure();
  }
}
