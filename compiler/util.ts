const camelCasedCache: Record<string, string> = {};

export function camelCase(name: string) {
  if (name in camelCasedCache) {
    return camelCasedCache[name];
  }
  const result = name.charAt(0).toLowerCase()
    + name.slice(1).replace(/[_.-](\w|$)/g, (_: string, x: string) => x.toUpperCase());
  return camelCasedCache[name] = result;
}

const capitalMatcher = /([A-Z])/g;

function addHyphenAndLower(char: string) {
  return '-' + char.toLowerCase();
}

const hyphenatedCache: Record<string, string> = {};

export function hyphenate(name: string) {
  if (name in hyphenatedCache) {
    return hyphenatedCache[name];
  }
  return hyphenatedCache[name] = (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
export default function hash(str: string): string {
  let hash = 5381;
  let i = str.length;

  while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(36);
}

export function arrayRemove(arr: any[], item: any) {
  let idx = arr.indexOf(item);
  if (idx !== -1) {
    arr.splice(idx, 1);
    return true;
  }
  return false;
}
