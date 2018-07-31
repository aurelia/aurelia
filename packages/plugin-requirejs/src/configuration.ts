import * as componentPlugin from './component';
import * as viewPlugin from './view';

declare function define(name, deps: any[], moduleObject: {});
let nonAnonDefine = define;

export function installRequireJSPlugins() {
  nonAnonDefine('view', [], viewPlugin);
  nonAnonDefine('component', [], componentPlugin);
}
