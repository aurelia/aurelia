const has = Object.prototype.hasOwnProperty;
export function hasOwn(obj: object, key: PropertyKey) {
  return has.call(obj, key);
}
