export function basename(filePath: string, suffix: string = ''): string {
  const normalized = normalize(filePath);
  const end = normalized.endsWith('/') ? normalized.length - 1 : normalized.length;
  const start = normalized.lastIndexOf('/', end - 1) + 1;
  const name = normalized.slice(start, end);
  return suffix !== '' && name.endsWith(suffix)
    ? name.slice(0, -suffix.length)
    : name;
}

export function dirname(filePath: string): string {
  const normalized = normalize(filePath).replace(/\/$/, '');
  const separator = normalized.lastIndexOf('/');
  if (separator < 0) {
    return '';
  }
  if (separator === 0) {
    return '/';
  }
  return normalized.slice(0, separator);
}

export function extname(filePath: string): string {
  const name = basename(filePath);
  const dot = name.lastIndexOf('.');
  return dot <= 0 ? '' : name.slice(dot);
}

function normalize(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}
