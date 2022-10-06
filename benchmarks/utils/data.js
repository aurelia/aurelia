export class RandomItem {
  constructor(id) {
    this.message = `item ${id}`;
  }

  update(id) {
    this.message = `updated item ${id}`;
  }
}

export const createItems = (count, seed = 0) =>
  Array.from({ length: count }, (_, i) => new RandomItem(i + seed));

