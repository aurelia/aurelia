import * as fs from 'fs';

type NodeFileSystem = typeof fs;

export const createMockFs: (overrides?: Partial<NodeFileSystem>) => NodeFileSystem = (overrides) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    chownSync: () => {
      throw new Error('not implemented');
    },
    ...overrides,
  } as Partial<NodeFileSystem> as NodeFileSystem;
};
