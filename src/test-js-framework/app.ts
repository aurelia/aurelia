import { appConfig } from './app-config'; //added by the compiler
import { customElement } from '../runtime/templating/custom-element';
import {Store} from './store';

var startTime;
var lastMeasure;
var startMeasure = function(name) {
    startTime = performance.now();
    lastMeasure = name;
}
var stopMeasure = function() {
    window.setTimeout(function() {
        var stop = performance.now();
        console.log(lastMeasure+" took "+(stop-startTime));
    }, 0);
}

@customElement(appConfig) //added by the compiler
export class App {
  store;
  constructor() {
      this.store = new Store();
  }

  run() {
      startMeasure("run");
      this.store.run();
      stopMeasure();
  }
  add() {
      startMeasure("add");
      this.store.add();
      stopMeasure();
  }
  remove(item) {
      startMeasure("delete");
      this.store.delete(item.id);
      stopMeasure();
  }
  select(item) {
      startMeasure("select");
      this.store.select(item.id);
      stopMeasure();
  }
  update() {
      startMeasure("update");
      this.store.update();
      stopMeasure();
  }

  runLots() {
      startMeasure("runLots");
      this.store.runLots();
      stopMeasure();
  }

  clear() {
      startMeasure("clear");
      this.store.clear();
      stopMeasure();
  }

  swapRows() {
      startMeasure("swapRows");
      this.store.swapRows();
      stopMeasure();
  }
}
