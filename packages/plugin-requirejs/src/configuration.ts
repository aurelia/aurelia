import * as componentPlugin from './component';
import * as viewPlugin from './view';

declare function define(name: string, deps: unknown[], moduleObject: {}): void;
const nonAnonDefine = define;

export function installRequireJSPlugins(): void {
  nonAnonDefine('view', [], viewPlugin);
  nonAnonDefine('component', [], componentPlugin);
}
