import { Store } from './store';
import { customElement, IPlatform } from 'aurelia';
import template from './app.html';
import { platform } from 'os';

@customElement({ name: 'app', template })

export class App {
  store: Store;

  constructor(@IPlatform platform: IPlatform) {
    this.store = new Store(platform);

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
