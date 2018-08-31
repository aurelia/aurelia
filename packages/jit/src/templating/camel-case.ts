const map = Object.create(null);
const camelCaser = (_: any, x: string) => x.toUpperCase();

export function camelCase(name: string): string {
  if (name in map) {
    return map[name];
  }
  const result = name.charAt(0).toLowerCase() + name.slice(1).replace(/[_.-](\w|$)/g, camelCaser);
  return map[name] = result;
}
