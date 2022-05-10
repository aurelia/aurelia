import * as path from 'path';
import { kebabCase } from '@aurelia/kernel';

// a/foo-bar.xxx -> "foo-bar"
// a/fooBar.xxx -> "foo-bar"
// a/foo-bar/index.xxx -> "foo-bar"
// a/fooBar/index.xxx -> "foo-bar"
export function resourceName(filePath: string): string {
  const parsed = path.parse(filePath);
  const name = parsed.name === 'index' ? path.basename(parsed.dir) : parsed.name;
  return kebabCase(name);
}
