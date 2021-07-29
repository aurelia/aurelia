import { IPlatform } from 'aurelia';
import { platform } from 'os';

function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

type Data = { id: number, label: string }


export class Store {
  data: Data[];
  selected: Data;
  id: number;
  backup: Data[];

  constructor(@IPlatform private readonly platform: IPlatform) {
    this.data = [];
    this.selected = undefined;
    this.id = 1;
  }
  buildData(count = 1000) {
    var data = [];
    for (var i = 0; i < count; i++)
      data.push({ id: this.id++, label: adjectives[_random(adjectives.length)] + " " + colours[_random(colours.length)] + " " + nouns[_random(nouns.length)] });
    return data;
  }
  updateData(mod = 10) {
    for (let i = 0; i < this.data.length; i += 10) {
      this.data[i].label += ' !!!';
    }
  }
  delete(id) {
    const idx = this.data.findIndex(d => d.id == id);
    this.data.splice(idx, 1);
  }
  run() {
    this.data = this.buildData();
  }
  add() {
    this.data = this.data.concat(this.buildData(1000));
    this.selected = undefined;
  }
  update() {
    this.updateData();
  }
  select(id) {
    this.selected = id;
  }
  hideAll() {
    this.backup = this.data;
    this.data = [];
    this.selected = undefined;
  }
  showAll() {
    this.data = this.backup;
    this.backup = null;
    this.selected = undefined;
  }
  runLots() {
    this.data = this.buildData(10000);
    this.selected = undefined;
  }
  clear() {
    this.data = [];
    this.selected = undefined;
  }
  swapRows() {
    if (this.data.length > 998) {
      var temp = this.data[1];
      var temp2 = this.data[998];
      this.platform.domWriteQueue.queueTask(() => {
        this.data.splice(1, 1, temp2);
        this.data.splice(998, 1, temp);
      });
    }
  }

}
