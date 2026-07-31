// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used implicitly by the tsconfig jsxFactory setting.
import { createElement, type JsxNode } from './jsx-factory';

type Constructor = abstract new (...args: never[]) => object;

function mark<T extends Constructor>(value: T, _context: ClassDecoratorContext<T>): T {
  return value;
}

@mark
class DecoratedJsx {
  public render(): JsxNode {
    return <status>TSX factory import retained</status>;
  }
}

export const jsxResult = new DecoratedJsx().render().text;
