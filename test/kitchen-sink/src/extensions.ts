interface Array<T> {
  shuffle(clone?: boolean): Array<T>
  rand(): T
}

Object.defineProperties(Array.prototype, {
  shuffle: {
    configurable: true,
    value: function(this: any[], clone?: boolean) {
      let array = clone ? this.slice() : this;
      for (let i = 0, ii = array.length; ii > i; ++i) {
        let pos = Math.floor(Math.random() * ii);
        let b = array[i];
        array[i] = array[pos];
        array[pos] = b;
      }
      return array;
    }
  },
  rand: {
    configurable: true,
    value: function() {
      return this[Math.floor(Math.random() * this.length)];
    }
  }
});
