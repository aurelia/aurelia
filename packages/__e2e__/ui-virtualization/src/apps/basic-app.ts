export class BasicApp {

  round = 0;

  getNewItem(index: number) {
    return {
      name: `item-${this.round}-${index}`,
      value: Math.random() * index
    };
  }

  items = Array.from({ length: 500 }, (_, idx) => {
    return this.getNewItem(idx);
  });

  newItems() {
    this.items = [];
  }

  clearItems() {
    this.items.splice(0);
  }

  addItemsAtStart(count: number) {
    if (count > 0) {
      this.round++;
      for (let i = 0; i < count; i++) {
        this.items.unshift(this.getNewItem(i));
      }
    } else if (count < 0) {
      count = -count;
      for (let i = 0; i < count; i++) {
        this.items.shift();
      }
    }
  }

  addItemsAtEnd(count: number) {
    if (count > 0) {
      this.round++;
      for (let i = 0; i < count; i++) {
        this.items.push(this.getNewItem(i));
      }
    } else if (count < 0) {
      count = -count;
      for (let i = 0; i < count; i++) {
        this.items.pop();
      }
    }
  }

}
