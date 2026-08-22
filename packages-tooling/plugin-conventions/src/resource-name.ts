import { kebabCase } from '@aurelia/kernel';
import { basename, dirname, extname } from './path-utils';

// a/foo-bar.xxx -> "foo-bar"
// a/fooBar.xxx -> "foo-bar"
// a/foo-bar/index.xxx -> "foo-bar"
// a/fooBar/index.xxx -> "foo-bar"
export function resourceName(filePath: string): string {
  const fileName = basename(filePath);
  const nameWithoutExtension = basename(fileName, extname(fileName));
  const name = nameWithoutExtension === 'index' ? basename(dirname(filePath)) : nameWithoutExtension;
  return kebabCase(name);
}
