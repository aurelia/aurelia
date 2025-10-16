export type QueryRoot = Element | Document | DocumentFragment;

export interface IDomQueryHelpers {
  getBy<K extends keyof HTMLElementTagNameMap>(selectors: K, root?: QueryRoot): HTMLElementTagNameMap[K];
  getBy<K extends keyof SVGElementTagNameMap>(selectors: K, root?: QueryRoot): SVGElementTagNameMap[K];
  getBy<E extends Element = HTMLElement>(selectors: string, root?: QueryRoot): E;
  getAllBy<K extends keyof HTMLElementTagNameMap>(selectors: K, root?: QueryRoot): HTMLElementTagNameMap[K][];
  getAllBy<K extends keyof SVGElementTagNameMap>(selectors: K, root?: QueryRoot): SVGElementTagNameMap[K][];
  getAllBy<E extends Element = HTMLElement>(selectors: string, root?: QueryRoot): E[];
  queryBy<K extends keyof HTMLElementTagNameMap>(selectors: K, root?: QueryRoot): HTMLElementTagNameMap[K] | null;
  queryBy<K extends keyof SVGElementTagNameMap>(selectors: K, root?: QueryRoot): SVGElementTagNameMap[K] | null;
  queryBy<E extends Element = HTMLElement>(selectors: string, root?: QueryRoot): E | null;
  getByTestId<E extends Element = HTMLElement>(testId: string, root?: QueryRoot): E;
  getAllByTestId<E extends Element = HTMLElement>(testId: string, root?: QueryRoot): E[];
  queryByTestId<E extends Element = HTMLElement>(testId: string, root?: QueryRoot): E | null;
}

const toArray = <E extends Element>(root: QueryRoot, selector: string) => Array.from(root.querySelectorAll<E>(selector));

const ensureSingle = <E extends Element>(elements: E[], description: string, descriptorKind: 'selector' | 'test id') => {
  if (elements.length === 0) {
    throw new Error(`No element found for ${descriptorKind} "${description}"`);
  }
  if (elements.length > 1) {
    throw new Error(`There is more than 1 element with ${descriptorKind} "${description}": ${elements.length} found`);
  }
  return elements[0];
};

const ensureAtMostOne = <E extends Element>(elements: E[], description: string, descriptorKind: 'selector' | 'test id') => {
  if (elements.length > 1) {
    throw new Error(`There is more than 1 element with ${descriptorKind} "${description}": ${elements.length} found`);
  }
  return elements[0] ?? null;
};

const testIdSelector = (testId: string) => `[data-testid="${testId}"]`;

export function createDomQueryHelpers(host: QueryRoot): IDomQueryHelpers {
  const getBy = <E extends Element = HTMLElement>(selector: string, root: QueryRoot = host): E =>
    ensureSingle(toArray<E>(root, selector), selector, 'selector');
  const getAllBy = <E extends Element = HTMLElement>(selector: string, root: QueryRoot = host): E[] =>
    toArray<E>(root, selector);
  const queryBy = <E extends Element = HTMLElement>(selector: string, root: QueryRoot = host): E | null =>
    ensureAtMostOne(toArray<E>(root, selector), selector, 'selector');
  const getByTestId = <E extends Element = HTMLElement>(testId: string, root: QueryRoot = host): E =>
    ensureSingle(toArray<E>(root, testIdSelector(testId)), testId, 'test id');
  const getAllByTestId = <E extends Element = HTMLElement>(testId: string, root: QueryRoot = host): E[] =>
    toArray<E>(root, testIdSelector(testId));
  const queryByTestId = <E extends Element = HTMLElement>(testId: string, root: QueryRoot = host): E | null =>
    ensureAtMostOne(toArray<E>(root, testIdSelector(testId)), testId, 'test id');

  return {
    getBy,
    getAllBy,
    queryBy,
    getByTestId,
    getAllByTestId,
    queryByTestId,
  };
}
