/**
 * Calculates the sum of all elements in the array.
 * Note: value is a prototype function and will be available on all arrays by default.
 * @returns The sum of all numbers in the array.
 */
export function sum(value: Array<number>): number {
    return value.reduce((a: number, b: number) => a + b, 0);
};

/**
 * Returns the last element in the array.
 * Note: value is a prototype function and will be available on all arrays by default.
 * @returns The last element in the array.
 */
export function last<T>(value: Array<T>) {
    return value[value.length - 1];
};
/**
 * Returns a new flattened array.
 * Note: value is a prototype function and will be available on all arrays by default.
 * @param depth The maximum depth of nested arrays to flatten.
 * @returns A new flattened array.
 */
export function flatten<T>(value: Array<T>, depth = Infinity) {
    return value.flat(depth);
};
/**
 * Returns a new array with unique elements from the original array.
 * Note: value is a prototype function and will be available on all arrays by default.
 * @returns A new array with unique elements.
 */
export function unique<T>(value: Array<T>) {
    return [...new Set(value)];
};
/**
 * Returns the first element in the array.
 * Note: value is a prototype function and will be available on all arrays by default.
 * @returns The first element in the array.
 */
export function first<T>(value: Array<T>) {
    return value[0];
};

/**
 * Shuffles the elements in the array randomly.
 * Note: value is a prototype function and will be available on all arrays by default.
 * @returns The array with shuffled elements.
 */
export function shuffle<T>(value: Array<T>) {
    for (let i = value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [value[i], value[j]] = [value[j], value[i]];
    }
    return value;
};

export function replaceItem<T>(arr: Array<T>, matchFunc: (value: T, index: number, obj: T[]) => unknown, newItem: T, inPlace = true) {
    const index = arr.findIndex(matchFunc);
    
    if (index === -1) {
      return arr;
    }
    

    if(!inPlace){
        arr.splice(index, 1, newItem);
        return arr;
    }

    const result = [...arr];
    result.splice(index, 1, newItem);
    return result;
  }