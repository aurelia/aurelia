export const childrenQuerySelector = (node: HTMLElement, selector: string): HTMLElement => {
  return Array
    .from(node.children)
    .find(el => el.matches(selector)) as HTMLElement;
}

export const childrenQuerySelectorAll = (node: HTMLElement, selector: string): HTMLElement[] => {
  return Array
    .from(node.children)
    .filter(el => el.matches(selector)) as HTMLElement[];
}

