export class VariableWidthHorizontalApp {

  round = 0;

  getNewItem(index: number) {
    return {
      name: `item-${this.round}-${index}`,
      value: Math.random() * index,
      w: Math.floor(Math.random() * 150) + 80 // Random width between 80px and 230px
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

  getColor(index: number): string {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
    return colors[index % colors.length];
  }
}
