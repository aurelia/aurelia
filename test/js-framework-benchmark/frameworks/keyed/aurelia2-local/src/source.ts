import { batch } from '@aurelia/runtime';

function _random(max: number) {
  return Math.round(Math.random() * 1000) % max;
}

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

export class Store {
  public data: any[];
  public id: number;
  public backup: any;
  public selectedIdx: number;
  public constructor() {
    this.data = [];
    this.id = 1;
    this.selectedIdx = -1;
  }
  public buildData(count = 1000) {
    const data = [];
    for (let i = 0; i < count; i++)
      data.push({
        id: this.id++,
        label: `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`,
        selected: false,
      });
    return data;
  }
  public updateData(mod = 10) {
    const data = this.data;
    const len = data.length;
    for (let i = 0; i < len; i += 10) {
      data[i].label += ' !!!';
    }
  }
  public delete(id: any) {
    const idx = this.data.findIndex(d => d.id == id);
    this.data.splice(idx, 1);
  }
  public run() {
    this.data = this.buildData();
  }
  public add() {
    this.data.push(...this.buildData(1000));
  }
  public update() {
    this.updateData();
  }
  public select(id: any) {
    const data = this.data;
    const len = data.length;
    if (this.selectedIdx > -1 && data[this.selectedIdx]) {
      data[this.selectedIdx].selected = false;
    }
    for (let i = 0; i < len; ++i) {
      if (data[i].id === id) {
        data[i].selected = true;
        this.selectedIdx = i;
        break;
      }
    }
  }
  public hideAll() {
    this.backup = this.data;
    this.data = [];
  }
  public showAll() {
    this.data = this.backup;
    this.backup = null;
  }
  public runLots() {
    this.data = this.buildData(10000);
  }
  public clear() {
    this.data = [];
    this.selectedIdx = -1;
  }
  public swapRows() {
    if (this.data.length > 998) {
      const temp = this.data[1];
      const temp2 = this.data[998];
      batch(() => {
        this.data.splice(1, 1, temp2);
        this.data.splice(998, 1, temp);
      });
    }
  }

}
