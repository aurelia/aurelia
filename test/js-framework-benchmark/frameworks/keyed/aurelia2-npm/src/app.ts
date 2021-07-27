import { Store } from './store';
import { customElement } from 'aurelia';
import template from './app.html';

@customElement({ name: 'app', template })

export class App {
  store: Store;

  constructor() {
    this.store = new Store();

  }
  run() {
    this.store.run();
  }
  add() {
    this.store.add();
  }
  remove(item) {
    this.store.delete(item.id);
  }
  select(item) {
    this.store.select(item.id);
  }
  update() {
    this.store.update();
  }

  runLots() {
    this.store.runLots();
  }

  clear() {
    this.store.clear();
  }

  swapRows() {
    this.store.swapRows();
  }
}
