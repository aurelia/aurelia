import * as componentPlugin from './component';
import * as viewPlugin from './view';
const nonAnonDefine = define;
export function installRequireJSPlugins() {
    nonAnonDefine('view', [], viewPlugin);
    nonAnonDefine('component', [], componentPlugin);
}
//# sourceMappingURL=configuration.js.map