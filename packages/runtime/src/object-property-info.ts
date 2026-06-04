/** @internal */
export type ComputedPropertyInfo = {
  flush?: 'sync' | 'async';
  deps?: (string | symbol)[];
  deep?: boolean;
};
