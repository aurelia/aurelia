
/**
 * Decompress ranges into an array of numbers and fill the lookup or set with the
 * provided value on the indices corresponding to the decompressed numbers
 */
/*@internal*/
export function decompress(lookup: Array<any> | null, set: Set<number> | null, compressed: number[], value: any): void {
  const rangeCount = compressed.length;
  for (let i = 0; i < rangeCount; i += 2) {
    const start = compressed[i];
    let end = compressed[i + 1];
    end = end > 0 ? end : start + 1;
    if (lookup) {
      let j = start;
      while (j < end) {
        lookup[j] = value;
        j++;
      }
    }
    if (set) {
      for (let ch = start; ch < end; ch++) {
        set.add(ch);
      }
    }
  }
}
