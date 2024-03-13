/* eslint-disable @typescript-eslint/no-unused-vars */
import { onResolve } from '@aurelia/kernel';
import { Aurelia } from './aurelia';

// test .app + .enhance
// but mostly test the auto inferrence of the component type on the .enhance API
function testAureliaApi(au: Aurelia) {
  class Abc { public abc = 5; }
  return [
    // if necessary, we can try enhance the typing for Aurelia & IAurelia
    // to make it auto infer the type of the component in the main app root
    onResolve(au.app({ host: document.body, component: Abc }).start(), (root) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return au.root.controller.viewModel.abc;
    }),
    onResolve(au.enhance({ component: Abc, host: document.body }), (root) => {
      return root.controller.viewModel.abc;
    })
  ];
}
