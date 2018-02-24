const map = {};

export function camelCase(name: string) {
  if (name in map) {
    return map[name];
  }
  const result = name.charAt(0).toLowerCase()
    + name.slice(1).replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
  return map[name] = result;
}
