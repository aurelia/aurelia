// TODO: unit test this stuff in a somewhat manageable way

// import { expect } from 'chai';
// import { IndexMap } from '@aurelia/runtime';
// import { longestIncreasingSubsequence } from '../../../src/resources/custom-attributes/repeat';
// import { assertArrayEqual } from '../../observation/array-observer.spec';

// function createIndexMap(items: number[], deletedItems?: number[]): IndexMap {
//   items['deletedItems'] = deletedItems;
//   return items;
// }

// describe.only('longestIncreasingSubsequence', function () {

//   interface Spec {
//     indexMap: IndexMap;
//     expected: number[];
//   }
//   const specs: Spec[] = [
//     {
//       indexMap: createIndexMap([-2]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([-2, -2]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([-2, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([-2, 1]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([0, -2]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([0, 1]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([1, -2]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([1, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 1]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 1]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([0, -2, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([0, 0, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 1]),
//       expected: [0, 2]
//     },
//     {
//       indexMap: createIndexMap([0, 1, -2]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 0]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 1]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([1, -2, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, 0, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 1]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 1, -2]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 1]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 0, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 0, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 1, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 1, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, -2, 1, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 0, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 1, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 1, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 0, 1, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 0, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 0, 1]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 1, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 1, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([-2, 1, 1, 1]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([0, -2, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, -2, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([0, -2, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 0, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 0, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 1, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 1, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([0, -2, 1, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([0, 0, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, 0, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([0, 0, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 0, 1]),
//       expected: [0, 3]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 1, -2]),
//       expected: [0, 2]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 1, 0]),
//       expected: [0, 2]
//     },
//     {
//       indexMap: createIndexMap([0, 0, 1, 1]),
//       expected: [0, 2]
//     },
//     {
//       indexMap: createIndexMap([0, 1, -2, -2]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, -2, 0]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, -2, 1]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 0, -2]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 0, 0]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 0, 1]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 1, -2]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 1, 0]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([0, 1, 1, 1]),
//       expected: [0, 1]
//     },
//     {
//       indexMap: createIndexMap([1, -2, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, -2, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, -2, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 0, 0]),
//       expected: [1]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 0, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 1, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 1, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, -2, 1, 1]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, 0, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 0, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, 0, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 0, 1]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 1, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 1, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 0, 1, 1]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 1, -2, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 1, -2, 0]),
//       expected: [2]
//     },
//     {
//       indexMap: createIndexMap([1, 1, -2, 1]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 0, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 0, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 0, 1]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 1, -2]),
//       expected: [3]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 1, 0]),
//       expected: [0]
//     },
//     {
//       indexMap: createIndexMap([1, 1, 1, 1]),
//       expected: [0]
//     }
//   ];

//   for (const spec of specs) {
//     it.only(`${JSON.stringify(spec)}`, function () {
//       const { indexMap, expected } = spec;
//       const actual = longestIncreasingSubsequence(indexMap);
//       assertArrayEqual([...actual], expected);
//     });
//   }
// });
